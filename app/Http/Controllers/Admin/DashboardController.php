<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pastor;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        // 1. Estadísticas Generales y por Grado Ministerial
        $totalPastores = Pastor::count();
        $activosCount = Pastor::where('status', true)->count();
        $inactivosCount = Pastor::where('status', false)->count();

        $gradosStats = [
            'colaboradores' => Pastor::where('nivel_ministerial', 'Colaborador')->count(),
            'laicos' => Pastor::where('nivel_ministerial', 'Laico')->count(),
            'licenciados' => Pastor::where('nivel_ministerial', 'Licenciado')->count(),
            'ordenados' => Pastor::where('nivel_ministerial', 'Ministro Ordenado')->count(),
        ];

        // 2. Distribución por Zona (ApexCharts)
        $zonasData = Pastor::select('zona', DB::raw('count(*) as total'))
            ->whereNotNull('zona')
            ->where('zona', '!=', '')
            ->groupBy('zona')
            ->orderByRaw('CAST(zona AS UNSIGNED) ASC')
            ->get();

        $zonasLabels = $zonasData->map(fn($item) => "Zona {$item->zona}")->toArray();
        $zonasSeries = $zonasData->pluck('total')->toArray();

        // 3. Distribución por Género (Donut Chart)
        $generoMasculino = Pastor::where('genero', 'M')->count();
        $generoFemenino = Pastor::where('genero', 'F')->count();

        // 4. Estado de Salud: Sanos vs Con Padecimientos (Donut Chart)
        $conPadecimientosCount = Pastor::where(function($q) {
            $q->whereNotNull('nota')->where('nota', '!=', '')
              ->orWhereNotNull('medicamentos_recetados');
        })->count();

        $sanosCount = max(0, $totalPastores - $conPadecimientosCount);

        // 5. Pastores Recientemente Agregados (Timeline Feed)
        $recentPastores = Pastor::select('id', 'codigo', 'nombres', 'apellidos', 'documento', 'nivel_ministerial', 'zona', 'distrito', 'foto', 'created_at')
            ->orderBy('created_at', 'desc')
            ->take(8)
            ->get()
            ->map(function($p) {
                $fotoUrl = null;
                if ($p->foto) {
                    $trimmed = trim($p->foto);
                    if (str_starts_with($trimmed, 'data:') || str_starts_with($trimmed, 'http') || str_starts_with($trimmed, '/')) {
                        $fotoUrl = $trimmed;
                    } else {
                        $fotoUrl = "/pastores/{$trimmed}";
                    }
                }
                return [
                    'id' => $p->id,
                    'codigo' => $p->codigo,
                    'nombres' => $p->nombres,
                    'apellidos' => $p->apellidos,
                    'nivel_ministerial' => $p->nivel_ministerial,
                    'zona' => $p->zona,
                    'distrito' => $p->distrito,
                    'foto' => $fotoUrl,
                    'created_at_human' => $p->created_at ? $p->created_at->diffForHumans() : 'Recientemente',
                    'created_at_date' => $p->created_at ? $p->created_at->format('d/m/Y h:i A') : '',
                ];
            });

        return inertia('admin/dashboard', [
            'totalPastores' => $totalPastores,
            'activosCount' => $activosCount,
            'inactivosCount' => $inactivosCount,
            'gradosStats' => $gradosStats,
            'zonasChart' => [
                'labels' => $zonasLabels,
                'series' => $zonasSeries,
            ],
            'generoChart' => [
                'masculino' => $generoMasculino,
                'femenino' => $generoFemenino,
            ],
            'saludChart' => [
                'sanos' => $sanosCount,
                'enfermos' => $conPadecimientosCount,
            ],
            'recentPastores' => $recentPastores,
        ]);
    }
}