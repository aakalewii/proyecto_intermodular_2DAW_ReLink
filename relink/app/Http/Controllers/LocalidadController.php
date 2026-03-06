<?php

namespace App\Http\Controllers;

use App\Models\Localidad;
use Illuminate\Http\Request;

class LocalidadController extends Controller
{
    // GET /api/localidad (Listar todas, y de paso que traiga el nombre de su municipio)
    public function index()
    {
        // Usamos 'with' para que el JSON incluya los datos de la localidad asociada
        $localidad = Localidad::with('municipio')->get();
        return response()->json($localidad, 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre' => ['required', 'string', 'max:255'],
            'municipio_id' => ['required', 'exists:municipios,id']
        ]);

        $localidad = Localidad::create($request->all());

        return response()->json([
            'message' => 'localidad creada con éxito',
            'data' => $localidad
        ], 201);
    }

    public function show($id)
    {
        $localidad = Localidad::with('municipio')->find($id);
        if (!$localidad) return response()->json(['message' => 'localidad no encontrada'], 404);
        
        return response()->json($localidad, 200);
    }

    public function update(Request $request, $id)
    {
        $localidad = Localidad::find($id);
        if (!$localidad) return response()->json(['message' => 'localidad no encontrada'], 404);

        $request->validate([
            'nombre' => ['required', 'string', 'max:255'],
            'municipio_id' => ['required', 'exists:municipios,id']
        ]);

        $localidad->update($request->all());

        return response()->json([
            'message' => 'localidad actualizada',
            'data' => $localidad
        ], 200);
    }

    public function destroy($id)
    {
        $localidad = Localidad::find($id);
        if (!$localidad) return response()->json(['message' => 'localidad no encontrada'], 404);

        $localidad->delete();

        return response()->json(['message' => 'localidad eliminada correctamente'], 200);
    }
}
