<?php

use App\Http\Controllers\UtilitysController;
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
use App\Http\Controllers\FiltersController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\SwipeController;
use App\Http\Middleware\TelephoneMiddleware;

use App\Models\User;
use Illuminate\Http\Request;

Route::get('/email/verify/{id}/{hash}', function (Request $request) {
    // 1. Buscamos al usuario por el ID que viene en la URL
    $user = User::findOrFail($request->route('id'));

    // 2. Verificamos que el hash del email coincida (Seguridad)
    if (! hash_equals((string) $request->route('hash'), sha1($user->getEmailForVerification()))) {
        return redirect('http://localhost:5173/email-enlace-invalido');
    }

    // 3. Si ya estaba verificado, avisamos
    if ($user->hasVerifiedEmail()) {
        return redirect('http://localhost:5173/email-ya-verificado');
    }

    // 4. Marcamos como verificado
    $user->markEmailAsVerified();

    // 5. Disparamos el evento de Laravel por si acaso
    event(new \Illuminate\Auth\Events\Verified($user));

    return redirect('http://localhost:5173/email-verificado');
})->middleware(['signed'])->name('verification.verify');

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

Route::get('/anuncios/buscar/{titulo}', [FiltersController::class, 'tituloAnuncio']);

Route::post('/swipe/anuncios', [SwipeController::class, 'verAnunciosSwipe']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [UtilitysController::class, 'misDatos']);
    Route::post('/logout', [AccessController::class, 'Logout']);
});

Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    Route::get('/perfil',  [ProfileController::class, 'mostrarPerfil']);
    Route::put('/perfil', [ProfileController::class, 'editarPerfil']);

    Route::patch('/perfil/foto', [ProfileController::class, 'actualizarFoto']);

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

    Route::post('/anuncios', [AnuncioController::class, 'store'])->middleware(TelephoneMiddleware::class);
    Route::post('/anuncios/{id}', [AnuncioController::class, 'update']);
    Route::delete('/anuncios/{id}', [AnuncioController::class, 'destroy']);
    Route::patch('/anuncios/{idAnuncio}/vendido', [AnuncioController::class, 'vendido']);
    Route::patch('/anuncios/{id}/recuperar', [AnuncioController::class, 'recuperar'])->middleware(TelephoneMiddleware::class);
});

Route::middleware(['auth:sanctum', 'admin', 'verified'])->group(function () {
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

    Route::get('/admin/users', [AdminController::class, 'userList']);
    Route::put('/admin/users/{id}', [AdminController::class, 'updateUser']);
    Route::get('/admin/stats', [AdminController::class, 'getUserStats']);

    Route::get('/admin/anuncios', [AdminController::class, 'listAnuncios']);
    Route::get('/admin/anuncios/stats', [AdminController::class, 'getAnuncioStats']);
    Route::put('/admin/anuncios/{id}/suspender', [AdminController::class, 'suspenderAnuncio']);
    Route::put('/admin/anuncios/{id}/activar', [AdminController::class, 'activarAnuncio']);
});
