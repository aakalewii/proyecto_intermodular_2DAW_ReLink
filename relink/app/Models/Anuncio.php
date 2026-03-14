<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Anuncio extends Model
{
    // Esta propiedad le dice exactamente a Laravel con qué tabla de la base de datos se comunica este modelo.
    protected $table = 'anuncios';

    // Esta propiedad es crucial por seguridad, se llama "Asignación Masiva"
    // le dice a Laravel qué columnas exactas de la tabla permitimos que se rellenen
    // de golpe cuando enviamos un array de datos. Si se intenta colar
    // un campo extra (como 'is_admin'), Laravel lo ignorará porque no está en esta lista.
    protected $fillable = [
        'titulo',
        'descripcion',
        'precio',
        'localidad_id',
        'fecha_publi',
        'user_id',
        'subcategoria_id',
        'estado'
    ];

    // Este método define una relación "Uno a Muchos Inversa".
    // Significa que "Este Anuncio pertenece a un Usuario". Laravel buscará automáticamente en la tabla users
    // el usuario cuyo ID coincida con el campo 'user_id' de este anuncio.
    public function user() {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Este método define a qué subcategoría pertenece el anuncio.
    // Usamos belongsTo porque un anuncio solo puede tener una subcategoría, pero una subcategoría puede tener muchos anuncios.
    public function subcategoria() {
        return $this->belongsTo(Subcategoria::class, 'subcategoria_id');
    }

    // Este método relaciona el anuncio con su localidad.
    public function ubicacion() {
        return $this->belongsTo(Localidad::class, 'localidad_id');
    }

    // Este método define una relación "Uno a Muchos".
    // Le indica a la base de datos que "Un Anuncio tiene muchas Imágenes".
    public function imagenes(){
        return $this->hasMany(ImagenAnuncio::class);
    }

    // Este método define una relación de "Muchos a Muchos".
    // Sirve para el sistema de favoritos: "Un Anuncio puede ser favorito de Muchos Usuarios", y a su vez,
    // "Un Usuario puede tener Muchos Anuncios favoritos". Para que esto funcione, le indicamos a Laravel
    // que use la tabla intermedia llamada 'favoritos' para cruzar la información.
    public function favorito_usuarios()
    {
        return $this->belongsToMany(User::class, 'favoritos');
    }
}
