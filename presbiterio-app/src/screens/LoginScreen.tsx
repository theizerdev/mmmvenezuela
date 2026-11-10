import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
  useWindowDimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  Lock,
  Mail,
  KeyRound,
  Sun,
  Moon,
  Smartphone,
  ArrowRight,
  Fingerprint,
  RefreshCw,
  Shield,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Alert } from '../components/ui/Alert';
import { radius } from '../components/ui/theme';
import { AmbientBackground } from '../components/login/AmbientBackground';
import { BiometricHero } from '../components/login/BiometricHero';
import { ForgotUserModal } from '../components/login/ForgotUserModal';
import { api } from '../services/api';

interface LoginScreenProps {
  onLoginSuccess?: () => void;
}

// Proporción del logo institucional (1210x774)
const LOGO_RATIO = 1210 / 774;
const ND = Platform.OS !== 'web';

type ServerStatus = 'checking' | 'online' | 'blocked' | 'offline';

/** Traduce errores técnicos del servidor/red a mensajes comprensibles para el usuario. */
function friendlyError(raw?: string | null): string {
  const m = (raw || '').toLowerCase();
  if (!m) return 'No se pudo iniciar sesión. Intente de nuevo.';
  if (m.includes('imunify') || m.includes('bot-protection') || m.includes('access denied')) {
    return 'El servidor bloqueó la conexión por seguridad. Contacte al soporte técnico.';
  }
  if (m.includes('tiempo de espera') || m.includes('timeout') || m.includes('aborted')) {
    return 'El servidor tardó demasiado en responder. Intente de nuevo.';
  }
  if (m.includes('json') || m.includes('unexpected')) {
    return 'El servidor respondió de forma inesperada. Intente nuevamente en unos minutos.';
  }
  if (
    m.includes('network request failed') ||
    m.includes('failed to fetch') ||
    m.includes('conexión') ||
    m.includes('conexion')
  ) {
    return 'No se pudo conectar con el servidor. Revise su conexión a internet.';
  }
  if (m.includes('credenciales') || m.includes('invalid') || m.includes('incorrect')) {
    return 'Correo electrónico o contraseña incorrectos. Use el mismo correo y contraseña del sistema administrativo.';
  }
  return raw as string;
}

function haptic(kind: 'select' | 'success' | 'error') {
  if (Platform.OS === 'web') return;
  try {
    if (kind === 'select') Haptics.selectionAsync();
    else
      Haptics.notificationAsync(
        kind === 'success'
          ? Haptics.NotificationFeedbackType.Success
          : Haptics.NotificationFeedbackType.Error
      );
  } catch {
    // Ignorado: el dispositivo puede no soportar vibración háptica
  }
}

