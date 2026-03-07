<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Categoria;


class CategoriaController extends Controller
{
    public function index()
    {
        $categorias = Categoria::all();
        return response()->json($categorias);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => ['required', 'string', 'max:255'],
            'descripcion' => ['nullable','string', 'max:255'],
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
            'descripcion' => ['nullable', 'string', 'max:255'],
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
                'message' => 'Categoria no encontrada'
            ], 404);
        }

        $categoria->delete();
        return response()->json([
            'message' => 'Eliminada con éxito'
        ], 200);

    }
}
