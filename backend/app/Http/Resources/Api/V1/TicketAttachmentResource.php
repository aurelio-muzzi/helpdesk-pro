<?php

namespace App\Http\Resources\Api\V1;

use App\Models\TicketAttachment;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin TicketAttachment
 */
class TicketAttachmentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'ticket_id' => $this->ticket_id,
            'comment_id' => $this->comment_id,
            'original_name' => $this->original_name,
            'file_size' => $this->file_size,
            'formatted_size' => $this->formattedSize(),
            'mime_type' => $this->mime_type,
            'download_url' => url("/api/v1/tickets/{$this->ticket_id}/attachments/{$this->id}/download"),
            'created_at' => $this->created_at->toISOString(),
        ];
    }
}
