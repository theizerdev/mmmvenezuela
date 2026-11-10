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
  Clock,
  Heart,
  ChevronRight,
  Users,
} from 'lucide-react-native';
import { Actividad, Sesion, Pastor, AsistenciaPrevia, UltimoEscaneo } from '../types';
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
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '../components/ui';

interface ManualScreenProps {
  actividad: Actividad | null;
  sesion: Sesion | null;
  ultimosEscaneos?: UltimoEscaneo[];
  onAsistenciaRegistrada: (pastor: Pastor, asistioConConyuge: boolean, totalPresentes?: number) => void;
}

export const ManualScreen: React.FC<ManualScreenProps> = ({
  actividad,
  sesion,
  ultimosEscaneos = [],
  onAsistenciaRegistrada,
}) => {
  const { isDark, colors } = useTheme();
  const [cedulaInput, setCedulaInput] = useState<string>('');
  const [buscando, setBuscando] = useState<boolean>(false);
  const [pastorEncontrado, setPastorEncontrado] = useState<Pastor | null>(null);
  const [resultadosMultiples, setResultadosMultiples] = useState<Pastor[]>([]);
  const [yaRegistrado, setYaRegistrado] = useState<boolean>(false);
  const [asistenciaPrevia, setAsistenciaPrevia] = useState<AsistenciaPrevia | null>(null);
  const [asistioConConyuge, setAsistioConConyuge] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [exitoRegistro, setExitoRegistro] = useState<boolean>(false);
  const [horaExito, setHoraExito] = useState<string>('');
  const [mensajeError, setMensajeError] = useState<string>('');

  const limpiarBusqueda = () => {
    setPastorEncontrado(null);
    setResultadosMultiples([]);
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
      setMensajeError('Ingrese el número de cédula, código o nombre del obrero');
      return;
    }

    Keyboard.dismiss();
    setBuscando(true);
    setMensajeError('');
    setPastorEncontrado(null);
    setResultadosMultiples([]);
    setYaRegistrado(false);
    setAsistenciaPrevia(null);
    setExitoRegistro(false);

    try {
      const res = await api.buscarPastor(term, actividad?.id, sesion?.id);

      if (res.success && res.multiple && res.resultados && res.resultados.length > 0) {
        setResultadosMultiples(res.resultados);
        try {
          if (Platform.OS !== 'web') {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        } catch {}
      } else if (res.success && res.pastor) {
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
        setMensajeError(res.message || `No se encontró ningún obrero con "${term}"`);
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

  const handleSeleccionarPastor = async (pastor: Pastor) => {
    setBuscando(true);
    setMensajeError('');
    try {
      const res = await api.buscarPastor('', actividad?.id, sesion?.id, pastor.id);
      if (res.success && res.pastor) {
        setResultadosMultiples([]);
        setPastorEncontrado(res.pastor);
        setYaRegistrado(!!res.ya_registrado);
        setAsistenciaPrevia(res.asistencia_previa || null);
        setAsistioConConyuge(false);
      }
    } catch (err: any) {
      setMensajeError(err.message || 'Error al cargar la ficha del obrero.');
    } finally {
      setBuscando(false);
    }
  };

  const handleConfirmarAsistencia = async () => {
    if (!pastorEncontrado || !actividad) return;

    setLoading(true);
    try {
      const res = await api.registrarAsistencia(
        {
          actividad_id: actividad.id,
          actividad_sesion_id: sesion?.id,
          pastor_id: pastorEncontrado.id,
          asistio_con_conyuge: asistioConConyuge,
          metodo: 'manual',
        },
        pastorEncontrado,
        sesion?.nombre
      );

      if (res.success) {
        setExitoRegistro(true);
        setHoraExito(res.asistencia?.hora || new Date().toLocaleTimeString());
        onAsistenciaRegistrada(pastorEncontrado, asistioConConyuge, res.total_presentes);

        try {
          if (Platform.OS !== 'web') {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        } catch {}

        setTimeout(() => {
          setCedulaInput('');
          limpiarBusqueda();
        }, 3000);
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
      {/* 1. TARJETA DE BÚSQUEDA POR CÉDULA, CÓDIGO O NOMBRE */}
      <Card>
        <CardHeader style={{ paddingBottom: 6 }}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.iconCircle, { backgroundColor: isDark ? '#1e1b4b' : '#ede9fe' }]}>
              <Search size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <CardTitle>Búsqueda de Obrero o Pastor</CardTitle>
              <CardDescription>
                Ingrese número de cédula, código o nombre/apellido
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
                placeholder="Ej: 12209160 o nombre del pastor"
                keyboardType="default"
                autoCorrect={false}
                returnKeyType="search"
                style={styles.customInput}
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

      {/* 2. LISTA DE COINCIDENCIAS MÚLTIPLES (CUANDO BUSCAN POR NOMBRE O CÉDULA PARCIAL) */}
      {resultadosMultiples.length > 0 && !pastorEncontrado && (
        <View style={styles.resultContainer}>
          <View style={styles.resultLabelRow}>
            <Users size={14} color={colors.primary} />
            <Text style={[styles.resultLabelText, { color: colors.textSecondary }]}>
              SELECCIONE EL OBRERO ({resultadosMultiples.length} COINCIDENCIAS)
            </Text>
          </View>

          <Card style={styles.listCard}>
            {resultadosMultiples.map((item, idx) => {
              const photoUri = item.foto ? api.resolveImageUrl(item.foto) : null;
              const initials = `${item.nombres?.charAt(0) || ''}${item.apellidos?.charAt(0) || ''}`.toUpperCase() || 'P';
              return (
                <Pressable
                  key={item.id}
                  onPress={() => handleSeleccionarPastor(item)}
                  style={({ pressed }) => [
                    styles.matchRow,
                    idx < resultadosMultiples.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: colors.cardBorder,
                    },
                    pressed && { opacity: 0.75 },
                  ]}
                >
                  <Avatar alt={item.nombre_completo} style={styles.smallAvatar}>
                    {photoUri ? <AvatarImage source={{ uri: photoUri }} /> : null}
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>

                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={[styles.matchName, { color: colors.text }]} numberOfLines={1}>
                      {item.nombre_completo}
                    </Text>
                    <Text style={[styles.matchSub, { color: colors.textSecondary }]} numberOfLines={1}>
                      {item.documento} • {item.zona ? `Zona ${item.zona}` : 'Nacional'} • {item.extension_nombre || item.iglesia}
                    </Text>
                  </View>

                  <ChevronRight size={18} color={colors.textSecondary} />
                </Pressable>
              );
            })}
          </Card>
        </View>
      )}

      {/* 3. RESULTADO INDIVIDUAL: FICHA DEL OBRERO CON SHADCN CARD */}
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
            permiteConyuge={actividad?.permite_conyuge ?? true}
          />
        </View>
      )}

      {/* 4. CINTA DE ÚLTIMOS ACREDITADOS EN PUERTA */}
      {!pastorEncontrado && resultadosMultiples.length === 0 && ultimosEscaneos.length > 0 && (
        <View style={styles.recentSection}>
          <View style={styles.resultLabelRow}>
            <Clock size={14} color={colors.primary} />
            <Text style={[styles.resultLabelText, { color: colors.textSecondary }]}>
              ÚLTIMOS ACREDITADOS EN PUERTA ({ultimosEscaneos.length})
            </Text>
          </View>

          <Card style={styles.listCard}>
            {ultimosEscaneos.map((scan, idx) => {
              const photoUri = scan.foto ? api.resolveImageUrl(scan.foto) : null;
              const parts = (scan.nombre_completo || 'P').trim().split(' ');
              const initials = `${parts[0]?.charAt(0) || ''}${parts[1]?.charAt(0) || ''}`.toUpperCase() || 'P';

              return (
                <View
                  key={scan.id}
                  style={[
                    styles.recentRow,
                    idx < ultimosEscaneos.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: colors.cardBorder,
                    },
                  ]}
                >
                  <Avatar alt={scan.nombre_completo} style={styles.smallAvatar}>
                    {photoUri ? <AvatarImage source={{ uri: photoUri }} /> : null}
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>

                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <View style={styles.recentTopLine}>
                      <Text style={[styles.matchName, { color: colors.text, flex: 1 }]} numberOfLines={1}>
                        {scan.nombre_completo}
                      </Text>
                      {scan.asistio_con_conyuge && (
                        <Badge variant="secondary" style={styles.spouseMiniBadge}>
                          <Heart size={10} color="#ec4899" fill="#ec4899" style={{ marginRight: 3 }} />
                          <Text style={styles.spouseMiniText}>+Cónyuge</Text>
                        </Badge>
                      )}
                    </View>

                    <Text style={[styles.matchSub, { color: colors.textSecondary }]} numberOfLines={1}>
                      {scan.documento} • {scan.zona ? `Zona ${scan.zona}` : 'Nacional'} • {scan.extension_nombre}
                    </Text>
                  </View>

                  <View style={styles.recentTimeBox}>
                    <Text
                      style={[
                        styles.recentTimeText,
                        { color: scan.pendiente_sync ? colors.warning : colors.success },
                      ]}
                    >
                      {scan.hora}
                    </Text>
                    <Text
                      style={[
                        styles.recentSessionText,
                        { color: scan.pendiente_sync ? colors.warning : colors.textMuted },
                      ]}
                      numberOfLines={1}
                    >
                      {scan.pendiente_sync ? 'En cola Offline' : scan.sesion}
                    </Text>
                  </View>
                </View>
              );
            })}
          </Card>
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
    paddingBottom: 28,
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
  recentSection: {
    marginTop: 16,
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
  listCard: {
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  smallAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  matchName: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  matchSub: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  recentTopLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  spouseMiniBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  spouseMiniText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#ec4899',
  },
  recentTimeBox: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  recentTimeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  recentSessionText: {
    fontSize: 9.5,
    fontWeight: '600',
    marginTop: 2,
    maxWidth: 90,
  },
});
