<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

// Esta clase es la encargada de gestionar toda la lógica relacionada con los anuncios que a los usuarios "No les gustan" (Dislikes).
class DislikeController extends Controller
{
    // Este método funciona como un interruptor o "toggle" para el botón de dislike.
    // Recibe la petición del usuario y el ID del anuncio. Primero comprueba si ese anuncio ya tiene dislike por el usuario.
    // Si lo tiene, lo borra (quita el dislike). Si no lo encuentra en la base de datos, lo inserta (añade el dislike).
    public function handleDislike(Request $request, int $anuncio_id)
    {
        $user = $request->user();

        $dislike = DB::table('dislikes')->
            where('user_id', $user->id)->
            where('anuncio_id', $anuncio_id)->
            first();

        if ($dislike) {
            DB::table('dislikes')
                ->where('user_id', $user->id)
                ->where('anuncio_id', $anuncio_id)
                ->delete();

                return response()->json(['message' => 'Dislike eliminado'], 200);
        }else{

                DB::table('dislikes')->insert([
                'user_id' => $user->id,
                'anuncio_id' => $anuncio_id,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            return response()->json(['message' => 'Dislike añadido'], 201);
        }
    }

    // Este método devuelve la lista completa de anuncios a los que un usuario ha dado dislike.
    // Para hacerlo más eficiente, hago un 'join' entre la tabla de anuncios y la de dislikes.
    // Además, uso una subconsulta (addSelect) para extraer únicamente la primera foto de cada anuncio.
    public function index(Request $request){

        $user = $request->user();

        $dislikes = DB::table('anuncios')
            ->join('dislikes', 'anuncios.id', '=', 'dislikes.anuncio_id')
            ->where('dislikes.user_id', $user->id)
            ->where('anuncios.estado', 'publicado')
            ->select('anuncios.*')
            ->addSelect(['foto_principal' => DB::table('imagenes_anuncio')
            ->select('url')
            ->whereColumn('anuncio_id', 'anuncios.id')
            ->orderBy('id', 'asc')
            ->limit(1)
            ])
            ->get();

        if ($dislikes->isEmpty()) {
            return response()->json([
                'message' => 'No has dado dislike a ningún anuncio',
                'datos' => []
            ], 200);
        }

        return response()->json([
            'message' => 'Lista de dislikes',
            'datos' => $dislikes
        ], 200);

    }

    // Este método es una comprobación rápida que utilizamos en el Frontend cuando carga la página de un anuncio en concreto.
    public function checkDislike(Request $request, int $anuncio_id)
    {
        $user = $request->user();

        $existe = DB::table('dislikes')
            ->where('user_id', $user->id)
            ->where('anuncio_id', $anuncio_id)
            ->exists();

        return response()->json([
            'is_dislike' => $existe
        ], 200);
    }
}
