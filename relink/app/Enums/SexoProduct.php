<?php

namespace App\Enums;

enum SexoProducto: string {
    case Hombre = 'hombre';
    case Mujer  = 'mujer';
    case Unisex = 'unisex';
    case Nino   = 'niño';
    case Nina   = 'niña';
}