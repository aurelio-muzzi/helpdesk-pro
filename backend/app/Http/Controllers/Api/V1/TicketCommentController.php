<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Comment\StoreCommentRequest;
use App\Http\Resources\Api\V1\TicketCommentResource;
use App\Models\Ticket;
use App\Models\TicketAttachment;
use App\Models\TicketComment;
use App\Models\TicketHistory;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class TicketCommentController extends Controller
{
    public function index(Request $request, Ticket $ticket): AnonymousResourceCollection
    {
        /** @var User $user */
        $user = $request->user();

        if ($user->isRequester() && $ticket->requester_id !== $user->id) {
            abort(Response::HTTP_FORBIDDEN, 'Acesso não autorizado a este chamado.');
        }

        $query = $ticket->comments()->with(['user.role', 'attachments']);

        if ($user->isRequester()) {
            $query->publicOnly();
        }

        $comments = $query->get();

        return TicketCommentResource::collection($comments);
    }

    public function store(StoreCommentRequest $request, Ticket $ticket): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        if ($user->isRequester()) {
            if ($ticket->requester_id !== $user->id) {
                abort(Response::HTTP_FORBIDDEN, 'Acesso não autorizado a este chamado.');
            }

            if ($ticket->status->isFinal()) {
                abort(Response::HTTP_UNPROCESSABLE_ENTITY, 'Não é permitido comentar em chamados finalizados.');
            }
        }

        $isInternal = false;
        if (! $user->isRequester()) {
            $isInternal = $request->boolean('is_internal');
        }

        $comment = DB::transaction(function () use ($request, $ticket, $user, $isInternal) {
            /** @var TicketComment $newComment */
            $newComment = TicketComment::create([
                'ticket_id' => $ticket->id,
                'user_id' => $user->id,
                'content' => (string) $request->input('content'),
                'is_internal' => $isInternal,
            ]);

            // Processamento de anexos se existirem
            if ($request->hasFile('attachments')) {
                /** @var array<UploadedFile> $files */
                $files = $request->file('attachments');
                foreach ($files as $file) {
                    $originalName = $file->getClientOriginalName();
                    $mimeType = $file->getClientMimeType() ?: 'application/octet-stream';
                    $fileSize = $file->getSize();
                    $path = $file->store("tickets/{$ticket->id}/attachments", 'local');

                    TicketAttachment::create([
                        'ticket_id' => $ticket->id,
                        'comment_id' => $newComment->id,
                        'user_id' => $user->id,
                        'original_name' => $originalName,
                        'file_path' => $path,
                        'file_size' => $fileSize,
                        'mime_type' => $mimeType,
                        'created_at' => now(),
                    ]);
                }
            }

            // Registro na linha do tempo de auditoria
            TicketHistory::create([
                'ticket_id' => $ticket->id,
                'user_id' => $user->id,
                'action' => 'comment_added',
                'field_name' => 'comment',
                'comment' => $isInternal
                    ? 'Nota interna adicionada pela equipe técnica.'
                    : 'Nova mensagem enviada no chamado.',
                'created_at' => now(),
            ]);

            return $newComment->load(['user.role', 'attachments']);
        });

        return (new TicketCommentResource($comment))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }
}
