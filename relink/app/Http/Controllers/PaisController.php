<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Pais;

// CRUD de paises
class PaisController extends Controller
{
    
// Este método va a la base de datos, y coge todos los registros de la tabla de países y los devuelve en formato JSON. 
    public function index()
    {
        return response()->json(Pais::all(), 200);
    }

// Este método se encarga de recibir los datos cuando queremos crear un país nuevo. 
// Antes de guardar nada, pasa un filtro de validación. Si todo está correcto, lo guarda y devuelve el nuevo país creado.
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

// Este método sirve para consultar los datos de un único país en concreto pasándole su ID por la URL. 
// Primero intenta buscarlo; si el país no existe, cortamos la ejecución y devolvemos un error 404 estándar. 
// Si lo encuentra, devuelve los datos.
    public function show($id)
    {
        $pais = Pais::find($id);
        if (!$pais) return response()->json(['message' => 'País no encontrado'], 404);
        
        return response()->json($pais, 200);
    }

// Este método procesa la edición de un país que ya existe. 
// Primero comprueba que el país siga en la base de datos. 
// en la validación le decimos que el nombre debe ser único en la tabla. 
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

// Este método es el encargado de borrar un país del sistema. 
// Primero se asegura de que el país con ese ID realmente exista. 
// Si lo encuentra, lo elimina definitivamente de la base de datos.
    public function destroy($id)
    {
        $pais = Pais::find($id);
        if (!$pais) return response()->json(['message' => 'País no encontrado'], 404);

        $pais->delete();

        return response()->json(['message' => 'País eliminado correctamente'], 200);
    }
}
