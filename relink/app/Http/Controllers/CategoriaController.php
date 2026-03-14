<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Categoria;


class CategoriaController extends Controller
{
    // Este método se encarga de devolver la lista completa de todas las categorías.
    // Utiliza el método estático all() de Eloquent, que equivale a hacer un "SELECT * FROM categorias".
    public function index()
    {
        $categorias = Categoria::all();
        return response()->json($categorias);
    }

    // Este método recibe la petición HTTP con los datos para crear una categoría nueva.
    // Lo primero que hace es validar que el 'nombre' venga obligatoriamente y sea texto.
    // La 'descripcion' es 'nullable', lo que significa que el usuario puede dejarla en blanco sin que dé error.
    // Si la validación pasa, Eloquent usa el método create() para insertarla en la base de datos.
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

    // Este método sirve para modificar una categoría que ya existe.
    // Primero, usa el método find($id) para buscar la categoría. Si no existe (es null), corta la ejecución
    // y devuelve un error 404.
    // Si la encuentra, vuelve a validar los datos entrantes (igual que en el store) y usa update()
    // para sobreescribir los valores antiguos con los nuevos.
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

    // Este método busca una categoría por su ID y la elimina permanentemente de la tabla.
    // Al igual que en el update, primero verifica que la categoría realmente exista antes de intentar borrarla,
    // devolviendo un 404.
    // Si existe, llama al método delete() de Eloquent.
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
