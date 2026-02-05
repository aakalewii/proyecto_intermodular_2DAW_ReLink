<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

class ProfileController extends Controller
{
    public function mostrarPerfil(Request $request){
        $user = $request->user();

        return response()->json([
            'mensaje' => 'Perfil personal.',
            'datos' => [
                'nombre_completo' => $user->name . ' ' . $user->apellidos,
                'email' => $user->email,
                'contraseña' => $user->password,
                'telefono' => $user->telefono
            ]
        ], 200);
    }

    public function editarPerfil(Request $request){
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'apellidos' => ['nullable', 'string', 'max:255'],
            'telefono' => ['nullable', 'string', 'max:255'],
        ]);

        $user->update($validated);
        return response()->json([
        'message' => 'Actualizado con éxito',
        'data' => $user
        ], 200);
    }

    public function verPerfil(int $id)
{
    // Buscamos al usuario y cargamos sus anuncios activos
    $user = User::with('anuncios')->find($id);

    if (!$user) {
        return response()->json(['message' => 'Vendedor no encontrado'], 404);
    }

    return response()->json([
        'data' => [
            'nombre'    => $user->name,
            'apellidos' => $user->apellidos,
            'telefono'  => $user->telefono, 
            'anuncios'  => $user->anuncios, 
        ]
    ], 200);
}
}
