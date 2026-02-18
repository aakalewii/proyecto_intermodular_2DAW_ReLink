<?php

namespace App\Http\Controllers;

use App\Models\Conversacion;
use App\Models\Mensaje;
use App\Enums\MensajeEstado;

use Illuminate\Http\Request;

class MensajeController extends Controller
{
    public function store(Request $request, int $conver_id)
    {
        $user = $request->user();

        $conversacion = Conversacion::where('id', $conver_id)
            ->where(function($query) use ($user) {
                $query->where('comprador_id', $user->id) 
                    ->orWhere('vendedor_id', $user->id);
            })
            ->first();
        
        if(!$conversacion){
            return response()->json([
                'message' => 'Error'
            ], 404);
        }

        $validated = $request->validate([
            'contenido' => ['required', 'string', 'max:255']
        ]);
        
        $validated['remitente_id'] = $request->user()->id; 
        $validated['conversacion_id'] = $conversacion->id;
        $validated['fecha_envio'] = now();
        $validated['estado'] = MensajeEstado::ENVIADO;

        $mensaje = Mensaje::create($validated);

        return response()->json([
            'message' => 'Mensaje creado con éxito',
            'data' => $mensaje], 201);
    }

    public function update(Request $request, int $id_mensaje){

        $mensaje = Mensaje::where('id',$id_mensaje)
            ->where('remitente_id', $request->user()->id)
            ->first();

        if ($mensaje == null) {
            return response()->json([
                'message' => 'Mensaje no encontrado'
            ], 404);
        }

        $validated = $request->validate([
            'contenido' => ['required', 'string', 'max:255']
        ]);

        $mensaje->update($validated);

        return response()->json([
            'message' => 'Actualizado con éxito',
            'data' => $mensaje
            ], 200);

    }

    public function destroy(Request $request,int $id_mensaje){

        $mensaje = Mensaje::where('id',$id_mensaje)
            ->where('remitente_id', $request->user()->id)
            ->first();

        if ($mensaje == null) {
            return response()->json([
                'message' => 'Mensaje no encontrado'
            ], 404);
        }

        $mensaje->update(['estado' => MensajeEstado::ELIMINADO]);

        return response()->json([
            'message' => 'Eliminado con éxito',
            'data' => $mensaje
            ], 200);

    }
}
