import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { Badge } from '../components/ui/Badge';
import { radius } from '../components/ui/theme';
import { Lock, User as UserIcon, Fingerprint, Eye, EyeOff, ShieldCheck, Sun, Moon, Smartphone } from 'lucide-react-native';

interface LoginScreenProps {
  onLoginSuccess?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const { ui, resolvedTheme, themeMode, setThemeMode } = useTheme();
  const {
    login,
    loginWithBiometrics,
    biometricsAvailable,
    biometricsEnabled,
  } = useAuth();

  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isDark = resolvedTheme === 'dark';

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
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* TEMA SWITCHER TOP */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={[styles.themeBtn, { backgroundColor: ui.muted, borderColor: ui.border }]}
            onPress={cycleTheme}
          >
            {themeMode === 'system' ? (
              <Smartphone size={16} color={ui.brand} />
            ) : isDark ? (
              <Moon size={16} color="#38bdf8" />
            ) : (
              <Sun size={16} color="#f59e0b" />
            )}
          </TouchableOpacity>
        </View>

        {/* LOGO & BRANDING */}
        <View style={styles.brandBox}>
          <Image
            source={isDark ? require('../../assets/logo_light.png') : require('../../assets/logo_color.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[styles.superTitle, { color: ui.brand }]}>
            IGLESIA CRISTIANA PENTECOSTÉS DE VENEZUELA
          </Text>
          <Text style={[styles.brandTitle, { color: ui.foreground }]}>
            MOVIMIENTO MISIONERO MUNDIAL
          </Text>
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
            <Badge variant="brand">PORTAL EJECUTIVO</Badge>
            <Badge variant="secondary">ZONAS & SUPERVISIÓN</Badge>
          </View>
        </View>

        {/* TARJETA SHADCN DE LOGIN */}
        <Card style={styles.loginCard}>
          <CardHeader>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <ShieldCheck size={20} color={ui.brand} />
              <CardTitle>Iniciar Sesión</CardTitle>
            </View>
            <CardDescription>
              Ingrese con sus credenciales de administración web o active su ingreso con huella.
            </CardDescription>
          </CardHeader>

          <CardContent style={styles.cardContent}>
            {/* ALERTA DE ERROR */}
            {errorMessage && (
              <Alert variant="destructive" title="Error de Acceso" description={errorMessage} style={{ marginBottom: 16 }} />
            )}

            {/* CAMPO USUARIO */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: ui.foreground }]}>Usuario o Cédula</Text>
              <View style={[styles.inputContainer, { backgroundColor: ui.input, borderColor: ui.border }]}>
                <UserIcon size={18} color={ui.mutedForeground} style={{ marginLeft: 12, marginRight: 8 }} />
                <Input
                  placeholder="Ej. mpaez o 12345678"
                  value={usuario}
                  onChangeText={setUsuario}
                  autoCapitalize="none"
                  style={{ flex: 1, borderWidth: 0 }}
                />
              </View>
            </View>

            {/* CAMPO CONTRASEÑA */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: ui.foreground }]}>Contraseña</Text>
              <View style={[styles.inputContainer, { backgroundColor: ui.input, borderColor: ui.border }]}>
                <Lock size={18} color={ui.mutedForeground} style={{ marginLeft: 12, marginRight: 8 }} />
                <Input
                  placeholder="••••••••"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  style={{ flex: 1, borderWidth: 0 }}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={{ padding: 10, marginRight: 4 }}
                >
                  {showPassword ? (
                    <EyeOff size={18} color={ui.mutedForeground} />
                  ) : (
                    <Eye size={18} color={ui.mutedForeground} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

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

            {/* BOTÓN BIOMÉTRICO (HUELLA) */}
            {biometricsAvailable && (
              <TouchableOpacity
                style={[styles.bioBtn, { backgroundColor: ui.muted, borderColor: ui.border }]}
                onPress={handleBiometricAuth}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Fingerprint size={22} color={ui.brand} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.bioTitle, { color: ui.foreground }]}>
                    {biometricsEnabled ? 'Ingresar con Huella Dactilar' : 'Sensor Biométrico'}
                  </Text>
                  <Text style={[styles.bioSub, { color: ui.mutedForeground }]}>
                    Acceso instantáneo con el lector de su teléfono
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {/* NOTA DE SEGURIDAD */}
            <View style={styles.securityBox}>
              <Text style={[styles.securityText, { color: ui.subtle }]}>
                🔒 Esta aplicación es de uso exclusivo para Presbíteros de Zona y el Supervisor Nacional. No contiene escáner de asistencia para garantizar la integridad del evento.
              </Text>
            </View>
          </CardContent>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 35,
    paddingBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBar: {
    width: '100%',
    maxWidth: 420,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  themeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandBox: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 64,
    height: 64,
    marginBottom: 10,
  },
  superTitle: {
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  brandTitle: {
    fontFamily: 'CocogooseBold',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.3,
    textAlign: 'center',
    marginVertical: 4,
  },
  loginCard: {
    width: '100%',
    maxWidth: 420,
  },
  cardContent: {
    gap: 14,
  },
  formGroup: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    height: 44,
  },
  bioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginTop: 8,
  },
  bioTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  bioSub: {
    fontSize: 11,
    marginTop: 1,
  },
  securityBox: {
    marginTop: 10,
    padding: 8,
  },
  securityText: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 15,
  },
});

