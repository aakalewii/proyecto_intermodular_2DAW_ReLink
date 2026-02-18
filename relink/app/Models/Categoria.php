<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Categoria extends Model
{
    // Nombre de la tabla
    protected $table = "categorias";

    // Clave primaria
    protected $primaryKey = "id";

    // Campos que se pueden rellenar
    protected $fillable = [
        "nombre",
        "descripcion"
    ];

    public $timestamps = true;

    // Relación: una categoría tiene muchas subcategorías
    public function subcategorias()
    {
        return $this->hasMany(Subcategoria::class, 'categoria_id');
    }
}

