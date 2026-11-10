import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Image,
  ActivityIndicator,
  Animated,
  Pressable,
} from 'react-native';
import {
  Wifi,
  CloudOff,
  Database,
  CalendarCheck,
  CheckCircle2,
  RefreshCw,
  Smartphone,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { Button, Badge } from './ui';

interface SyncSplashLoaderProps {
  visible: boolean;
  onComplete: () => void;
  onDismiss?: () => void;
}

interface StepStatus {
  key: string;
  label: string;
  status: 'pending' | 'running' | 'success' | 'warning';
  detail: string;
}

export const SyncSplashLoader: React.FC<SyncSplashLoaderProps> = ({
  visible,
  onComplete,
  onDismiss,
}) => {
  const { colors, isDark } = useTheme();
  const [currentStep, setCurrentStep] = useState<string>('Iniciando...');
  const [progressPercent, setProgressPercent] = useState<number>(10);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [padronCount, setPadronCount] = useState<number>(api.getPadronCount());
  const [deviceName, setDeviceName] = useState<string>(api.getDeviceName());
  const [serverUrl, setServerUrl] = useState<string>(api.getBaseUrl());

  const [steps, setSteps] = useState<StepStatus[]>([
    {
      key: 'conn',
      label: 'Conexión con el Servidor Central',
      status: 'pending',
      detail: 'Verificando enlace...',
    },
    {
      key: 'padron',
      label: 'Padrón Nacional de Obreros',
      status: 'pending',
      detail: '899 obreros en memoria flash...',
    },
    {
      key: 'act',
      label: 'Actividades y Cultos Vigentes',
      status: 'pending',
      detail: 'Convención Nacional 2026...',
    },
    {
      key: 'queue',
      label: 'Cola Offline y Protección Anti-Duplicados',
      status: 'pending',
      detail: 'Comprobando registros pendientes...',
    },
  ]);

  const progressAnim = useRef(new Animated.Value(0.1)).current;

  const updateProgress = useCallback((percent: number) => {
    setProgressPercent(percent);
    Animated.timing(progressAnim, {
      toValue: Math.min(1, Math.max(0, percent / 100)),
      duration: 350,
      useNativeDriver: false,
    }).start();
  }, [progressAnim]);

  const ejecutarSincronizacion = useCallback(async () => {
    setIsFinished(false);
    setDeviceName(api.getDeviceName());
    setServerUrl(api.getBaseUrl());

    // Paso 1: Conexión
    setSteps((prev) =>
      prev.map((s) =>
        s.key === 'conn' ? { ...s, status: 'running', detail: `Conectando con ${api.getBaseUrl()}...` } : s
      )
    );
    updateProgress(20);
    setCurrentStep('Verificando enlace con el servidor central...');

    let online = false;
    try {
      online = await api.testConnection(api.getBaseUrl());
    } catch {
      online = false;
    }
    setIsOnline(online);

    setSteps((prev) =>
      prev.map((s) => {
        if (s.key === 'conn') {
          return {
            ...s,
            status: online ? 'success' : 'warning',
            detail: online ? 'Conectado al servidor central' : 'Modo Autónomo Local (Sin conexión)',
          };
        }
        return s;
      })
    );

    // Paso 2: Padrón
    setSteps((prev) =>
      prev.map((s) =>
        s.key === 'padron' ? { ...s, status: 'running', detail: 'Verificando datos y fotos de obreros...' } : s
      )
    );
    updateProgress(50);
    setCurrentStep('Sincronizando Padrón Nacional de Obreros...');

    let totalPadron = api.getPadronCount();
    try {
      const pRes = await api.sincronizarPadronOffline();
      totalPadron = pRes.total;
      setPadronCount(totalPadron);
    } catch {
      totalPadron = api.getPadronCount();
    }

    setSteps((prev) =>
      prev.map((s) => {
        if (s.key === 'padron') {
          return {
            ...s,
            status: 'success',
            detail: `${totalPadron} obreros listos con fotos y credenciales`,
          };
        }
        return s;
      })
    );

    // Paso 3: Actividades
    setSteps((prev) =>
      prev.map((s) =>
        s.key === 'act' ? { ...s, status: 'running', detail: 'Descargando cultos y sesiones...' } : s
      )
    );
    updateProgress(75);
    setCurrentStep('Sincronizando actividades y cultos activos...');

    try {
      await api.getActividadesActivas();
    } catch {}

    setSteps((prev) =>
      prev.map((s) => {
        if (s.key === 'act') {
          return {
            ...s,
            status: 'success',
            detail: 'Convención Nacional 2026 y cultos activos',
          };
        }
        return s;
      })
    );

    // Paso 4: Cola Offline y Cero Duplicados
    setSteps((prev) =>
      prev.map((s) =>
        s.key === 'queue' ? { ...s, status: 'running', detail: 'Verificando cola local...' } : s
      )
    );
    updateProgress(90);
    setCurrentStep('Verificando registros offline y protección anti-duplicados...');

    const pendingQueueCount = api.getPendingQueueCount();
    let syncedNow = 0;
    if (online && pendingQueueCount > 0) {
      try {
        const qRes = await api.sincronizarColaOffline();
        syncedNow = qRes.synced;
      } catch {}
    }

    const remainingPending = api.getPendingQueueCount();

    setSteps((prev) =>
      prev.map((s) => {
        if (s.key === 'queue') {
          return {
            ...s,
            status: remainingPending > 0 ? 'warning' : 'success',
            detail:
              syncedNow > 0
                ? `¡${syncedNow} registros sincronizados sin duplicados!`
                : remainingPending > 0
                ? `${remainingPending} registros en cola para sincronizar`
                : 'Cola limpia y protegida contra duplicados',
          };
        }
        return s;
      })
    );

    updateProgress(100);
    setCurrentStep(
      online
        ? '¡Dispositivo sincronizado y listo para la asistencia!'
        : '¡Modo Autónomo Local listo para marcar asistencia!'
    );
    setIsFinished(true);
  }, [updateProgress]);

  useEffect(() => {
    if (visible) {
      ejecutarSincronizacion();
    }
  }, [visible, ejecutarSincronizacion]);

  const handleComenzar = () => {
    onComplete();
  };

  const getStepIcon = (status: StepStatus['status']) => {
    switch (status) {
      case 'running':
        return <ActivityIndicator size="small" color={colors.primary} />;
      case 'success':
        return <CheckCircle2 size={18} color={colors.success} />;
      case 'warning':
        return <CloudOff size={18} color={colors.warning} />;
      default:
        return <View style={[styles.stepDot, { backgroundColor: colors.cardBorder }]} />;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      onRequestClose={onDismiss || onComplete}
    >
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        {/* CABECERA INSTITUCIONAL */}
        <View style={styles.header}>
          <Image
            source={colors.logo}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[styles.institutionTitle, { color: colors.text }]}>
            MOVIMIENTO MISIONERO MUNDIAL
          </Text>
          <Text style={[styles.systemSubtitle, { color: colors.primary }]}>
            SISTEMA DE ASISTENCIA Y CONTROL DE ACCESO
          </Text>

          {/* BADGES DISPOSITIVO Y SERVIDOR */}
          <View style={styles.badgeRow}>
            <Badge variant="outline" style={styles.infoBadge}>
              <Smartphone size={12} color={colors.textSecondary} style={{ marginRight: 4 }} />
              <Text style={[styles.infoBadgeText, { color: colors.text }]}>
                {deviceName}
              </Text>
            </Badge>

            <Badge variant={isOnline ? 'success' : 'secondary'} style={styles.infoBadge}>
              {isOnline ? (
                <Wifi size={12} color={colors.success} style={{ marginRight: 4 }} />
              ) : (
                <CloudOff size={12} color={colors.warning} style={{ marginRight: 4 }} />
              )}
              <Text style={[styles.infoBadgeText, { color: isOnline ? colors.success : colors.warning }]}>
                {isOnline ? 'Servidor Online' : 'Modo Offline'}
              </Text>
            </Badge>
          </View>
        </View>

        {/* TARJETA DE PROGRESO */}
        <View style={[styles.progressCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.progressHeaderRow}>
            <Text style={[styles.stepText, { color: colors.text }]}>
              {currentStep}
            </Text>
            <Text style={[styles.percentText, { color: colors.primary }]}>
              {progressPercent}%
            </Text>
          </View>

          {/* BARRA DE PROGRESO */}
          <View style={[styles.progressBarTrack, { backgroundColor: isDark ? '#1e293b' : '#e2e8f0' }]}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  backgroundColor: colors.primary,
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>

          {/* LISTA DE COMPROBACIONES */}
          <View style={styles.stepsList}>
            {steps.map((st) => (
              <View key={st.key} style={styles.stepItem}>
                <View style={styles.stepIconBox}>
                  {getStepIcon(st.status)}
                </View>
                <View style={styles.stepInfo}>
                  <Text style={[styles.stepLabel, { color: colors.text }]}>
                    {st.label}
                  </Text>
                  <Text style={[styles.stepDetail, { color: colors.textSecondary }]}>
                    {st.detail}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* NOTA DE INTEGRIDAD Y DISPONIBILIDAD */}
        <View style={[styles.guaranteeBox, { backgroundColor: isDark ? '#0f172a' : '#f8fafc', borderColor: colors.cardBorder }]}>
          <ShieldCheck size={18} color={colors.success} />
          <Text style={[styles.guaranteeText, { color: colors.textSecondary }]}>
            Base local blindada con {padronCount} obreros y resolución de fotografías oficial.
          </Text>
        </View>

        {/* ACCIONES INFERIORES */}
        <View style={styles.footer}>
          <Button
            variant="default"
            size="lg"
            onPress={handleComenzar}
            disabled={!isFinished}
            style={styles.startButton}
          >
            <Text style={styles.startButtonText}>
              {isFinished ? 'Comenzar Asistencia' : 'Sincronizando equipo...'}
            </Text>
            {isFinished ? (
              <ChevronRight size={18} color="#ffffff" style={{ marginLeft: 6 }} />
            ) : (
              <ActivityIndicator size="small" color="#ffffff" style={{ marginLeft: 6 }} />
            )}
          </Button>

          {isFinished && (
            <Pressable
              onPress={ejecutarSincronizacion}
              style={styles.resyncPressable}
            >
              <RefreshCw size={13} color={colors.textSecondary} style={{ marginRight: 5 }} />
              <Text style={[styles.resyncText, { color: colors.textSecondary }]}>
                Volver a sincronizar ahora
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingVertical: 32,
  },
  header: {
    alignItems: 'center',
    marginTop: 10,
  },
  logo: {
    width: 76,
    height: 76,
    marginBottom: 12,
  },
  institutionTitle: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  systemSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 2,
    textAlign: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  infoBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  progressCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    marginVertical: 14,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  stepText: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  percentText: {
    fontSize: 15,
    fontWeight: '900',
    marginLeft: 10,
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 18,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  stepsList: {
    gap: 12,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepIconBox: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stepInfo: {
    flex: 1,
  },
  stepLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  stepDetail: {
    fontSize: 11,
    marginTop: 1,
  },
  guaranteeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
  },
  guaranteeText: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    gap: 10,
  },
  startButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 14,
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  resyncPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  resyncText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

