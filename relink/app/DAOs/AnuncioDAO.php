<?php

namespace App\DAOs;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Enums\AnuncioEstado;
use Illuminate\Support\Facades\Storage;

class AnuncioDAO
{
    public function crearAnuncio($datos, $userId, $fechaPubli)
    {
        // Insertamos en la tabla de anuncios
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

    public function obtenerPublicados($user = null)
    {
        // Obtenemos los anuncios que no sean del usuario
        if ($user == null) {
            return DB::select('SELECT anuncios.*, 
                (SELECT url FROM imagenes_anuncio WHERE anuncio_id = anuncios.id LIMIT 1) as foto_principal 
                FROM anuncios 
                WHERE estado = ?
            ', [
            AnuncioEstado::PUBLICADO->value
            ]);
        }

        return DB::select('SELECT anuncios.*, 
            (SELECT url FROM imagenes_anuncio WHERE anuncio_id = anuncios.id LIMIT 1) as foto_principal 
            FROM anuncios 
            WHERE estado = ? AND user_id != ?
        ', [
            AnuncioEstado::PUBLICADO->value,
            $user
        ]);

    }

    public function obtenerAnuncioPorId($id)
    {
        // Obetenemos un anuncio por id
        return DB::selectOne('SELECT * FROM anuncios WHERE id = ?', [$id]);
    }

    public function obtenerDetalleAnuncio($id)
    {
        // Buscamos el anuncio con el id
        $anuncio = DB::selectOne('SELECT * FROM anuncios WHERE id = ? AND estado = ?', [
            $id,
            AnuncioEstado::PUBLICADO->value
        ]);

        if (!$anuncio) return null;

        // Le pasamos los datos de usuario, localidad, imagenes
        $anuncio->user = DB::selectOne('SELECT id, name FROM users WHERE id = ?', [$anuncio->user_id]);
        $anuncio->localidad = DB::selectOne('SELECT id, nombre FROM localidades WHERE id = ?', [$anuncio->localidad_id]);
        $anuncio->imagenes = DB::select('SELECT id, url FROM imagenes_anuncio WHERE anuncio_id = ?', [$id]);

        // Traer la subcategoría y su categoría padre
        $anuncio->subcategoria = DB::selectOne('SELECT id, nombre, categoria_id FROM subcategorias WHERE id = ?', [$anuncio->subcategoria_id]);

        if ($anuncio->subcategoria) {
            // Lo guardamos tanto dentro de subcategoria como directo en el anuncio para que el JS lo encuentre a la primera
            $categoria = DB::selectOne('SELECT id, nombre FROM categorias WHERE id = ?', [$anuncio->subcategoria->categoria_id]);
            $anuncio->subcategoria->categoria = $categoria;
            $anuncio->categoria = $categoria;
        }

        return $anuncio;
    }

    public function actualizarAnuncio($id, $datos)
    {
        // Actualizamos los datos del anuncio con el id
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
        // Eliminamos el anuncio 'cambiandole el estado'
        return DB::update('UPDATE anuncios SET estado = ? WHERE id = ?', [
            AnuncioEstado::ELIMINADO->value,
            $id
        ]);
    }

    // FUNCIONES PARA IMÁGENES

    public function guardarImagen($anuncioId, $ruta)
    {
        // Insertar en imagenes_anuncio
        DB::table('imagenes_anuncio')->insert([
            'url' => $ruta,
            'anuncio_id' => $anuncioId
        ]);
    }

    public function eliminarImagenes(array $ids, $anuncioId)
    {
        if (empty($ids)) return;

        // Buscamos las imágenes asegurándonos de que pertenecen a este anuncio por seguridad
        $imagenes = DB::table('imagenes_anuncio')
            ->whereIn('id', $ids)
            ->where('anuncio_id', $anuncioId)
            ->get();

        // Borramos los archivos físicos del disco duro
        foreach ($imagenes as $img) {
            Storage::disk('public')->delete($img->url);
        }

        // Las borramos de la base de datos de golpe
        DB::table('imagenes_anuncio')
            ->whereIn('id', $ids)
            ->where('anuncio_id', $anuncioId)
            ->delete();
    }
}
