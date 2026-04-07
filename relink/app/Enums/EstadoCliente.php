<?php

namespace App\Enums;

enum EstadoCliente: string
{
    case ACTIVO = 'activo';
    case INACTIVO = 'inactivo';
    case BLOQUEADO = 'bloqueado';

}
