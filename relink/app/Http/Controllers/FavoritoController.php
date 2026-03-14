<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

// Esta clase es la encargada de gestionar toda la lógica relacionada con los anuncios que los usuarios guardan en su lista de favoritos. 
class FavoritoController extends Controller
{
    // Este método funciona como un interruptor o "toggle" para el botón del corazón. 
    // Recibe la petición del usuario y el ID del anuncio. Primero comprueba si ese anuncio ya está guardado por el usuario. 
    // Si lo está, lo borra (quita el favorito). Si no lo encuentra en la base de datos, lo inserta (añade el favorito).
    public function handleFavorito(Request $request, int $anuncio_id)
    {
        $user = $request->user();

        $favorito = DB::table('favoritos')->
            where('user_id', $user->id)->
            where('anuncio_id', $anuncio_id)->
            first();

        if ($favorito) {
            DB::table('favoritos')
                ->where('user_id', $user->id)
                ->where('anuncio_id', $anuncio_id)
                ->delete();
            
                return response()->json(['message' => 'Eliminado de favoritos'], 200);
        }else{

                DB::table('favoritos')->insert([
                'user_id' => $user->id,
                'anuncio_id' => $anuncio_id,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            return response()->json(['message' => 'Añadido a favoritos'], 201);
        }
    }

    // Este método devuelve la lista completa de anuncios que un usuario ha marcado como favoritos. 
    // Para hacerlo más eficiente, hago un 'join' entre la tabla de anuncios y la de favoritos. 
    // Además, uso una subconsulta (addSelect) para extraer únicamente la primera foto de cada anuncio.
    public function index(Request $request){
        
        $user = $request->user();

        $favoritos = DB::table('anuncios')
            ->join('favoritos', 'anuncios.id', '=', 'favoritos.anuncio_id')
            ->where('favoritos.user_id', $user->id)
            ->where('anuncios.estado', 'publicado')
            ->select('anuncios.*')
            ->addSelect(['foto_principal' => DB::table('imagenes_anuncio')
            ->select('url')
            ->whereColumn('anuncio_id', 'anuncios.id')
            ->orderBy('id', 'asc')
            ->limit(1)
            ])
            ->get();
            
        if ($favoritos->isEmpty()) {
            return response()->json([
                'message' => 'No tienes nada en tu lista de favoritos',
                'datos' => []
            ], 200);
        }
            
        return response()->json([
            'message' => 'Lista de favoritos',
            'datos' => $favoritos
        ], 200);

    }

    // Este método es una comprobación rápida que utilizamos en el Frontend cuando carga la página de un anuncio en concreto. 
    public function checkFavorito(Request $request, int $anuncio_id)
    {
        $user = $request->user();

        $existe = DB::table('favoritos')
            ->where('user_id', $user->id)
            ->where('anuncio_id', $anuncio_id)
            ->exists();

        return response()->json([
            'is_favorito' => $existe
        ], 200);
    }
}
