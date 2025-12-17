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
        Schema::create('conversaciones', function (Blueprint $table) {
            $table->id();

            $table->foreignId('anuncio_id')
                ->constrained('anuncios')
                ->cascadeOnDelete();

            $table->foreignId('vendedor_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->foreignId('comprador_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->string('estado')->default('activa');
            $table->timestamps();

            $table->unique(['anuncio_id', 'comprador_id'], 'uq_anuncio_comprador');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('conversaciones');
    }
};
