<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Enums\AnuncioEstado; // <-- ¡MUY IMPORTANTE! Añadimos esto para poder usar el estado

class ProfileController extends Controller
{
    public function mostrarPerfil(Request $request){

        $userId = $request->user()->id;

        // ¡LA MAGIA ESTÁ AQUÍ! Filtramos la relación de anuncios
        $user = User::with(['localidad', 'anuncios' => function ($query) {
            $query->where('estado', AnuncioEstado::PUBLICADO->value);
        }])->find($userId);

        return response()->json([
            'mensaje' => 'Perfil personal.',
            'datos' => [
                'nombre' => $user->name,
                'apellidos' => $user->apellidos,
                'nombre_completo' => $user->name . ' ' . $user->apellidos,
                'email' => $user->email,
                'contraseña' => $user->password, // Nota: Por seguridad, normalmente no se envía la contraseña al frontend
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
        // ¡TAMBIÉN LO APLICAMOS AQUÍ! Para que otros no vean los anuncios borrados
        $user = User::with(['localidad', 'anuncios' => function ($query) {
            $query->where('estado', AnuncioEstado::PUBLICADO->value);
        }])->find($id);

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
