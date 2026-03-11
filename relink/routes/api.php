<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AccessController;
use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AnuncioController;
use App\Http\Controllers\FavoritoController;
use App\Http\Controllers\ConversacionController;
use App\Http\Controllers\MensajeController;
use App\Http\Controllers\SubcategoriaController;
use App\Http\Controllers\PaisController;
use App\Http\Controllers\ProvinciaController;
use App\Http\Controllers\MunicipioController;
use App\Http\Controllers\LocalidadController;



// Rutas públicas para el acceso
Route::post('/register', [AccessController::class, 'Register']);
Route::post('/login', [AccessController::class, 'login']);
Route::get('/verperfil/{id}',  [ProfileController::class, 'verPerfil']);

Route::get('/anuncios', [AnuncioController::class, 'index']);
Route::get('/anuncios/{id}', [AnuncioController::class, 'show']);

Route::get('/categorias', [CategoriaController::class, 'index']);
Route::get('/subcategorias', [SubcategoriaController::class, 'index']);
Route::get('/categorias/{id}/subcategorias', [SubcategoriaController::class, 'porCategoria']);

Route::get('/paises', [PaisController::class, 'index']);
Route::get('/provincias', [ProvinciaController::class, 'index']);
Route::get('/municipios', [MunicipioController::class, 'index']);
Route::get('/localidades', [LocalidadController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AccessController::class, 'Logout']);
    Route::get('/perfil',  [ProfileController::class, 'mostrarPerfil']);
    Route::put('/perfil', [ProfileController::class, 'editarPerfil']);

    Route::get('/conversaciones', [ConversacionController::class, 'index']);
    Route::post('/conversaciones', [ConversacionController::class, 'store']);
    Route::get('/conversaciones/{id}', [ConversacionController::class, 'verConversacion']);
    Route::delete('/conversaciones/{id}', [ConversacionController::class, 'eliminarConversacion']);
    Route::put('/conversaciones/{id}/archivar', [ConversacionController::class, 'archivarConversacion']);
    Route::post('/conversaciones/{conver_id}/mensajes', [MensajeController::class, 'store']);
    Route::put('/mensajes/{id_mensaje}', [MensajeController::class, 'update']);
    Route::delete('/mensajes/{id_mensaje}', [MensajeController::class, 'destroy']);

    Route::post('/favoritos/{anuncioId}', [FavoritoController::class, 'handleFavorito']);
    Route::get('/favoritos', [FavoritoController::class, 'index']);
    Route::get('/favoritos/check/{anuncio_id}', [FavoritoController::class, 'checkFavorito']);

    Route::post('/anuncios', [AnuncioController::class, 'store']);
    Route::put('/anuncios/{id}', [AnuncioController::class, 'update']);
    Route::delete('/anuncios/{id}', [AnuncioController::class, 'destroy']);
    Route::post('/anuncios/{id}/imagenes', [App\Http\Controllers\AnuncioController::class, 'subirImagenes']);
});

Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::post('/categorias', [CategoriaController::class, 'store']);
    Route::put('/categorias/{id}', [CategoriaController::class, 'update']);
    Route::delete('/categorias/{id}', [CategoriaController::class, 'destroy']);

    Route::post('/subcategorias', [SubcategoriaController::class, 'store']);
    Route::put('/subcategorias/{id}', [SubcategoriaController::class, 'update']);
    Route::delete('/subcategorias/{id}', [SubcategoriaController::class, 'destroy']);

    Route::apiResource('paises', PaisController::class)->except(['index']);
    Route::apiResource('provincias', ProvinciaController::class)->except(['index']);
    Route::apiResource('municipios', MunicipioController::class)->except(['index']);
    Route::apiResource('localidades', LocalidadController::class)->except(['index']);
});
