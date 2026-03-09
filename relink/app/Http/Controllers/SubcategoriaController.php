<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Subcategoria;

class SubcategoriaController extends Controller
{
    public function index()
    {
        $subcategorias = Subcategoria::with('categoria')->get();
        return response()->json($subcategorias);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => ['required', 'string', 'max:255'],
            'descripcion' => ['nullable', 'string', 'max:255'],
            'categoria_id' => ['required', 'integer', 'exists:categorias,id'], 
        ]);

        $subcategoria = Subcategoria::create($validated);
        
        return response()->json([
            'message' => 'Subcategoría creada con éxito',
            'data' => $subcategoria
        ], 201);
    }

    public function update(Request $request, int $id)
    {
        $subcategoria = Subcategoria::find($id);

        if (!$subcategoria) {
            return response()->json([
                'message' => 'Subcategoría no encontrada'
            ], 404);
        }

        $validated = $request->validate([
            'nombre' => ['required', 'string', 'max:255'],
            'descripcion' => ['nullable', 'string', 'max:255'],
            'categoria_id' => ['required', 'integer', 'exists:categorias,id'],
        ]);

        $subcategoria->update($validated);
        
        return response()->json([
            'message' => 'Actualizada con éxito',
            'data' => $subcategoria
        ], 200);
    }

    public function destroy(Request $request, int $id)
    {
        $subcategoria = Subcategoria::find($id);

        if (!$subcategoria) {
            return response()->json([
                'message' => 'Subcategoría no encontrada'
            ], 404);
        }

        $subcategoria->delete();
        
        return response()->json([
            'message' => 'Eliminada con éxito'
        ], 200);
    }

    // Filtrar subcategoría por categoria seleccionada
    public function porCategoria($categoria_id)
    {
        // Buscamos las subcategorías donde la columna categoria_id coincida
        $subcategorias = Subcategoria::where('categoria_id', $categoria_id)->get();
        return response()->json($subcategorias);
    }
}