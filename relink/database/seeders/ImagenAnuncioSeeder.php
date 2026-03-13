<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\ImagenAnuncio;


class ImagenAnuncioSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        ImagenAnuncio::create([
            'anuncio_id' => 1,
            'url' => 'anuncios/default1.jpg',
        ]);

        ImagenAnuncio::create([
            'anuncio_id' => 2,
            'url' => 'anuncios/default1.jpg',
        ]);

        ImagenAnuncio::create([
            'anuncio_id' => 3,
            'url' => 'anuncios/default1.jpg',
        ]);

        ImagenAnuncio::create([
            'anuncio_id' => 4,
            'url' => 'anuncios/default1.jpg',
        ]);

        ImagenAnuncio::create([
            'anuncio_id' => 5,
            'url' => 'anuncios/default1.jpg',
        ]);

        ImagenAnuncio::create([
            'anuncio_id' => 6,
            'url' => 'anuncios/default1.jpg',
        ]);

        ImagenAnuncio::create([
            'anuncio_id' => 2,
            'url' => 'anuncios/default2.png',
        ]);

        ImagenAnuncio::create([
            'anuncio_id' => 4,
            'url' => 'anuncios/default2.png',
        ]);
    }
}
