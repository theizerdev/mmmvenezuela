import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Switch,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {
  ShieldCheck,
  Fingerprint,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Laptop,
  Smartphone,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from './ui/Dialog';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { radius } from './ui/theme';

interface SetupQuickAccessModalProps {
  visible: boolean;
  onClose: () => void;
  isInitialSetup?: boolean;
}

export const SetupQuickAccessModal: React.FC<SetupQuickAccessModalProps> = ({
  visible,
  onClose,
  isInitialSetup = false,
}) => {
  const { ui, resolvedTheme } = useTheme();
  const {
    biometricsAvailable,
    biometricsEnabled,
    biometricType,
    platformAuthName,
    hasPinConfigured,
    setupQuickAccess,
  } = useAuth();

  const isDark = resolvedTheme === 'dark';
  const isWindows = /Windows/i.test(platformAuthName);

  // Por defecto activar la llave del dispositivo si está disponible
  const [useBio, setUseBio] = useState<boolean>(true);
  const [wantPin, setWantPin] = useState<boolean>(!biometricsAvailable);
  const [pin, setPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSave = async () => {
    setErrorMessage(null);

    if (wantPin) {
      if (pin.length < 4) {
        setErrorMessage('El PIN debe tener al menos 4 dígitos numéricos.');
        return;
      }
      if (pin !== confirmPin) {
        setErrorMessage('Los dos códigos PIN no coinciden.');
        return;
      }
    }

    if (!wantPin && !useBio) {
      setErrorMessage(
        `Por favor active al menos un método de acceso (${
          isWindows ? 'Windows Hello' : 'Llave de acceso'
        } o PIN).`
      );
      return;
    }

    setLoading(true);
    try {
      const ok = await setupQuickAccess({
        enableBiometrics: useBio,
        pin: wantPin ? pin : undefined,
      });

      if (ok) {
        setSuccessMessage(
          isWindows
            ? '¡Windows Hello vinculado correctamente a su cuenta!'
            : '¡Llave de acceso configurada correctamente!'
        );
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setErrorMessage(
          isWindows
            ? 'Windows Security canceló la operación o no se ingresó el PIN de Windows.'
            : 'No se completó la verificación con el dispositivo.'
        );
      }
    } catch (e: any) {
      setErrorMessage(e?.message || 'Error guardando acceso del dispositivo.');
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async () => {
    await setupQuickAccess({ dismiss: true });
    onClose();
  };

  return (
    <Dialog open={visible} onOpenChange={(open) => !open && onClose()}>
      <DialogHeader>
        <View style={styles.headerRow}>
          <View style={[styles.iconBox, { backgroundColor: ui.brandSoft, borderColor: ui.brand }]}>
            {isWindows ? (
              <Laptop size={22} color={ui.brand} />
            ) : (
              <ShieldCheck size={22} color={ui.brand} />
            )}
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <DialogTitle>
              {isInitialSetup
                ? isWindows
                  ? 'Configurar Windows Hello'
                  : 'Configurar Llave de Acceso'
                : 'Llave de Acceso del Dispositivo'}
            </DialogTitle>
            <DialogDescription>
              {isWindows
                ? 'Use el PIN o huella de su Windows para entrar sin escribir contraseña.'
                : 'Acceda a su panel ejecutivo al instante con la seguridad de su equipo.'}
            </DialogDescription>
          </View>
        </View>
      </DialogHeader>

      <View style={styles.body}>
        {errorMessage && (
          <View
            style={[
              styles.alertBox,
              { backgroundColor: ui.destructiveSoft, borderColor: ui.destructiveBorder },
            ]}
          >
            <AlertCircle size={16} color={ui.destructive} />
            <Text style={[styles.alertText, { color: ui.destructive }]}>{errorMessage}</Text>
          </View>
        )}

        {successMessage && (
          <View
            style={[
              styles.alertBox,
              { backgroundColor: ui.successSoft, borderColor: ui.success },
            ]}
          >
            <CheckCircle2 size={16} color={ui.success} />
            <Text style={[styles.alertText, { color: ui.success }]}>{successMessage}</Text>
          </View>
        )}

        {/* 1. OPCIÓN LLAVE DE ACCESO DEL DISPOSITIVO (WINDOWS HELLO / PASSKEY) */}
        {biometricsAvailable && (
          <View
            style={[
              styles.optionCard,
              {
                backgroundColor: ui.muted,
                borderColor: useBio ? ui.brand : ui.border,
              },
            ]}
          >
            <View style={styles.optionHeader}>
              <View
                style={[
                  styles.cardIconBox,
                  {
                    backgroundColor: useBio ? ui.brandSoft : ui.card,
                    borderColor: useBio ? ui.brand : ui.border,
                  },
                ]}
              >
                {isWindows ? (
                  <Laptop size={22} color={ui.brand} />
                ) : (
                  <Fingerprint size={22} color={ui.brand} />
                )}
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={[styles.optionTitle, { color: ui.foreground }]}>
                    {isWindows ? 'Windows Hello' : platformAuthName}
                  </Text>
                  <Badge variant="brand" size="sm">
                    RECOMENDADO
                  </Badge>
                </View>
                <Text style={[styles.optionDesc, { color: ui.mutedForeground }]}>
                  {isWindows
                    ? 'Inicie sesión con el PIN de inicio de Windows, sensor de huella o rostro de este equipo.'
                    : 'Desbloquee el panel usando la autenticación biométrica o código de este dispositivo.'}
                </Text>
              </View>
              <Switch
                value={useBio}
                onValueChange={setUseBio}
                trackColor={{ false: ui.border, true: ui.brand }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        )}

        {/* 2. OPCIÓN CÓDIGO PIN MANUAL (RESPALDO) */}
        <View
          style={[
            styles.optionCard,
            {
              backgroundColor: ui.muted,
              borderColor: wantPin ? ui.brand : ui.border,
            },
          ]}
        >
          <View style={styles.optionHeader}>
            <View
              style={[
                styles.cardIconBox,
                { backgroundColor: ui.card, borderColor: ui.border },
              ]}
            >
              <KeyRound size={20} color={ui.foreground} />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[styles.optionTitle, { color: ui.foreground }]}>
                PIN Numérico Alternativo
              </Text>
              <Text style={[styles.optionDesc, { color: ui.mutedForeground }]}>
                {biometricsAvailable
                  ? 'Código de respaldo de 4 a 6 dígitos en caso de no usar Windows Hello.'
                  : 'Código personal de 4 a 6 dígitos para ingreso rápido.'}
              </Text>
            </View>
            <Switch
              value={wantPin}
              onValueChange={setWantPin}
              trackColor={{ false: ui.border, true: ui.brand }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* FORMULARIO PIN */}
          {wantPin && (
            <View style={[styles.pinForm, { borderTopColor: ui.border }]}>
              <View style={styles.pinInputsRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.inputLabel, { color: ui.foreground }]}>Nuevo PIN</Text>
                  <TextInput
                    style={[
                      styles.pinInput,
                      {
                        backgroundColor: ui.card,
                        borderColor: ui.border,
                        color: ui.foreground,
                      },
                    ]}
                    placeholder="4 a 6 dígitos"
                    placeholderTextColor={ui.mutedForeground}
                    value={pin}
                    onChangeText={(val) => setPin(val.replace(/\D/g, '').slice(0, 6))}
                    keyboardType="numeric"
                    secureTextEntry
                    maxLength={6}
                  />
                </View>

                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={[styles.inputLabel, { color: ui.foreground }]}>Confirmar PIN</Text>
                  <TextInput
                    style={[
                      styles.pinInput,
                      {
                        backgroundColor: ui.card,
                        borderColor: ui.border,
                        color: ui.foreground,
                      },
                    ]}
                    placeholder="Repita su PIN"
                    placeholderTextColor={ui.mutedForeground}
                    value={confirmPin}
                    onChangeText={(val) => setConfirmPin(val.replace(/\D/g, '').slice(0, 6))}
                    keyboardType="numeric"
                    secureTextEntry
                    maxLength={6}
                  />
                </View>
              </View>

              {pin.length >= 4 && confirmPin.length >= 4 && (
                <View style={styles.matchIndicator}>
                  {pin === confirmPin ? (
                    <Text style={{ color: ui.success, fontSize: 11, fontWeight: '700' }}>
                      ✓ Los códigos coinciden correctamente
                    </Text>
                  ) : (
                    <Text style={{ color: ui.destructive, fontSize: 11, fontWeight: '700' }}>
                      ✗ Los códigos no coinciden
                    </Text>
                  )}
                </View>
              )}
            </View>
          )}
        </View>

        {/* BOTONES DE ACCIÓN */}
        <View style={styles.actionsBox}>
          <Button
            variant="brand"
            onPress={handleSave}
            loading={loading}
            fullWidth
            style={{ marginBottom: 8 }}
          >
            {isWindows && useBio
              ? 'VINCULAR CON WINDOWS HELLO'
              : 'GUARDAR Y ACTIVAR ACCESO'}
          </Button>

          {isInitialSetup && (
            <Button variant="outline" onPress={handleDismiss} disabled={loading} fullWidth>
              Configurar más tarde
            </Button>
          )}
        </View>
      </View>
    </Dialog>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.xl,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    marginTop: 14,
    gap: 12,
  },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: 8,
  },
  alertText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  optionCard: {
    padding: 12,
    borderRadius: radius.lg,
    borderWidth: 1.5,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIconBox: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTitle: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  optionDesc: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  pinForm: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  pinInputsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  pinInput: {
    height: 42,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 4,
  },
  matchIndicator: {
    marginTop: 6,
    alignItems: 'center',
  },
  actionsBox: {
    marginTop: 6,
  },
});
