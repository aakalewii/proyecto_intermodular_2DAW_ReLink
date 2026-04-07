<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use App\Enums\UserRole;
use App\Enums\EstadoCliente;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\Rules\Password;

class AccessController extends Controller
{
    // Este método se encarga de registrar a un nuevo usuario en la plataforma.
    // Primero, utiliza el validador de Laravel para asegurar que el email sea único ('unique:users'),
    // que la contraseña tenga mínimo 8 caracteres y que coincida con el campo de confirmación ('same:password').
    // Si todo es correcto, crea el usuario en la base de datos, encriptando la contraseña con Hash::make por seguridad.
    // Finalmente, le asigna el rol de CLIENTE por defecto usando un Enum y devuelve un código 201 (Creado).
    public function Register(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => [
            'required', 
            'string', 
            'confirmed',
            Password::min(8)
                ->mixedCase()   // Mayúsculas y minúsculas
                ->numbers()     // Al menos un número
                ->symbols()     // Un símbolo (!@#$%...)
        ],
        ]);

        $user = User::create([
            'name'      => $request->name,
            'email'     => $request->email,
            'password'  => Hash::make($request->password),
            'rol'       => UserRole::CLIENTE,
            'url'       => 'perfiles/default.jpg'
        ]);

        event(new Registered($user));

        return response()->json([
            'message' => 'Usuario registrado con éxito',
            'user'    => $user
        ], 201);
    }

    // Este método procesa el inicio de sesión (Login) de los usuarios.
    // Primero busca en la base de datos si existe algún usuario con el email introducido.
    // Luego, usa Hash::check para comparar la contraseña escrita con la encriptada en la base de datos.
    // Si la contraseña es correcta y la cuenta no está desactivada, cambia el estado a 'online' (= 1).
    // usa Laravel Sanctum ($user->createToken) para generar un token de acceso seguro.
    // Este token es la "llave" que el frontend guardará (en el localStorage) para poder hacer peticiones privadas después.
    public function Login(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
            'recaptcha_token' => 'required'
        ]);

        // Preguntamos a los servidores de Google si el token es real
        // Alvaro: Http::withoutVerifying()->asForm()->post
        // Lenny:  Http::asForm()->post
        $googleResponse = Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
        'secret' => env('RECAPTCHA_SECRET_KEY'),
        'response' => $request->recaptcha_token,
        'remoteip' => $request->ip() // Opcional, pero ayuda a Google a detectar fraudes
        ]);

        $body = $googleResponse->json();

        // Si Google dice que es falso o caducó, bloqueamos el login
        if (!$body['success']) {
            return response()->json([
                'message' => 'La validación del Captcha ha fallado. Inténtalo de nuevo.'
            ], 400);
        }

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Credenciales inválidas'
            ], 401);
        }

        if ($user->estado === EstadoCliente::BLOQUEADO) {
        return response()->json([
            'message' => 'Tu cuenta ha sido suspendida. Por favor, contacta con soporte para más información.'
        ], 403); // 403 (Forbidden) es el código ideal para accesos denegados
    }

        // Si existe el campo 'activo' y el usuario está inactivo, denegar
        if (isset($user->activo) && $user->activo === 0) {
            return response()->json([
                'message' => 'Usuario no activo'
            ], 403);
        }

        // Marcamos al usuario como conectado
        $user->update(['online'=>1]);

        // Crear token personal de acceso (Sanctum)
        $token = $user->createToken('access-token')->plainTextToken;

        return response()->json([
            'message' => 'Inicio de sesión correcto',
            'user' => $user,
            'token' => $token,
            'token_type' => 'Bearer'
        ], 200);

    }

    // Este método cierra la sesión del usuario de forma segura.
    // Obtiene al usuario que está haciendo la petición gracias al token que manda en la cabecera.
    // Actualiza su estado en la base de datos para ponerlo como desconectado ('online' = 0).
    // Finalmente, destruye el token actual ($user->currentAccessToken()->delete()),
    // lo que significa que esa llave ya no servirá para entrar, obligando a loguearse de nuevo en el futuro.
    public function Logout(Request $request)
    {
        $user = $request->user();

        if ($user == null) {
            return response()->json([
                'message' => 'Usuario no encontrado'
            ], 404);
        }

        $user->update(['online'=>0]);
        $user->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Sesión cerrada con éxito'
        ], 200);
    }

}
