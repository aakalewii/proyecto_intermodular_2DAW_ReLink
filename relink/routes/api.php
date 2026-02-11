<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AccessController;
use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AnuncioController;
use App\Http\Controllers\FavoritoController;



// Rutas públicas para el acceso
Route::post('/register', [AccessController::class, 'Register']);
Route::post('/login', [AccessController::class, 'login']);
Route::get('/verperfil/{id}',  [ProfileController::class, 'verPerfil']);

Route::get('/anuncios', [AnuncioController::class, 'index']);
Route::get('/anuncios/{id}', [AnuncioController::class, 'show']); 
Route::get('/categorias', [CategoriaController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AccessController::class, 'Logout']);
    Route::get('/perfil',  [ProfileController::class, 'mostrarPerfil']);
    Route::post('/editarperfil',  [ProfileController::class, 'editarPerfil']);
    

    Route::post('/favoritos/{anuncioId}', [FavoritoController::class, 'handleFavorito']);
    Route::get('/favoritos', [FavoritoController::class, 'index']);

    Route::post('/anuncios', [AnuncioController::class, 'store']);
    Route::put('/anuncios/{id}', [AnuncioController::class, 'update']);
    Route::delete('/anuncios/{id}', [AnuncioController::class, 'destroy']);
});

Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    
    Route::post('/categorias', [CategoriaController::class, 'store']);
    Route::put('/categorias/{id}', [CategoriaController::class, 'update']);
    Route::delete('/categorias/{id}', [CategoriaController::class, 'destroy']);
});