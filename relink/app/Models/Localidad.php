<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;


class Localidad extends Model
{
    protected $table = 'localidades';

    protected $fillable = [
        'nombre',
        'municipio_id'
    ];

    public function anuncios(): hasMany 
    {
        return $this->hasMany(Anuncio::class, 'localidad_id');
    }

    public function users(): hasMany 
    {
        return $this->hasMany(User::class, 'localidad_id');
    }
    public function municipio(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Municipio::class);
    }
}
