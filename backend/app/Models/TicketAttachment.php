<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $ticket_id
 * @property int|null $comment_id
 * @property int $user_id
 * @property string $original_name
 * @property string $file_path
 * @property int $file_size
 * @property string $mime_type
 * @property Carbon $created_at
 * @property-read Ticket $ticket
 * @property-read TicketComment|null $comment
 * @property-read User $user
 */
class TicketAttachment extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'ticket_id',
        'comment_id',
        'user_id',
        'original_name',
        'file_path',
        'file_size',
        'mime_type',
        'created_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'file_size' => 'integer',
            'created_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Ticket, $this>
     */
    public function ticket(): BelongsTo
    {
        return $this->belongsTo(Ticket::class, 'ticket_id');
    }

    /**
     * @return BelongsTo<TicketComment, $this>
     */
    public function comment(): BelongsTo
    {
        return $this->belongsTo(TicketComment::class, 'comment_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function formattedSize(): string
    {
        $bytes = $this->file_size;

        if ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2).' MB';
        }

        if ($bytes >= 1024) {
            return number_format($bytes / 1024, 2).' KB';
        }

        return $bytes.' B';
    }
}
