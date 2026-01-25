<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AccessController;

// Rutas públicas para el acceso
Route::post('/register', [AccessController::class, 'Register']);
Route::post('/login', [AccessController::class, 'login']);

// Ruta de ejemplo protegida
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});