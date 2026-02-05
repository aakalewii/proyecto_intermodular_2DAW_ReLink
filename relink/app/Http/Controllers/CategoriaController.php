<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Categoria;


class CategoriaController extends Controller
{
    public function idnex()
    {
        $categorias = Categoria::all();
        return response()->json($categorias);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => ['required', 'string', 'max:255'],
            'descripcion' => ['required', 'string', 'max:255'],
        ]);

        $categoria = Categoria::create($validated);
        
        return response()->json([
            'message' => 'Categoría creado con éxito',
            'data' => $categoria], 201);
    }

    public function update(Request $request, int $id)
    {
        $categoria = Categoria::find($id);

        if ($categoria == null) {
            return response()->json([
                'message' => 'Categoría no encontrada'
            ], 404);
        }

        $validated = $request->validate([
            'nombre' => ['required', 'string', 'max:255'],
            'descripcion' => ['required', 'string', 'max:255'],
        ]);

        $categoria->update($validated);
        
        return response()->json([
            'message' => 'Actualizado con éxito',
            'data' => $categoria
        ], 200);

    }

    public function destroy(Request $request, int $id)
    {
        $categoria = Categoria::find($id);

        if ($categoria == null) {
            return response()->json([
                'message' => 'Anuncio no encontrado'
            ], 404);
        }

        $categoria->delete();
        return response()->json([
            'message' => 'Eliminado con éxito'
        ], 200);

    }
}
