<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ImagenAnuncio extends Model
{
    protected $table = 'imagenes_anuncio';

    protected $fillable = ['url', 'anuncio_id'];

    public function anuncio()
    {
        return $this->belongsTo(Anuncio::class);
    }
}
