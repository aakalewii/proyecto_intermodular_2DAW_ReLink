<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subcategoria extends Model
{
    // Esta propiedad define el nombre exacto de la tabla en la base de datos.
    protected $table = "subcategorias";

    // Esta línea indica explícitamente que la clave principal de esta tabla es "id".
    protected $primaryKey = "id";

    // Este es el sistema de seguridad contra asignaciones masivas no deseadas.
    // Aquí autorizamos a Laravel a que rellene automáticamente el 'nombre' y la 'descripcion',
    // pero también incluimos el 'categoria_id'.
    protected $fillable = [
        "nombre",
        "descripcion",
        "categoria_id"
    ];

    // Esta propiedad activa el control automático de las fechas de creación y actualización de la fila.
    public $timestamps = true;

    // Este método define la relación inversa de "Uno a Muchos".
    // Básicamente le dice al sistema que "Esta Subcategoría pertenece a una Categoría principal".
    // Le pasamos 'categoria_id' explícitamente para indicarle a Laravel qué columna usar para buscar a su "padre".
    public function categoria()
    {
        return $this->belongsTo(Categoria::class, 'categoria_id');
    }

    // Este método establece una relación directa de "Uno a Muchos" hacia abajo.
    // Le indica a la base de datos que "Una Subcategoría contiene Muchos Anuncios".
    public function anuncios()
    {
        return $this->hasMany(Anuncio::class, 'subcategoria_id');
    }
}
