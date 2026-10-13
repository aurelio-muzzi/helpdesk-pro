<?php

namespace App\Models;

use App\Enums\PriorityLevel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $name
 * @property string $display_name
 * @property string|null $description
 * @property int $order
 * @property string $color
 * @property bool $is_active
 */
class Priority extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'display_name',
        'description',
        'order',
        'color',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'order' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function level(): ?PriorityLevel
    {
        return PriorityLevel::tryFrom($this->name);
    }
}
