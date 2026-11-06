import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Linking,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Image,
  useWindowDimensions,
} from 'react-native';
import {
  CheckCircle2,
  Clock,
  Phone,
  MessageCircle,
  Heart,
  Search,
  FilterX,
  Bell,
  BellOff,
  ShieldCheck,
  ChevronLeft,
  RefreshCw,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import {
  Actividad,
  Sesion,
  PresbiteroDashboardData,
  PastorPendiente,
} from '../types';
import { MetricCard } from '../components/MetricCard';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { radius } from '../components/ui/theme';

interface PresbiteroDashboardScreenProps {
  actividad: Actividad | null;
  sesion: Sesion | null;
  zonaOverride?: string;
  onVolverSupervisor?: () => void;
}

export const PresbiteroDashboardScreen: React.FC<PresbiteroDashboardScreenProps> = ({
  actividad,
  sesion,
  zonaOverride,
  onVolverSupervisor,
}) => {
  const { width } = useWindowDimensions();
  const { ui } = useTheme();
  const { user, toggleModoSilencioso } = useAuth();

  const isDesktop = width >= 992;

  const getMetricCardStyle = () => {
    if (isDesktop) return styles.metricDesktop;
    return styles.metricCompactGrid;
  };

  const [data, setData] = useState<PresbiteroDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'presentes' | 'pendientes'>('presentes');
  const [searchQuery, setSearchQuery] = useState('');
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const zonaTarget = zonaOverride || user?.zona || '1';

  const cargarDashboard = useCallback(async (isManual = false) => {
    if (isManual) setIsUpdating(true);
    try {
      const res = await api.getPresbiteroDashboard(actividad?.id, sesion?.id, zonaTarget);
      if (res.success) {
        setData(res);
        setLastUpdated(new Date());
      }
    } catch (e) {
      console.warn('Error cargando dashboard del presbítero:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
      if (isManual) setIsUpdating(false);
    }
  }, [actividad?.id, sesion?.id, zonaTarget]);

  useEffect(() => {
    cargarDashboard();
    const interval = setInterval(() => cargarDashboard(false), 15000);
    return () => clearInterval(interval);
  }, [cargarDashboard]);

  const onRefresh = () => {
    setRefreshing(true);
    cargarDashboard(true);
  };

  const handleLlamar = (telefono?: string | null) => {
    if (!telefono) return;
    const clean = telefono.replace(/\D/g, '');
    Linking.openURL(`tel:${clean}`);
  };

  const handleWhatsApp = (pastor: PastorPendiente) => {
    if (!pastor.telefono) return;
    const clean = pastor.telefono.replace(/\D/g, '');
    const mensaje = encodeURIComponent(
      `Paz de Cristo, amado Pastor ${pastor.nombre_completo}. Le saludamos del Presbiterio Zona ${zonaTarget}. Queríamos consultar si ya se encuentra en camino al evento.`
    );
    Linking.openURL(`https://wa.me/${clean}?text=${mensaje}`);
  };

  const metricas = data?.metricas || {
    total_padron: 0,
    total_presentes: 0,
    total_pendientes: 0,
    porcentaje_asistencia: 0,
    con_conyuge: 0,
  };

  const query = searchQuery.toLowerCase().trim();

  const presentesFiltrados = (data?.presentes || []).filter(
    (p) =>
      !query ||
      p.nombre_completo.toLowerCase().includes(query) ||
      p.extension_nombre.toLowerCase().includes(query) ||
      p.documento.includes(query)
  );

  const pendientesFiltrados = (data?.pendientes || []).filter(
    (p) =>
      !query ||
      p.nombre_completo.toLowerCase().includes(query) ||
      p.extension_nombre.toLowerCase().includes(query) ||
      p.documento.includes(query)
  );

  if (loading && !data) {
    return (
      <View style={[styles.centerLoading, { backgroundColor: ui.background }]}>
        <ActivityIndicator size="small" color={ui.brand} />
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={[styles.loadingText, { color: ui.mutedForeground }]}
        >
          Cargando Presbiterio Zona {zonaTarget}...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: ui.background }]}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.responsiveInner}>
        {/* BOTÓN REGRESAR SI ES AUDITORÍA DE SUPERVISOR */}
        {onVolverSupervisor && (
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: ui.card, borderColor: ui.border }]}
            onPress={onVolverSupervisor}
            activeOpacity={0.75}
          >
            <ChevronLeft size={14} color={ui.foreground} />
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[styles.backText, { color: ui.foreground }]}
            >
              Volver a Supervisión Nacional
            </Text>
          </TouchableOpacity>
        )}

        {/* CABECERA COMPACTA DE LA ZONA */}
        <Card style={styles.headerCard}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1, marginRight: 8, minWidth: 0 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <ShieldCheck size={15} color={ui.brand} />
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={[styles.zonaTitle, { color: ui.foreground }]}
                >
                  PRESBITERIO ZONA {data?.zona || zonaTarget}
                </Text>
              </View>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[styles.presbiteroSub, { color: ui.mutedForeground }]}
              >
                Presbítero:{' '}
                <Text style={{ color: ui.foreground, fontWeight: '600' }}>
                  {data?.presbitero_nombre ||
                    (user?.es_supervisor ? 'Supervisión' : user?.name || 'Asignado')}
                </Text>
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 }}>
                <View style={[styles.livePulseDot, { backgroundColor: ui.success }]} />
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={{ fontSize: 9.5, color: ui.mutedForeground, fontWeight: '500' }}
                >
                  Sincronizado •{' '}
                  {lastUpdated.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              {/* BOTÓN FORZAR ACTUALIZACIÓN MANUAL */}
              <TouchableOpacity
                style={[styles.refreshBtn, { backgroundColor: ui.muted, borderColor: ui.border }]}
                onPress={onRefresh}
                disabled={isUpdating || refreshing}
                accessibilityLabel="Actualizar datos"
              >
                <RefreshCw size={13} color={ui.foreground} />
              </TouchableOpacity>

              {/* MODO SILENCIOSO / PLENARIA */}
              <TouchableOpacity
                style={[
                  styles.silenceBtn,
                  {
                    backgroundColor: user?.push_modo_silencioso
                      ? 'rgba(245, 158, 11, 0.12)'
                      : ui.successSoft,
                    borderColor: user?.push_modo_silencioso ? ui.warning : ui.success,
                  },
                ]}
                onPress={toggleModoSilencioso}
                activeOpacity={0.75}
              >
                {user?.push_modo_silencioso ? (
                  <>
                    <BellOff size={13} color={ui.warning} />
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      style={[styles.silenceText, { color: ui.warning }]}
                    >
                      SILENCIADO
                    </Text>
                  </>
                ) : (
                  <>
                    <Bell size={13} color={ui.success} />
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      style={[styles.silenceText, { color: ui.success }]}
                    >
                      ALERTAS
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Card>

        {/* MÉTRICAS EN CUADRÍCULA COMPACTA 2x2 (4x1 EN DESKTOP) */}
        <View style={styles.metricsContainer}>
          <MetricCard
            title="PADRÓN"
            value={String(metricas.total_padron)}
            percent={100}
            subtext="Pastores de esta zona"
            iconName="account-group"
            badgeLabel="ZONA"
            badgeVariant="secondary"
            style={getMetricCardStyle()}
          />

          <MetricCard
            title="PRESENTES"
            value={String(metricas.total_presentes)}
            percent={metricas.porcentaje_asistencia}
            subtext={`${metricas.porcentaje_asistencia}% del padrón`}
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
            badgeVariant={metricas.total_pendientes > 0 ? 'warning' : 'success'}
            style={getMetricCardStyle()}
          />

          <MetricCard
            title="CÓNYUGES"
            value={String(metricas.con_conyuge)}
            percent={
              metricas.total_presentes > 0
                ? (metricas.con_conyuge / metricas.total_presentes) * 100
                : 0
            }
            subtext="Acompañados en sala"
            iconName="heart"
            badgeLabel="PAREJAS"
            badgeVariant="brand"
            style={getMetricCardStyle()}
          />
        </View>

        {/* TABS SEGMENTADOS SHADCN: PRESENTES / POR LLEGAR */}
        <View style={[styles.tabBar, { backgroundColor: ui.muted, borderColor: ui.border }]}>
          <TouchableOpacity
            style={[
              styles.tabBtn,
              activeTab === 'presentes' && [
                styles.tabBtnActive,
                { backgroundColor: ui.card, borderColor: ui.border },
              ],
            ]}
            onPress={() => setActiveTab('presentes')}
            activeOpacity={0.75}
          >
            <CheckCircle2
              size={14}
              color={activeTab === 'presentes' ? ui.success : ui.mutedForeground}
            />
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[
                styles.tabBtnText,
                { color: activeTab === 'presentes' ? ui.foreground : ui.mutedForeground },
              ]}
            >
              Presentes
            </Text>
            <Badge variant={activeTab === 'presentes' ? 'success' : 'secondary'} size="sm">
              {presentesFiltrados.length}
            </Badge>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabBtn,
              activeTab === 'pendientes' && [
                styles.tabBtnActive,
                { backgroundColor: ui.card, borderColor: ui.border },
              ],
            ]}
            onPress={() => setActiveTab('pendientes')}
            activeOpacity={0.75}
          >
            <Clock
              size={14}
              color={activeTab === 'pendientes' ? ui.warning : ui.mutedForeground}
            />
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[
                styles.tabBtnText,
                { color: activeTab === 'pendientes' ? ui.foreground : ui.mutedForeground },
              ]}
            >
              Por Llegar
            </Text>
            <Badge variant={activeTab === 'pendientes' ? 'warning' : 'secondary'} size="sm">
              {pendientesFiltrados.length}
            </Badge>
          </TouchableOpacity>
        </View>

        {/* BUSCADOR RÁPIDO CON BOTÓN LIMPIAR */}
        <View style={[styles.searchBox, { backgroundColor: ui.card, borderColor: ui.border }]}>
          <Search size={15} color={ui.mutedForeground} style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.searchInput, { color: ui.foreground }]}
            placeholder="Buscar por nombre, cédula o congregación..."
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

        {/* LISTA DE PASTORES PRESENTES */}
        {activeTab === 'presentes' && (
          <View style={styles.listContainer}>
            {presentesFiltrados.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Text style={[styles.emptyText, { color: ui.mutedForeground }]}>
                  {searchQuery
                    ? 'No se encontraron obreros con ese criterio.'
                    : 'Aún no se registran pastores de esta zona en el evento.'}
                </Text>
              </Card>
            ) : (
              presentesFiltrados.map((pastor, index) => {
                const pastorKey = `pres-${pastor.pastor_id ?? (pastor as any).id ?? pastor.documento ?? index}`;
                const rawFoto = (pastor as any).foto_url || (pastor as any).foto;
                const resolvedUri = rawFoto ? api.resolveImageUrl(rawFoto) : null;
                const hasFoto = !!resolvedUri && !imageErrors[pastorKey];

                return (
                  <Card key={pastorKey} style={styles.pastorCard}>
                    <View style={styles.pastorRow}>
                      {/* AVATAR COMPACTO SHADCN */}
                      <View
                        style={[
                          styles.avatarBox,
                          { backgroundColor: ui.muted, borderColor: ui.border },
                        ]}
                      >
                        {hasFoto ? (
                          <Image
                            source={{ uri: resolvedUri! }}
                            style={styles.avatarImage}
                            resizeMode="cover"
                            onError={() =>
                              setImageErrors((prev) => ({ ...prev, [pastorKey]: true }))
                            }
                          />
                        ) : (
                          <Text style={[styles.avatarText, { color: ui.brand }]}>
                            {pastor.nombre_completo.substring(0, 2).toUpperCase()}
                          </Text>
                        )}
                      </View>

                      {/* INFORMACIÓN DEL PASTOR CON PUNTOS SUSPENSIVOS */}
                      <View style={{ flex: 1, marginLeft: 10, minWidth: 0 }}>
                        <Text
                          style={[styles.pastorNombre, { color: ui.foreground }]}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {pastor.nombre_completo}
                        </Text>
                        <Text
                          style={[styles.pastorSub, { color: ui.mutedForeground }]}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          C.I. V-{pastor.documento} • {pastor.extension_nombre}
                        </Text>
                        <View style={styles.tagsRow}>
                          <Badge
                            variant="success"
                            size="sm"
                            icon={<Clock size={10} color={ui.success} />}
                          >
                            {pastor.hora_asistencia}
                          </Badge>
                          {pastor.conyuge_presente && (
                            <Badge
                              variant="brand"
                              size="sm"
                              icon={<Heart size={10} color={ui.brand} />}
                            >
                              Cónyuge
                            </Badge>
                          )}
                        </View>
                      </View>
                    </View>
                  </Card>
                );
              })
            )}
          </View>
        )}

        {/* LISTA DE PASTORES PENDIENTES */}
        {activeTab === 'pendientes' && (
          <View style={styles.listContainer}>
            {pendientesFiltrados.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Text style={[styles.emptyText, { color: ui.success }]}>
                  ¡Excelente! Todos los pastores de la Zona {data?.zona || zonaTarget} ya están presentes.
                </Text>
              </Card>
            ) : (
              pendientesFiltrados.map((pastor, index) => {
                const pastorKey = `pend-${pastor.pastor_id ?? (pastor as any).id ?? pastor.documento ?? index}`;
                const rawFoto = (pastor as any).foto_url || (pastor as any).foto;
                const resolvedUri = rawFoto ? api.resolveImageUrl(rawFoto) : null;
                const hasFoto = !!resolvedUri && !imageErrors[pastorKey];

                return (
                  <Card key={pastorKey} style={styles.pastorCard}>
                    <View style={styles.pastorRow}>
                      {/* AVATAR COMPACTO SHADCN */}
                      <View
                        style={[
                          styles.avatarBox,
                          { backgroundColor: ui.muted, borderColor: ui.border },
                        ]}
                      >
                        {hasFoto ? (
                          <Image
                            source={{ uri: resolvedUri! }}
                            style={styles.avatarImage}
                            resizeMode="cover"
                            onError={() =>
                              setImageErrors((prev) => ({ ...prev, [pastorKey]: true }))
                            }
                          />
                        ) : (
                          <Text style={[styles.avatarText, { color: ui.mutedForeground }]}>
                            {pastor.nombre_completo.substring(0, 2).toUpperCase()}
                          </Text>
                        )}
                      </View>

                      <View style={{ flex: 1, marginLeft: 10, minWidth: 0 }}>
                        <Text
                          style={[styles.pastorNombre, { color: ui.foreground }]}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {pastor.nombre_completo}
                        </Text>
                        <Text
                          style={[styles.pastorSub, { color: ui.mutedForeground }]}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          C.I. V-{pastor.documento} • {pastor.extension_nombre}
                        </Text>
                        <View style={styles.tagsRow}>
                          <Badge variant="warning" size="sm">
                            PENDIENTE
                          </Badge>
                          {pastor.telefono && (
                            <Text
                              numberOfLines={1}
                              ellipsizeMode="tail"
                              style={[styles.phoneText, { color: ui.mutedForeground }]}
                            >
                              {pastor.telefono}
                            </Text>
                          )}
                        </View>
                      </View>

                      {/* ACCIONES DIRECTAS WHATSAPP Y TELÉFONO */}
                      {pastor.telefono ? (
                        <View style={styles.actionCol}>
                          <TouchableOpacity
                            style={[styles.actionBtnWhatsApp, { backgroundColor: '#25D366' }]}
                            onPress={() => handleWhatsApp(pastor)}
                            accessibilityLabel="Contactar por WhatsApp"
                            activeOpacity={0.75}
                          >
                            <MessageCircle size={14} color="#ffffff" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[
                              styles.actionBtnPhone,
                              { backgroundColor: ui.muted, borderColor: ui.border },
                            ]}
                            onPress={() => handleLlamar(pastor.telefono)}
                            accessibilityLabel="Llamar por teléfono"
                            activeOpacity={0.75}
                          >
                            <Phone size={14} color={ui.foreground} />
                          </TouchableOpacity>
                        </View>
                      ) : null}
                    </View>
                  </Card>
                );
              })
            )}
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
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    height: 32,
    paddingHorizontal: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: 10,
    gap: 4,
  },
  backText: {
    fontSize: 11.5,
    fontWeight: '600',
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
  zonaTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
    flexShrink: 1,
  },
  presbiteroSub: {
    fontSize: 11,
    marginTop: 2,
  },
  silenceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 28,
    paddingHorizontal: 8,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: 4,
    flexShrink: 0,
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
  silenceText: {
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.4,
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
  tabBar: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: 10,
    gap: 3,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 5,
    minWidth: 0,
  },
  tabBtnActive: {
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  tabBtnText: {
    fontSize: 11.5,
    fontWeight: '600',
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
  listContainer: {
    gap: 8,
  },
  pastorCard: {
    padding: 10,
    borderRadius: radius.lg,
  },
  pastorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBox: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  avatarImage: {
    width: 38,
    height: 38,
  },
  avatarText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  pastorNombre: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  pastorSub: {
    fontSize: 11,
    marginTop: 1,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  phoneText: {
    fontSize: 10.5,
    fontWeight: '500',
  },
  actionCol: {
    flexDirection: 'row',
    gap: 5,
    marginLeft: 8,
    flexShrink: 0,
  },
  actionBtnWhatsApp: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnPhone: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
