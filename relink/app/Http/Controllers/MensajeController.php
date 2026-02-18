<?php

namespace App\Http\Controllers;

use App\Models\Conversacion;
use Illuminate\Http\Request;

class MensajeController extends Controller
{
    public function create(Request $request, int $conver_id)
    {
        $user = $request->user();

        $conversacion = Conversacion::find($conver_id);

        
    }
}
