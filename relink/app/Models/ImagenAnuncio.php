<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ImagenAnuncio extends Model
{
    // Esta propiedad le indica a Laravel el nombre exacto de la tabla en la base de datos.
    protected $table = 'imagenes_anuncio';

    // Este es nuestro filtro de seguridad para la "Asignación Masiva".
    // Solo permitimos que se guarden de forma automática la ruta de la imagen ('url')
    // y el identificador del anuncio al que pertenece ('anuncio_id').
    protected $fillable = ['url', 'anuncio_id'];

    // Este método define la relación inversa de "Uno a Muchos".
    // Le explica a la base de datos que "Esta Imagen pertenece a un Anuncio concreto".
    public function anuncio()
    {
        return $this->belongsTo(Anuncio::class);
    }
}
