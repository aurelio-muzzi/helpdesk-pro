<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * @property int $id
 * @property int $department_id
 * @property string $name
 * @property string|null $description
 * @property bool $is_active
 * @property Department|null $department
 */
class Team extends Model
{
    use HasFactory;

    protected $fillable = [
        'department_id',
        'name',
        'description',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<Department, $this>
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * @return BelongsToMany<User, $this>
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'team_members')
            ->withPivot('is_leader')
            ->withTimestamps();
    }

    /**
     * @return BelongsToMany<User, $this>
     */
    public function leaders(): BelongsToMany
    {
        return $this->users()->wherePivot('is_leader', true);
    }
}
