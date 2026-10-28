import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { BarChart3, PieChart, Users, ChevronRight, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react-native';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { ApexChart } from './ApexChart';
import { radius, useTheme } from './ui/theme';
import { SupervisorDashboardData, ZonaResumen } from '../types';

interface SupervisorApexChartProps {
  data: SupervisorDashboardData;
  selectedFilter?: 'todas' | 'optimo' | 'regular' | 'critico';
  onSelectFilter?: (filter: 'todas' | 'optimo' | 'regular' | 'critico') => void;
  onSelectZona?: (zonaId: string) => void;
}

export const SupervisorApexChart: React.FC<SupervisorApexChartProps> = ({
  data,
  selectedFilter = 'todas',
  onSelectFilter,
  onSelectZona,
}) => {
  const { ui, resolvedTheme } = useTheme();
  const { width } = useWindowDimensions();
  const isDark = resolvedTheme === 'dark';

  const [activeTab, setActiveTab] = useState<'barras' | 'semaforo' | 'parejas'>('parejas');

  const zonas = data.zonas || [];
  const metricas = data.metricas_nacionales;

  // Clasificación de zonas para semáforo y filtros
  const { optimas, regulares, criticas } = useMemo(() => {
    const opt: ZonaResumen[] = [];
    const reg: ZonaResumen[] = [];
    const cri: ZonaResumen[] = [];

    zonas.forEach((z) => {
      if (z.porcentaje >= 70) {
        opt.push(z);
      } else if (z.porcentaje >= 40) {
        reg.push(z);
      } else {
        cri.push(z);
      }
    });

    return { optimas: opt, regulares: reg, criticas: cri };
  }, [zonas]);

  // Colores institucionales según el modo
  const chartTextColor = isDark ? '#94a3b8' : '#64748b';
  const chartBorderColor = isDark ? '#27272a' : '#e2e8f0';
  const chartBgTooltip = isDark ? '#18181b' : '#ffffff';

  // 1. CONFIGURACIÓN: Comparativa de las 41 Zonas (Barra Apilada: Presentes vs Pendientes)
  const barChartOptions = useMemo(() => {
    const categories = zonas.map((z) => `Z${z.zona}`);

    return {
      chart: {
        type: 'bar',
        stacked: true,
        toolbar: { show: false },
        fontFamily: 'inherit',
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 600,
        },
        events: {
          dataPointSelection: (_event: any, _chartContext: any, config: any) => {
            const index = config?.dataPointIndex;
            if (index !== undefined && zonas[index] && onSelectZona) {
              onSelectZona(zonas[index].zona);
            }
          },
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          borderRadius: 3,
          columnWidth: '65%',
          dataLabels: {
            total: {
              enabled: false,
            },
          },
        },
      },
      colors: ['#0284c7', isDark ? '#334155' : '#cbd5e1'],
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        categories,
        labels: {
          rotate: -45,
          rotateAlways: zonas.length > 20,
          style: {
            colors: chartTextColor,
            fontSize: '10px',
            fontWeight: 600,
          },
        },
        axisBorder: { color: chartBorderColor },
        axisTicks: { color: chartBorderColor },
      },
      yaxis: {
        labels: {
          style: {
            colors: chartTextColor,
            fontSize: '11px',
          },
        },
        title: {
          text: 'Obreros Convocados',
          style: {
            color: chartTextColor,
            fontSize: '11px',
            fontWeight: 500,
          },
        },
      },
      grid: {
        borderColor: chartBorderColor,
        strokeDashArray: 4,
        yaxis: { lines: { show: true } },
        xaxis: { lines: { show: false } },
      },
      legend: {
        position: 'top',
        horizontalAlign: 'right',
        labels: { colors: chartTextColor },
        markers: { radius: 3 },
      },
      tooltip: {
        theme: isDark ? 'dark' : 'light',
        shared: true,
        intersect: false,
        y: {
          formatter: (val: number) => `${val} pastores`,
        },
        custom: ({ series, seriesIndex, dataPointIndex, w }: any) => {
          const z = zonas[dataPointIndex];
          if (!z) return '';
          const presentes = series[0][dataPointIndex] || 0;
          const pendientes = series[1][dataPointIndex] || 0;
          const total = presentes + pendientes;
          const pct = total > 0 ? Math.round((presentes / total) * 100) : 0;
          const semColor = pct >= 70 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#ef4444';
          const semLabel = pct >= 70 ? 'ÓPTIMO' : pct >= 40 ? 'REGULAR' : 'BAJO';

          return `
            <div style="padding: 10px 14px; font-family: inherit; font-size: 12px; background: ${chartBgTooltip}; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border: 1px solid ${chartBorderColor};">
              <div style="font-weight: 800; font-size: 13px; color: ${isDark ? '#f8fafc' : '#0f172a'}; margin-bottom: 2px;">
                ${z.nombre_zona.toUpperCase()}
              </div>
              <div style="font-size: 11px; color: ${isDark ? '#94a3b8' : '#64748b'}; margin-bottom: 8px;">
                Presbítero: <b>${z.presbitero_nombre}</b>
              </div>
              <div style="display: flex; justify-content: space-between; gap: 12px; margin-bottom: 4px;">
                <span style="color: #0284c7;">● Presentes:</span>
                <b>${presentes}</b>
              </div>
              <div style="display: flex; justify-content: space-between; gap: 12px; margin-bottom: 6px;">
                <span style="color: ${isDark ? '#94a3b8' : '#64748b'};">● Por Llegar:</span>
                <b>${pendientes}</b>
              </div>
              <div style="border-top: 1px solid ${chartBorderColor}; padding-top: 6px; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 11px; font-weight: 700; color: ${semColor};">[${semLabel}] ${pct}% Asistencia</span>
                <span style="font-size: 10px; color: ${isDark ? '#94a3b8' : '#64748b'};">Total: ${total}</span>
              </div>
              <div style="font-size: 9.5px; color: #0284c7; margin-top: 4px; text-align: center;">
                (Toque para auditar esta zona)
              </div>
            </div>
          `;
        },
      },
    };
  }, [zonas, chartTextColor, chartBorderColor, isDark, chartBgTooltip, onSelectZona]);

  const barChartSeries = useMemo(() => {
    return [
      {
        name: 'Presentes en Sala',
        data: zonas.map((z) => z.presentes),
      },
      {
        name: 'Por Llegar (Faltantes)',
        data: zonas.map((z) => Math.max(0, (z.total_padron || z.padron) - z.presentes)),
      },
    ];
  }, [zonas]);

  // 2. CONFIGURACIÓN: Donut de Rendimiento (Semáforo de las 41 Zonas)
  const semaforoChartOptions = useMemo(() => {
    return {
      chart: {
        type: 'donut',
        fontFamily: 'inherit',
      },
      labels: [
        `Óptimas (≥ 70%)`,
        `Regulares (40 - 69%)`,
        `Atención / Bajas (< 40%)`,
      ],
      colors: ['#10b981', '#f59e0b', '#ef4444'],
      legend: {
        position: 'bottom',
        labels: { colors: chartTextColor },
        markers: { radius: 4 },
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number, opts: any) => {
          const count = opts.w.config.series[opts.seriesIndex];
          return `${count} z.`;
        },
      },
      plotOptions: {
        pie: {
          donut: {
            size: '72%',
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: '12px',
                color: chartTextColor,
              },
              value: {
                show: true,
                fontSize: '22px',
                fontWeight: '800',
                color: isDark ? '#f8fafc' : '#0f172a',
                formatter: (val: any) => `${val} Zonas`,
              },
              total: {
                show: true,
                label: 'Total Zonas',
                fontSize: '12px',
                fontWeight: '600',
                color: chartTextColor,
                formatter: () => `${zonas.length}`,
              },
            },
          },
        },
      },
      tooltip: {
        theme: isDark ? 'dark' : 'light',
        y: {
          formatter: (val: number) => `${val} de ${zonas.length} Zonas (${Math.round((val / (zonas.length || 1)) * 100)}%)`,
        },
      },
    };
  }, [zonas, chartTextColor, isDark]);

  const semaforoChartSeries = useMemo(() => {
    return [optimas.length, regulares.length, criticas.length];
  }, [optimas.length, regulares.length, criticas.length]);

  // 3. CONFIGURACIÓN: Distribución de Concurrencia Nacional y Parejas
  const parejasChartOptions = useMemo(() => {
    return {
      chart: {
        type: 'donut',
        fontFamily: 'inherit',
      },
      labels: ['Presentes en Sala', 'Obreros en Camino', 'Cónyuges Acompañantes'],
      colors: ['#0284c7', '#f59e0b', '#ec4899'],
      legend: {
        position: 'bottom',
        labels: { colors: chartTextColor },
        markers: { radius: 4 },
      },
      dataLabels: {
        enabled: true,
      },
      plotOptions: {
        pie: {
          donut: {
            size: '72%',
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: '12px',
                color: chartTextColor,
              },
              value: {
                show: true,
                fontSize: '22px',
                fontWeight: '800',
                color: isDark ? '#f8fafc' : '#0f172a',
                formatter: (val: any) => `${val}`,
              },
              total: {
                show: true,
                label: 'Padrón Total',
                fontSize: '12px',
                fontWeight: '600',
                color: chartTextColor,
                formatter: () => `${metricas.total_padron}`,
              },
            },
          },
        },
      },
      tooltip: {
        theme: isDark ? 'dark' : 'light',
        y: {
          formatter: (val: number) => `${val} personas`,
        },
      },
    };
  }, [chartTextColor, isDark, metricas.total_padron]);

  const parejasChartSeries = useMemo(() => {
    return [
      metricas.total_presentes,
      metricas.total_pendientes,
      metricas.total_con_conyuge,
    ];
  }, [metricas.total_presentes, metricas.total_pendientes, metricas.total_con_conyuge]);

  return (
    <Card style={styles.card}>
      {/* CABECERA DEL GRÁFICO CON SELECTOR DE VISTAS */}
      <View style={styles.header}>
        <View style={styles.titleArea}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <BarChart3 size={17} color={ui.brand} />
            <Text style={[styles.mainTitle, { color: ui.foreground }]}>
              RADAR EJECUTIVO NACIONAL
            </Text>
          </View>
          <Text style={[styles.subtitle, { color: ui.mutedForeground }]}>
            Análisis consolidado en vivo de las 41 zonas pastorales
          </Text>
        </View>

        {/* TABS DE GRÁFICO */}
        <View style={[styles.tabBar, { backgroundColor: ui.muted, borderColor: ui.border }]}>
          <TouchableOpacity
            style={[
              styles.tabBtn,
              activeTab === 'parejas' && [styles.tabBtnActive, { backgroundColor: ui.card }],
            ]}
            onPress={() => setActiveTab('parejas')}
          >
            <Text
              style={[
                styles.tabBtnText,
                { color: activeTab === 'parejas' ? ui.foreground : ui.mutedForeground },
                activeTab === 'parejas' && { fontWeight: '700' },
              ]}
            >
              Proporción
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabBtn,
              activeTab === 'barras' && [styles.tabBtnActive, { backgroundColor: ui.card }],
            ]}
            onPress={() => setActiveTab('barras')}
          >
            <Text
              style={[
                styles.tabBtnText,
                { color: activeTab === 'barras' ? ui.foreground : ui.mutedForeground },
                activeTab === 'barras' && { fontWeight: '700' },
              ]}
            >
              41 Zonas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabBtn,
              activeTab === 'semaforo' && [styles.tabBtnActive, { backgroundColor: ui.card }],
            ]}
            onPress={() => setActiveTab('semaforo')}
          >
            <Text
              style={[
                styles.tabBtnText,
                { color: activeTab === 'semaforo' ? ui.foreground : ui.mutedForeground },
                activeTab === 'semaforo' && { fontWeight: '700' },
              ]}
            >
              Semáforo
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* FILTROS RÁPIDOS INTERACTIVOS (SELECCIÓN DIRECTA DE RENDIMIENTO) */}
      <View style={styles.filterPillsRow}>
        <TouchableOpacity
          onPress={() => onSelectFilter?.('todas')}
          style={[
            styles.filterPill,
            selectedFilter === 'todas'
              ? [styles.filterPillActive, { backgroundColor: ui.brand, borderColor: ui.brand }]
              : { backgroundColor: ui.muted, borderColor: ui.border },
          ]}
        >
          <Text
            style={[
              styles.filterPillText,
              { color: selectedFilter === 'todas' ? '#ffffff' : ui.foreground },
            ]}
          >
            Todas (41)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onSelectFilter?.('optimo')}
          style={[
            styles.filterPill,
            selectedFilter === 'optimo'
              ? [styles.filterPillActive, { backgroundColor: '#10b981', borderColor: '#10b981' }]
              : { backgroundColor: ui.muted, borderColor: ui.border },
          ]}
        >
          <View style={[styles.dot, { backgroundColor: '#10b981' }]} />
          <Text
            style={[
              styles.filterPillText,
              { color: selectedFilter === 'optimo' ? '#ffffff' : ui.foreground },
            ]}
          >
            Óptimas ({optimas.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onSelectFilter?.('regular')}
          style={[
            styles.filterPill,
            selectedFilter === 'regular'
              ? [styles.filterPillActive, { backgroundColor: '#f59e0b', borderColor: '#f59e0b' }]
              : { backgroundColor: ui.muted, borderColor: ui.border },
          ]}
        >
          <View style={[styles.dot, { backgroundColor: '#f59e0b' }]} />
          <Text
            style={[
              styles.filterPillText,
              { color: selectedFilter === 'regular' ? '#ffffff' : ui.foreground },
            ]}
          >
            Regulares ({regulares.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onSelectFilter?.('critico')}
          style={[
            styles.filterPill,
            selectedFilter === 'critico'
              ? [styles.filterPillActive, { backgroundColor: '#ef4444', borderColor: '#ef4444' }]
              : { backgroundColor: ui.muted, borderColor: ui.border },
          ]}
        >
          <View style={[styles.dot, { backgroundColor: '#ef4444' }]} />
          <Text
            style={[
              styles.filterPillText,
              { color: selectedFilter === 'critico' ? '#ffffff' : ui.foreground },
            ]}
          >
            Atención ({criticas.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* ÁREA DE RENDERIZADO DEL APEXCHART */}
      <View style={styles.chartWrapper}>
        {activeTab === 'barras' && (
          <ApexChart
            options={barChartOptions}
            series={barChartSeries}
            type="bar"
            height={width < 600 ? 300 : 340}
          />
        )}

        {activeTab === 'semaforo' && (
          <ApexChart
            options={semaforoChartOptions}
            series={semaforoChartSeries}
            type="donut"
            height={width < 600 ? 280 : 320}
          />
        )}

        {activeTab === 'parejas' && (
          <ApexChart
            options={parejasChartOptions}
            series={parejasChartSeries}
            type="donut"
            height={width < 600 ? 280 : 320}
          />
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: radius.xl,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 14,
  },
  titleArea: {
    flex: 1,
    minWidth: 220,
  },
  mainTitle: {
    fontSize: 13.5,
    fontFamily: 'CocogooseBold',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 11.5,
    marginTop: 2,
  },
  tabBar: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  tabBtn: {
    paddingVertical: 4.5,
    paddingHorizontal: 10,
    borderRadius: radius.md,
  },
  tabBtnActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  tabBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  filterPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radius.full,
    borderWidth: 1,
    gap: 5,
  },
  filterPillActive: {
    borderColor: 'transparent',
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  chartWrapper: {
    width: '100%',
    paddingTop: 4,
  },
});

