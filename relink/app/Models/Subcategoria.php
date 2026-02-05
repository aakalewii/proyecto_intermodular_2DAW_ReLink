<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subcategoria extends Model
{
    // Nombre de la tabla
    protected $table = "subcategorias";

    // Clave primaria
    protected $primaryKey = "id";

    // Campos rellenables
    protected $fillable = [
        "nombre",
        "descripcion",
        "categoria_id"
    ];

    // La tabla tiene timestamps
    public $timestamps = true;

    // Relación: una subcategoría pertenece a una categoría
    public function categoria()
    {
        return $this->belongsTo(Categoria::class, 'categoria_id');
    }

    // Relación: una subcategoría tiene muchos anuncios
    public function anuncios()
    {
        return $this->hasMany(Anuncio::class, 'subcategoria_id');
    }
}