<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\DAOs\AnuncioDAO;
use App\Enums\AnuncioEstado;
use App\Models\Anuncio;
use App\Models\ImagenAnuncio;
use Illuminate\Support\Facades\DB;


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
}
