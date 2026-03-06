<?php

namespace App\Http\Controllers;

use App\Models\Provincia;
use Illuminate\Http\Request;

class ProvinciaController extends Controller
{
    // GET /api/provincias (Listar todas, y de paso que traiga el nombre de su país)
    public function index()
    {
        // Usamos 'with' para que el JSON incluya los datos del país asociado
        $provincias = Provincia::with('pais')->get();
        return response()->json($provincias, 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre' => ['required', 'string', 'max:255'],
            'pais_id' => ['required', 'exists:paises,id']
        ]);

        $provincia = Provincia::create($request->all());

        return response()->json([
            'message' => 'Provincia creada con éxito',
            'data' => $provincia
        ], 201);
    }

    public function show($id)
    {
        $provincia = Provincia::with('pais')->find($id);
        if (!$provincia) return response()->json(['message' => 'Provincia no encontrada'], 404);
        
        return response()->json($provincia, 200);
    }

    public function update(Request $request, $id)
    {
        $provincia = Provincia::find($id);
        if (!$provincia) return response()->json(['message' => 'Provincia no encontrada'], 404);

        $request->validate([
            'nombre' => ['required', 'string', 'max:255'],
            'pais_id' => ['required', 'exists:paises,id']
        ]);

        $provincia->update($request->all());

        return response()->json([
            'message' => 'Provincia actualizada',
            'data' => $provincia
        ], 200);
    }

    public function destroy($id)
    {
        $provincia = Provincia::find($id);
        if (!$provincia) return response()->json(['message' => 'Provincia no encontrada'], 404);

        $provincia->delete();

        return response()->json(['message' => 'Provincia eliminada correctamente'], 200);
    }
}
