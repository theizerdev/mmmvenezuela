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
        Schema::create('iglesias', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->text('direccion')->nullable();
            $table->string('telefono')->nullable();
            $table->string('email')->nullable();
            $table->unsignedBigInteger('pastor_id')->nullable(); // Pastor principal
            $table->unsignedBigInteger('ciudad_id')->nullable();
            $table->unsignedBigInteger('estado_id')->nullable();
            $table->unsignedBigInteger('municipio_id')->nullable();
            $table->unsignedBigInteger('parroquia_id')->nullable();
            $table->decimal('latitud', 10, 8)->nullable();
            $table->decimal('longitud', 11, 8)->nullable();
            $table->string('zona')->nullable();
            $table->string('distrito')->nullable();
            $table->date('fecha_fundacion')->nullable();
            $table->text('descripcion')->nullable();
            $table->boolean('activa')->default(true);
            $table->unsignedBigInteger('usuario_registro_id')->nullable(); // Usuario que registró la iglesia
            $table->timestamps();
            
            $table->foreign('pastor_id')->references('id')->on('pastores')->onDelete('set null');
            $table->foreign('estado_id')->references('id')->on('estados')->onDelete('set null');
            $table->foreign('municipio_id')->references('id')->on('municipios')->onDelete('set null');
            $table->foreign('parroquia_id')->references('id')->on('parroquias')->onDelete('set null');
            $table->foreign('usuario_registro_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('iglesias');
    }
};