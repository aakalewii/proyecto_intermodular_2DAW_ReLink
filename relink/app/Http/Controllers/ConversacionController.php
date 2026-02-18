<?php

namespace App\Http\Controllers;

use App\Models\Conversacion;
use App\Enums\ConversacionEstado;

use Illuminate\Http\Request;

class ConversacionController extends Controller
{
    public function index(Request $request) {

    $user = $request->user();

    $conversaciones = Conversacion::with(['anuncio', 'vendedor', 'comprador'])
        ->where('comprador_id', $user->id) 
        ->orWhere('vendedor_id', $user->id)
        ->get();

    if ($conversaciones->isEmpty()) {
        return response()->json([
            'message' => 'No tienes Conversaciones'
        ], 200);
    }

    return response()->json([
        'data' => $conversaciones
    ], 200);
}

    public function verConversacion(Request $request, int $id) {

        $user = $request->user();

        $conversacion = Conversacion::with(['anuncio', 'vendedor', 'comprador', 'mensajes'])
            ->where('id', $id)
            ->where(function($query) use ($user) {
                $query->where('comprador_id', $user->id) 
                    ->orWhere('vendedor_id', $user->id);
            })
            ->first();

        if (!$conversacion) {
        return response()->json([
            'message' => 'Conversación no encontrada o no tienes permiso'
        ], 404);
    }

        return response()->json([
            'data' => $conversacion
        ], 200);
    }
    
    public function eliminarConversacion(Request $request, int $id) {
        
        $user = $request->user();

        $conversacion = Conversacion::where('id', $id)
            ->where(function($query) use ($user) {
                $query->where('comprador_id', $user->id) 
                    ->orWhere('vendedor_id', $user->id);
            })
            ->first();

        if (!$conversacion) {
        return response()->json([
            'message' => 'Conversación no encontrada'
        ], 404);
        }

        $conversacion->update(['estado' => ConversacionEstado::ELIMINADO]);
        

        return response()->json([
            'data' => $conversacion
        ], 200);
    }

    public function archivarConversacion(Request $request, int $id) {
        
        $user = $request->user();

        $conversacion = Conversacion::where('id', $id)
            ->where(function($query) use ($user) {
                $query->where('comprador_id', $user->id) 
                    ->orWhere('vendedor_id', $user->id);
            })
            ->first();

        if (!$conversacion) {
        return response()->json([
            'message' => 'Conversación no encontrada'
        ], 404);
        }

        $conversacion->update(['estado' => ConversacionEstado::ARCHIVADO]);
        

        return response()->json([
            'data' => $conversacion
        ], 200);
    }

    public function store(Request $request) {

        $request->validate([
            'anuncio_id' => 'required|exists:anuncios,id',
        ]);

        $comprador = $request->user();
        $anuncio = Anuncio::findOrFail($request->anuncio_id);
        $vendedor_id = $anuncio->user_id;


        if ($comprador->id === $vendedor_id) {
            return response()->json(['message' => 'No puedes iniciar un chat contigo mismo'], 400);
        }

        $conversacionExistente = Conversacion::where('anuncio_id', $anuncio->id)
            ->where('comprador_id', $comprador->id)
            ->first();

        if ($conversacionExistente) {
            return response()->json([
                'message' => 'La conversación ya existe',
                'data' => $conversacionExistente
            ], 200);
        }

        $nuevaConversacion = Conversacion::create([
            'anuncio_id' => $anuncio->id,
            'vendedor_id' => $vendedor_id,
            'comprador_id' => $comprador->id,
            'estado' => ConversacionEstado::ACTIVO
        ]);

        return response()->json([
            'message' => 'Conversación iniciada',
            'data' => $nuevaConversacion
        ], 201);
    }
}
