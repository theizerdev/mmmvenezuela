import React, { useState, useEffect, useCallback } from 'react';
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
  TrendingUp,
  MapPin,
  Heart,
  Users,
  Search,
  ShieldCheck,
  Phone,
} from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import {
  Actividad,
  Sesion,
  SupervisorDashboardData,
  ZonaResumen,
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

  const isWide = width >= 768;

  const [data, setData] = useState<SupervisorDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedZona, setSelectedZona] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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
    const interval = setInterval(cargarDashboard, 25000);
    return () => clearInterval(interval);
  }, [cargarDashboard]);

  const onRefresh = () => {
    setRefreshing(true);
    cargarDashboard();
  };

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

  const metricas = data?.metricas_nacionales || {
    total_padron: 0,
    total_presentes: 0,
    total_pendientes: 0,
    porcentaje_asistencia: 0,
    total_con_conyuge: 0,
    total_zonas: 0,
  };

  const zonasFiltradas = (data?.zonas || []).filter(
    (z) =>
      z.nombre_zona.toLowerCase().includes(searchQuery.toLowerCase()) ||
      z.presbitero_nombre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && !data) {
    return (
      <View style={[styles.centerLoading, { backgroundColor: ui.background }]}>
        <ActivityIndicator size="large" color={ui.brand} />
        <Text style={[styles.loadingText, { color: ui.mutedForeground }]}>
          Consolidando telemetría de las 41 zonas pastorales de Venezuela...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: ui.background }]}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.responsiveInner}>
        {/* CABECERA SUPERVISOR NACIONAL */}
        <Card style={styles.headerCard}>
          <View style={styles.headerRow}>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Globe2 size={18} color={ui.brand} />
                <Text style={[styles.title, { color: ui.foreground }]}>
                  SUPERVISIÓN NACIONAL VENEZUELA
                </Text>
              </View>
              <Text style={[styles.subtitle, { color: ui.mutedForeground }]}>
                Monitoreo centralizado en tiempo real • 41 Zonas Convocadas
              </Text>
            </View>

            <Badge variant="brand" size="sm">
              EN DIRECTO
            </Badge>
          </View>
        </Card>

        {/* MÉTRICAS NACIONALES CONSOLIDADAS */}
        <View style={styles.metricsContainer}>
          <MetricCard
            title="PADRÓN PASTORAL"
            value={String(metricas.total_padron)}
            percent={100}
            subtext="41 Zonas Eclesiásticas"
            iconName="account-group"
            badgeLabel="41 ZONAS"
            badgeVariant="secondary"
            style={isWide ? styles.metricWide : styles.metricMobile}
          />

          <MetricCard
            title="ASISTENCIA TOTAL"
            value={String(metricas.total_presentes)}
            percent={metricas.porcentaje_asistencia}
            subtext={`${metricas.porcentaje_asistencia}% concurrencia`}
            iconName="chart-timeline-variant"
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
            style={isWide ? styles.metricWide : styles.metricMobile}
          />

          <MetricCard
            title="PENDIENTES"
            value={String(metricas.total_pendientes)}
            percent={
              metricas.total_padron > 0
                ? (metricas.total_pendientes / metricas.total_padron) * 100
                : 0
            }
            subtext="Obreros en camino o ausentes"
            iconName="clock-alert-outline"
            badgeLabel="POR LLEGAR"
            badgeVariant="warning"
            style={isWide ? styles.metricWide : styles.metricMobile}
          />

          <MetricCard
            title="CÓNYUGES"
            value={String(metricas.total_con_conyuge)}
            percent={
              metricas.total_presentes > 0
                ? (metricas.total_con_conyuge / metricas.total_presentes) * 100
                : 0
            }
            subtext="Acompañando la obra"
            iconName="heart"
            badgeLabel="PAREJAS"
            badgeVariant="brand"
            style={isWide ? styles.metricWide : styles.metricMobile}
          />
        </View>

        {/* BUSCADOR DE ZONA */}
        <View style={[styles.searchBox, { backgroundColor: ui.card, borderColor: ui.border }]}>
          <Search size={16} color={ui.mutedForeground} style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.searchInput, { color: ui.foreground }]}
            placeholder="Filtrar por número de zona o nombre del presbítero..."
            placeholderTextColor={ui.mutedForeground}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* LISTADO DE LAS 41 ZONAS */}
        <Text style={[styles.sectionTitle, { color: ui.foreground }]}>
          ESTADO POR PRESBITERIO ({zonasFiltradas.length} ZONAS)
        </Text>

        <View style={styles.zonasGrid}>
          {zonasFiltradas.map((z, index) => {
            const badgeVariant =
              z.porcentaje >= 70 ? 'success' : z.porcentaje >= 40 ? 'warning' : 'destructive';
            const badgeLabel =
              z.porcentaje >= 70 ? 'ÓPTIMO' : z.porcentaje >= 40 ? 'REGULAR' : 'BAJO';

            return (
              <TouchableOpacity
                key={`zona-${z.zona ?? index}`}
                style={[
                  styles.zonaCard,
                  isWide ? styles.zonaCardWide : styles.zonaCardMobile,
                  { backgroundColor: ui.card, borderColor: ui.border },
                ]}
                onPress={() => setSelectedZona(z.zona)}
                activeOpacity={0.7}
              >
                <View style={styles.zonaHeaderRow}>
                  {/* ÍNDICE Y NOMBRE */}
                  <View style={styles.zonaTitleCol}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Badge variant="outline" size="sm">
                        {`#${index + 1}`}
                      </Badge>
                      <Text style={[styles.zonaNombre, { color: ui.foreground }]}>
                        {z.nombre_zona.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={[styles.presbiteroNombre, { color: ui.mutedForeground }]}>
                      Presbítero:{' '}
                      <Text style={{ color: ui.foreground, fontWeight: '700' }}>
                        {z.presbitero_nombre}
                      </Text>
                    </Text>
                  </View>

                  {/* SEMÁFORO BADGE */}
                  <Badge variant={badgeVariant} size="sm">
                    {badgeLabel}
                  </Badge>
                </View>

                {/* BARRA DE PROGRESO */}
                <View style={{ marginVertical: 8 }}>
                  <Progress value={z.porcentaje} height={5} />
                </View>

                {/* DETALLES DE AUDITORÍA */}
                <View style={styles.zonaFooterRow}>
                  <Text style={[styles.footerStat, { color: ui.mutedForeground }]}>
                    Presentes:{' '}
                    <Text style={{ color: ui.foreground, fontWeight: '700' }}>
                      {z.presentes}/{z.total_padron}
                    </Text>{' '}
                    ({z.porcentaje}%)
                  </Text>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text style={[styles.auditLink, { color: ui.brand }]}>Auditar Zona</Text>
                    <ChevronRight size={14} color={ui.brand} />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 14,
    paddingBottom: 40,
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
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '600',
  },
  headerCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: radius.xl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 14.5,
    fontFamily: 'CocogooseBold',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 11.5,
    marginTop: 2,
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  metricWide: {
    flex: 1,
    minWidth: 200,
  },
  metricMobile: {
    width: '48.5%',
    minWidth: 140,
    flexGrow: 1,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: 14,
    height: 44,
    marginVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    height: '100%',
  },
  sectionTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  zonasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  zonaCard: {
    padding: 14,
    borderRadius: radius.xl,
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
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  zonaTitleCol: {
    flex: 1,
  },
  zonaNombre: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  presbiteroNombre: {
    fontSize: 11.5,
    marginTop: 2,
  },
  zonaFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  footerStat: {
    fontSize: 11.5,
  },
  auditLink: {
    fontSize: 11.5,
    fontWeight: '700',
  },
});
