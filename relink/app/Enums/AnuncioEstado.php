<?php

namespace App\Enums;

enum AnuncioEstado: string
{
    case PUBLICADO = 'publicado';
    case ELIMINADO = 'eliminado';
}
