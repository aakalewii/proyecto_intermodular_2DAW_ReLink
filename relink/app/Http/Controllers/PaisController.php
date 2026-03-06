<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Pais;

class PaisController extends Controller
{
    // GET /api/paises (Listar todos)
    public function index()
    {
        return response()->json(Pais::all(), 200);
    }

    // POST /api/paises (Crear uno nuevo)
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => ['required', 'string', 'max:255', 'unique:paises,nombre']
        ]);

        $pais = Pais::create($request->all());

        return response()->json([
            'message' => 'País creado con éxito',
            'data' => $pais
        ], 201);
    }

    // GET /api/paises/{id} (Ver un país específico)
    public function show($id)
    {
        $pais = Pais::find($id);
        if (!$pais) return response()->json(['message' => 'País no encontrado'], 404);
        
        return response()->json($pais, 200);
    }

    // PUT /api/paises/{id} (Actualizar un país)
    public function update(Request $request, $id)
    {
        $pais = Pais::find($id);
        if (!$pais) return response()->json(['message' => 'País no encontrado'], 404);

        $request->validate([
            'nombre' => ['required', 'string', 'max:255', 'unique:paises,nombre,' . $id]
        ]);

        $pais->update($request->all());

        return response()->json([
            'message' => 'País actualizado',
            'data' => $pais
        ], 200);
    }

    // DELETE /api/paises/{id} (Borrar un país)
    public function destroy($id)
    {
        $pais = Pais::find($id);
        if (!$pais) return response()->json(['message' => 'País no encontrado'], 404);

        $pais->delete();

        return response()->json(['message' => 'País eliminado correctamente'], 200);
    }
}
