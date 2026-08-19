<?php

namespace App\Providers;

use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

use Illuminate\Auth\Events\Failed;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Support\Facades\Event;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configureActivityListeners();
    }

    /**
     * Log authentication events in activity_log.
     */
    protected function configureActivityListeners(): void
    {
        Event::listen(Login::class, function (Login $event) {
            if ($event->user) {
                activity('autenticacion')
                    ->causedBy($event->user)
                    ->withProperties([
                        'ip_address' => request()->ip(),
                        'user_agent' => request()->userAgent(),
                        'evento' => 'login',
                    ])
                    ->log("Inicio de sesión del usuario {$event->user->name}");
            }
        });

        Event::listen(Logout::class, function (Logout $event) {
            if ($event->user) {
                activity('autenticacion')
                    ->causedBy($event->user)
                    ->withProperties([
                        'ip_address' => request()->ip(),
                        'user_agent' => request()->userAgent(),
                        'evento' => 'logout',
                    ])
                    ->log("Cierre de sesión del usuario {$event->user->name}");
            }
        });

        Event::listen(Failed::class, function (Failed $event) {
            activity('autenticacion')
                ->withProperties([
                    'ip_address' => request()->ip(),
                    'user_agent' => request()->userAgent(),
                    'evento' => 'failed_login',
                ])
                ->log('Intento fallido de inicio de sesión');
        });
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
