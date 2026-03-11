<?php

namespace App\Enums;

enum ConversacionEstado: string
{
    case ELIMINADO = 'eliminado';
    case ACTIVO = 'activo';
    case ARCHIVADO = 'archivada';
}
