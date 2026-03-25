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

    // Este constructor recibe una instancia de AnuncioDAO y la guarda en una propiedad de la clase.
    public function __construct(AnuncioDAO $anuncioDAO)
    {
        $this->anuncioDAO = $anuncioDAO;
    }

    // Este método devuelve la lista de anuncios que se van a mostrar en la página principal.
    public function index()
    {
        $anuncios = $this->anuncioDAO->obtenerPublicados();
        return response()->json($anuncios);
    }

    // Este método se encarga de recibir los datos del formulario de "Crear Anuncio" y guardarlos.
    // Primero, hace una validación estricta para asegurar que el título, precio, etc., vienen en el formato correcto.
    // Después, abre una "Transacción de Base de Datos" (DB::transaction). Esto es clave: o se guarda el anuncio Y sus fotos,
    // o si algo falla a medias, se cancela todo para no dejar anuncios "huérfanos".
    // Si la transacción va bien, el DAO crea el anuncio en texto y luego guarda las fotos en la carpeta pública del servidor.
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

    // Este método es el que carga los datos cuando entramos a la página de "Ver Detalle" de un anuncio.
    // Simplemente recibe la ID de la URL y le pide al DAO que busque toda la información (usuario, fotos, categoría).
    // Si el anuncio no existe (o ha sido borrado), devuelve un error 404 (No encontrado).
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

    // Este método atiende el formulario de "Editar Anuncio".
    // Primero, comprueba por seguridad que el anuncio existe y que el usuario que intenta editarlo es su verdadero dueño (error 403 si no lo es).
    // Luego, valida los datos igual que al crear, pero añade validaciones para las "nuevas_imagenes" y "imagenes_a_borrar".
    // De nuevo, usa una Transacción: actualiza los textos, le dice al DAO que borre las fotos viejas marcadas por el usuario,
    // y finalmente sube las fotos nuevas a la carpeta del servidor.
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
                $this->anuncioDAO->actualizarAnuncio($id, $validated);

                if (!empty($validated['imagenes_a_borrar'])) {
                    $this->anuncioDAO->eliminarImagenes($validated['imagenes_a_borrar'], $anuncio->id);
                }

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

    // Este método se dispara cuando el usuario le da al botón de la papelera en su perfil para borrar un anuncio suyo.
    // Igual que al editar, hace un control de seguridad: ¿existe? ¿es del usuario?.
    // Si todo está OK, le manda la orden de eliminar al DAO y devuelve un mensaje de éxito.
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

    // Método para marcar como vendido
    public function vendido(Request $request, int $id)
    {
        $anuncio = Anuncio::findOrFail($id);

        $usuario = $request->user();

        if ($anuncio->estado === AnuncioEstado::ELIMINADO->value) {
            return response()->json(['message' => 'Anuncio no encontrado'], 404);
        }

        if ($anuncio->user_id !== $usuario->id) {
            return response()->json(['message' => 'No tienes permiso para acceder a este anuncio'], 403);
        }

        if ($anuncio->estado === AnuncioEstado::VENDIDO->value) {
            return response()->json(['message' => 'El anuncio ya estaba marcado como vendido'], 200);
        }

        $anuncio->estado = AnuncioEstado::VENDIDO->value;
        $anuncio->save();

        return response()->json([
            'message' => 'Anuncio vendido con éxito'
        ], 200);
    }
}