/** Punto del PIN con pequeño "pop" al llenarse. */
const PinDot: React.FC<{ filled: boolean; color: string; border: string }> = ({
  filled,
  color,
  border,
}) => {
  const s = useRef(new Animated.Value(filled ? 1 : 0)).current;
  useEffect(() => {
    Animated.spring(s, { toValue: filled ? 1 : 0, useNativeDriver: ND, friction: 5, tension: 160 }).start();
  }, [filled, s]);
  const scale = s.interpolate({ inputRange: [0, 1], outputRange: [1, 1.25] });
  return (
    <Animated.View
      style={[
        styles.pinDot,
        {
          borderColor: filled ? color : border,
          backgroundColor: filled ? color : 'transparent',
          transform: [{ scale }],
        },
      ]}
    />
  );
};

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const { width, height } = useWindowDimensions();
  const { ui, resolvedTheme, themeMode, setThemeMode } = useTheme();
  const {
    login,
    loginWithBiometrics,
    loginWithPin,
    biometricsAvailable,
    biometricsEnabled,
    biometricType,
    platformAuthName,
    hasPinConfigured,
    savedUserName,
    savedUserLogin,
    clearSavedAccount,
  } = useAuth();

  const isDark = resolvedTheme === 'dark';

  // Pantallas bajas o móviles: escala compacta para evitar scroll
  const compact = height < 740;
  const logoWidth = compact ? 112 : 132;
  const logoHeight = Math.round(logoWidth / LOGO_RATIO);

  const showBiometrics = biometricsAvailable && biometricsEnabled;
  const hasQuickAccess = hasPinConfigured || (biometricsEnabled && !!savedUserLogin);

  const [useQuickAccessMode, setUseQuickAccessMode] = useState<boolean>(hasQuickAccess);
  // Con huella disponible, la huella es la acción principal y el teclado PIN queda oculto
  const [pinVisible, setPinVisible] = useState<boolean>(!showBiometrics);

  const [usuario, setUsuario] = useState(savedUserLogin || '');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState<ServerStatus>('checking');
  const [forgotUserModalVisible, setForgotUserModalVisible] = useState<boolean>(false);

  const passwordRef = useRef<any>(null);

  // ---- Animaciones -------------------------------------------------------
  const logoAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const footAnim = useRef(new Animated.Value(0)).current;
  const modeAnim = useRef(new Animated.Value(1)).current;
  const shake = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timing = (v: Animated.Value) =>
      Animated.timing(v, {
        toValue: 1,
        duration: 480,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: ND,
      });
    Animated.stagger(100, [timing(logoAnim), timing(cardAnim), timing(footAnim)]).start();
  }, [logoAnim, cardAnim, footAnim]);

  // Transición suave al cambiar entre PIN/huella y usuario/contraseña
  useEffect(() => {
    modeAnim.setValue(0);
    Animated.timing(modeAnim, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: ND,
    }).start();
  }, [useQuickAccessMode, pinVisible, modeAnim]);

  const runShake = useCallback(() => {
    shake.setValue(0);
    Animated.sequence(
      [8, -8, 6, -6, 3, 0].map((v) =>
        Animated.timing(shake, { toValue: v, duration: 45, useNativeDriver: ND })
      )
    ).start();
  }, [shake]);

  const fail = useCallback(
    (msg?: string | null) => {
      setErrorMessage(friendlyError(msg));
      runShake();
      haptic('error');
    },
    [runShake]
  );

  // ---- Estado del servidor ----------------------------------------------
  const checkServer = useCallback(async () => {
    setServerStatus('checking');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);
    try {
      await api.init();
      const resp = await fetch(`${api.getBaseUrl()}/api/v1/actividades?_t=${Date.now()}`, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
        cache: 'no-store',
      });
      const contentType = resp.headers.get('content-type') || '';
      setServerStatus(resp.ok && contentType.includes('json') ? 'online' : 'blocked');
    } catch {
      setServerStatus('offline');
    } finally {
      clearTimeout(timeoutId);
    }
  }, []);

  useEffect(() => {
    checkServer();
  }, [checkServer]);

  // Sincronizar estado inicial si cambia
  useEffect(() => {
    if (hasQuickAccess) {
      setUseQuickAccessMode(true);
    }
  }, [hasQuickAccess]);

  useEffect(() => {
    setPinVisible(!showBiometrics);
  }, [showBiometrics]);

  // ---- Acciones ----------------------------------------------------------
  const handleLogin = async () => {
    if (loading) return;
    if (!usuario.trim() || !password.trim()) {
      fail('Por favor ingrese su correo electrónico y contraseña del sistema administrativo.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const res = await login(usuario.trim(), password.trim());
    setLoading(false);

    if (res.success) {
      haptic('success');
      onLoginSuccess?.();
    } else {
      fail(res.message || 'Credenciales incorrectas.');
    }
  };

  const handlePinLogin = async (pinToTry?: string) => {
    const pinVal = pinToTry || pin;
    if (pinVal.length < 4) {
      fail('Por favor ingrese su PIN de acceso de 4 dígitos.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const res = await loginWithPin(pinVal);
    setLoading(false);

    if (res.success) {
      haptic('success');
      onLoginSuccess?.();
    } else {
      fail(res.message || 'PIN incorrecto.');
      setPin('');
    }
  };

  const handleBiometricAuth = async () => {
    if (loading) return;
    setErrorMessage(null);
    setLoading(true);
    const res = await loginWithBiometrics();
    setLoading(false);

    if (res.success) {
      haptic('success');
      onLoginSuccess?.();
    } else {
      fail(res.message || 'Verificación biométrica no superada.');
    }
  };

  const handlePinDigit = (digit: string) => {
    if (pin.length >= 6 || loading) return;
    haptic('select');
    const nextPin = pin + digit;
    setPin(nextPin);
    if (hasPinConfigured && nextPin.length === 4) {
      handlePinLogin(nextPin);
    }
  };

  const handlePinBackspace = () => {
    haptic('select');
    setPin((prev) => prev.slice(0, -1));
  };

  const cycleTheme = () => {
    if (themeMode === 'system') setThemeMode('dark');
    else if (themeMode === 'dark') setThemeMode('light');
    else setThemeMode('system');
  };

  const biometricName = /Windows/i.test(platformAuthName) ? 'Windows Hello' : biometricType;
  const biometricLabel = `INGRESAR CON ${biometricName.toUpperCase()}`;

  // ---- Presentación Shadcn UI -------------------------------------------
  const cardBg = isDark ? '#111216' : '#FFFFFF';
  const cardBorder = isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(15, 23, 42, 0.10)';

  const statusColor =
    serverStatus === 'online' ? ui.success : serverStatus === 'checking' ? ui.warning : ui.destructive;
  const statusText =
    serverStatus === 'online'
      ? 'Servidor conectado'
      : serverStatus === 'checking'
        ? 'Verificando servidor…'
        : serverStatus === 'blocked'
          ? 'Servidor sin respuesta válida'
          : 'Sin conexión con el servidor';

  const fadeUp = (v: Animated.Value, dist: number) => ({
    opacity: v,
    transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [dist, 0] }) }],
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: ui.background }]}
    >
      <AmbientBackground />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.responsiveWrapper, { maxWidth: Math.min(width - 24, 390) }]}>
          {/* LOGO INSTITUCIONAL COMPACTO */}
          <Animated.View
            style={[
              styles.logoBox,
              compact && { marginBottom: 8 },
              {
                opacity: logoAnim,
                transform: [
                  { scale: logoAnim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) },
                ],
              },
            ]}
          >
            <Image
              source={
                isDark
                  ? require('../../assets/logo_light.png')
                  : require('../../assets/logo_color.png')
              }
              style={{ width: logoWidth, height: logoHeight }}
              resizeMode="contain"
              accessibilityLabel="Movimiento Misionero Mundial"
            />
          </Animated.View>

          {/* CARD SHADCN / RADIX */}
          <Animated.View
            style={[
              styles.card,
              { backgroundColor: cardBg, borderColor: cardBorder },
              {
                opacity: cardAnim,
                transform: [
                  { translateX: shake },
                  {
                    translateY: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }),
                  },
                ],
              },
            ]}
          >
            {/* Línea sutil de acento de marca */}
            <View style={[styles.accentBar, { backgroundColor: ui.brand }]} />

            {/* Cambio de tema discreto */}
            <TouchableOpacity
              style={[
                styles.themeBtn,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                  borderColor: ui.border,
                },
              ]}
              onPress={cycleTheme}
              accessibilityRole="button"
              accessibilityLabel="Cambiar tema"
              hitSlop={6}
            >
              {themeMode === 'system' ? (
                <Smartphone size={13} color={ui.brand} />
              ) : isDark ? (
                <Moon size={13} color="#38bdf8" />
              ) : (
                <Sun size={13} color="#f59e0b" />
              )}
            </TouchableOpacity>

            <Animated.View style={fadeUp(modeAnim, 8)}>
              {useQuickAccessMode ? (
                /* ======================================================== */
                /* MODO A: ACCESO RÁPIDO (HUELLA / PIN)                     */
                /* ======================================================== */
                <View>
                  <View style={styles.headingBox}>
                    <Text
                      style={[styles.title, { color: ui.foreground }]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {savedUserName ? '¡Paz de Dios!' : 'Acceso Rápido'}
                    </Text>
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      style={[
                        styles.subtitle,
                        savedUserName
                          ? { color: ui.brand, fontWeight: '600' }
                          : { color: ui.mutedForeground },
                      ]}
                    >
                      {savedUserName || 'Desbloquee con su huella o PIN institucional'}
                    </Text>
                  </View>

                  {errorMessage && (
                    <Alert
                      variant="destructive"
                      title="No se pudo ingresar"
                      description={errorMessage}
                      style={{ marginBottom: 10 }}
                    />
                  )}

                  {/* HUELLA COMO ACCIÓN PRINCIPAL */}
                  {showBiometrics && !pinVisible && (
                    <BiometricHero
                      caption={`Toque para ingresar con ${biometricName}`}
                      onPress={handleBiometricAuth}
                      loading={loading}
                    />
                  )}

                  {/* PIN + TECLADO COMPACTO */}
                  {hasPinConfigured && pinVisible && (
                    <View style={styles.pinSection}>
                      <View style={styles.pinDotsRow}>
                        {[0, 1, 2, 3].map((idx) => (
                          <PinDot
                            key={idx}
                            filled={pin.length > idx}
                            color={ui.brand}
                            border={ui.border}
                          />
                        ))}
                      </View>

                      <View style={styles.keypadGrid}>
                        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                          <TouchableOpacity
                            key={digit}
                            style={[
                              styles.keypadKey,
                              { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : ui.muted, borderColor: ui.border },
                            ]}
                            onPress={() => handlePinDigit(digit)}
                            disabled={loading}
                            activeOpacity={0.6}
                          >
                            <Text style={[styles.keypadKeyText, { color: ui.foreground }]}>
                              {digit}
                            </Text>
                          </TouchableOpacity>
                        ))}

                        {showBiometrics ? (
                          <TouchableOpacity
                            style={[
                              styles.keypadKey,
                              { backgroundColor: ui.brandSoft, borderColor: ui.brand },
                            ]}
                            onPress={handleBiometricAuth}
                            disabled={loading}
                            activeOpacity={0.6}
                            accessibilityLabel={biometricLabel}
                          >
                            <Fingerprint size={20} color={ui.brand} />
                          </TouchableOpacity>
                        ) : (
                          <View style={styles.keypadKeyEmpty} />
                        )}

                        <TouchableOpacity
                          style={[
                            styles.keypadKey,
                            { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : ui.muted, borderColor: ui.border },
                          ]}
                          onPress={() => handlePinDigit('0')}
                          disabled={loading}
                          activeOpacity={0.6}
                        >
                          <Text style={[styles.keypadKeyText, { color: ui.foreground }]}>0</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.keypadKey,
                            { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : ui.muted, borderColor: ui.border },
                          ]}
                          onPress={handlePinBackspace}
                          disabled={loading || pin.length === 0}
                          activeOpacity={0.6}
                          accessibilityLabel="Borrar"
                        >
                          <Text style={[styles.keypadKeyText, { color: ui.mutedForeground }]}>⌫</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  {/* Alternar huella ⇄ PIN */}
                  {showBiometrics && hasPinConfigured && (
                    <TouchableOpacity
                      style={styles.linkBtn}
                      onPress={() => {
                        setErrorMessage(null);
                        setPin('');
                        setPinVisible((v) => !v);
                      }}
                    >
                      <View style={styles.linkInner}>
                        {pinVisible ? (
                          <Fingerprint size={13} color={ui.brand} />
                        ) : (
                          <KeyRound size={13} color={ui.brand} />
                        )}
                        <Text
                          style={[styles.linkText, { color: ui.brand }]}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {pinVisible ? `Usar ${biometricName}` : 'Usar PIN'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}

                  <View style={styles.divider} />

                  <View style={styles.switchRow}>
                    <TouchableOpacity
                      style={styles.linkBtn}
                      onPress={() => {
                        setErrorMessage(null);
                        setUseQuickAccessMode(false);
                      }}
                    >
                      <Text
                        style={[styles.linkText, { color: ui.foreground }]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        Ingresar con correo y contraseña
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.linkBtn}
                      onPress={async () => {
                        await clearSavedAccount();
                        setUseQuickAccessMode(false);
                        setUsuario('');
                        setPassword('');
                        setPin('');
                      }}
                    >
                      <Text
                        style={[styles.linkSubText, { color: ui.mutedForeground }]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        Cambiar de cuenta institucional
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                /* ======================================================== */
                /* MODO B: CREDENCIALES (CORREO / CONTRASEÑA)               */
                /* ======================================================== */
                <View>
                  <View style={styles.headingBox}>
                    <Text
                      style={[styles.title, { color: ui.foreground }]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      Iniciar Sesión
                    </Text>
                    <Text
                      style={[styles.subtitle, { color: ui.mutedForeground }]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      Usa el correo y contraseña del sistema administrativo
                    </Text>
                    <Badge
                      variant="brand"
                      size="sm"
                      icon={<Shield size={10} color={ui.brand} />}
                      style={{ marginTop: 2 }}
                    >
                      ACCESO EJECUTIVO
                    </Badge>
                  </View>

                  {errorMessage && (
                    <Alert
                      variant="destructive"
                      title="No se pudo ingresar"
                      description={errorMessage}
                      style={{ marginBottom: 10 }}
                    />
                  )}

                  <Input
                    label="CORREO ELECTRÓNICO"
                    placeholder="correo@ejemplo.com"
                    value={usuario}
                    onChangeText={(t) => {
                      setUsuario(t);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                    onSubmitEditing={() => passwordRef.current?.focus()}
                    blurOnSubmit={false}
                    leftIcon={<Mail size={16} color={ui.mutedForeground} />}
                  />

                  {/* CONTRASEÑA CON "¿OLVIDASTE TU CORREO?" INTEGRADO EN LA CABECERA DEL INPUT */}
                  <Input
                    ref={passwordRef}
                    label="CONTRASEÑA"
                    labelRight={
                      <TouchableOpacity
                        onPress={() => {
                          setErrorMessage(null);
                          setForgotUserModalVisible(true);
                        }}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        accessibilityRole="button"
                        accessibilityLabel="Consultar o recuperar correo con cédula"
                      >
                        <Text
                          style={[styles.forgotUserText, { color: ui.brand }]}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          ¿Olvidaste tu correo?
                        </Text>
                      </TouchableOpacity>
                    }
                    placeholder="Contraseña del sistema administrativo"
                    value={password}
                    onChangeText={(t) => {
                      setPassword(t);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    secureTextEntry
                    revealable
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="go"
                    onSubmitEditing={handleLogin}
                    leftIcon={<Lock size={16} color={ui.mutedForeground} />}
                  />

                  {/* BOTÓN PRIMARIO SHADCN */}
                  <Button
                    variant="brand"
                    size="default"
                    fullWidth
                    onPress={handleLogin}
                    loading={loading}
                    rightIcon={<ArrowRight size={15} color={isDark ? '#000000' : '#FFFFFF'} />}
                    style={{ marginTop: 2 }}
                  >
                    INGRESAR AL PANEL
                  </Button>

                  {/* BIOMETRÍA OPCIONAL */}
                  {showBiometrics && (
                    <Button
                      variant="outline"
                      size="default"
                      fullWidth
                      onPress={handleBiometricAuth}
                      disabled={loading}
                      leftIcon={<Fingerprint size={16} color={ui.brand} />}
                      style={{ marginTop: 8 }}
                    >
                      {biometricLabel}
                    </Button>
                  )}

                  {hasQuickAccess && (
                    <TouchableOpacity
                      style={[styles.linkBtn, { marginTop: 6 }]}
                      onPress={() => {
                        setErrorMessage(null);
                        setUseQuickAccessMode(true);
                      }}
                    >
                      <View style={styles.linkInner}>
                        <KeyRound size={13} color={ui.brand} />
                        <Text
                          style={[styles.linkText, { color: ui.brand }]}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          Volver al acceso rápido
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </Animated.View>
          </Animated.View>

          {/* PIE DE PÁGINA: ESTADO DEL SERVIDOR + AVISO HERMÉTICO */}
          <Animated.View style={[styles.footer, fadeUp(footAnim, 10)]}>
            <TouchableOpacity
              style={[
                styles.statusChip,
                {
                  borderColor: ui.border,
                  backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                },
              ]}
              onPress={checkServer}
              disabled={serverStatus === 'checking'}
              accessibilityLabel={`${statusText}. Toque para reintentar`}
            >
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text
                style={[styles.statusText, { color: ui.mutedForeground }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {statusText}
              </Text>
              {serverStatus !== 'online' && serverStatus !== 'checking' && (
                <RefreshCw size={10} color={ui.mutedForeground} />
              )}
            </TouchableOpacity>

            <Text
              style={[styles.securityText, { color: ui.mutedForeground }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              🔒 Uso exclusivo: Presbíteros y Supervisión Nacional
            </Text>
          </Animated.View>
        </View>
      </ScrollView>

      {/* MODAL CONSULTA DE USUARIO POR CÉDULA */}
      <ForgotUserModal
        visible={forgotUserModalVisible}
        onClose={() => setForgotUserModalVisible(false)}
        onSelectUser={(u) => {
          setUsuario(u);
          setTimeout(() => {
            passwordRef.current?.focus();
          }, 250);
        }}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  responsiveWrapper: {
    width: '100%',
    paddingHorizontal: 12,
  },
  logoBox: {
    alignItems: 'center',
    marginBottom: 12,
  },
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
    width: 44,
    height: 2,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  themeBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 26,
    height: 26,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  headingBox: {
    alignItems: 'center',
    marginBottom: 12,
    gap: 3,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: '500',
    letterSpacing: 0.1,
    textAlign: 'center',
  },
  forgotUserText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  pinSection: {
    alignItems: 'center',
    marginBottom: 4,
  },
  pinDotsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  pinDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
  },
  keypadGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: 216,
    gap: 8,
  },
  keypadKey: {
    width: 62,
    height: 38,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keypadKeyEmpty: {
    width: 62,
    height: 38,
  },
  keypadKeyText: {
    fontSize: 17,
    fontWeight: '600',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(128,128,128,0.25)',
    marginTop: 6,
    marginBottom: 2,
  },
  switchRow: {
    alignItems: 'center',
  },
  linkBtn: {
    alignItems: 'center',
    paddingVertical: 5,
  },
  linkInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  linkText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  linkSubText: {
    fontSize: 11,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
  },
  securityText: {
    fontSize: 9.5,
    lineHeight: 13,
    textAlign: 'center',
  },
});
