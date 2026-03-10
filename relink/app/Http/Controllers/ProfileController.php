<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

class ProfileController extends Controller
{
    public function mostrarPerfil(Request $request){
         
        $userId = $request->user()->id;
        $user = User::with(['localidad', 'anuncios'])->find($userId);

        return response()->json([
            'mensaje' => 'Perfil personal.',
            'datos' => [
                'nombre_completo' => $user->name . ' ' . $user->apellidos,
                'email' => $user->email,
                'contraseña' => $user->password,
                'telefono' => $user->telefono,
                'localidad_id' => $user->localidad_id,
                'localidad_nombre' => $user->localidad ? $user->localidad->nombre : 'No definida',
                'anuncios' => $user->anuncios
            ]
        ], 200);
    }

    public function editarPerfil(Request $request){
        
        $user = $request->user();

        $validated = $request->validate([
        'name' => ['required', 'string', 'max:255'],
        'apellidos' => ['nullable', 'string', 'max:255'],
        'telefono' => ['nullable', 'string', 'max:255'],
        'localidad_id' => ['nullable', 'exists:localidades,id'],
    ]);

        $user->update($validated);
        return response()->json([
        'message' => 'Actualizado con éxito',
        'data' => $user->load('localidad')
        ], 200);
    }

    public function verPerfil(int $id)
{
    // Buscamos al usuario y cargamos sus anuncios activos
    $user = User::with('anuncios', 'localidad')->find($id);

    if (!$user) {
        return response()->json(['message' => 'Vendedor no encontrado'], 404);
    }

    return response()->json([
        'data' => [
            'nombre' => $user->name,
            'apellidos' => $user->apellidos,
            'telefono' => $user->telefono,
            'localidad' => $user->localidad ? $user->localidad->nombre : 'No definida',
            'anuncios' => $user->anuncios, 
        ]
    ], 200);
}
}
