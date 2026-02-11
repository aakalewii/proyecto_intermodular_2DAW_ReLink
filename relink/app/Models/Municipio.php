<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;


class Municipio extends Model
{
    protected $table = 'municipios';

    protected $fillable = [
        'nombre',
        'provincia_id'
    ];

    public function localidades(): hasMany 
    {
        return $this->hasMany(Localidad::class, foreignKey: 'municipio_id');
    }

    public function provincia(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Provincia::class);
    }
}
