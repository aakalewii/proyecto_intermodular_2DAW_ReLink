<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Enums\AnuncioEstado;

class ProfileController extends Controller
{
    public function mostrarPerfil(Request $request){
<<<<<<< Updated upstream
        $user = $request->user();
=======

        $userId = $request->user()->id;
        $user = User::with(['localidad', 'anuncios' => function ($query) {
            $query->where('estado', AnuncioEstado::PUBLICADO->value);
        }])->find($userId);
>>>>>>> Stashed changes

        return response()->json([
            'mensaje' => 'Perfil personal.',
            'datos' => [
<<<<<<< Updated upstream
=======
                'nombre' => $user->name,
                'apellidos' => $user->apellidos,
>>>>>>> Stashed changes
                'nombre_completo' => $user->name . ' ' . $user->apellidos,
                'email' => $user->email,
                'contraseña' => $user->password,
                'telefono' => $user->telefono
            ]
        ], 200);
    }

    public function editarPerfil(Request $request){
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
            'telefono'  => $user->telefono, 
            'anuncios'  => $user->anuncios, 
=======
            'telefono' => $user->telefono,
            'localidad' => $user->localidad ? $user->localidad->nombre : 'No definida',
            'anuncios' => $user->anuncios,
>>>>>>> Stashed changes
        ]
    ], 200);
}
}
