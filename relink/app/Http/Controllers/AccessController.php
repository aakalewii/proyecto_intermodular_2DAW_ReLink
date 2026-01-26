<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use App\Enums\UserRole;


class AccessController extends Controller
{
    public function Register(Request $request)
    {


        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8'],
            'password_confirmation' => ['required', 'string', 'same:password'],
            'apellidos' => ['nullable', 'string', 'max:255'],
            'telefono' => ['nullable', 'string', 'max:255'],
        ]);

        $user = User::create([
            'name'      => $request->name,
            'email'     => $request->email,
            'password'  => Hash::make($request->password),
            'apellidos' => $request->apellidos,
            'telefono'  => $request->telefono,
            'rol'       => UserRole::CLIENTE,
        ]);

        return response()->json([
            'message' => 'Usuario registrado con éxito',
            'user'    => $user
        ], 201);
    }

    public function Login(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Credenciales inválidas'
            ], 401);
        }

        // Si existe el campo 'activo' y el usuario está inactivo, denegar
        if (isset($user->activo) && $user->activo === 0) {
            return response()->json([
                'message' => 'Usuario no activo'
            ], 403);
        }

        // Crear token personal de acceso (Sanctum)
        $token = $user->createToken('access-token')->plainTextToken;

        return response()->json([
            'message' => 'Inicio de sesión correcto',
            'user' => $user,
            'token' => $token,
            'token_type' => 'Bearer'
        ], 200);

    }
}
