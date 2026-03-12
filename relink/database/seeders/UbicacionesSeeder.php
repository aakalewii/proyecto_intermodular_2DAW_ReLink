<?php

namespace Database\Seeders;

use App\Models\Localidad;
use App\Models\Municipio;
use App\Models\Pais;
use App\Models\Provincia;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UbicacionesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Seeder de País
        Pais::create([
            'nombre' => 'España'
        ]);

        // Seeder de Provincias
        Provincia::create([
            'nombre' => 'Las Palmas',
            'pais_id' => 1
        ]);

        Provincia::create([
            'nombre' => 'Santa Cruz de Tenerife',
            'pais_id' => 1
        ]);

        // Seeder de Municipios
        Municipio::create([
            'nombre' => 'San Bartolomé de Tirajana',
            'provincia_id' => 1
        ]);

        Municipio::create([
            'nombre' => 'Las Palmas de Gran Canaria',
            'provincia_id' => 1
        ]);

        Municipio::create([
            'nombre' => 'Santa Cruz de Tenerife',
            'provincia_id' => 2
        ]);

        // Seeder de Localidades
        Localidad::create([
            'nombre' => 'San Fernando',
            'municipio_id' => 1
        ]);

        Localidad::create([
            'nombre' => 'La Isleta',
            'municipio_id' => 2
        ]);

        Localidad::create([
            'nombre' => 'San Andrés',
            'municipio_id' => 3
        ]);
    }
}
