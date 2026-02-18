<?php

namespace App\Enums;

enum ConversacionEstado: string
{
    case 0 = 'eliminado';
    case 1 = 'activo';
    case 2 = 'archivada';
}