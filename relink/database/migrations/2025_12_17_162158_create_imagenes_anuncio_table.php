<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('imagenes_anuncio', function (Blueprint $table) {
            $table->id();

            $table->foreignId('anuncio_id')
                ->constrained('anuncios')
                ->cascadeOnDelete();

            $table->string('url');
            $table->integer('orden')->default(0);

            $table->timestamps();

            $table->index(['anuncio_id', 'orden']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('imagenes_anuncio');
    }
};
