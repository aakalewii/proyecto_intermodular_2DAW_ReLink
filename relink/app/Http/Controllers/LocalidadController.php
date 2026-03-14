<?php

namespace App\Http\Controllers;

use App\Models\Localidad;
use Illuminate\Http\Request;

// CRUD  de Localidades
class LocalidadController extends Controller
{
    // Este método va a la base de datos, y coge todos los registros de la tabla de localidades y los devuelve en formato JSON. 
    public function index()
    {
        // Usamos 'with' para que el JSON incluya los datos de la localidad asociada
        $localidad = Localidad::with('municipio')->get();
        return response()->json($localidad, 200);
    }

    // Este método recibe los datos del formulario para registrar una nueva localidad. 
    // Pasa una validación de seguridad y guardacel resgistro en la BD.
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

    // Este método busca una localidad concreta utilizando su ID. 
    // Le añadimos el 'with' para que muestre el municipio.
    // Si el ID que nos pasan no existe, devolvemos un error 404.
    public function show($id)
    {
        $localidad = Localidad::with('municipio')->find($id);
        if (!$localidad) return response()->json(['message' => 'localidad no encontrada'], 404);
        
        return response()->json($localidad, 200);
    }

    // Este método actualiza la información de una localidad que ya tenemos guardado. 
    // Primero busca que la localidad exista. Si está, lo valida y finalmente guarda los nuevos datos.
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

    // Este método elimina una localidad. Busca el registro por su ID y, si lo encuentra, lo borra de la base de datos.
    public function destroy($id)
    {
        $localidad = Localidad::find($id);
        if (!$localidad) return response()->json(['message' => 'localidad no encontrada'], 404);

        $localidad->delete();

        return response()->json(['message' => 'localidad eliminada correctamente'], 200);
    }
}
