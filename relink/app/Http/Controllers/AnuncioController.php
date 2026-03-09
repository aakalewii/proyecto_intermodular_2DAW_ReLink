<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\DAOs\AnuncioDAO;
use App\Enums\AnuncioEstado;
use App\Models\Anuncio;
use App\Models\ImagenAnuncio;
use Illuminate\Support\Facades\DB;


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
           
        $nuevoAnuncio = $this->anuncioDAO->crearAnuncio($validated, $request->user()->id, now());

                if ($request->hasFile('imagenes')) {
                    foreach ($request->file('imagenes') as $foto) {
                        
                        $ruta = $foto->store('anuncios', 'public');

                        ImagenAnuncio::create([
                            'url' => $ruta,
                            'anuncio_id' => $nuevoAnuncio->id
                        ]);
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

    public function update(Request $request, int $id)
    {

        $anuncio = $this->anuncioDAO->obtenerAnuncioPorId($id);

        if ($anuncio == null || $anuncio->estado === AnuncioEstado::ELIMINADO->value) {
            return response()->json([
                'message' => 'Anuncio no encontrado'
            ], 404);
        }

        if ($anuncio->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'No tienes permiso para editar este anuncio'
            ], 403);
        }

        $validated = $request->validate([
            'titulo' => ['required', 'string', 'max:255'],
            'descripcion' => ['required', 'string', 'max:255'],
            'precio' => ['required', 'numeric'],
            'localidad_id' => ['required', 'integer'],
            'subcategoria_id' => ['required', 'integer'],
        ]);

        $anuncioActualizado = $this->anuncioDAO->actualizarAnuncio($id, $validated);

        return response()->json([
            'message' => 'Actualizado con éxito',
            'data' => $anuncioActualizado
            ], 200);

    }

    public function destroy(Request $request, int $id)
    {

        $anuncio = $this->anuncioDAO->obtenerAnuncioPorId($id);

        if ($anuncio == null || $anuncio->estado === AnuncioEstado::ELIMINADO->value) {
            return response()->json([
                'message' => 'Anuncio no encontrado'
            ], 404);
        }

        if ($anuncio->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'No tienes permiso para eliminar este anuncio'
            ], 403);
        }

        $this->anuncioDAO->eliminarAnuncio($id);

        return response()->json([
            'message' => 'Anuncio eliminado con éxito'
        ], 200);

    }

    public function subirImagenes(Request $request, $anuncioId)
    {
    // 1. Validar que sea un array de imágenes
    $request->validate([
        'imagenes' => 'required|array',
        'imagenes.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048' // Máximo 2MB por foto
    ]);

    $anuncio = Anuncio::findOrFail($anuncioId);
    $rutasGuardadas = [];

    // 2. Procesar cada imagen
    if ($request->hasFile('imagenes')) {
        foreach ($request->file('imagenes') as $foto) {
            
            // Guardar en la carpeta 'public/anuncios'
            $ruta = $foto->store('anuncios', 'public');

            // 3. Guardar en la base de datos
            $nuevaImagen = ImagenAnuncio::create([
                'url' => $ruta,
                'anuncio_id' => $anuncio->id
            ]);

            $rutasGuardadas[] = $nuevaImagen;
        }
    }

    return response()->json([
        'message' => 'Imágenes subidas correctamente',
        'imagenes' => $rutasGuardadas
    ], 201);
    }

}
