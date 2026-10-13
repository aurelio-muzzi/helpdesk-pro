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
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('role_id')->nullable()->after('id')->constrained('roles')->nullOnDelete();
            $table->string('avatar_url')->nullable()->after('password');
            $table->boolean('is_active')->default(true)->after('avatar_url');
            $table->softDeletes()->after('updated_at');

            $table->index(['role_id', 'is_active'], 'idx_users_role_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('idx_users_role_active');
            $table->dropConstrainedForeignId('role_id');
            $table->dropColumn(['avatar_url', 'is_active', 'deleted_at']);
        });
    }
};
