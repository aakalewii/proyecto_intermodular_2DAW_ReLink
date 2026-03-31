<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Enums\AnuncioEstado;
class ProfileController extends Controller
{
    // Este método devuelve la información del perfil personal del usuario que ha iniciado sesión.
    // Recupera la ID del usuario a través del token ($request->user()->id).
    // En lugar de traer todos los anuncios del usuario a lo bruto, filtramos
    // la relación trayéndonos única y exclusivamente los anuncios que tengan el estado "PUBLICADO".
    public function mostrarPerfil(Request $request){

        $userId = $request->user()->id;

        $user = User::with(['localidad', 'anuncios' => function ($query) {
            $query->with('imagenes');
        }])->find($userId);

        return response()->json([
            'mensaje' => 'Perfil personal.',
            'datos' => [
                'nombre' => $user->name,
                'apellidos' => $user->apellidos,
                'nombre_completo' => $user->name . ' ' . $user->apellidos,
                'email' => $user->email,
                'contraseña' => $user->password,
                'telefono' => $user->telefono,
                'localidad_id' => $user->localidad_id,
                'localidad_nombre' => $user->localidad ? $user->localidad->nombre : 'No definida',
                'anuncios' => $user->anuncios,
                'url' => $user->url,
            ]
        ], 200);
    }

    // Este método permite al usuario conectado modificar sus datos personales básicos.
    // Primero, recupera al usuario directamente del request. Luego, valida los campos permitiendo
    // que apellidos, teléfono y localidad puedan quedar vacíos ('nullable').
    // Después actualiza el registro usando update().
    // uso de $user->load('localidad') al final: sirve para "refrescar"
    // la relación de la localidad que acabamos de cambiar.
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

    // Este método sirve para ver el perfil público de otro usuario (por ejemplo, al hacer clic en el perfil de un vendedor).
    // A diferencia de mostrarPerfil, este recibe un $id para cargar su localidad y solo sus anuncios publicados.
    // Si no encuentra al usuario, devuelve un error 404. Si lo encuentra, devuelve un JSON mucho más restringido:
    public function verPerfil(int $id)
    {
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

    public function actualizarFoto(Request $request)
    {
        // Validamos que nos envíen la url de la foto
        $request->validate([
            'url_foto' => ['required', 'string']
        ]);

        // Sacamos al usuario de la sesión
        $user = $request->user();

        // Actualizamos SOLO la columna 'url'
        $user->url = $request->url_foto;
        $user->save();

        // Devolvemos éxito
        return response()->json([
            'message' => 'Foto de perfil actualizada correctamente',
            'url' => $user->url
        ], 200);
    }
}
