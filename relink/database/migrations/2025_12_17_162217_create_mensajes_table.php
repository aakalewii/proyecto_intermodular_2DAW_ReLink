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
        Schema::create('mensajes', function (Blueprint $table) {
            $table->id();

            $table->foreignId('conversacion_id')
                ->constrained('conversaciones')
                ->cascadeOnDelete();

            $table->foreignId('remitente_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->text('contenido');
            $table->timestamp('fecha_lectura')->nullable(); // opcional pero muy útil
            $table->timestamps();

            $table->index(['conversacion_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mensajes');
    }
};
