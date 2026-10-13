<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\AuditLogResource;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AuditLogController extends Controller
{
    /**
     * Display a listing of system audit logs with filters and pagination.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = AuditLog::with(['user.role'])->latest('id');

        // Filtro por tipo/categoria de evento
        if ($request->filled('event')) {
            $event = (string) $request->string('event');
            if (str_ends_with($event, '*')) {
                $prefix = rtrim($event, '*');
                $query->where('event', 'like', $prefix.'%');
            } else {
                $query->where('event', $event);
            }
        }

        // Filtro por usuário executor
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->integer('user_id'));
        }

        // Filtro por busca textual (descrição, IP ou nome do usuário)
        if ($request->filled('search')) {
            $search = (string) $request->string('search');
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                    ->orWhere('ip_address', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        // Filtro por período
        if ($request->filled('from')) {
            $query->where('created_at', '>=', $request->string('from'));
        }
        if ($request->filled('to')) {
            $query->where('created_at', '<=', $request->string('to').' 23:59:59');
        }

        $perPage = min(max($request->integer('per_page', 20), 5), 100);

        return AuditLogResource::collection($query->paginate($perPage));
    }
}
