<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Anuncio;
use Illuminate\Support\Facades\DB;

class SwipeController extends Controller
{
    public function verAnunciosSwipe(Request $request){     
        // Empezamos la consulta base (Solo anuncios publicados y cargamos al usuario)
        $query = Anuncio::with('user:id,name,apellidos,telefono','imagenes','ubicacion')->where('estado', 'publicado');

        if ($request->categoria_id != null) {
            $query->whereHas('subcategoria', function ($q) use ($request) {
                $q->where('categoria_id', $request->categoria_id);
            });
        }

        // Añadimos filtros poco a poco, solo si el usuario los ha enviado.
        if ($request->subcategoria_id != null) {
            $query->where('subcategoria_id', $request->subcategoria_id);
        }

        if ($request->localidad_id != null) {
            $query->where('localidad_id', $request->localidad_id);
        }

        if ($request->precio_min != null) {
            $query->where('precio', '>=', $request->precio_min);
        }

        if ($request->precio_max != null) {
            $query->where('precio', '<=', $request->precio_max);
        }

        // Excluir los Dislikes de la Base de Datos
        $user = $request->user(); // Pillamos al usuario que está conectado
        if ($user != null) {
            // Sacamos un array solo con los números de los anuncios que no le gustan al usuario
            $dislikesDelUsuario = DB::table('dislikes')
                ->where('user_id', $user->id)
                ->pluck('anuncio_id')
                ->toArray();
            
            // Si la lista tiene algo, le decimos a la consulta que ignore esos IDs
            if (count($dislikesDelUsuario) > 0) {
                $query->whereNotIn('id', $dislikesDelUsuario);
            }
        }

        if ($user != null) {
            // Sacamos un array solo con los números de los anuncios que le gustan al usuario
            $favoritosDelUsuario = DB::table('favoritos')
                ->where('user_id', $user->id)
                ->pluck('anuncio_id')
                ->toArray();
            
            // Si la lista tiene algo, le decimos a la consulta que ignore esos IDs
            if (count($favoritosDelUsuario) > 0) {
                $query->whereNotIn('id', $favoritosDelUsuario);
            }
        }

        // Cogemos 10 en aleatorio y cerramos la consulta
        $anuncios = $query->inRandomOrder()->limit(10)->get();

        return response()->json($anuncios);
    }
}
