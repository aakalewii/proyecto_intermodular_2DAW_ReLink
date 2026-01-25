<?php

namespace App\Enums;

enum UserRole: string
{
    case CLIENTE = 'cliente';
    case PRO = 'pro';
    case ADMIN = 'admin';
}