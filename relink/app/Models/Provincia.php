<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Provincia extends Model
{
    protected $table = 'provincias';

    protected $fillable = [
        'nombre',
        'pais_id'
    ];

    public function municipios(): hasMany 
    {
        return $this->hasMany(Municipio::class, 'provincia_id');
    }

    public function pais(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Pais::class);
    }
}
