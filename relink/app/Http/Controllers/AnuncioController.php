<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\DAOs\AnuncioDAO;
use App\Enums\AnuncioEstado;

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
            'subcategoria_id' => ['required', 'integer']
        ]);

        $anuncio = $this->anuncioDAO->crearAnuncio($validated, $request->user()->id, now());

        return response()->json([
            'message' => 'Anuncio creado con éxito',
            'data' => $anuncio], 201);
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

        $this->anuncioDAO->eliminarAnuncioLogico($id);

        return response()->json([
            'message' => 'Anuncio eliminado con éxito'
        ], 200);

    }

}
