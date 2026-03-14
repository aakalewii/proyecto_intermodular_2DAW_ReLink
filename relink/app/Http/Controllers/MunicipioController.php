<?php

namespace App\Http\Controllers;

use App\Models\Municipio;
use Illuminate\Http\Request;

// CURD de Municipios
class MunicipioController extends Controller
{

// Este método va a la base de datos, coge todos los registros de la tabla de municipios y los devuelve en formato JSON. 
    public function index()
    {
        // Usamos 'with' para que el JSON incluya los datos de la provincia asociada
        $municipios = Municipio::with('provincia')->get();
        return response()->json($municipios, 200);
    }

    // Este método se encarga de guardar un municipio nuevo en la base de datos. 
    // Se valida y se guarda en la base de datos.
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

    // Este método busca un municipio concreto utilizando su ID. 
    // Le añadimos el 'with' para que muestre la provincia.
    // Si el ID que nos pasan no existe, devolvemos un error 404.
    public function show($id)
    {
        $municipio = Municipio::with('provincia')->find($id);
        if (!$municipio) return response()->json(['message' => 'municipio no encontrado'], 404);
        
        return response()->json($municipio, 200);
    }

    // Este método actualiza la información de un municipio que ya tenemos guardado. 
    // Primero busca que el municipio exista. Si está, lo valida y finalmente guarda los nuevos datos.
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

    // Este método elimina un municipio. Busca el registro por su ID y, si lo encuentra, lo borra de la base de datos.
    public function destroy($id)
    {
        $municipio = Municipio::find($id);
        if (!$municipio) return response()->json(['message' => 'municipio no encontrado'], 404);

        $municipio->delete();

        return response()->json(['message' => 'municipio eliminado correctamente'], 200);
    }
}
