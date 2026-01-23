<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Conversacion extends Model
{
    protected $table = 'conversaciones';

    protected $fillable = [
        'anuncio_id',
        'vendedor_id',
        'comprador_id',
        'estado'
    ];

    /**
     * Relación con el anuncio del que se está hablando
     */
    public function anuncio(): BelongsTo
    {
        return $this->belongsTo(Anuncio::class, 'anuncio_id');
    }

    /**
     * Relación con el vendedor
     */
    public function vendedor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'vendedor_id');
    }

    /**
     * Relación con el comprador
     */
    public function comprador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'comprador_id');
    }

    /**
     * Relación con los mensajes que contiene esta charla
     */
    public function mensajes(): HasMany
    {
        return $this->hasMany(Mensaje::class, 'conversacion_id');
    }
}