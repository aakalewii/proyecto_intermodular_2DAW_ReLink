<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Categoria extends Model
{
    // Esta propiedad define explícitamente el nombre de la tabla en la base de datos.
    protected $table = "categorias";

    // Esta línea indica cuál es la clave primaria de la tabla.
    protected $primaryKey = "id";

    // Este es el escudo de seguridad para la "Asignación Masiva".
    // Le indica a Laravel que, cuando yo le pase un array con datos desde un formulario para crear o actualizar,
    // solo tiene permitido guardar o modificar el 'nombre' y la 'descripcion'. Cualquier otro dato será ignorado.
    protected $fillable = [
        "nombre",
        "descripcion"
    ];

    // Esta propiedad activa el manejo automático de las columnas 'created_at' y 'updated_at'.
    public $timestamps = true;

    // Este método establece una relación de "Uno a Muchos".
    // Le explica a la base de datos que "Una Categoría tiene muchas Subcategorías".
    // Esto me permite hacer consultas muy limpias como $categoria->subcategorias para obtener
    // de golpe todas las subcategorías hijas, indicándole además que la clave que las une es 'categoria_id'.
    public function subcategorias()
    {
        return $this->hasMany(Subcategoria::class, 'categoria_id');
    }
}
