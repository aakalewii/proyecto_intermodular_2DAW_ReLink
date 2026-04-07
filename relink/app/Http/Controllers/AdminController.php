<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Enums\UserRole;
use App\Enums\EstadoCliente;
use App\Enums\AnuncioEstado;
use App\Models\Anuncio;
use Illuminate\Validation\Rule;

class AdminController extends Controller
{
    public function userList()
    {
        $users = User::all();
        return response()->json($users);
    }

    public function updateUser(Request $request, $id)
    {

        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email,' . $id],
            'telefono' => ['nullable', 'regex:/^[6][0-9]{8}$/'],
            'apellidos' => ['nullable', 'string', 'max:255'],
            'rol' => ['required', Rule::enum(UserRole::class)],
            'estado' => ['required', Rule::enum(EstadoCliente::class)], 
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Usuario actualizado correctamente',
            'user' => $user
        ]);
    }

    public function getUserStats()
    {
        $totalUsuarios = User::count();

        $totalClientes = User::where('rol', UserRole::CLIENTE->value)->count();

        $totalAdmins = User::where('rol', UserRole::ADMIN->value)->count();

        $online = User::where('online', 1)->count();

        $activos = User::where('estado', EstadoCliente::ACTIVO->value)->count();

        $bloqueados = User::where('estado', EstadoCliente::BLOQUEADO->value)->count();

        return response()->json([
        'total_usuarios' => $totalUsuarios,
        'total_clientes' => $totalClientes,
        'total_admins' => $totalAdmins,
        'online' => $online,
        'activos' => $activos,
        'bloqueados' => $bloqueados,
        ]);
    }

    public function listAnuncios()
    {
        $anuncios = Anuncio::with('user')->get();

        return response()->json($anuncios);
    }

    public function suspenderAnuncio($idAnuncio){

        $anuncio = Anuncio::findOrFail($idAnuncio);
        $anuncio->estado = AnuncioEstado::SUSPENDIDO;
        $anuncio->save();

        return response()->json(['message' => 'Anuncio suspendido correctamente']);
    }

    public function activarAnuncio($idAnuncio){

        $anuncio = Anuncio::findOrFail($idAnuncio);
        $anuncio->estado = AnuncioEstado::PUBLICADO;
        $anuncio->save();

        return response()->json(['message' => 'Anuncio activado correctamente']);
    }

    public function getAnuncioStats()
    {
        $totalAnuncios = Anuncio::count();

        $totalSuspendidos = Anuncio::where('estado', AnuncioEstado::SUSPENDIDO->value)->count();

        $totalPublicados = Anuncio::where('estado', AnuncioEstado::PUBLICADO->value)->count();


        return response()->json([
        'total_anuncios' => $totalAnuncios,
        'total_suspendidos' => $totalSuspendidos,
        'total_publicos' => $totalPublicados,
        ]);
    }
}
