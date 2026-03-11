<?php

namespace App\DAOs;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

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
            'publicado'
        ]);

        $nuevoId = DB::getPdo()->lastInsertId();
        return $this->obtenerAnuncioPorId($nuevoId);
    }

    public function obtenerPublicados()
    {
        return DB::select('SELECT * FROM anuncios WHERE estado = ?', [
            'publicado'
        ]);
    }

    public function obtenerDetalleAnuncio($id)
    {
        $anuncio = DB::selectOne('SELECT * FROM anuncios WHERE id = ? AND estado = ?', [
            $id,
            'publicado'
        ]);

        if (!$anuncio) return null;

        $anuncio->user = DB::selectOne('SELECT id, name FROM users WHERE id = ?', [$anuncio->user_id]);
        $anuncio->localidad = DB::selectOne('SELECT id, nombre FROM localidades WHERE id = ?', [$anuncio->localidad_id]);
        $anuncio->imagenes = DB::select('SELECT id, url FROM imagenes_anuncio WHERE anuncio_id = ?', [$id]);

        return $anuncio;
    }

    public function obtenerAnuncioPorId($id)
    {
        // Esta función es necesaria porque crearAnuncio y actualizarAnuncio la llaman
        $anuncio = DB::selectOne('SELECT * FROM anuncios WHERE id = ?', [$id]);
        if ($anuncio) {
            $anuncio->imagenes = DB::select('SELECT id, url FROM imagenes_anuncio WHERE anuncio_id = ?', [$id]);
        }
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
            'eliminado',
            $id
        ]);
    }

    public function guardarImagen($anuncioId, $ruta)
    {
        DB::table('imagenes_anuncio')->insert([
            'url' => $ruta,
            'anuncio_id' => $anuncioId
        ]);
    }

    public function eliminarImagenes(array $ids, $anuncioId)
    {
        if (empty($ids)) return;

        $imagenes = DB::table('imagenes_anuncio')
            ->whereIn('id', $ids)
            ->where('anuncio_id', $anuncioId)
            ->get();

        foreach ($imagenes as $img) {
            Storage::disk('public')->delete($img->url);
        }

        DB::table('imagenes_anuncio')
            ->whereIn('id', $ids)
            ->where('anuncio_id', $anuncioId)
            ->delete();
    }
}
