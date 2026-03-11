<?php

namespace App\DAOs;

use Illuminate\Support\Facades\DB;
use App\Enums\AnuncioEstado;
use Illuminate\Support\Facades\Storage; // <--- Añadimos Storage para poder borrar los archivos físicos

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

<<<<<<< Updated upstream
=======
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

>>>>>>> Stashed changes
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

    public function eliminarAnuncioLogico($id)
    {
        return DB::update('UPDATE anuncios SET estado = ? WHERE id = ?', [
            AnuncioEstado::ELIMINADO->value,
            $id
        ]);
    }

    // ==========================================
    // NUEVAS FUNCIONES PARA IMÁGENES
    // ==========================================

    public function guardarImagen($anuncioId, $ruta)
    {
        // Si tu tabla imagenes_anuncio tiene created_at y updated_at, puedes añadirlos en este array
        DB::table('imagenes_anuncio')->insert([
            'url' => $ruta,
            'anuncio_id' => $anuncioId
        ]);
    }

    public function eliminarImagenes(array $ids, $anuncioId)
    {
        if (empty($ids)) return;

        // 1. Buscamos las imágenes asegurándonos de que pertenecen a este anuncio por seguridad
        $imagenes = DB::table('imagenes_anuncio')
            ->whereIn('id', $ids)
            ->where('anuncio_id', $anuncioId)
            ->get();

        // 2. Borramos los archivos físicos del disco duro
        foreach ($imagenes as $img) {
            Storage::disk('public')->delete($img->url);
        }

        // 3. Las borramos de la base de datos de golpe
        DB::table('imagenes_anuncio')
            ->whereIn('id', $ids)
            ->where('anuncio_id', $anuncioId)
            ->delete();
    }
}
