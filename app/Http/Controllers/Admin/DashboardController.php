<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pastor;
use App\Models\Estado;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        // 1. Estadísticas Generales y por Grado Ministerial
        $totalPastores = Pastor::count();
        $activosCount = Pastor::where('status', true)->count();
        $inactivosCount = Pastor::where('status', false)->count();

        $gradosStats = [
            'colaboradores' => Pastor::whereIn('nivel_ministerial', ['Pastor Asociado', 'Colaborador'])->count(),
            'laicos' => Pastor::where('nivel_ministerial', 'Laico')->count(),
            'licenciados' => Pastor::where('nivel_ministerial', 'Licenciado')->count(),
            'ordenados' => Pastor::where('nivel_ministerial', 'Ministro Ordenado')->count(),
        ];

        // 2. KPIs Complementarios
        $bautizadosEspiritu = Pastor::where('batizado_espiritu_santo', true)->count();
        $porcentajeBautizados = $totalPastores > 0 ? round(($bautizadosEspiritu / $totalPastores) * 100) : 0;
        $cargosNacionalesCount = Pastor::whereNotNull('cargo_nacional')->where('cargo_nacional', '!=', '')->count();
        $casadosCount = Pastor::where('estado_civil', 'LIKE', '%Casad%')->count();

        // 3. Distribución por Zona (ApexCharts)
        $zonasData = Pastor::select('zona', DB::raw('count(*) as total'))
            ->whereNotNull('zona')
            ->where('zona', '!=', '')
            ->groupBy('zona')
            ->orderByRaw('CAST(zona AS UNSIGNED) ASC')
            ->get();

        $zonasLabels = $zonasData->map(fn($item) => "Zona {$item->zona}")->toArray();
        $zonasSeries = $zonasData->pluck('total')->toArray();

        // 4. Distribución por Género (Donut Chart)
        $generoMasculino = Pastor::where('genero', 'M')->count();
        $generoFemenino = Pastor::where('genero', 'F')->count();

        // 5. Estado de Salud: Sanos vs Con Padecimientos (Donut Chart)
        $conPadecimientosCount = Pastor::where(function($q) {
            $q->whereNotNull('nota')->where('nota', '!=', '')
              ->orWhereNotNull('medicamentos_recetados');
        })->count();

        $sanosCount = max(0, $totalPastores - $conPadecimientosCount);

        // 6. Rangos de Edad (<30, 30-45, 46-60, 60+)
        $edadRanges = [
            'menos30' => Pastor::where('edad', '<', 30)->where('edad', '>', 0)->count(),
            'de30a45' => Pastor::whereBetween('edad', [30, 45])->count(),
            'de46a60' => Pastor::whereBetween('edad', [46, 60])->count(),
            'mas60' => Pastor::where('edad', '>', 60)->count(),
        ];

        // 7. Estudios Teológicos
        $estudiosTeologicos = [
            'conEstudio' => Pastor::where('estudio_teologico', true)->count(),
            'sinEstudio' => Pastor::where('estudio_teologico', false)->orWhereNull('estudio_teologico')->count(),
        ];

        // 8. Pastores por Estado Geográfico Nacional (Top 8 estados)
        $estadosData = Pastor::select('estados.nombre as estado_nombre', DB::raw('count(pastores.id) as total'))
            ->join('estados', 'pastores.estado_id', '=', 'estados.id')
            ->groupBy('estados.nombre')
            ->orderBy('total', 'desc')
            ->take(8)
            ->get();

        $estadosLabels = $estadosData->pluck('estado_nombre')->toArray();
        $estadosSeries = $estadosData->pluck('total')->toArray();

        // 9. Cumpleañeros del Mes Actual
        $currentMonth = Carbon::now()->month;
        $cumpleanerosMes = Pastor::select('id', 'codigo', 'nombres', 'apellidos', 'fe_nacimiento', 'foto', 'zona', 'distrito', 'nivel_ministerial')
            ->whereNotNull('fe_nacimiento')
            ->whereRaw('MONTH(fe_nacimiento) = ?', [$currentMonth])
            ->orderByRaw('DAY(fe_nacimiento) ASC')
            ->take(6)
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
                $fecha = Carbon::parse($p->fe_nacimiento);
                return [
                    'id' => $p->id,
                    'codigo' => $p->codigo,
                    'nombres' => $p->nombres,
                    'apellidos' => $p->apellidos,
                    'nivel_ministerial' => $p->nivel_ministerial,
                    'zona' => $p->zona,
                    'distrito' => $p->distrito,
                    'foto' => $fotoUrl,
                    'dia' => $fecha->format('d'),
                    'mes' => $fecha->translatedFormat('F'),
                    'edad_cumplida' => $fecha->age,
                ];
            });

        // 10. Pastores Recientemente Agregados (Timeline Feed)
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
            'bautizadosEspiritu' => $bautizadosEspiritu,
            'porcentajeBautizados' => $porcentajeBautizados,
            'cargosNacionalesCount' => $cargosNacionalesCount,
            'casadosCount' => $casadosCount,
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
            'edadChart' => $edadRanges,
            'estudiosChart' => $estudiosTeologicos,
            'estadosChart' => [
                'labels' => $estadosLabels,
                'series' => $estadosSeries,
            ],
            'cumpleanerosMes' => $cumpleanerosMes,
            'recentPastores' => $recentPastores,
        ]);
    }
}