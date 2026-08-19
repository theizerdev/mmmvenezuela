<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;

class ActivityMonitoringController extends Controller
{
    /**
     * Display system activity logs.
     */
    public function index(Request $request): Response
    {
        $query = Activity::with(['causer', 'subject']);

        // Search filter
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                    ->orWhere('log_name', 'like', "%{$search}%")
                    ->orWhere('event', 'like', "%{$search}%")
                    ->orWhereHasMorph('causer', [User::class], function ($userQuery) use ($search) {
                        $userQuery->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        // Event filter
        if ($event = $request->input('event')) {
            if ($event === 'autenticacion') {
                $query->where('log_name', 'autenticacion');
            } else {
                $query->where('event', $event);
            }
        }

        // User filter
        if ($causer_id = $request->input('causer_id')) {
            $query->where('causer_type', User::class)
                ->where('causer_id', $causer_id);
        }

        // Date filter
        if ($dateFrom = $request->input('date_from')) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }

        if ($dateTo = $request->input('date_to')) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        $perPage = (int) $request->input('perPage', 15);
        $activities = $query->latest('id')->paginate($perPage)->withQueryString();

        // Transform collection items for front-end presentation
        $activities->getCollection()->transform(function ($activity) {
            $properties = $activity->properties ? $activity->properties->toArray() : [];

            $causer = null;
            if ($activity->causer) {
                $causer = [
                    'id' => $activity->causer->id,
                    'name' => $activity->causer->name,
                    'email' => $activity->causer->email,
                ];
            }

            $subjectTypeFormatted = $activity->subject_type
                ? class_basename($activity->subject_type)
                : 'Sistema';

            return [
                'id' => $activity->id,
                'log_name' => $activity->log_name,
                'description' => $activity->description,
                'event' => $activity->event ?? ($properties['evento'] ?? 'custom'),
                'subject_type' => $subjectTypeFormatted,
                'subject_id' => $activity->subject_id,
                'causer' => $causer,
                'properties' => $properties,
                'ip_address' => $properties['ip_address'] ?? 'N/A',
                'user_agent' => $properties['user_agent'] ?? null,
                'created_at' => $activity->created_at ? $activity->created_at->format('Y-m-d H:i:s') : null,
                'created_at_human' => $activity->created_at ? $activity->created_at->diffForHumans() : null,
            ];
        });

        // Compute dashboard stats
        $today = Carbon::today();
        $stats = [
            'total_today' => Activity::whereDate('created_at', $today)->count(),
            'creations_today' => Activity::whereDate('created_at', $today)->where('event', 'created')->count(),
            'updates_today' => Activity::whereDate('created_at', $today)->where('event', 'updated')->count(),
            'deletions_today' => Activity::whereDate('created_at', $today)->where('event', 'deleted')->count(),
            'logins_today' => Activity::whereDate('created_at', $today)->where('log_name', 'autenticacion')->count(),
        ];

        $users = User::select('id', 'name', 'email')->orderBy('name')->get();

        return Inertia::render('admin/monitoring/activities/index', [
            'activities' => $activities,
            'stats' => $stats,
            'users' => $users,
            'filters' => $request->only(['search', 'event', 'causer_id', 'date_from', 'date_to', 'perPage']),
        ]);
    }
}
