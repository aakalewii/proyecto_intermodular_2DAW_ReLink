<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Anuncio extends Model
{
    protected $table = 'anuncios';

    protected $fillable = [
        'titulo',
        'descripcion',
        'precio',
        'localidad_id',
        'fecha_publi',
        'user_id',
        'subcategoria_id',
        'estado'
    ];

    public function user() {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function subcategoria() {
        return $this->belongsTo(Subcategoria::class, 'subcategoria_id');
    }

    public function ubicacion() {
        return $this->belongsTo(Localidad::class, 'localidad_id');
    }

    public function imagenes(){
        return $this->hasMany(ImagenAnuncio::class);
    }

    public function favorito_usuarios()
    {
        return $this->belongsToMany(User::class, 'favoritos');
    }
}
