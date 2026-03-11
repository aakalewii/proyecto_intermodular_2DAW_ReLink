<?php

namespace App\DAOs;

use Illuminate\Support\Facades\DB;
use App\Enums\AnuncioEstado;

class AnuncioDAO
{
    public function crearAnuncio($datos, $userId, $fechaPubli)
    {
        DB::insert('INSERT INTO anuncios (titulo, descripcion, precio, localidad_id, subcategoria_id, user_id, fecha_publi, estado)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
            $datos['titulo'],
            $datos['descripcion'],
            $datos['precio'],
            $datos['localidad_id'],
            $datos['subcategoria_id'],
            $userId,
            $fechaPubli,
            AnuncioEstado::PUBLICADO->value
        ]);

        $nuevoId = DB::getPdo()->lastInsertId();
        return $this->obtenerAnuncioPorId($nuevoId);
    }

    public function obtenerPublicados()
    {
        return DB::select('SELECT * FROM anuncios WHERE estado = ?', [
            AnuncioEstado::PUBLICADO->value
        ]);
    }

    public function obtenerAnuncioPorId($id)
    {
        return DB::selectOne('SELECT * FROM anuncios WHERE id = ?', [$id]);
    }

    public function obtenerDetalleAnuncio($id)
    {
        $anuncio = DB::selectOne('SELECT * FROM anuncios WHERE id = ? AND estado = ?', [
            $id, 
            AnuncioEstado::PUBLICADO->value
        ]);

        if (!$anuncio) return null;

        $anuncio->user = DB::selectOne('SELECT id, name FROM users WHERE id = ?', [$anuncio->user_id]);
        $anuncio->localidad = DB::selectOne('SELECT id, nombre FROM localidades WHERE id = ?', [$anuncio->localidad_id]);
        $anuncio->imagenes = DB::select('SELECT id, url FROM imagenes_anuncio WHERE anuncio_id = ?', [$id]);

        return $anuncio;
    }

    public function actualizarAnuncio($id, $datos)
    {
        DB::update('UPDATE anuncios SET titulo = ?, descripcion = ?, precio = ?, localidad_id = ?, subcategoria_id = ? WHERE id = ?', [
            $datos['titulo'],
            $datos['descripcion'],
            $datos['precio'],
            $datos['localidad_id'],
            $datos['subcategoria_id'],
            $id
        ]);

        return $this->obtenerAnuncioPorId($id);
    }

    public function eliminarAnuncio($id)
    {
        return DB::update('UPDATE anuncios SET estado = ? WHERE id = ?', [
            AnuncioEstado::ELIMINADO->value,
            $id
        ]);
    }
}
