<?php

namespace App\DAOs;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Enums\AnuncioEstado;
use Illuminate\Support\Facades\Storage;

// Esta clase implementa el patrón de diseño DAO (Data Access Object).
// Su objetivo es aislar todas las consultas SQL directas a la base de datos relacionadas con los anuncios.
class AnuncioDAO
{
    // Este método se encarga de insertar un anuncio nuevo en la base de datos mediante una consulta SQL.
    // Utiliza interrogantes (?) como parámetros para prevenir ataques de inyección SQL.
    // Una vez guardado, recupera el ID generado automáticamente por la base de datos (lastInsertId)
    // y devuelve el objeto completo del anuncio recién creado.
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

    // Este método extrae el listado general de anuncios visibles. Trae absolutamente todos los anuncios públicos.
    // Además, incorpora una subconsulta para inyectar la URL de la primera imagen de cada anuncio.
    public function obtenerPublicados($busqueda = null, $userId = null)
    {
        $sql = 'SELECT anuncios.*,
                    (SELECT url FROM imagenes_anuncio WHERE anuncio_id = anuncios.id LIMIT 1) as foto_principal
                FROM anuncios
                WHERE estado = ?';

        $parametros = [
            \App\Enums\AnuncioEstado::PUBLICADO->value
        ];

        // Si nos llega una palabra, le añadimos el filtro a la consulta
        if ($busqueda) {
            $sql .= ' AND titulo LIKE ?';
            $parametros[] = '%' . $busqueda . '%';
        }

        // Si estás logueado, excluir los anuncios que marcaste como "No me interesa"
        if ($userId) {
            $sql .= ' AND anuncios.id NOT IN (SELECT anuncio_id FROM dislikes WHERE user_id = ?)';
            $parametros[] = $userId;
        }

        return DB::select($sql, $parametros);

    }

    // La función de este método es buscar en la base de datos un anuncio concreto a partir de su ID
    public function obtenerAnuncioPorId($id)
    {
        // Obetenemos un anuncio por id
        return DB::selectOne('SELECT * FROM anuncios WHERE id = ?', [$id]);
    }

    // Este es el método está diseñado para cargar la vista detallada de un anuncio.
    // Primero busca el anuncio asegurándose de que esté publicado.
    // Luego, hace varias consultas adicionales para añadir la información del vendedor, la localidad, la galería completa de imágenes,
    // la subcategoría y la categoría principal.
    public function obtenerDetalleAnuncio($id)
    {
        // Buscamos el anuncio con el id
        $anuncio = DB::selectOne('SELECT * FROM anuncios WHERE id = ? AND estado = ?', [
            $id,
            AnuncioEstado::PUBLICADO->value
        ]);

        if (!$anuncio) return null;

        $anuncio->user = DB::selectOne('SELECT id, name, telefono FROM users WHERE id = ?', [$anuncio->user_id]);
        $anuncio->localidad = DB::selectOne('SELECT id, nombre FROM localidades WHERE id = ?', [$anuncio->localidad_id]);
        $anuncio->imagenes = DB::select('SELECT id, url FROM imagenes_anuncio WHERE anuncio_id = ?', [$id]);

        $anuncio->subcategoria = DB::selectOne('SELECT id, nombre, categoria_id FROM subcategorias WHERE id = ?', [$anuncio->subcategoria_id]);

        if ($anuncio->subcategoria) {
            $categoria = DB::selectOne('SELECT id, nombre FROM categorias WHERE id = ?', [$anuncio->subcategoria->categoria_id]);
            $anuncio->subcategoria->categoria = $categoria;
            $anuncio->categoria = $categoria;
        }

        return $anuncio;
    }

    // Este método procesa los cambios de un anuncio existente.
    // Ejecuta una sentencia UPDATE.
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

    // Este método implementa un borrado lógico.
    // En lugar de ejecutar un comando DELETE, cambia la columna 'estado' al valor 'ELIMINADO'.
    public function eliminarAnuncio($id)
    {
        return DB::update('UPDATE anuncios SET estado = ? WHERE id = ?', [
            AnuncioEstado::ELIMINADO->value,
            $id
        ]);
    }

    // FUNCIONES PARA IMÁGENES

    // Este método auxiliar gestiona la inserción de nuevas fotos.
    // Recibe el ID del anuncio al que pertenece la foto y la ruta del archivo,
    // e inserta rápida en la tabla intermedia de imágenes.
    public function guardarImagen($anuncioId, $ruta)
    {
        DB::table('imagenes_anuncio')->insert([
            'url' => $ruta,
            'anuncio_id' => $anuncioId
        ]);
    }

    // Este método se encarga de limpiar las imágenes tanto de la base de datos como del servidor físico.
    // Busca las imágenes asegurándonos de que pertenecen a este anuncio por seguridad
    // Luego, borra los archivos físicos del disco duro, y finalmente la borramos de la base de datos.
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
