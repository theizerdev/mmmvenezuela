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
  Users,
  CheckCircle2,
  Clock,
  Phone,
  MessageCircle,
  Heart,
  Search,
  Bell,
  BellOff,
  ShieldCheck,
  ChevronLeft,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import {
  Actividad,
  Sesion,
  PresbiteroDashboardData,
  PastorPresente,
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
  const { ui, resolvedTheme } = useTheme();
  const { user, toggleModoSilencioso } = useAuth();

  const isDesktop = width >= 992;
  const isTablet = width >= 600 && width < 992;
  const isMobile = width < 600;
  const isWide = width >= 768;

  const getMetricCardStyle = () => {
    if (isDesktop) return styles.metricDesktop;
    if (isTablet) return styles.metricTablet;
    return styles.metricMobile;
  };

  const [data, setData] = useState<PresbiteroDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'presentes' | 'pendientes'>('presentes');
  const [searchQuery, setSearchQuery] = useState('');
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const zonaTarget = zonaOverride || user?.zona || '1';

  const cargarDashboard = useCallback(async () => {
    try {
      const res = await api.getPresbiteroDashboard(actividad?.id, sesion?.id, zonaTarget);
      if (res.success) {
        setData(res);
      }
    } catch (e) {
      console.warn('Error cargando dashboard del presbítero:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [actividad?.id, sesion?.id, zonaTarget]);

  useEffect(() => {
    cargarDashboard();
    const interval = setInterval(cargarDashboard, 20000); // 20s auto-refresh
    return () => clearInterval(interval);
  }, [cargarDashboard]);

  const onRefresh = () => {
    setRefreshing(true);
    cargarDashboard();
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

  const presentesFiltrados = (data?.presentes || []).filter(
    (p) =>
      p.nombre_completo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.extension_nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.documento.includes(searchQuery)
  );

  const pendientesFiltrados = (data?.pendientes || []).filter(
    (p) =>
      p.nombre_completo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.extension_nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.documento.includes(searchQuery)
  );

  if (loading && !data) {
    return (
      <View style={[styles.centerLoading, { backgroundColor: ui.background }]}>
        <ActivityIndicator size="large" color={ui.brand} />
        <Text style={[styles.loadingText, { color: ui.mutedForeground }]}>
          Cargando telemetría del Presbiterio Zona {zonaTarget}...
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
        {/* BOTÓN REGRESAR SI ES AUDITORÍA DE SUPERVISOR */}
        {onVolverSupervisor && (
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: ui.muted, borderColor: ui.border }]}
            onPress={onVolverSupervisor}
          >
            <ChevronLeft size={16} color={ui.foreground} />
            <Text style={[styles.backText, { color: ui.foreground }]}>
              Volver al Dashboard Nacional
            </Text>
          </TouchableOpacity>
        )}

        {/* CABECERA EJECUTIVA DE LA ZONA (SENTINELA HUD) */}
        <Card style={styles.headerCard}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <ShieldCheck size={18} color={ui.brand} />
                <Text style={[styles.zonaTitle, { color: ui.foreground }]}>
                  PRESBITERIO ZONA {data?.zona || zonaTarget}
                </Text>
              </View>
              <Text style={[styles.presbiteroSub, { color: ui.mutedForeground }]}>
                Presbítero a cargo:{' '}
                <Text style={{ color: ui.foreground, fontWeight: '700' }}>
                  {data?.presbitero_nombre ||
                    (user?.es_supervisor ? 'Cargando presbítero...' : user?.name || 'Maikel Páez')}
                </Text>
              </Text>
            </View>

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
            >
              {user?.push_modo_silencioso ? (
                <>
                  <BellOff size={15} color={ui.warning} />
                  <Text style={[styles.silenceText, { color: ui.warning }]}>SILENCIADO</Text>
                </>
              ) : (
                <>
                  <Bell size={15} color={ui.success} />
                  <Text style={[styles.silenceText, { color: ui.success }]}>ALERTAS ON</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </Card>

        {/* MÉTRICAS GRID RESPONSIVE */}
        <View style={styles.metricsContainer}>
          <MetricCard
            title="PADRÓN CONVOCADO"
            value={String(metricas.total_padron)}
            percent={100}
            subtext="Pastores asignados a esta zona"
            iconName="account-group"
            badgeLabel="PADRÓN"
            badgeVariant="secondary"
            style={getMetricCardStyle()}
          />

          <MetricCard
            title="ASISTENCIA ACTUAL"
            value={String(metricas.total_presentes)}
            percent={metricas.porcentaje_asistencia}
            subtext={`${metricas.porcentaje_asistencia}% del total presente`}
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
            subtext="Pastores aún no registrados"
            iconName="clock-alert-outline"
            badgeLabel="POR LLEGAR"
            badgeVariant={metricas.total_pendientes > 0 ? 'warning' : 'success'}
            style={getMetricCardStyle()}
          />

          <MetricCard
            title="CON CÓNYUGE"
            value={String(metricas.con_conyuge)}
            percent={
              metricas.total_presentes > 0
                ? (metricas.con_conyuge / metricas.total_presentes) * 100
                : 0
            }
            subtext="Acompañados de su esposa/o"
            iconName="heart"
            badgeLabel="CÓNYUGES"
            badgeVariant="brand"
            style={getMetricCardStyle()}
          />
        </View>

        {/* BUSCADOR RÁPIDO */}
        <View style={[styles.searchBox, { backgroundColor: ui.card, borderColor: ui.border }]}>
          <Search size={16} color={ui.mutedForeground} style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.searchInput, { color: ui.foreground }]}
            placeholder="Buscar por nombre, cédula o congregación..."
            placeholderTextColor={ui.mutedForeground}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* TABS DE SELECCIÓN PRESENTES / PENDIENTES */}
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
          >
            <CheckCircle2
              size={15}
              color={activeTab === 'presentes' ? ui.success : ui.mutedForeground}
            />
            <Text
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
          >
            <Clock
              size={15}
              color={activeTab === 'pendientes' ? ui.warning : ui.mutedForeground}
            />
            <Text
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
                      {/* AVATAR: FOTO OFICIAL O INICIALES */}
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

                      {/* INFORMACIÓN DEL PASTOR */}
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text
                          style={[styles.pastorNombre, { color: ui.foreground }]}
                          numberOfLines={1}
                        >
                          {pastor.nombre_completo}
                        </Text>
                        <Text
                          style={[styles.pastorSub, { color: ui.mutedForeground }]}
                          numberOfLines={1}
                        >
                          C.I. V-{pastor.documento} • {pastor.extension_nombre}
                        </Text>
                        <View style={styles.tagsRow}>
                          <Badge
                            variant="success"
                            size="sm"
                            icon={<Clock size={11} color={ui.success} />}
                          >
                            {pastor.hora_asistencia}
                          </Badge>
                          {pastor.conyuge_presente && (
                            <Badge
                              variant="brand"
                              size="sm"
                              icon={<Heart size={11} color={ui.brand} />}
                            >
                              Con Esposa
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
                  🎉 ¡Excelente! Todos los pastores de la Zona {data?.zona || zonaTarget} ya están presentes.
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
                      {/* AVATAR: FOTO OFICIAL O INICIALES */}
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

                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text
                          style={[styles.pastorNombre, { color: ui.foreground }]}
                          numberOfLines={1}
                        >
                          {pastor.nombre_completo}
                        </Text>
                        <Text
                          style={[styles.pastorSub, { color: ui.mutedForeground }]}
                          numberOfLines={1}
                        >
                          C.I. V-{pastor.documento} • {pastor.extension_nombre}
                        </Text>
                        <View style={styles.tagsRow}>
                          <Badge variant="warning" size="sm">
                            PENDIENTE
                          </Badge>
                          {pastor.telefono && (
                            <Text style={[styles.phoneText, { color: ui.subtle }]}>
                              📞 {pastor.telefono}
                            </Text>
                          )}
                        </View>
                      </View>

                      {/* ACCIONES DIRECTAS WHATSAPP Y TELÉFONO */}
                      <View style={styles.actionCol}>
                        {pastor.telefono && (
                          <>
                            <TouchableOpacity
                              style={[styles.actionBtnWhatsApp, { backgroundColor: '#25D366' }]}
                              onPress={() => handleWhatsApp(pastor)}
                              accessibilityLabel="Contactar por WhatsApp"
                            >
                              <MessageCircle size={15} color="#ffffff" />
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[
                                styles.actionBtnPhone,
                                { backgroundColor: ui.muted, borderColor: ui.border },
                              ]}
                              onPress={() => handleLlamar(pastor.telefono)}
                              accessibilityLabel="Llamar por teléfono"
                            >
                              <Phone size={15} color={ui.foreground} />
                            </TouchableOpacity>
                          </>
                        )}
                      </View>
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
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: 12,
    gap: 4,
  },
  backText: {
    fontSize: 12.5,
    fontWeight: '700',
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
    gap: 10,
  },
  zonaTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  presbiteroSub: {
    fontSize: 12,
    marginTop: 2,
  },
  silenceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    gap: 5,
    flexShrink: 0,
  },
  silenceText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  metricDesktop: {
    flex: 1,
    minWidth: 210,
  },
  metricTablet: {
    width: '48.5%',
    flexGrow: 1,
  },
  metricMobile: {
    width: '100%',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: 14,
    height: 44,
    marginVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    height: '100%',
  },
  tabBar: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: 12,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 6,
  },
  tabBtnActive: {
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  listContainer: {
    gap: 8,
  },
  pastorCard: {
    padding: 12,
    borderRadius: radius.lg,
  },
  pastorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '800',
  },
  pastorNombre: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  pastorSub: {
    fontSize: 11.5,
    marginTop: 1,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  phoneText: {
    fontSize: 11,
    marginLeft: 4,
  },
  actionCol: {
    flexDirection: 'row',
    gap: 6,
    marginLeft: 8,
    flexShrink: 0,
  },
  actionBtnWhatsApp: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnPhone: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
    borderRadius: radius.xl,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '600',
  },
});
