<?php

namespace App\Models;

use App\Enums\UserRole;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property int|null $role_id
 * @property string|null $avatar_url
 * @property bool $is_active
 * @property Role|null $role
 */
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role_id',
        'avatar_url',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<Role, $this>
     */
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * @return BelongsToMany<Team, $this>
     */
    public function teams(): BelongsToMany
    {
        return $this->belongsToMany(Team::class, 'team_members')
            ->withPivot('is_leader')
            ->withTimestamps();
    }

    /**
     * @return HasMany<Ticket, $this>
     */
    public function requestedTickets(): HasMany
    {
        return $this->hasMany(Ticket::class, 'requester_id');
    }

    /**
     * @return HasMany<Ticket, $this>
     */
    public function assignedTickets(): HasMany
    {
        return $this->hasMany(Ticket::class, 'assigned_to');
    }

    /**
     * @return HasMany<TicketComment, $this>
     */
    public function comments(): HasMany
    {
        return $this->hasMany(TicketComment::class, 'user_id');
    }

    public function hasRole(UserRole|string $role): bool
    {
        $roleName = $role instanceof UserRole ? $role->value : $role;

        return $this->role?->name === $roleName;
    }

    public function hasPermission(string $permission): bool
    {
        if ($this->isAdmin()) {
            return true;
        }

        return $this->role?->hasPermission($permission) ?? false;
    }

    public function isAdmin(): bool
    {
        return $this->hasRole(UserRole::ADMIN);
    }

    public function isManager(): bool
    {
        return $this->hasRole(UserRole::MANAGER);
    }

    public function isAgent(): bool
    {
        return $this->hasRole(UserRole::AGENT);
    }

    public function isRequester(): bool
    {
        return $this->hasRole(UserRole::REQUESTER);
    }
}
