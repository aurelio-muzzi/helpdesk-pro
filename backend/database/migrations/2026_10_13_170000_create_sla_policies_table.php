<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sla_policies', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->text('description')->nullable();
            $table->foreignId('priority_id')->constrained('priorities')->cascadeOnDelete();
            $table->unsignedInteger('first_response_time_minutes');
            $table->unsignedInteger('resolution_time_minutes');
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();

            $table->index(['priority_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sla_policies');
    }
};
