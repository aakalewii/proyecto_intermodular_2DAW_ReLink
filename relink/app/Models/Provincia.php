<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

// Esta clase representa a las provincias en nuestra base de datos. Al heredar de Model, 
// nos permite interactuar con la tabla de provincias usando Eloquent, sin tener que escribir consultas SQL manuales.
class Provincia extends Model
{
    // Esta propiedad le especifica a Laravel el nombre exacto de la tabla. 
    protected $table = 'provincias';

    // Esta propiedad es nuestro filtro de seguridad para la asignación masiva. Le indica al sistema que, 
    // al crear o editar una provincia de golpe, solo se permite guardar el nombre y el ID del país al que pertenece, 
    // bloqueando cualquier otro dato que no deba tocarse.
    protected $fillable = [
        'nombre',
        'pais_id'
    ];

    // Este método crea una relación de "uno a muchos". Le explica a Laravel que dentro de una misma provincia podemos encontrar múltiples municipios, 
    // y que el sistema debe buscarlos usando el identificador de la provincia.
    public function municipios(): hasMany
    {
        return $this->hasMany(Municipio::class, 'provincia_id');
    }

    // Este método es la relación inversa a la que acabamos de ver. Nos permite coger una provincia cualquiera y preguntarle directamente a qué país 
    // pertenece, usando el campo 'pais_id' como puente para traer todos los datos de ese país.
    public function pais()
    {
        return $this->belongsTo(Pais::class, 'pais_id');
    }
}
