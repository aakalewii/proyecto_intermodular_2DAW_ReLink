<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

// Controller donde ingresaremos utilidades para no saturar los demás
class UtilitysController extends Controller
{
    // Método para recibir nuestros datos
    public function misDatos(Request $request)
    {
        $user = $request->user();

        if ($user == null) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }

        return response()->json($user, 200);
    }
}
