<?php

namespace App\Enums;
enum EstadoProducto: string {
    case Nuevo      = 'nuevo';
    case ComoNuevo  = 'como_nuevo';
    case BuenEstado = 'buen_estado';
    case Aceptable  = 'aceptable';
    case MalEstado  = 'mal_estado';
}