<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

// Esta clase es la encargada de gestionar toda la lógica relacionada con los anuncios que a los usuarios "No les gustan" (Dislikes).
class DislikeController extends Controller
{
    public function ocultar(Request $request, int $id)
    {
        $user = $request->user();

        //Borramos de favoritos primero
        DB::table('favoritos')
            ->where('user_id', $user->id)
            ->where('anuncio_id', $id)
            ->delete();

        //Añadimos a dislikes si no estaba ya
        $existe = DB::table('dislikes')
            ->where('user_id', $user->id)
            ->where('anuncio_id', $id)
            ->exists();

        if (!$existe) {
            DB::table('dislikes')->insert([
                'user_id' => $user->id,
                'anuncio_id' => $id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        return response()->json(['message' => 'Anuncio ocultado con éxito y eliminado de favoritos'], 201);
    }

    //Método para sacar un anuncio
    public function restaurar(Request $request, int $id)
    {
        DB::table('dislikes')
            ->where('user_id', $request->user()->id)
            ->where('anuncio_id', $id)
            ->delete();

        return response()->json(['message' => 'Anuncio restaurado'], 200);
    }

    // Método para listar los descartes
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
}
