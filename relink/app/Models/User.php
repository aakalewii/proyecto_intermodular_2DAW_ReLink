<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Enums\UserRole;
use Laravel\Sanctum\HasApiTokens;

// Esta clase representa a los usuarios de nuestra aplicación
// Hereda de Authenticatable para que Laravel gestione su inicio de sesión y seguridad automáticamente.
class User extends Authenticatable implements MustVerifyEmail
{

    use HasApiTokens, HasFactory, Notifiable;

    // Esta propiedad le dice a Laravel qué columnas de la base de datos se pueden rellenar directamente desde un formulario.
    // Es una medida de seguridad para evitar que usuarios malintencionados inyecten datos en campos que no deben tocar.
    protected $fillable = [
        'name',
        'email',
        'password',
        'apellidos',
        'telefono',
        'rol',
        'activo',
        'online',
        'localidad_id',
        'url',
    ];

    // Esta propiedad actúa como un escudo de privacidad. Todo lo que pongamos aquí (como la contraseña o el token) 
    // jamás se enviará al frontend cuando devolvamos los datos del usuario, evitando fugas de información sensible.
    protected $hidden = [
        'password',
        'remember_token',
    ];

    // Este método se encarga de transformar los datos automáticamente cuando salen o entran a la base de datos. 
    // Por ejemplo, asegura que la contraseña siempre se encripte y que el campo rol se convierta en nuestro Enum de roles 
    // para no cometer errores de escritura.
    protected function casts(): array
    {
        return [
            'rol' => UserRole::class,
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // Este método define la relación básica entre el usuario y sus productos. 
    // Le dice a Laravel que un único usuario puede tener creados muchos anuncios diferentes en la plataforma.
    public function anuncios() {
        return $this->hasMany(Anuncio::class);
    }

    // Este método conecta al usuario con la tabla de chats, filtrando específicamente aquellas conversaciones 
    // donde él es la persona interesada en comprar el artículo de otro vendedor.
    public function compras()
    {
        return $this->hasMany(Conversacion::class, 'comprador_id');
    }

    // Este método hace lo opuesto al anterior. Enlaza al usuario con las conversaciones de chat en las que otras personas le están escribiendo 
    // a él para comprarle sus productos.
    public function ventas()
    {
        return $this->hasMany(Conversacion::class, 'vendedor_id');
    }

    // Este método es una variante semántica del método anuncios. Hace exactamente lo mismo, pero tenerlo con este nombre nos resulta más cómodo y 
    // legible cuando escribimos el código para sacar los anuncios propios del usuario logueado.
    public function misAnuncios()
    {
        return $this->hasMany(Anuncio::class, 'user_id');
    }

    // Este método establece una relación de pertenencia. Nos permite saber de dónde es cada persona vinculando el identificador que tiene 
    // el usuario con el registro completo de la tabla de localidades.
    public function localidad(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Localidad::class);
    }

    // Este método crea una relación de "muchos a muchos". Como un usuario puede guardar muchos anuncios, y un anuncio puede ser guardado 
    // por muchos usuarios, Laravel usará la tabla intermedia 'favoritos' para gestionar esta conexión.
    public function favoritos()
    {
        return $this->belongsToMany(Anuncio::class, 'favoritos');
    }

}  