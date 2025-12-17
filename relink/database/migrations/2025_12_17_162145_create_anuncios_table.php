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
        Schema::create('anuncios', function (Blueprint $table) {
            $table->id();

            $table->string('titulo', 120);
            $table->text('descripcion')->nullable();
            $table->decimal('precio', 10, 2);
            $table->string('estado')->default('publicado');
            $table->dateTime('fecha_publi')->nullable();

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->foreignId('ubicacion_id')
                ->constrained('ubicaciones')
                ->restrictOnDelete();

            $table->foreignId('subcategoria_id')
                ->constrained('subcategorias')
                ->restrictOnDelete();

            $table->timestamps();

            $table->index(['estado', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('anuncios');
    }
};
