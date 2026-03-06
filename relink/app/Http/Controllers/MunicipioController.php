<?php

namespace App\Http\Controllers;

use App\Models\Municipio;
use Illuminate\Http\Request;

class MunicipioController extends Controller
{
    // GET /api/municipios (Listar todos, y de paso que traiga el nombre de su provincia)
    public function index()
    {
        // Usamos 'with' para que el JSON incluya los datos de la provincia asociada
        $municipios = Municipio::with('provincia')->get();
        return response()->json($municipios, 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre' => ['required', 'string', 'max:255'],
            'provincia_id' => ['required', 'exists:provincias,id']
        ]);

        $municipio = Municipio::create($request->all());

        return response()->json([
            'message' => 'Municipio creado con éxito',
            'data' => $municipio
        ], 201);
    }

    public function show($id)
    {
        $municipio = Municipio::with('provincia')->find($id);
        if (!$municipio) return response()->json(['message' => 'municipio no encontrado'], 404);
        
        return response()->json($municipio, 200);
    }

    public function update(Request $request, $id)
    {
        $municipio = Municipio::find($id);
        if (!$municipio) return response()->json(['message' => 'municipio no encontrado'], 404);

        $request->validate([
            'nombre' => ['required', 'string', 'max:255'],
            'provincia_id' => ['required', 'exists:provincias,id']
        ]);

        $municipio->update($request->all());

        return response()->json([
            'message' => 'municipio actualizado',
            'data' => $municipio
        ], 200);
    }

    public function destroy($id)
    {
        $municipio = Municipio::find($id);
        if (!$municipio) return response()->json(['message' => 'municipio no encontrado'], 404);

        $municipio->delete();

        return response()->json(['message' => 'municipio eliminado correctamente'], 200);
    }
}
