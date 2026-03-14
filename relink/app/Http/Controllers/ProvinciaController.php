<?php

namespace App\Http\Controllers;

use App\Models\Provincia;
use Illuminate\Http\Request;

// CRUD de Provincia
class ProvinciaController extends Controller
{

// Este método va a la base de datos, coge todos los registros de la tabla de provincias y los devuelve en formato JSON. 
    public function index()
    {
        // Usamos 'with' para que el JSON incluya los datos del país asociado
        $provincias = Provincia::with('pais')->get();
        return response()->json($provincias, 200);
    }

// Este método se encarga de registrar una nueva provincia. 
// En la validación obligamos al sistema a dirigirse a la BD y comprobar
/// que el id del país exista.
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

    // Este método sirve para ver el detalle de una sola provincia buscando por su ID. 
    // usamos el 'with' para que, si el profesor o el usuario quiere ver los datos de esta provincia concreta, 
    // le devolvamos también a qué país pertenece sin tener que hacer una segunda consulta rara desde el JavaScript.
    public function show($id)
    {
        $provincia = Provincia::with('pais')->find($id);
        if (!$provincia) return response()->json(['message' => 'Provincia no encontrada'], 404);
        
        return response()->json($provincia, 200);
    }

    // Este método procesa los cambios cuando editamos una provincia. 
    // Comprobamos si existe. Si la encuentra, aplica las reglas de validación y guarda los cambios.
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

    // Este método borra una provincia de la base de datos. Busca el ID, comprueba que existe, y ejecuta la elimina.
    public function destroy($id)
    {
        $provincia = Provincia::find($id);
        if (!$provincia) return response()->json(['message' => 'Provincia no encontrada'], 404);

        $provincia->delete();

        return response()->json(['message' => 'Provincia eliminada correctamente'], 200);
    }
}
