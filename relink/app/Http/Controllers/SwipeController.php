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

        // Leer el token de Sanctum aunque la ruta sea pública
        $user = auth('sanctum')->user();

        if ($user != null) {
            // Excluir Dislikes
            $dislikesDelUsuario = DB::table('dislikes')
                ->where('user_id', $user->id)
                ->pluck('anuncio_id')
                ->toArray();

            if (count($dislikesDelUsuario) > 0) {
                $query->whereNotIn('id', $dislikesDelUsuario);
            }

            // Excluir Favoritos
            $favoritosDelUsuario = DB::table('favoritos')
                ->where('user_id', $user->id)
                ->pluck('anuncio_id')
                ->toArray();

            if (count($favoritosDelUsuario) > 0) {
                $query->whereNotIn('id', $favoritosDelUsuario);
            }

            // Para que no salgan los anuncios del propio usuario
            $query->where('user_id', '!=', $user->id);
        }

        // Cogemos 10 en aleatorio y cerramos la consulta
        $anuncios = $query->inRandomOrder()->limit(10)->get();

        return response()->json($anuncios);
    }
}
