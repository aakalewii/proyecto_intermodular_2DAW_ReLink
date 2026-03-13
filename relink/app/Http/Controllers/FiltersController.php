<?php

namespace App\Http\Controllers;


use App\Models\Anuncio;
use Illuminate\Support\Facades\DB;



class FiltersController extends Controller
{
    public function tituloAnuncio(String $titulo)
    {
        $anuncios = DB::table('anuncios')
        ->where('titulo', 'like', '%' . $titulo . '%')
        ->where('estado', 'publicado')
        ->select('anuncios.*')
        ->addSelect(['foto_principal' => DB::table('imagenes_anuncio')
            ->select('url')
            ->whereColumn('anuncio_id', 'anuncios.id')
            ->orderBy('id', 'asc')
            ->limit(1)
        ])
        ->get();
        
        return response()->json($anuncios);
    }

    public function categoriaAnuncio(int $categoria_id)
    {
        $anuncios = Anuncio::with('imagenes')
        ->where('subcategoria_id.categoria_id', $categoria_id)
        ->where('estado', 'publicado')
        ->get();
        
        return response()->json($anuncios);

    }

    public function subcategoriaAnuncio(int $subcategoria_id)
    {
        $anuncios = Anuncio::with('imagenes')
        ->where('subcategoria_id.', $subcategoria_id)
        ->where('estado', 'publicado')
        ->get();
        
        return response()->json($anuncios);

    }

    public function localidadAnuncio(int $localidad_id)
    {
        $anuncios = Anuncio::with('imagenes')
        ->where('localidad_id', $localidad_id)
        ->where('estado', 'publicado')
        ->get();
        
        return response()->json($anuncios);

    }
}
