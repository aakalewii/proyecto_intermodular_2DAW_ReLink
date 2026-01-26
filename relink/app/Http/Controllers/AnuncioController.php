<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Anuncio;

class AnuncioController extends Controller
{
    public function index()
    {
        $anuncios = Anuncio::all();
        return response()->json($anuncios);
    }

    public function store(Request $request)
    {
        
        $validated = $request->validate([
            'titulo' => ['required', 'string', 'max:255'],
            'descripcion' => ['required', 'string', 'max:255'],
            'precio' => ['required', 'decimal'],
            'ubicacion_id' => ['required', 'integer'],
            'fecha_publi' => ['required', 'date'],
            'user_id' => ['required', 'integer'],
            'subcategoria_id' => ['required', 'integer'],
        ]);

        $anuncio = Anuncio::create($validated);
        return response()->json([
            'message' => 'Anuncio creado con éxito',
            'data' => $anuncio], 201);
    }

    public function update(Request $request, int $id)
    {
        $anuncio = Anuncio::find($id);

        if ($anuncio == null) {
            return response()->json([
                'message' => 'Anuncio no encontrado'
            ], 404);
        }

        $validated = $request->validate([
            'titulo' => ['required', 'string', 'max:255'],
            'descripcion' => ['required', 'string', 'max:255'],
            'precio' => ['required', 'decimal'],
            'ubicacion_id' => ['required', 'integer'],
            'fecha_publi' => ['required', 'date'],
            'user_id' => ['required', 'integer'],
            'subcategoria_id' => ['required', 'integer'],
        ]);

        $anuncio->update($validated);
        return response()->json([
        'message' => 'Actualizado con éxito',
        'data' => $anuncio
    ], 200);

    }

    public function destroy(Request $request, int $id)
    {
        $anuncio = Anuncio::find($id);

        if ($anuncio == null) {
            return response()->json([
                'message' => 'Anuncio no encontrado'
            ], 404);
        }

        $anuncio->delete();
        return response()->json([
            'message' => 'Eliminado con éxito'
        ], 200);

    }

}
