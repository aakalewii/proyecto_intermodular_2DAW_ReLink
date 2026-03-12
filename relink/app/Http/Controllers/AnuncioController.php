<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\DAOs\AnuncioDAO;
use App\Enums\AnuncioEstado;
use App\Models\Anuncio;
use App\Models\ImagenAnuncio;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class AnuncioController extends Controller
{
    private $anuncioDAO;

    public function __construct(AnuncioDAO $anuncioDAO)
    {
        $this->anuncioDAO = $anuncioDAO;
    }

    public function index()
    {
        $anuncios = $this->anuncioDAO->obtenerPublicados();
        return response()->json($anuncios);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'titulo' => ['required', 'string', 'max:255'],
            'descripcion' => ['required', 'string', 'max:255'],
            'precio' => ['required', 'numeric'],
            'localidad_id' => ['required', 'integer'],
            'subcategoria_id' => ['required', 'integer'],
            'imagenes' => ['nullable', 'array'],
            'imagenes.*' => ['image', 'mimes:jpeg,png,jpg,gif', 'max:2048']
        ]);

        try {
            $anuncio = DB::transaction(function () use ($validated, $request) {
                // 1. Creamos el anuncio usando el DAO
                $nuevoAnuncio = $this->anuncioDAO->crearAnuncio($validated, $request->user()->id, now());

                // 2. Si hay fotos, las guardamos físicamente y llamamos al DAO
                if ($request->hasFile('imagenes')) {
                    foreach ($request->file('imagenes') as $foto) {
                        $ruta = $foto->store('anuncios', 'public');
                        $this->anuncioDAO->guardarImagen($nuevoAnuncio->id, $ruta);
                    }
                }

                return $nuevoAnuncio;
            });

            return response()->json([
                'message' => 'Anuncio y fotos creados con éxito',
                'data' => $anuncio
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Hubo un error al guardar: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        $anuncio = $this->anuncioDAO->obtenerDetalleAnuncio($id);

        if ($anuncio == null) {
            return response()->json([
                'message' => 'Anuncio no encontrado o no disponible'
            ], 404);
        }

        return response()->json([
            'message' => 'Anuncio recuperado con éxito',
            'datos' => $anuncio
        ], 200);
    }

    public function update(Request $request, int $id)
    {
        $anuncio = $this->anuncioDAO->obtenerAnuncioPorId($id);

        if ($anuncio == null || $anuncio->estado === AnuncioEstado::ELIMINADO->value) {
            return response()->json(['message' => 'Anuncio no encontrado'], 404);
        }

        if ($anuncio->user_id !== $request->user()->id) {
            return response()->json(['message' => 'No tienes permiso para editar este anuncio'], 403);
        }

        $validated = $request->validate([
            'titulo' => ['required', 'string', 'max:255'],
            'descripcion' => ['required', 'string', 'max:255'],
            'precio' => ['required', 'numeric'],
            'localidad_id' => ['required', 'integer'],
            'subcategoria_id' => ['required', 'integer'],
            'imagenes_a_borrar' => ['nullable', 'array'],
            'nuevas_imagenes' => ['nullable', 'array'],
            'nuevas_imagenes.*' => ['image', 'mimes:jpeg,png,jpg,gif', 'max:2048']
        ]);

        try {
            DB::transaction(function () use ($id, $validated, $request, $anuncio) {
                // 1. Actualizamos los textos usando el DAO
                $this->anuncioDAO->actualizarAnuncio($id, $validated);

                // 2. Borramos las fotos marcadas usando el DAO (Él se encarga de borrar el archivo físico)
                if (!empty($validated['imagenes_a_borrar'])) {
                    $this->anuncioDAO->eliminarImagenes($validated['imagenes_a_borrar'], $anuncio->id);
                }

                // 3. Subimos las fotos nuevas
                if ($request->hasFile('nuevas_imagenes')) {
                    foreach ($request->file('nuevas_imagenes') as $foto) {
                        $ruta = $foto->store('anuncios', 'public');
                        $this->anuncioDAO->guardarImagen($anuncio->id, $ruta);
                    }
                }
            });

            $anuncioActualizado = $this->anuncioDAO->obtenerAnuncioPorId($id);

            return response()->json([
                'message' => 'Actualizado con éxito',
                'data' => $anuncioActualizado
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Hubo un error al actualizar: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Request $request, int $id)
    {
        $anuncio = $this->anuncioDAO->obtenerAnuncioPorId($id);

        if ($anuncio == null || $anuncio->estado === AnuncioEstado::ELIMINADO->value) {
            return response()->json(['message' => 'Anuncio no encontrado'], 404);
        }

        if ($anuncio->user_id !== $request->user()->id) {
            return response()->json(['message' => 'No tienes permiso para eliminar este anuncio'], 403);
        }

        $this->anuncioDAO->eliminarAnuncio($id);

        return response()->json([
            'message' => 'Anuncio eliminado con éxito'
        ], 200);
    }

    // Las funciones extra de imágenes sueltas, usando también el DAO para la eliminación física
    public function eliminarImagen(Request $request, $id)
    {
        $imagen = ImagenAnuncio::findOrFail($id);

        $anuncio = Anuncio::findOrFail($imagen->anuncio_id);
        if ($anuncio->user_id !== $request->user()->id) {
            return response()->json(['message' => 'No tienes permiso'], 403);
        }

        // Reutilizamos el DAO para hacer el borrado
        $this->anuncioDAO->eliminarImagenes([$id], $anuncio->id);

        return response()->json(['message' => 'Imagen borrada con éxito'], 200);
    }

    public function subirImagenes(Request $request, $anuncioId)
    {
        $request->validate([
            'imagenes' => 'required|array',
            'imagenes.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        $anuncio = Anuncio::findOrFail($anuncioId);
        $rutasGuardadas = [];

        if ($request->hasFile('imagenes')) {
            foreach ($request->file('imagenes') as $foto) {
                $ruta = $foto->store('anuncios', 'public');
                // Guardamos usando el DAO
                $this->anuncioDAO->guardarImagen($anuncio->id, $ruta);
                $rutasGuardadas[] = $ruta;
            }
        }

        return response()->json([
            'message' => 'Imágenes subidas correctamente',
            'rutas' => $rutasGuardadas
        ], 201);
    }
}
