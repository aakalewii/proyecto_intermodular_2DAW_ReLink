<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Enums\UserRole;
use Laravel\Sanctum\HasApiTokens;


class User extends Authenticatable
{

    use HasApiTokens, HasFactory, Notifiable;

    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'apellidos',
        'telefono',
        'rol',
        'activo',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'rol' => UserRole::class,
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function anuncios() {
        return $this->hasMany(Anuncio::class);
    }

    /**
     * Conversaciones donde el usuario es el que quiere comprar
     */
    public function compras()
    {
        return $this->hasMany(Conversacion::class, 'comprador_id');
    }

    /**
     * Conversaciones donde el usuario es el que vende el producto
     */
    public function ventas()
    {
        return $this->hasMany(Conversacion::class, 'vendedor_id');
    }

    /**
     * Los anuncios que el usuario ha publicado
     */
    public function misAnuncios()
    {
        return $this->hasMany(Anuncio::class, 'user_id');
    }
}
