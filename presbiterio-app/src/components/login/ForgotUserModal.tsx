import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  X,
  Search,
  User as UserIcon,
  Mail,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Shield,
  ShieldAlert,
} from 'lucide-react-native';
import { radius, useTheme } from '../ui/theme';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Alert } from '../ui/Alert';
import { api } from '../../services/api';
import { PastorConsulta } from '../../types';

interface ForgotUserModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectUser: (username: string) => void;
}

export const ForgotUserModal: React.FC<ForgotUserModalProps> = ({
  visible,
  onClose,
  onSelectUser,
}) => {
  const { ui, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [cedula, setCedula] = useState('');
  const [loading, setLoading] = useState(false);
  const [pastor, setPastor] = useState<PastorConsulta | null>(null);
  const [sinAcceso, setSinAcceso] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Limpiar campos al abrir
  useEffect(() => {
    if (visible) {
      setCedula('');
      setErrorMessage(null);
      setSinAcceso(false);
      setPastor(null);
    }
  }, [visible]);

  const handleBuscar = async () => {
    const clean = cedula.trim();
    if (!clean) {
      setErrorMessage('Por favor ingrese su número de cédula.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSinAcceso(false);
    setPastor(null);

    const res = await api.consultarUsuarioPorCedula(clean);
    setLoading(false);

    if (res.es_pastor_sin_acceso) {
      setSinAcceso(true);
      setPastor(res.pastor ?? null);
      setErrorMessage(
        res.message ||
          'Este pastor se encuentra registrado, pero no cuenta con un rol de Presbítero ni Supervisión Nacional.'
      );
    } else if (res.success && res.pastor) {
      setPastor(res.pastor);
    } else {
      setErrorMessage(
        res.message || 'No se encontró ningún registro ministerial con esa cédula.'
      );
    }
  };

  const handleUsarUsuario = () => {
    const loginCredential = pastor?.email || pastor?.usuario;
    if (loginCredential) {
      onSelectUser(loginCredential);
      onClose();
    }
  };

  const modalBg = isDark ? '#111217' : '#FFFFFF';
  const borderCol = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(15, 23, 42, 0.12)';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />

        <View
          style={[
            styles.modalCard,
            { backgroundColor: modalBg, borderColor: borderCol },
          ]}
        >
          {/* BOTÓN CERRAR (Shadcn style icon button) */}
          <TouchableOpacity
            style={[styles.closeBtn, { borderColor: ui.border, backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}
            onPress={onClose}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Cerrar ventana"
          >
            <X size={15} color={ui.mutedForeground} />
          </TouchableOpacity>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollBody}
          >
            {/* CABECERA COMPACTA SHADCN */}
            <View style={styles.header}>
              <View
                style={[
                  styles.iconBadge,
                  { backgroundColor: ui.brandSoft, borderColor: ui.brand },
                ]}
              >
                <Search size={18} color={ui.brand} />
              </View>
              <Text
                style={[styles.title, { color: ui.foreground }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                ¿Olvidaste tu Correo?
              </Text>
              <Text
                style={[styles.description, { color: ui.mutedForeground }]}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                Ingresa tu cédula para consultar el correo con el que ingresas al sistema administrativo.
              </Text>
            </View>

            {/* FORMULARIO DE CONSULTA */}
            <View style={styles.searchSection}>
              <Input
                label="CÉDULA DE IDENTIDAD"
                placeholder="Ej. 12345678 o V-12345678"
                value={cedula}
                onChangeText={(t) => {
                  setCedula(t);
                  if (errorMessage) setErrorMessage(null);
                  if (sinAcceso) setSinAcceso(false);
                }}
                autoCapitalize="characters"
                autoCorrect={false}
                returnKeyType="search"
                onSubmitEditing={handleBuscar}
                leftIcon={<UserIcon size={16} color={ui.mutedForeground} />}
              />

              <Button
                variant="brand"
                size="default"
                fullWidth
                onPress={handleBuscar}
                loading={loading}
                leftIcon={<Search size={15} color={isDark ? '#000000' : '#FFFFFF'} />}
              >
                BUSCAR DATOS
              </Button>
            </View>

            {/* CASO A: PASTOR SIN ROL EJECUTIVO (NO AUTORIZADO) */}
            {sinAcceso && (
              <View style={[styles.deniedCard, { borderColor: ui.destructiveBorder, backgroundColor: ui.destructiveSoft }]}>
                <View style={styles.deniedHeader}>
                  <ShieldAlert size={18} color={ui.destructive} style={{ marginTop: 1 }} />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[styles.deniedTitle, { color: ui.destructive }]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      Acceso Restringido a Presbiterio
                    </Text>
                    <Text
                      style={[styles.deniedText, { color: resolvedTheme === 'dark' ? ui.destructiveForeground : ui.destructive }]}
                    >
                      {errorMessage ||
                        'Este registro pertenece a un pastor sin rol de Presbítero, Supervisor ni Oficial Nacional. Esta aplicación es de uso exclusivo para el cuerpo de Presbíteros y Supervisión.'}
                    </Text>
                  </View>
                </View>

                {pastor && (
                  <View style={[styles.deniedPastorBox, { borderColor: ui.destructiveBorder }]}>
                    <Text
                      style={[styles.deniedPastorName, { color: ui.foreground }]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {pastor.nombre_completo}
                    </Text>
                    <View style={styles.badgesRow}>
                      <Badge variant="outline" size="sm">
                        C.I. {pastor.documento}
                      </Badge>
                      <Badge variant="destructive" size="sm">
                        {pastor.cargo_nacional || 'Pastor'}
                      </Badge>
                      {pastor.zona && (
                        <Badge variant="secondary" size="sm">
                          {pastor.zona}
                        </Badge>
                      )}
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* CASO B: ERROR GENERAL / NO ENCONTRADO */}
            {!sinAcceso && errorMessage && (
              <Alert
                variant="destructive"
                title="No se encontró registro"
                description={errorMessage}
                style={{ marginTop: 6 }}
              />
            )}

            {/* CASO C: LÍDER AUTORIZADO ENCONTRADO */}
            {!sinAcceso && pastor && (
              <View
                style={[
                  styles.resultCard,
                  {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                    borderColor: ui.border,
                  },
                ]}
              >
                {/* FILA SUPERIOR: AVATAR Y DATOS */}
                <View style={styles.pastorHeaderRow}>
                  {pastor.foto ? (
                    <Image
                      source={{ uri: pastor.foto }}
                      style={[styles.avatar, { borderColor: ui.brand }]}
                      resizeMode="cover"
                    />
                  ) : (
                    <View
                      style={[
                        styles.avatarFallback,
                        { backgroundColor: ui.brandSoft, borderColor: ui.brand },
                      ]}
                    >
                      <UserIcon size={22} color={ui.brand} />
                    </View>
                  )}

                  <View style={styles.pastorInfoText}>
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      style={[styles.pastorName, { color: ui.foreground }]}
                    >
                      {pastor.nombre_completo}
                    </Text>

                    <View style={styles.badgesRow}>
                      <Badge variant="brand" size="sm" icon={<Shield size={10} color={ui.brand} />}>
                        {pastor.cargo_nacional || 'Presbítero'}
                      </Badge>
                      <Badge variant="outline" size="sm">
                        C.I. {pastor.documento}
                      </Badge>
                    </View>
                  </View>
                </View>

                {/* DETALLES DE ZONA Y CORREO */}
                <View style={[styles.detailsBox, { borderTopColor: ui.border }]}>
                  {pastor.zona && (
                    <View style={styles.detailItem}>
                      <MapPin size={13} color={ui.brand} />
                      <Text
                        style={[styles.detailText, { color: ui.foreground }]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {pastor.zona}
                        {pastor.distrito ? ` • ${pastor.distrito}` : ''}
                      </Text>
                    </View>
                  )}

                  {pastor.email ? (
                    <View style={styles.detailItem}>
                      <Mail size={13} color={ui.mutedForeground} />
                      <Text
                        style={[styles.detailText, { color: ui.mutedForeground }]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {pastor.email}
                      </Text>
                    </View>
                  ) : null}
                </View>

                {/* DESTACADO: CORREO DE ACCESO AL SISTEMA ADMINISTRATIVO Y A LA APP */}
                {(pastor.email || pastor.usuario) && (
                  <View
                    style={[
                      styles.usernameCard,
                      {
                        backgroundColor: isDark ? 'rgba(2, 132, 199, 0.10)' : 'rgba(2, 132, 199, 0.06)',
                        borderColor: ui.brand,
                      },
                    ]}
                  >
                    <View style={styles.usernameCardHeader}>
                      <CheckCircle2 size={13} color={ui.brand} />
                      <Text
                        style={[styles.usernameCardTitle, { color: ui.brand }]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        CORREO DEL SISTEMA ADMINISTRATIVO
                      </Text>
                    </View>

                    <Text
                      selectable
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      style={[styles.usernameValue, { color: ui.foreground }]}
                    >
                      {pastor.email || pastor.usuario}
                    </Text>

                    <Text
                      style={[styles.usernameHelp, { color: ui.mutedForeground }]}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      Ingresa con este correo y la misma contraseña que usas en el sistema administrativo.
                    </Text>
                  </View>
                )}

                {/* BOTÓN USAR ESTE CORREO */}
                {(pastor.email || pastor.usuario) && (
                  <Button
                    variant="brand"
                    size="default"
                    fullWidth
                    onPress={handleUsarUsuario}
                    rightIcon={<ArrowRight size={14} color={isDark ? '#000000' : '#FFFFFF'} />}
                    style={{ marginTop: 10 }}
                  >
                    USAR ESTE CORREO
                  </Button>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '88%',
    borderRadius: radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  scrollBody: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 18,
  },
  header: {
    alignItems: 'center',
    marginBottom: 14,
    paddingHorizontal: 12,
    gap: 3,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  description: {
    fontSize: 11.5,
    lineHeight: 16,
    textAlign: 'center',
  },
  searchSection: {
    marginBottom: 4,
  },
  deniedCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: 12,
    marginTop: 8,
    gap: 10,
  },
  deniedHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  deniedTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    marginBottom: 2,
  },
  deniedText: {
    fontSize: 11.5,
    lineHeight: 16,
  },
  deniedPastorBox: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
    gap: 6,
  },
  deniedPastorName: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  resultCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: 12,
    marginTop: 8,
  },
  pastorHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    borderWidth: 1.5,
  },
  avatarFallback: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pastorInfoText: {
    flex: 1,
    gap: 3,
  },
  pastorName: {
    fontSize: 13.5,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    alignItems: 'center',
  },
  detailsBox: {
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 10,
    paddingTop: 8,
    gap: 5,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    flex: 1,
    fontSize: 11.5,
    fontWeight: '500',
  },
  usernameCard: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  usernameCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  usernameCardTitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  usernameValue: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginVertical: 2,
  },
  usernameHelp: {
    fontSize: 10.5,
    lineHeight: 14,
    textAlign: 'center',
  },
});
