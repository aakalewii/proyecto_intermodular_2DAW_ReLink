<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

// Esta clase representa a los países dentro de nuestra aplicación. Al heredar de Model, 
// Laravel la conecta mágicamente con la base de datos para que podamos hacer consultas de forma muy sencilla.
class Pais extends Model
{
    // Esta propiedad le indica a Laravel el nombre exacto de la tabla en la base de datos. 
    protected $table = 'paises';

    // Esta propiedad funciona como una lista blanca de seguridad. Le dice al sistema que, si intentamos crear o actualizar un país de golpe 
    // con muchos datos, el único campo que tiene permiso para guardarse en la base de datos es el 'nombre'.
    protected $fillable = [
        'nombre',
    ];

    // Este método establece la relación directa que hay entre los países y las provincias. 
    // Básicamente le dice a Laravel que un mismo país puede tener dentro de él muchísimas provincias, y que las busque usando el identificador 'pais_id'.
    public function provincias(): hasMany 
    {
        return $this->hasMany(Provincia::class, 'pais_id');
    }
}
