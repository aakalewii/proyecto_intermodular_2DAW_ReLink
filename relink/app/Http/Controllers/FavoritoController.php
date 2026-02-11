<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FavoritoController extends Controller
{
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
}
