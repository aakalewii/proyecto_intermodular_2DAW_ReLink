<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Subcategoria;

class SubcategoriaController extends Controller
{
    // Este método devuelve la lista de todas las subcategorías.
    // El detalle técnico aquí es el uso de "with('categoria')". Al igual que vimos en los perfiles,
    // Le digo a Laravel: "Tráeme las subcategorías y, en la misma consulta,
    // adjúntales los datos de la categoría a la que pertenecen".
    public function index()
    {
        $subcategorias = Subcategoria::with('categoria')->get();
        return response()->json($subcategorias);
    }

    // Este método crea una nueva subcategoría en la base de datos.
    // Además de requerir el nombre y permitir que la descripción esté vacía, tiene una validación clave:
    // "exists:categorias,id".
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

    // Este método actualiza los datos de una subcategoría existente.
    // usamos find() y verificamos que no sea null para evitar que el servidor falle.
    // Volvemos a aplicar las mismas reglas estrictas de validación para asegurar
    // que, si se cambia de categoría padre, la nueva categoría sea válida y real.
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

    // Este método busca y borra una subcategoría específica.
    // Primero verifica que exista, y si es así, usa el método delete() de Eloquent.
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

    // Este método es una ruta personalizada y es vital para el frontend.
    // Recibe el ID de una categoría padre, y hace una consulta con "where" para devolver exclusivamente
    // las subcategorías que le pertenecen.
    public function porCategoria($categoria_id)
    {
        $subcategorias = Subcategoria::where('categoria_id', $categoria_id)->get();
        return response()->json($subcategorias);
    }
}
