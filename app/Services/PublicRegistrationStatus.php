<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class PublicRegistrationStatus
{
    private const SETTING_KEY = 'public_pastor_registration_active';

    public function isOpen(): bool
    {
        return DB::table('system_settings')
            ->where('key', self::SETTING_KEY)
            ->value('value') === '1';
    }

    public function setOpen(bool $isOpen): void
    {
        DB::table('system_settings')->updateOrInsert(
            ['key' => self::SETTING_KEY],
            ['value' => $isOpen ? '1' : '0', 'updated_at' => now()],
        );
    }
}
