<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->index('created_at');
            $table->index('resolved_at');
            $table->index('first_response_at');
            $table->index(['created_at', 'status']);
            $table->index(['department_id', 'created_at']);
            $table->index(['priority_id', 'created_at']);
            $table->index(['category_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->dropIndex(['created_at']);
            $table->dropIndex(['resolved_at']);
            $table->dropIndex(['first_response_at']);
            $table->dropIndex(['created_at', 'status']);
            $table->dropIndex(['department_id', 'created_at']);
            $table->dropIndex(['priority_id', 'created_at']);
            $table->dropIndex(['category_id', 'created_at']);
        });
    }
};
