<?php

namespace Tests\Unit;

use App\Services\PublicRegistrationStatus;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class PublicRegistrationStatusTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Schema::create('system_settings', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->text('value');
            $table->timestamps();
        });
    }

    public function test_registration_is_closed_by_default_and_can_be_toggled(): void
    {
        $status = app(PublicRegistrationStatus::class);

        $this->assertFalse($status->isOpen());

        $status->setOpen(true);
        $this->assertTrue($status->isOpen());

        $status->setOpen(false);
        $this->assertFalse($status->isOpen());
    }
}
