import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Keyboard,
  Platform,
  Pressable,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  Search,
  CreditCard,
  AlertCircle,
  X,
  UserCheck,
} from 'lucide-react-native';
import { Actividad, Sesion, Pastor, AsistenciaPrevia } from '../types';
import { api } from '../services/api';
import { PastorCard } from '../components/PastorCard';
import { useTheme } from '../context/ThemeContext';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  Button,
  Badge,
} from '../components/ui';

interface ManualScreenProps {
  actividad: Actividad | null;
  sesion: Sesion | null;
  onAsistenciaRegistrada: (pastor: Pastor, asistioConConyuge: boolean) => void;
}

export const ManualScreen: React.FC<ManualScreenProps> = ({
  actividad,
  sesion,
  onAsistenciaRegistrada,
}) => {
  const { isDark, colors } = useTheme();
  const [cedulaInput, setCedulaInput] = useState<string>('');
  const [buscando, setBuscando] = useState<boolean>(false);
  const [pastorEncontrado, setPastorEncontrado] = useState<Pastor | null>(null);
  const [yaRegistrado, setYaRegistrado] = useState<boolean>(false);
  const [asistenciaPrevia, setAsistenciaPrevia] = useState<AsistenciaPrevia | null>(null);
  const [asistioConConyuge, setAsistioConConyuge] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [exitoRegistro, setExitoRegistro] = useState<boolean>(false);
  const [horaExito, setHoraExito] = useState<string>('');
  const [mensajeError, setMensajeError] = useState<string>('');

  const limpiarBusqueda = () => {
    setPastorEncontrado(null);
    setYaRegistrado(false);
    setAsistenciaPrevia(null);
    setAsistioConConyuge(false);
    setExitoRegistro(false);
    setHoraExito('');
    setMensajeError('');
  };

  const handleBuscar = async () => {
    const term = cedulaInput.trim();
    if (!term) {
      setMensajeError('Por favor ingrese el número de cédula del pastor u obrero');
      return;
    }

    Keyboard.dismiss();
    setBuscando(true);
    setMensajeError('');
    setPastorEncontrado(null);
    setYaRegistrado(false);
    setAsistenciaPrevia(null);
    setExitoRegistro(false);

    try {
      const res = await api.buscarPastor(term, actividad?.id, sesion?.id);

      if (res.success && res.pastor) {
        setPastorEncontrado(res.pastor);
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
        setMensajeError(res.message || `No se encontró ningún obrero con la cédula "${term}"`);
        try {
          if (Platform.OS !== 'web') {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          }
        } catch {}
      }
    } catch (err: any) {
      setMensajeError(err.message || 'Error al buscar el pastor. Verifique la conexión con el servidor.');
    } finally {
      setBuscando(false);
    }
  };

  const handleConfirmarAsistencia = async () => {
    if (!pastorEncontrado || !actividad) return;

    setLoading(true);
    try {
      const res = await api.registrarAsistencia({
        actividad_id: actividad.id,
        actividad_sesion_id: sesion?.id,
        pastor_id: pastorEncontrado.id,
        asistio_con_conyuge: asistioConConyuge,
        metodo: 'manual',
      });

      if (res.success) {
        setExitoRegistro(true);
        setHoraExito(res.asistencia?.hora || new Date().toLocaleTimeString());
        onAsistenciaRegistrada(pastorEncontrado, asistioConConyuge);

        try {
          if (Platform.OS !== 'web') {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        } catch {}

        setTimeout(() => {
          setCedulaInput('');
          limpiarBusqueda();
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

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bg }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* 1. TARJETA DE BÚSQUEDA SHADCN / RADIX */}
      <Card>
        <CardHeader style={{ paddingBottom: 6 }}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.iconCircle, { backgroundColor: isDark ? '#1e1b4b' : '#ede9fe' }]}>
              <Search size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <CardTitle>Búsqueda por Cédula de Identidad</CardTitle>
              <CardDescription>
                Ingrese el número de cédula del pastor u obrero
              </CardDescription>
            </View>
          </View>
        </CardHeader>

        <CardContent>
          <View style={styles.inputGroup}>
            <View style={styles.inputWrapper}>
              <View style={styles.innerLeadingIcon}>
                <CreditCard size={17} color={colors.textSecondary} />
              </View>

              <Input
                value={cedulaInput}
                onChangeText={(text) => {
                  setCedulaInput(text);
                  if (mensajeError) setMensajeError('');
                }}
                onSubmitEditing={handleBuscar}
                placeholder="Ej: 12209160 o V-12209160"
                keyboardType="numeric"
                returnKeyType="search"
                style={styles.customInput}
                autoFocus={Platform.OS !== 'web'}
              />

              {cedulaInput.length > 0 && (
                <Pressable
                  onPress={() => {
                    setCedulaInput('');
                    limpiarBusqueda();
                  }}
                  style={styles.clearBtn}
                  hitSlop={8}
                >
                  <X size={16} color={colors.textSecondary} />
                </Pressable>
              )}
            </View>

            <Button
              variant="default"
              size="default"
              onPress={handleBuscar}
              disabled={buscando || !cedulaInput.trim()}
              loading={buscando}
              style={styles.searchButton}
            >
              <Search size={16} color="#ffffff" />
              <Text style={styles.searchButtonText}>Buscar</Text>
            </Button>
          </View>

          {/* MENSAJE DE ERROR */}
          {mensajeError ? (
            <View style={[styles.errorBox, { backgroundColor: colors.dangerBg, borderColor: colors.dangerBorder }]}>
              <AlertCircle size={16} color={colors.danger} />
              <Text style={[styles.errorText, { color: isDark ? '#fecdd3' : colors.danger }]}>
                {mensajeError}
              </Text>
            </View>
          ) : null}
        </CardContent>
      </Card>

      {/* 2. RESULTADO: FICHA DEL OBRERO CON SHADCN CARD */}
      {pastorEncontrado && (
        <View style={styles.resultContainer}>
          <View style={styles.resultLabelRow}>
            <UserCheck size={14} color={colors.primary} />
            <Text style={[styles.resultLabelText, { color: colors.textSecondary }]}>
              OBRERO IDENTIFICADO EN EL SISTEMA
            </Text>
          </View>

          <PastorCard
            pastor={pastorEncontrado}
            asistioConConyuge={asistioConConyuge}
            onToggleConyuge={setAsistioConConyuge}
            onConfirmar={handleConfirmarAsistencia}
            onCancelar={limpiarBusqueda}
            loading={loading}
            yaRegistrado={yaRegistrado}
            asistenciaPrevia={asistenciaPrevia}
            exitoRegistro={exitoRegistro}
            horaRegistroExitoso={horaExito}
          />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  inputWrapper: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
  },
  innerLeadingIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 2,
  },
  customInput: {
    paddingLeft: 38,
    paddingRight: 36,
    fontWeight: '700',
  },
  clearBtn: {
    position: 'absolute',
    right: 12,
    zIndex: 2,
    padding: 2,
  },
  searchButton: {
    minWidth: 100,
  },
  searchButtonText: {
    color: '#ffffff',
    fontSize: 13.5,
    fontWeight: '800',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
    marginTop: 10,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  resultContainer: {
    marginTop: 14,
  },
  resultLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
    paddingHorizontal: 2,
  },
  resultLabelText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
});
