<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\TicketAttachment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class TicketAttachmentController extends Controller
{
    public function download(Request $request, Ticket $ticket, TicketAttachment $attachment): StreamedResponse
    {
        /** @var User $user */
        $user = $request->user();

        if ($attachment->ticket_id !== $ticket->id) {
            abort(Response::HTTP_NOT_FOUND, 'Anexo não encontrado para este chamado.');
        }

        // Validação de permissão de visualização do chamado
        if ($user->isRequester()) {
            if ($ticket->requester_id !== $user->id) {
                abort(Response::HTTP_FORBIDDEN, 'Acesso não autorizado a este chamado.');
            }

            // Se o anexo pertencer a uma nota interna, o solicitante não pode baixar
            if ($attachment->comment && $attachment->comment->is_internal) {
                abort(Response::HTTP_FORBIDDEN, 'Acesso não autorizado a este anexo interno.');
            }
        }

        if (! Storage::disk('local')->exists($attachment->file_path)) {
            abort(Response::HTTP_NOT_FOUND, 'Arquivo físico não encontrado no servidor de armazenamento.');
        }

        return Storage::disk('local')->download($attachment->file_path, $attachment->original_name);
    }
}
