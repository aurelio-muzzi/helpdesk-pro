<?php

namespace App\Models;

use App\Enums\TicketStatus;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property int $id
 * @property string $code
 * @property string $title
 * @property string $description
 * @property TicketStatus $status
 * @property int $requester_id
 * @property int|null $assigned_to
 * @property int|null $team_id
 * @property int|null $department_id
 * @property int $category_id
 * @property int $priority_id
 * @property int|null $sla_policy_id
 * @property Carbon|null $first_response_due_at
 * @property Carbon|null $first_response_at
 * @property Carbon|null $resolution_due_at
 * @property string $sla_status
 * @property Carbon|null $resolved_at
 * @property Carbon|null $closed_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 * @property-read User $requester
 * @property-read User|null $assignedTo
 * @property-read Team|null $team
 * @property-read Department|null $department
 * @property-read Category $category
 * @property-read Priority $priority
 * @property-read SlaPolicy|null $slaPolicy
 * @property-read TicketSatisfaction|null $satisfaction
 * @property-read Collection<int, TicketHistory> $histories
 */
class Ticket extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code',
        'title',
        'description',
        'status',
        'requester_id',
        'assigned_to',
        'team_id',
        'department_id',
        'category_id',
        'priority_id',
        'sla_policy_id',
        'first_response_due_at',
        'first_response_at',
        'resolution_due_at',
        'sla_status',
        'resolved_at',
        'closed_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => TicketStatus::class,
            'first_response_due_at' => 'datetime',
            'first_response_at' => 'datetime',
            'resolution_due_at' => 'datetime',
            'resolved_at' => 'datetime',
            'closed_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Ticket $ticket) {
            if (empty($ticket->code)) {
                $ticket->code = static::generateSequentialCode();
            }
        });
    }

    public static function generateSequentialCode(): string
    {
        $year = date('Y');
        $prefix = "HD-{$year}-";

        $lastTicket = static::withTrashed()
            ->where('code', 'like', "{$prefix}%")
            ->orderBy('id', 'desc')
            ->first();

        $nextNumber = 1;
        if ($lastTicket && preg_match("/^HD-{$year}-(\d+)$/", $lastTicket->code, $matches)) {
            $nextNumber = ((int) $matches[1]) + 1;
        }

        return sprintf('HD-%s-%05d', $year, $nextNumber);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requester_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * @return BelongsTo<Team, $this>
     */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'team_id');
    }

    /**
     * @return BelongsTo<Department, $this>
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'department_id');
    }

    /**
     * @return BelongsTo<Category, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    /**
     * @return BelongsTo<Priority, $this>
     */
    public function priority(): BelongsTo
    {
        return $this->belongsTo(Priority::class, 'priority_id');
    }

    /**
     * @return BelongsTo<SlaPolicy, $this>
     */
    public function slaPolicy(): BelongsTo
    {
        return $this->belongsTo(SlaPolicy::class, 'sla_policy_id');
    }

    /**
     * @return HasOne<TicketSatisfaction, $this>
     */
    public function satisfaction(): HasOne
    {
        return $this->hasOne(TicketSatisfaction::class, 'ticket_id');
    }

    /**
     * @return HasMany<TicketHistory, $this>
     */
    public function histories(): HasMany
    {
        return $this->hasMany(TicketHistory::class, 'ticket_id')->orderBy('created_at', 'desc');
    }

    /**
     * @return HasMany<TicketComment, $this>
     */
    public function comments(): HasMany
    {
        return $this->hasMany(TicketComment::class, 'ticket_id')->orderBy('created_at', 'asc');
    }

    /**
     * @return HasMany<TicketAttachment, $this>
     */
    public function attachments(): HasMany
    {
        return $this->hasMany(TicketAttachment::class, 'ticket_id')->orderBy('created_at', 'desc');
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeStatus(Builder $query, string $status): Builder
    {
        return $query->where('status', $status);
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopePriority(Builder $query, int $priorityId): Builder
    {
        return $query->where('priority_id', $priorityId);
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeCategory(Builder $query, int $categoryId): Builder
    {
        return $query->where('category_id', $categoryId);
    }

    /**
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeSearch(Builder $query, string $search): Builder
    {
        return $query->where(function (Builder $q) use ($search) {
            $q->where('code', 'like', "%{$search}%")
                ->orWhere('title', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%");
        });
    }
}
