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

    // Relación: una categoría tiene muchos anuncios (a través de subcategorías)
    public function anuncios()
    {
        return $this->hasManyThrough(
            Anuncio::class,          // Modelo final
            Subcategoria::class,     // Modelo intermedio
            'categoria_id',          // FK en subcategorias
            'subcategoria_id',       // FK en anuncios
            'id',                    // PK en categorias
            'id'                     // PK en subcategorias
        );
    }
}

