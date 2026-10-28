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
  const { ui } = useTheme();
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
          <Badge variant="brand">CONSEJO NACIONAL</Badge>
        </View>
      </Card>

      {/* METRICCARDS NACIONALES */}
      <View style={styles.metricsGrid}>
        <MetricCard
          title="PADRÓN PASTORAL"
          value={String(metricas.total_padron)}
          percent={100}
          subtext="Pastores convocados en el país"
          iconName="account-group"
          badgeLabel="NACIONAL"
          badgeVariant="secondary"
          style={{ flex: 1, minWidth: 150 }}
        />

        <MetricCard
          title="ASISTENCIA TOTAL"
          value={String(metricas.total_presentes)}
          percent={metricas.porcentaje_asistencia}
          subtext={`${metricas.porcentaje_asistencia}% concurrencia`}
          iconName="chart-timeline-variant"
          badgeLabel={metricas.porcentaje_asistencia >= 70 ? 'ÓPTIMO' : metricas.porcentaje_asistencia >= 40 ? 'REGULAR' : 'BAJO'}
          badgeVariant={metricas.porcentaje_asistencia >= 70 ? 'success' : metricas.porcentaje_asistencia >= 40 ? 'warning' : 'destructive'}
          style={{ flex: 1, minWidth: 150 }}
        />
      </View>

      <View style={styles.metricsGrid}>
        <MetricCard
          title="PENDIENTES POR LLEGAR"
          value={String(metricas.total_pendientes)}
          percent={metricas.total_padron > 0 ? (metricas.total_pendientes / metricas.total_padron) * 100 : 0}
          subtext="Obreros en camino o ausentes"
          iconName="clock-alert-outline"
          badgeLabel="POR LLEGAR"
          badgeVariant="warning"
          style={{ flex: 1, minWidth: 150 }}
        />

        <MetricCard
          title="CÓNYUGES PRESENTES"
          value={String(metricas.total_con_conyuge)}
          percent={metricas.total_presentes > 0 ? (metricas.total_con_conyuge / metricas.total_presentes) * 100 : 0}
          subtext="Acompañando la obra"
          iconName="heart"
          badgeLabel="PAREJAS"
          badgeVariant="brand"
          style={{ flex: 1, minWidth: 150 }}
        />
      </View>

      {/* BUSCADOR DE ZONA */}
      <View style={[styles.searchBox, { backgroundColor: ui.card, borderColor: ui.border }]}>
        <Search size={16} color={ui.mutedForeground} style={{ marginRight: 8 }} />
        <TextInput
          style={[styles.searchInput, { color: ui.foreground }]}
          placeholder="Filtrar por zona o presbítero..."
          placeholderTextColor={ui.mutedForeground}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* LISTADO DE LAS 41 ZONAS */}
      <Text style={[styles.sectionTitle, { color: ui.foreground }]}>
        ESTADO POR PRESBITERIO ({zonasFiltradas.length} ZONAS)
      </Text>

      <View style={styles.zonasList}>
        {zonasFiltradas.map((z, index) => {
          const badgeVariant =
            z.porcentaje >= 70 ? 'success' : z.porcentaje >= 40 ? 'warning' : 'destructive';
          const badgeLabel =
            z.porcentaje >= 70 ? 'ÓPTIMO' : z.porcentaje >= 40 ? 'REGULAR' : 'BAJO';

          return (
            <TouchableOpacity
              key={z.zona}
              style={[styles.zonaCard, { backgroundColor: ui.card, borderColor: ui.border }]}
              onPress={() => setSelectedZona(z.zona)}
              activeOpacity={0.7}
            >
              <View style={styles.zonaHeaderRow}>
                {/* ÍNDICE Y NOMBRE */}
                <View style={styles.zonaTitleCol}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Badge variant="outline">#{index + 1}</Badge>
                    <Text style={[styles.zonaNombre, { color: ui.foreground }]}>
                      {z.nombre_zona.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={[styles.presbiteroNombre, { color: ui.mutedForeground }]}>
                    Presbítero: <Text style={{ color: ui.foreground, fontWeight: '700' }}>{z.presbitero_nombre}</Text>
                  </Text>
                </View>

                {/* SEMÁFORO BADGE */}
                <Badge variant={badgeVariant}>{badgeLabel}</Badge>
              </View>

              {/* BARRA DE PROGRESO */}
              <View style={{ marginVertical: 8 }}>
                <Progress value={z.porcentaje} height={5} />
              </View>

              {/* DETALLES DE AUDITORÍA */}
              <View style={styles.zonaFooterRow}>
                <Text style={[styles.footerStat, { color: ui.mutedForeground }]}>
                  Presentes: <Text style={{ color: ui.foreground, fontWeight: '700' }}>{z.presentes}/{z.total_padron}</Text> ({z.porcentaje}%)
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
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    height: 42,
    marginVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    height: '100%',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  zonasList: {
    gap: 10,
  },
  zonaCard: {
    padding: 14,
    borderRadius: radius.xl,
    borderWidth: 1,
  },
  zonaHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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

