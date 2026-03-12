<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Anuncio;

class AnuncioSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Anuncio::create([
            'titulo' => 'Anuncio 1',
            'descripcion' => 'Descripción anuncio 1',
            'precio' => 200.00,
            'estado' => 'publicado',
            'user_id' => 2,
            'subcategoria_id' => 1,
            'localidad_id' => 1,
        ]);

        Anuncio::create([
            'titulo' => 'Anuncio 2',
            'descripcion' => 'Descripción anuncio 2',
            'precio' => 157.00,
            'estado' => 'publicado',
            'user_id' => 2,
            'subcategoria_id' => 2,
            'localidad_id' => 2,
        ]);

        Anuncio::create([
            'titulo' => 'Anuncio 3',
            'descripcion' => 'Descripción anuncio 3',
            'precio' => 200.00,
            'estado' => 'publicado',
            'user_id' => 2,
            'subcategoria_id' => 3,
            'localidad_id' => 1,
        ]);

        Anuncio::create([
            'titulo' => 'Anuncio 4',
            'descripcion' => 'Descripción anuncio 4',
            'precio' => 20.00,
            'estado' => 'publicado',
            'user_id' => 3,
            'subcategoria_id' => 6,
            'localidad_id' => 1,
        ]);

        Anuncio::create([
            'titulo' => 'Anuncio 5',
            'descripcion' => 'Descripción anuncio 5',
            'precio' => 19.00,
            'estado' => 'publicado',
            'user_id' => 3,
            'subcategoria_id' => 5,
            'localidad_id' => 3,
        ]);

        Anuncio::create([
            'titulo' => 'Anuncio 6',
            'descripcion' => 'Descripción anuncio 6',
            'precio' => 47.00,
            'estado' => 'publicado',
            'user_id' => 3,
            'subcategoria_id' => 4,
            'localidad_id' => 3,
        ]);
    }
}
