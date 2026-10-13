<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->foreignId('sla_policy_id')->nullable()->after('priority_id')->constrained('sla_policies')->nullOnDelete();
            $table->timestamp('first_response_due_at')->nullable()->after('sla_policy_id');
            $table->timestamp('first_response_at')->nullable()->after('first_response_due_at');
            $table->timestamp('resolution_due_at')->nullable()->after('first_response_at');
            $table->string('sla_status', 30)->default('normal')->after('resolution_due_at')->index();
        });
    }

    public function down(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->dropForeign(['sla_policy_id']);
            $table->dropColumn([
                'sla_policy_id',
                'first_response_due_at',
                'first_response_at',
                'resolution_due_at',
                'sla_status',
            ]);
        });
    }
};
