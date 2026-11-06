import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  useWindowDimensions,
} from 'react-native';
import {
  Globe2,
  ChevronRight,
  Search,
  FilterX,
  RefreshCw,
} from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import {
  Actividad,
  Sesion,
  SupervisorDashboardData,
} from '../types';
import { MetricCard } from '../components/MetricCard';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Progress } from '../components/ui/Progress';
import { radius } from '../components/ui/theme';
import { PresbiteroDashboardScreen } from './PresbiteroDashboardScreen';

interface SupervisorDashboardScreenProps {
  actividad: Actividad | null;
  sesion: Sesion | null;
}

export const SupervisorDashboardScreen: React.FC<SupervisorDashboardScreenProps> = ({
  actividad,
  sesion,
}) => {
  const { width } = useWindowDimensions();
  const { ui } = useTheme();

  const isDesktop = width >= 992;

  const [data, setData] = useState<SupervisorDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedZona, setSelectedZona] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSemaforo, setFilterSemaforo] = useState<'todas' | 'optimo' | 'regular' | 'critico'>('todas');

  const cargarDashboard = useCallback(async () => {
    try {
      const res = await api.getSupervisorDashboard(actividad?.id);
      if (res.success) {
        setData(res);
      }
    } catch (e) {
      console.warn('Error cargando dashboard nacional:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [actividad?.id]);

  useEffect(() => {
    cargarDashboard();
    const interval = setInterval(cargarDashboard, 15000);
    return () => clearInterval(interval);
  }, [cargarDashboard]);

  const onRefresh = () => {
    setRefreshing(true);
    cargarDashboard();
  };

  const metricas = data?.metricas_nacionales || {
    total_padron: 0,
    total_presentes: 0,
    total_pendientes: 0,
    porcentaje_asistencia: 0,
    total_con_conyuge: 0,
    total_zonas: 0,
  };

  const zonas = useMemo(() => data?.zonas || [], [data?.zonas]);
  const countOptimas = useMemo(() => zonas.filter((z) => z.porcentaje >= 70).length, [zonas]);
  const countRegulares = useMemo(
    () => zonas.filter((z) => z.porcentaje >= 40 && z.porcentaje < 70).length,
    [zonas]
  );
  const countCriticas = useMemo(() => zonas.filter((z) => z.porcentaje < 40).length, [zonas]);

  const zonasFiltradas = useMemo(() => {
    return zonas.filter((z) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        z.nombre_zona.toLowerCase().includes(query) ||
        z.presbitero_nombre.toLowerCase().includes(query) ||
        String(z.zona) === query;

      if (!matchesSearch) return false;

      if (filterSemaforo === 'optimo') return z.porcentaje >= 70;
      if (filterSemaforo === 'regular') return z.porcentaje >= 40 && z.porcentaje < 70;
      if (filterSemaforo === 'critico') return z.porcentaje < 40;
      return true;
    });
  }, [zonas, searchQuery, filterSemaforo]);

  if (selectedZona) {
    return (
      <PresbiteroDashboardScreen
        actividad={actividad}
        sesion={sesion}
        zonaOverride={selectedZona}
        onVolverSupervisor={() => setSelectedZona(null)}
      />
    );
  }

  const getMetricCardStyle = () => {
    if (isDesktop) return styles.metricDesktop;
    return styles.metricCompactGrid;
  };

  if (loading && !data) {
    return (
      <View style={[styles.centerLoading, { backgroundColor: ui.background }]}>
        <ActivityIndicator size="small" color={ui.brand} />
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={[styles.loadingText, { color: ui.mutedForeground }]}
        >
          Cargando supervisión nacional (41 zonas)...
        </Text>
      </View>
    );
  }

  const filterTabs: Array<{
    key: 'todas' | 'optimo' | 'regular' | 'critico';
    label: string;
    count: number;
    dotColor?: string;
  }> = [
    { key: 'todas', label: 'Todas', count: zonas.length || 41 },
    { key: 'optimo', label: 'Óptimas', count: countOptimas, dotColor: ui.success },
    { key: 'regular', label: 'Regular', count: countRegulares, dotColor: ui.warning },
    { key: 'critico', label: 'Bajas', count: countCriticas, dotColor: ui.destructive },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: ui.background }]}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.responsiveInner}>
        {/* CABECERA COMPACTA SUPERVISOR NACIONAL */}
        <Card style={styles.headerCard}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1, marginRight: 8, minWidth: 0 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <Globe2 size={15} color={ui.brand} />
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={[styles.title, { color: ui.foreground }]}
                >
                  SUPERVISIÓN NACIONAL
                </Text>
              </View>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[styles.subtitle, { color: ui.mutedForeground }]}
              >
                Monitoreo en tiempo real • {zonas.length || 41} Zonas Eclesiásticas
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <TouchableOpacity
                style={[styles.refreshBtn, { backgroundColor: ui.muted, borderColor: ui.border }]}
                onPress={onRefresh}
                disabled={refreshing}
                accessibilityLabel="Actualizar datos"
              >
                <RefreshCw size={13} color={ui.foreground} />
              </TouchableOpacity>

              <Badge
                variant="brand"
                size="sm"
                icon={<View style={[styles.livePulseDot, { backgroundColor: ui.brand }]} />}
              >
                EN VIVO
              </Badge>
            </View>
          </View>
        </Card>

        {/* MÉTRICAS NACIONALES EN CUADRÍCULA COMPACTA 2x2 (4x1 EN DESKTOP) */}
        <View style={styles.metricsContainer}>
          <MetricCard
            title="PADRÓN"
            value={String(metricas.total_padron)}
            percent={100}
            subtext="41 Zonas Oficiales"
            iconName="account-group"
            badgeLabel="TOTAL"
            badgeVariant="secondary"
            style={getMetricCardStyle()}
          />

          <MetricCard
            title="PRESENTES"
            value={String(metricas.total_presentes)}
            percent={metricas.porcentaje_asistencia}
            subtext={`${metricas.porcentaje_asistencia}% asistencia nacional`}
            iconName="check-decagram"
            badgeLabel={
              metricas.porcentaje_asistencia >= 70
                ? 'ÓPTIMO'
                : metricas.porcentaje_asistencia >= 40
                ? 'REGULAR'
                : 'BAJO'
            }
            badgeVariant={
              metricas.porcentaje_asistencia >= 70
                ? 'success'
                : metricas.porcentaje_asistencia >= 40
                ? 'warning'
                : 'destructive'
            }
            style={getMetricCardStyle()}
          />

          <MetricCard
            title="PENDIENTES"
            value={String(metricas.total_pendientes)}
            percent={
              metricas.total_padron > 0
                ? (metricas.total_pendientes / metricas.total_padron) * 100
                : 0
            }
            subtext="Obreros por llegar"
            iconName="clock-alert-outline"
            badgeLabel="AUSENTES"
            badgeVariant="warning"
            style={getMetricCardStyle()}
          />

          <MetricCard
            title="CÓNYUGES"
            value={String(metricas.total_con_conyuge)}
            percent={
              metricas.total_presentes > 0
                ? (metricas.total_con_conyuge / metricas.total_presentes) * 100
                : 0
            }
            subtext="Acompañando en sala"
            iconName="heart"
            badgeLabel="PAREJAS"
            badgeVariant="brand"
            style={getMetricCardStyle()}
          />
        </View>

        {/* CONTROL SEGMENTADO SHADCN POR SEMÁFORO (1 FILA HORIZONTAL) */}
        <View style={[styles.segmentedBar, { backgroundColor: ui.muted, borderColor: ui.border }]}>
          {filterTabs.map((tab) => {
            const active = filterSemaforo === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.segmentItem,
                  active && [
                    styles.segmentItemActive,
                    { backgroundColor: ui.card, borderColor: ui.border },
                  ],
                ]}
                onPress={() => setFilterSemaforo(tab.key)}
                activeOpacity={0.75}
              >
                {tab.dotColor ? (
                  <View style={[styles.segmentDot, { backgroundColor: tab.dotColor }]} />
                ) : null}
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={[
                    styles.segmentText,
                    {
                      color: active ? ui.foreground : ui.mutedForeground,
                      fontWeight: active ? '700' : '500',
                    },
                  ]}
                >
                  {tab.label} ({tab.count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* BUSCADOR DE ZONA SHADCN */}
        <View style={[styles.searchBox, { backgroundColor: ui.card, borderColor: ui.border }]}>
          <Search size={15} color={ui.mutedForeground} style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.searchInput, { color: ui.foreground }]}
            placeholder="Filtrar por zona o nombre del presbítero..."
            placeholderTextColor={ui.mutedForeground}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
              <FilterX size={15} color={ui.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>

        {/* CABECERA DEL LISTADO DE ZONAS */}
        <View style={styles.sectionHeaderRow}>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[styles.sectionTitle, { color: ui.mutedForeground }]}
          >
            PRESBITERIOS ({zonasFiltradas.length} DE {zonas.length || 41} ZONAS)
          </Text>

          {filterSemaforo !== 'todas' && (
            <TouchableOpacity
              onPress={() => setFilterSemaforo('todas')}
              style={[styles.clearFilterPill, { backgroundColor: ui.muted, borderColor: ui.border }]}
            >
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[styles.clearFilterText, { color: ui.brand }]}
              >
                Mostrar todas
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* LISTADO DE LAS 41 ZONAS */}
        {zonasFiltradas.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={[styles.emptyText, { color: ui.mutedForeground }]}>
              No se encontraron zonas con el filtro seleccionado.
            </Text>
          </Card>
        ) : (
          <View style={styles.zonasGrid}>
            {zonasFiltradas.map((z, index) => {
              const isOptimo = z.porcentaje >= 70;
              const isRegular = z.porcentaje >= 40 && z.porcentaje < 70;
              const badgeVariant = isOptimo ? 'success' : isRegular ? 'warning' : 'destructive';
              const badgeLabel = isOptimo ? 'ÓPTIMO' : isRegular ? 'REGULAR' : 'BAJO';
              const barColor = isOptimo ? ui.success : isRegular ? ui.warning : ui.destructive;
              const totalPadron = z.total_padron || z.padron || 0;

              return (
                <TouchableOpacity
                  key={`zona-${z.zona ?? index}`}
                  style={[
                    styles.zonaCard,
                    isDesktop ? styles.zonaCardWide : styles.zonaCardMobile,
                    { backgroundColor: ui.card, borderColor: ui.border },
                  ]}
                  onPress={() => setSelectedZona(z.zona)}
                  activeOpacity={0.75}
                >
                  <View style={styles.zonaHeaderRow}>
                    <View style={styles.zonaTitleCol}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Badge variant="outline" size="sm">
                          {`#${z.zona}`}
                        </Badge>
                        <Text
                          numberOfLines={1}
                          ellipsizeMode="tail"
                          style={[styles.zonaNombre, { color: ui.foreground }]}
                        >
                          {z.nombre_zona.toUpperCase()}
                        </Text>
                      </View>
                      <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={[styles.presbiteroNombre, { color: ui.mutedForeground }]}
                      >
                        Presbítero:{' '}
                        <Text style={{ color: ui.foreground, fontWeight: '600' }}>
                          {z.presbitero_nombre}
                        </Text>
                      </Text>
                    </View>

                    <Badge variant={badgeVariant} size="sm">
                      {`${z.porcentaje}% • ${badgeLabel}`}
                    </Badge>
                  </View>

                  {/* BARRA DE PROGRESO CON COLOR DE SEMÁFORO REAL */}
                  <View style={{ marginVertical: 7 }}>
                    <Progress value={z.porcentaje} indicatorColor={barColor} height={5} />
                  </View>

                  {/* DETALLES DE AUDITORÍA */}
                  <View style={styles.zonaFooterRow}>
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      style={[styles.footerStat, { color: ui.mutedForeground }]}
                    >
                      Presentes:{' '}
                      <Text style={{ color: ui.foreground, fontWeight: '700' }}>
                        {z.presentes}/{totalPadron}
                      </Text>
                      {z.con_conyuge > 0 ? ` • ${z.con_conyuge} cónyuges` : ''}
                    </Text>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                      <Text style={[styles.auditLink, { color: ui.brand }]}>Auditar</Text>
                      <ChevronRight size={13} color={ui.brand} />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 12,
    paddingBottom: 32,
  },
  responsiveInner: {
    width: '100%',
    maxWidth: 1100,
    alignSelf: 'center',
  },
  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    fontWeight: '500',
  },
  headerCard: {
    padding: 12,
    marginBottom: 10,
    borderRadius: radius.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  refreshBtn: {
    width: 28,
    height: 28,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  livePulseDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
    flexShrink: 1,
  },
  subtitle: {
    fontSize: 10.5,
    marginTop: 2,
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  metricDesktop: {
    flex: 1,
    minWidth: 210,
  },
  metricCompactGrid: {
    width: '48.5%',
    flexGrow: 1,
  },
  segmentedBar: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: 10,
    gap: 3,
  },
  segmentItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 4,
    minWidth: 0,
  },
  segmentItemActive: {
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  segmentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    flexShrink: 0,
  },
  segmentText: {
    fontSize: 10.5,
    flexShrink: 1,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 11,
    height: 38,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 12.5,
    height: '100%',
    paddingVertical: 0,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    flex: 1,
  },
  clearFilterPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  clearFilterText: {
    fontSize: 10.5,
    fontWeight: '600',
  },
  zonasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  zonaCard: {
    padding: 12,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  zonaCardWide: {
    width: '49%',
    flexGrow: 1,
  },
  zonaCardMobile: {
    width: '100%',
  },
  zonaHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  zonaTitleCol: {
    flex: 1,
    minWidth: 0,
  },
  zonaNombre: {
    fontSize: 12.5,
    fontWeight: '700',
    flexShrink: 1,
  },
  presbiteroNombre: {
    fontSize: 11,
    marginTop: 2,
  },
  zonaFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  footerStat: {
    flex: 1,
    fontSize: 11,
  },
  auditLink: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyCard: {
    padding: 20,
    alignItems: 'center',
    borderRadius: radius.lg,
  },
  emptyText: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
});
