import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import {
  Camera,
  Flashlight,
  QrCode,
  AlertTriangle,
} from 'lucide-react-native';
import { Actividad, Sesion, Pastor, AsistenciaPrevia } from '../types';
import { api } from '../services/api';
import { PastorCard } from '../components/PastorCard';
import { useTheme } from '../context/ThemeContext';
import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../components/ui';

interface ScannerScreenProps {
  actividad: Actividad | null;
  sesion: Sesion | null;
  onAsistenciaRegistrada: (pastor: Pastor, asistioConConyuge: boolean) => void;
}

export const ScannerScreen: React.FC<ScannerScreenProps> = ({
  actividad,
  sesion,
  onAsistenciaRegistrada,
}) => {
  const { colors, isDark } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [torch, setTorch] = useState<boolean>(false);
  const [scannedPastor, setScannedPastor] = useState<Pastor | null>(null);
  const [asistioConConyuge, setAsistioConConyuge] = useState<boolean>(false);
  const [yaRegistrado, setYaRegistrado] = useState<boolean>(false);
  const [asistenciaPrevia, setAsistenciaPrevia] = useState<AsistenciaPrevia | null>(null);
  const [exitoRegistro, setExitoRegistro] = useState<boolean>(false);
  const [horaExito, setHoraExito] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [buscando, setBuscando] = useState<boolean>(false);

  // Candado para evitar múltiples lecturas seguidas del mismo código
  const isScanningLockedRef = useRef<boolean>(false);
  const lastScannedDataRef = useRef<string>('');

  const resetScanner = () => {
    setScannedPastor(null);
    setAsistioConConyuge(false);
    setYaRegistrado(false);
    setAsistenciaPrevia(null);
    setExitoRegistro(false);
    setHoraExito('');
    lastScannedDataRef.current = '';
    isScanningLockedRef.current = false;
  };

  const handleBarcodeScanned = useCallback(
    async ({ data }: { data: string }) => {
      if (isScanningLockedRef.current) return;
      if (!data || data === lastScannedDataRef.current) return;

      isScanningLockedRef.current = true;
      lastScannedDataRef.current = data;

      try {
        if (Platform.OS !== 'web') {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
      } catch {}

      setBuscando(true);

      try {
        const res = await api.buscarPastor(data, actividad?.id, sesion?.id);

        if (res.success && res.pastor) {
          setScannedPastor(res.pastor);
          setYaRegistrado(!!res.ya_registrado);
          setAsistenciaPrevia(res.asistencia_previa || null);
          setAsistioConConyuge(false);

          if (res.ya_registrado) {
            try {
              if (Platform.OS !== 'web') {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              }
            } catch {}
          } else {
            try {
              if (Platform.OS !== 'web') {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
            } catch {}
          }
        } else {
          try {
            if (Platform.OS !== 'web') {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            }
          } catch {}
          // Permitir reintentar en 2 segundos
          setTimeout(() => {
            isScanningLockedRef.current = false;
            lastScannedDataRef.current = '';
          }, 2000);
        }
      } catch (err) {
        setTimeout(() => {
          isScanningLockedRef.current = false;
          lastScannedDataRef.current = '';
        }, 2000);
      } finally {
        setBuscando(false);
      }
    },
    [actividad?.id, sesion?.id]
  );

  const handleConfirmarAsistencia = async () => {
    if (!scannedPastor || !actividad) return;

    setLoading(true);
    try {
      const res = await api.registrarAsistencia({
        actividad_id: actividad.id,
        actividad_sesion_id: sesion?.id,
        pastor_id: scannedPastor.id,
        asistio_con_conyuge: asistioConConyuge,
        metodo: 'qr',
      });

      if (res.success) {
        setExitoRegistro(true);
        setHoraExito(res.asistencia?.hora || new Date().toLocaleTimeString());
        onAsistenciaRegistrada(scannedPastor, asistioConConyuge);

        try {
          if (Platform.OS !== 'web') {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        } catch {}

        setTimeout(() => {
          resetScanner();
        }, 3500);
      } else if (res.ya_registrado) {
        setYaRegistrado(true);
        try {
          if (Platform.OS !== 'web') {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          }
        } catch {}
      }
    } catch (e: any) {
      alert(e.message || 'Error al registrar la asistencia');
    } finally {
      setLoading(false);
    }
  };

  // Verificación de permisos de cámara
  if (!permission) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.permissionText, { color: colors.textSecondary }]}>
          Comprobando permisos de cámara...
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.bg }]}>
        <Card style={styles.permissionCard}>
          <CardHeader style={{ alignItems: 'center' }}>
            <View style={[styles.permIconCircle, { backgroundColor: isDark ? '#1e1b4b' : '#ede9fe' }]}>
              <Camera size={32} color={colors.primary} />
            </View>
            <CardTitle style={{ textAlign: 'center', marginTop: 12 }}>
              Permiso de Cámara Requerido
            </CardTitle>
            <CardDescription style={{ textAlign: 'center', marginTop: 6 }}>
              Para escanear el código QR de las credenciales de los pastores, conceda acceso a la cámara.
            </CardDescription>
          </CardHeader>
          <CardContent style={{ alignItems: 'center' }}>
            <Button variant="default" size="default" onPress={requestPermission}>
              Permitir Acceso a la Cámara
            </Button>
          </CardContent>
        </Card>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {scannedPastor ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.topStatusIndicator}>
            <Badge variant="success" style={styles.scannedBadge}>
              <QrCode size={13} color={colors.success} style={{ marginRight: 4 }} />
              <Text style={[styles.scannedBadgeText, { color: colors.success }]}>
                CÓDIGO QR DETECTADO
              </Text>
            </Badge>
          </View>

          <PastorCard
            pastor={scannedPastor}
            asistioConConyuge={asistioConConyuge}
            onToggleConyuge={setAsistioConConyuge}
            onConfirmar={handleConfirmarAsistencia}
            onCancelar={resetScanner}
            loading={loading}
            yaRegistrado={yaRegistrado}
            asistenciaPrevia={asistenciaPrevia}
            exitoRegistro={exitoRegistro}
            horaRegistroExitoso={horaExito}
          />
        </ScrollView>
      ) : (
        <View style={styles.cameraWrapper}>
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            enableTorch={torch}
            barcodeScannerSettings={{
              barcodeTypes: ['qr', 'code128', 'code39', 'ean13'],
            }}
            onBarcodeScanned={handleBarcodeScanned}
          />

          {/* OVERLAY DEL ESCÁNER */}
          <View style={styles.overlayContainer}>
            {/* BOTÓN DE LINTERNA (FLASH) */}
            <View style={styles.torchRow}>
              <Button
                variant={torch ? 'default' : 'secondary'}
                size="sm"
                onPress={() => setTorch((prev) => !prev)}
                style={styles.torchBtn}
              >
                <Flashlight size={15} color={torch ? '#ffffff' : colors.text} />
                <Text style={{ color: torch ? '#ffffff' : colors.text, fontSize: 12, fontWeight: '700' }}>
                  {torch ? 'Linterna Encendida' : 'Linterna'}
                </Text>
              </Button>
            </View>

            {/* MARCO GUÍA DEL QR CON ESQUINAS CIAN (HUD OFICIAL DE ESCANEAR.TSX) */}
            <View style={styles.targetBox}>
              <View style={[styles.corner, styles.cornerTL, { borderColor: '#22d3ee' }]} />
              <View style={[styles.corner, styles.cornerTR, { borderColor: '#22d3ee' }]} />
              <View style={[styles.corner, styles.cornerBL, { borderColor: '#22d3ee' }]} />
              <View style={[styles.corner, styles.cornerBR, { borderColor: '#22d3ee' }]} />

              {buscando && (
                <View style={styles.searchingOverlay}>
                  <ActivityIndicator size="small" color="#22d3ee" />
                  <Text style={styles.searchingText}>Identificando obrero...</Text>
                </View>
              )}
            </View>

            {/* INSTRUCCIÓN INFERIOR */}
            <View style={styles.instructionCard}>
              <Text style={styles.instructionTitle}>
                Apunte la cámara al código QR del carnet
              </Text>
              <Text style={styles.instructionSubtitle}>
                El sistema reconocerá automáticamente los datos y la extensión
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 14,
  },
  topStatusIndicator: {
    alignItems: 'center',
    marginBottom: 8,
  },
  scannedBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  scannedBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  cameraWrapper: {
    flex: 1,
    position: 'relative',
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  torchRow: {
    alignSelf: 'flex-end',
  },
  torchBtn: {
    borderRadius: 20,
    paddingHorizontal: 14,
  },
  targetBox: {
    width: 240,
    height: 240,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderWidth: 3.5,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 16,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 16,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 16,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 16,
  },
  searchingOverlay: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchingText: {
    color: '#22d3ee',
    fontSize: 12.5,
    fontWeight: '700',
  },
  instructionCard: {
    backgroundColor: 'rgba(2, 6, 23, 0.85)',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  instructionTitle: {
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: '800',
    textAlign: 'center',
  },
  instructionSubtitle: {
    color: '#94a3b8',
    fontSize: 10.5,
    textAlign: 'center',
    marginTop: 2,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  permissionCard: {
    width: '100%',
    maxWidth: 380,
  },
  permIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionText: {
    marginTop: 12,
    fontSize: 13,
  },
});
