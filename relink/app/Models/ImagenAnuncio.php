<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ImagenAnuncio extends Model
{
    protected $table = 'imagenes_anuncios';

    protected $fillable = ['ruta', 'anuncio_id'];

    public function anuncio()
    {
        return $this->belongsTo(Anuncio::class);
    }
}
