<?php

namespace App\Http\Controllers;


use App\Models\Anuncio;



class FiltersController extends Controller
{
    public function tituloAnuncio(String $titulo)
    {
        $anuncios = Anuncio::with('imagenes')
        ->where('titulo', 'like', '%' . $titulo . '%')
        ->where('estado', 'publicado')
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
