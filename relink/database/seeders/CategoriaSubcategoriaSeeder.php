<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Categoria;
use App\Models\Subcategoria;

class CategoriaSubcategoriaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Categoria::create([
            'nombre' => 'Motor'
        ]);

        Categoria::create([
            'nombre' => 'Tecnología'
        ]);

        Categoria::create([
            'nombre' => 'Ropa'
        ]);

        Subcategoria::create([
            'nombre' => 'Coches',
            'categoria_id' => 1
        ]);

        Subcategoria::create([
            'nombre' => 'Motos',
            'categoria_id' => 1
        ]);

        Subcategoria::create([
            'nombre' => 'Moviles',
            'categoria_id' => 2
        ]);

        Subcategoria::create([
            'nombre' => 'Ordenadores',
            'categoria_id' => 2
        ]);

        Subcategoria::create([
            'nombre' => 'Partes de Arriba',
            'categoria_id' => 3
        ]);

        Subcategoria::create([
            'nombre' => 'Partes de abajo',
            'categoria_id' => 3
        ]);
    }
}
