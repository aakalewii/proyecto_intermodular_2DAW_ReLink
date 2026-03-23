<?php

namespace App\Enums;

enum AnuncioEstado: string
{
    case PUBLICADO = 'publicado';
    case VENDIDO = 'vendido';
    case ELIMINADO = 'eliminado';

}
