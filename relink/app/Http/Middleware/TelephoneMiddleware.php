<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

// Este middleware tiene el fin de que el usuario para publicar anuncios complete su perfil añadiendo el teléfono, ya que al no tener 
// chat, usamos whatsapp. Asi dejamos el register limpio para la experiencia del usuario.
class TelephoneMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        // Si al usuario le falta el teléfono
        if (!$request->user()->telefono) {
            // Cortamos la acción
            return response()->json([
                'success' => false,
                'message' => 'Para publicar un anuncio debes completar tu número de teléfono en tu perfil.'
            ], 403);
        }

        return $next($request);
    }
}
