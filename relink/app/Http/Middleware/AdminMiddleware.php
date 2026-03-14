<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\User;

// Esta clase se pone delante de las rutas privadas y asegura de que nadie que no tenga permisos pueda ingresar en el panel de administración.
class AdminMiddleware
{
    // Este método es el que ejecuta la comprobación real cada vez que alguien intenta acceder a una ruta protegida. 
    // Primero identifica quién es el usuario que hace la petición. 
    // Luego verifica que el usuario esté logueado y que el valor de su rol sea exactamente el de administrador. 
    // Si no es admin, devuelve un mensaje JSON con un error 403 de acceso denegado.
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        
            if ($user && $user->rol->value === 'admin') {
            return $next($request);
        }

        return response()->json([
            'message' => 'Acceso denegado',
            'tu_rol_es' => $user->rol 
        ], 403);
    }
}
