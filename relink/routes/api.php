<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AccessController;
use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\ProfileController;

// Rutas públicas para el acceso
Route::post('/register', [AccessController::class, 'Register']);
Route::post('/login', [AccessController::class, 'login']);
Route::get('/verperfil/{id}',  [ProfileController::class, 'verPerfil']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AccessController::class, 'Logout']);
    Route::get('/perfil',  [ProfileController::class, 'mostrarPerfil']);
    Route::post('/editarperfil',  [ProfileController::class, 'editarPerfil']);
    
});

Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    
    Route::post('/categorias', [CategoriaController::class, 'store']);
    Route::put('/categorias/{id}', [CategoriaController::class, 'update']);
    Route::delete('/categorias/{id}', [CategoriaController::class, 'destroy']);
});