<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

// Esta clase representa a los municipios de nuestra base de datos. Como hereda de la clase Model, 
// nos facilita interactuar con la tabla correspondiente usando todas las herramientas ágiles que nos proporciona Eloquent.
class Municipio extends Model
{
    // Esta propiedad le dice explícitamente a Laravel cómo se llama la tabla en la base de datos. 
    protected $table = 'municipios';

    // Esta propiedad es una medida de seguridad. Le indicamos al sistema que si creamos o actualizamos un municipio de forma masiva desde un formulario, 
    // solo nos deje guardar el nombre y el ID de la provincia, ignorando cualquier otro dato.
    protected $fillable = [
        'nombre',
        'provincia_id'
    ];

    // Este método establece que un municipio puede tener muchísimas localidades dentro de él. Al usar la relación "hasMany", 
    // le decimos a Laravel que vaya a la tabla de localidades y nos traiga todas las que tengan guardado el identificador de este municipio.
    public function localidades(): hasMany 
    {
        return $this->hasMany(Localidad::class, foreignKey: 'municipio_id');
    }

    // Este método nos permite saber rápidamente a qué provincia pertenece este municipio en concreto, 
    // utilizando el "provincia_id" que tenemos guardado para buscar todos los datos de esa provincia.
    public function provincia(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Provincia::class);
    }
}
