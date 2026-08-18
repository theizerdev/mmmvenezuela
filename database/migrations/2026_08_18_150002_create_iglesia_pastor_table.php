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
        Schema::create('iglesia_pastor', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('pastor_id');
            $table->unsignedBigInteger('iglesia_id');
            $table->timestamps();
            
            $table->foreign('pastor_id')->references('id')->on('pastores')->onDelete('cascade');
            $table->foreign('iglesia_id')->references('id')->on('iglesias')->onDelete('cascade');
            
            // Evitar duplicados
            $table->unique(['pastor_id', 'iglesia_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('iglesia_pastor');
    }
};