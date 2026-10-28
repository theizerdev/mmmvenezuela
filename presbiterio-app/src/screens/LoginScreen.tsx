import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Image,
  useWindowDimensions,
} from 'react-native';
import {
  ShieldCheck,
  Lock,
  User as UserIcon,
  Fingerprint,
  KeyRound,
  Sun,
  Moon,
  Smartphone,
  ChevronRight,
  ArrowLeft,
  UserCheck,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { Badge } from '../components/ui/Badge';
import { radius } from '../components/ui/theme';

interface LoginScreenProps {
  onLoginSuccess?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const { width } = useWindowDimensions();
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

  // Si tiene PIN o Huella guardada, empezar por defecto en modo Acceso Rápido
  const hasQuickAccess = hasPinConfigured || (biometricsEnabled && !!savedUserLogin);
  const [useQuickAccessMode, setUseQuickAccessMode] = useState<boolean>(hasQuickAccess);

  const [usuario, setUsuario] = useState(savedUserLogin || '');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sincronizar estado inicial si cambia
  useEffect(() => {
    if (hasQuickAccess) {
      setUseQuickAccessMode(true);
    }
  }, [hasQuickAccess]);

  // Manejar Login por Usuario/Contraseña
  const handleLogin = async () => {
    if (!usuario.trim() || !password.trim()) {
      setErrorMessage('Por favor ingrese su usuario y contraseña institucional.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const res = await login(usuario.trim(), password.trim());
    setLoading(false);

    if (res.success) {
      onLoginSuccess?.();
    } else {
      setErrorMessage(res.message || 'Credenciales incorrectas. Verifique su usuario o contraseña.');
    }
  };

  // Manejar Login con PIN
  const handlePinLogin = async (pinToTry?: string) => {
    const pinVal = pinToTry || pin;
    if (pinVal.length < 4) {
      setErrorMessage('Por favor ingrese su PIN de acceso de 4 a 6 dígitos.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const res = await loginWithPin(pinVal);
    setLoading(false);

    if (res.success) {
      onLoginSuccess?.();
    } else {
      setErrorMessage(res.message || 'PIN incorrecto.');
      setPin('');
    }
  };

  // Manejar Biometría (Huella / Face ID)
  const handleBiometricAuth = async () => {
    setErrorMessage(null);
    setLoading(true);
    const res = await loginWithBiometrics();
    setLoading(false);

    if (res.success) {
      onLoginSuccess?.();
    } else {
      setErrorMessage(res.message || 'Verificación biométrica no superada.');
    }
  };

  const handlePinDigit = (digit: string) => {
    if (pin.length >= 6) return;
    const nextPin = pin + digit;
    setPin(nextPin);
    if (nextPin.length >= 4 && (hasPinConfigured && nextPin.length === 4)) {
      handlePinLogin(nextPin);
    }
  };

  const handlePinBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const cycleTheme = () => {
    if (themeMode === 'system') setThemeMode('dark');
    else if (themeMode === 'dark') setThemeMode('light');
    else setThemeMode('system');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: ui.background }]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { minHeight: '100%', justifyContent: 'center' },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* CONTENEDOR RESPONSIVE CENTRADO */}
        <View style={[styles.responsiveWrapper, { maxWidth: Math.min(width - 32, 440) }]}>
          {/* HEADER TOP CON CAMBIO DE TEMA */}
          <View style={styles.topBar}>
            <Badge variant="outline" size="sm">
              MMM VENEZUELA • OFICIAL
            </Badge>

            <TouchableOpacity
              style={[
                styles.themeBtn,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
                  borderColor: ui.border,
                },
              ]}
              onPress={cycleTheme}
              accessibilityLabel="Cambiar tema"
            >
              {themeMode === 'system' ? (
                <Smartphone size={15} color={ui.brand} />
              ) : isDark ? (
                <Moon size={15} color="#38bdf8" />
              ) : (
                <Sun size={15} color="#f59e0b" />
              )}
              <Text style={[styles.themeBtnText, { color: ui.foreground }]}>
                {themeMode === 'system' ? 'Auto' : isDark ? 'Oscuro' : 'Claro'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* LOGO INSTITUCIONAL Y TÍTULOS */}
          <View style={styles.brandingBox}>
            <Image
              source={
                isDark
                  ? require('../../assets/logo_light.png')
                  : require('../../assets/logo_color.png')
              }
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={[styles.churchSub, { color: ui.mutedForeground }]}>
              IGLESIA CRISTIANA PENTECOSTÉS DE VENEZUELA
            </Text>
            <Text style={[styles.churchTitle, { color: ui.foreground }]}>
              MOVIMIENTO MISIONERO MUNDIAL
            </Text>
            <View style={styles.badgesRow}>
              <Badge variant="brand" size="md">
                PORTAL EJECUTIVO
              </Badge>
              <Badge variant="secondary" size="md">
                ZONAS & SUPERVISIÓN
              </Badge>
            </View>
          </View>

          {/* ============================================================== */}
          {/* MODO A: ACCESO RÁPIDO (PIN / BIOMETRÍA)                        */}
          {/* ============================================================== */}
          {useQuickAccessMode ? (
            <Card style={[styles.card, { borderColor: ui.border }]}>
              <CardHeader style={{ alignItems: 'center', textAlign: 'center' }}>
                <View
                  style={[
                    styles.avatarBadge,
                    { backgroundColor: ui.brandSoft, borderColor: ui.brand },
                  ]}
                >
                  <UserCheck size={28} color={ui.brand} />
                </View>
                <CardTitle style={{ marginTop: 10, textAlign: 'center' }}>
                  {savedUserName ? `¡Paz de Dios!` : 'Acceso Rápido'}
                </CardTitle>
                <CardDescription style={{ textAlign: 'center', marginTop: 2 }}>
                  {savedUserName ? (
                    <Text style={{ fontWeight: '700', color: ui.foreground }}>
                      {savedUserName}
                    </Text>
                  ) : (
                    'Desbloquee con su PIN o sensor biométrico'
                  )}
                </CardDescription>
              </CardHeader>

              <CardContent style={styles.cardContent}>
                {errorMessage && (
                  <Alert
                    variant="destructive"
                    title="Error de Acceso"
                    description={errorMessage}
                    style={{ marginBottom: 14 }}
                  />
                )}

                {/* VISUALIZADOR DE PIN */}
                {hasPinConfigured && (
                  <View style={styles.pinSection}>
                    <Text style={[styles.pinPromptText, { color: ui.mutedForeground }]}>
                      Ingrese su PIN de 4 dígitos
                    </Text>

                    <View style={styles.pinDotsRow}>
                      {[0, 1, 2, 3].map((idx) => {
                        const filled = pin.length > idx;
                        return (
                          <View
                            key={idx}
                            style={[
                              styles.pinDot,
                              {
                                borderColor: filled ? ui.brand : ui.border,
                                backgroundColor: filled ? ui.brand : 'transparent',
                              },
                            ]}
                          />
                        );
                      })}
                    </View>

                    {/* TECLADO NUMÉRICO RÁPIDO */}
                    <View style={styles.keypadGrid}>
                      {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                        <TouchableOpacity
                          key={digit}
                          style={[
                            styles.keypadKey,
                            { backgroundColor: ui.muted, borderColor: ui.border },
                          ]}
                          onPress={() => handlePinDigit(digit)}
                          disabled={loading}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.keypadKeyText, { color: ui.foreground }]}>
                            {digit}
                          </Text>
                        </TouchableOpacity>
                      ))}

                      {/* TECLA BIOMÉTRICA O VACÍA */}
                      {biometricsAvailable && biometricsEnabled ? (
                        <TouchableOpacity
                          style={[
                            styles.keypadKey,
                            { backgroundColor: ui.brandSoft, borderColor: ui.brand },
                          ]}
                          onPress={handleBiometricAuth}
                          disabled={loading}
                          activeOpacity={0.7}
                        >
                          <Fingerprint size={24} color={ui.brand} />
                        </TouchableOpacity>
                      ) : (
                        <View style={styles.keypadKeyEmpty} />
                      )}

                      <TouchableOpacity
                        style={[
                          styles.keypadKey,
                          { backgroundColor: ui.muted, borderColor: ui.border },
                        ]}
                        onPress={() => handlePinDigit('0')}
                        disabled={loading}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.keypadKeyText, { color: ui.foreground }]}>0</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.keypadKey,
                          { backgroundColor: ui.muted, borderColor: ui.border },
                        ]}
                        onPress={handlePinBackspace}
                        disabled={loading || pin.length === 0}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.keypadKeyText, { color: ui.mutedForeground }]}>⌫</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* BOTÓN WINDOWS HELLO / BIOMÉTRICO DIRECTO */}
                {biometricsAvailable && biometricsEnabled && (
                  <Button
                    variant={hasPinConfigured ? 'outline' : 'brand'}
                    onPress={handleBiometricAuth}
                    loading={loading}
                    fullWidth
                    style={{ marginTop: 12, marginBottom: 4 }}
                  >
                    {/Windows/i.test(platformAuthName)
                      ? 'INGRESAR CON WINDOWS HELLO'
                      : `INGRESAR CON ${biometricType.toUpperCase()}`}
                  </Button>
                )}

                {/* ALTERNATIVAS DE INGRESO */}
                <View style={styles.switchRow}>
                  <TouchableOpacity
                    style={styles.switchBtn}
                    onPress={() => {
                      setErrorMessage(null);
                      setUseQuickAccessMode(false);
                    }}
                  >
                    <Text style={[styles.switchBtnText, { color: ui.brand }]}>
                      Ingresar con usuario y contraseña
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.switchBtn, { marginTop: 6 }]}
                    onPress={async () => {
                      await clearSavedAccount();
                      setUseQuickAccessMode(false);
                      setUsuario('');
                      setPassword('');
                      setPin('');
                    }}
                  >
                    <Text style={[styles.switchSubText, { color: ui.mutedForeground }]}>
                      Cambiar de cuenta institucional
                    </Text>
                  </TouchableOpacity>
                </View>
              </CardContent>
            </Card>
          ) : (
            /* ============================================================== */
            /* MODO B: CREDENCIALES (USUARIO / CONTRASEÑA)                    */
            /* ============================================================== */
            <Card style={[styles.card, { borderColor: ui.border }]}>
              <CardHeader>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <ShieldCheck size={20} color={ui.brand} />
                  <CardTitle>Iniciar Sesión</CardTitle>
                </View>
                <CardDescription>
                  Credenciales de administración web para Presbíteros y Supervisión.
                </CardDescription>
              </CardHeader>

              <CardContent style={styles.cardContent}>
                {errorMessage && (
                  <Alert
                    variant="destructive"
                    title="Error de Acceso"
                    description={errorMessage}
                    style={{ marginBottom: 14 }}
                  />
                )}

                {/* CAMPO USUARIO O CÉDULA */}
                <Input
                  label="USUARIO O CÉDULA"
                  placeholder="Ej. mpaez o V-12345678"
                  value={usuario}
                  onChangeText={setUsuario}
                  autoCapitalize="none"
                  leftIcon={<UserIcon size={18} color={ui.mutedForeground} />}
                />

                {/* CAMPO CONTRASEÑA */}
                <Input
                  label="CONTRASEÑA"
                  placeholder="••••••••••••"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  revealable
                  autoCapitalize="none"
                  leftIcon={<Lock size={18} color={ui.mutedForeground} />}
                />

                {/* BOTÓN LOGIN */}
                <Button
                  variant="brand"
                  onPress={handleLogin}
                  loading={loading}
                  fullWidth
                  style={{ marginTop: 8 }}
                >
                  INGRESAR AL PANEL
                </Button>

                {/* ACCESO CON WINDOWS HELLO O BIOMETRÍA DIRECTA */}
                {biometricsAvailable && biometricsEnabled && (
                  <Button
                    variant="outline"
                    onPress={handleBiometricAuth}
                    loading={loading}
                    fullWidth
                    style={{ marginTop: 8 }}
                  >
                    {/Windows/i.test(platformAuthName)
                      ? 'INGRESAR CON WINDOWS HELLO'
                      : `INGRESAR CON ${biometricType.toUpperCase()}`}
                  </Button>
                )}

                {/* REGRESAR A ACCESO RÁPIDO SI EXISTE */}
                {hasQuickAccess && (
                  <TouchableOpacity
                    style={[styles.quickReturnBtn, { backgroundColor: ui.muted, borderColor: ui.border }]}
                    onPress={() => {
                      setErrorMessage(null);
                      setUseQuickAccessMode(true);
                    }}
                  >
                    <KeyRound size={16} color={ui.brand} />
                    <Text style={[styles.quickReturnText, { color: ui.foreground }]}>
                      Volver al Acceso Rápido (PIN / Huella)
                    </Text>
                  </TouchableOpacity>
                )}
              </CardContent>
            </Card>
          )}

          {/* NOTA DE SEGURIDAD / AVISO INSTITUCIONAL */}
          <View style={styles.securityBox}>
            <Text style={[styles.securityText, { color: ui.subtle }]}>
              🔒 Aplicación ejecutiva de uso reservado para Presbíteros y Supervisión Nacional. No
              contiene escáner para preservar la integridad del padrón ministerial.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  responsiveWrapper: {
    width: '100%',
    paddingHorizontal: 16,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  themeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 30,
    paddingHorizontal: 10,
    borderRadius: radius.full,
    borderWidth: 1,
    gap: 6,
  },
  themeBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  brandingBox: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoImage: {
    width: 64,
    height: 64,
    marginBottom: 10,
  },
  churchSub: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  churchTitle: {
    fontFamily: 'CocogooseBold',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: -0.3,
    marginTop: 3,
    textAlign: 'center',
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  card: {
    borderRadius: radius.xl,
    padding: 6,
    borderWidth: 1,
  },
  cardContent: {
    paddingTop: 8,
  },
  avatarBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinSection: {
    alignItems: 'center',
    marginVertical: 10,
  },
  pinPromptText: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
  },
  pinDotsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  keypadGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: 250,
    gap: 12,
  },
  keypadKey: {
    width: 66,
    height: 52,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keypadKeyEmpty: {
    width: 66,
    height: 52,
  },
  keypadKeyText: {
    fontSize: 20,
    fontWeight: '700',
  },
  switchRow: {
    alignItems: 'center',
    marginTop: 18,
  },
  switchBtn: {
    paddingVertical: 4,
  },
  switchBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  switchSubText: {
    fontSize: 11,
    fontWeight: '500',
  },
  quickReturnBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginTop: 12,
    gap: 8,
  },
  quickReturnText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  securityBox: {
    marginTop: 20,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  securityText: {
    fontSize: 10.5,
    lineHeight: 15,
    textAlign: 'center',
  },
});
