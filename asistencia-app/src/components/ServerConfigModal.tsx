import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import {
  Server,
  Wifi,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
} from 'lucide-react-native';
import { api, DEFAULT_API_URL } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Input,
  Button,
} from './ui';

interface ServerConfigModalProps {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const ServerConfigModal: React.FC<ServerConfigModalProps> = ({
  visible,
  onClose,
  onSaved,
}) => {
  const { colors, isDark } = useTheme();
  const [url, setUrl] = useState<string>(api.getBaseUrl());
  const [testing, setTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    if (visible) {
      setUrl(api.getBaseUrl());
      setTestResult(null);
    }
  }, [visible]);

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    const ok = await api.testConnection(url);
    setTesting(false);
    setTestResult(ok ? 'success' : 'error');
  };

  const handleSave = async () => {
    if (!url.trim()) return;
    await api.setBaseUrl(url);
    onSaved();
    onClose();
  };

  const handleReset = () => {
    setUrl(DEFAULT_API_URL);
    setTestResult(null);
  };

  return (
    <Dialog open={visible} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Server size={20} color={colors.primary} />
            <DialogTitle>Servidor Backend</DialogTitle>
          </View>
          <DialogDescription>
            Configure la URL base donde se encuentra ejecutándose el sistema Laravel:
          </DialogDescription>
        </DialogHeader>

        <View style={styles.body}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>DIRECCIÓN URL / IP:</Text>
          <Input
            value={url}
            onChangeText={(text) => {
              setUrl(text);
              setTestResult(null);
            }}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="http://192.168.101.102"
            style={[
              testResult === 'success' && { borderColor: colors.success },
              testResult === 'error' && { borderColor: colors.danger },
            ]}
          />

          {/* MENSAJES DE ESTADO DEL TEST */}
          {testResult === 'success' && (
            <View style={[styles.resultBanner, { backgroundColor: colors.successBg, borderColor: colors.successBorder }]}>
              <CheckCircle2 size={16} color={colors.success} />
              <Text style={[styles.resultText, { color: colors.success }]}>
                ¡Conexión verificada con el sistema MMM Venezuela!
              </Text>
            </View>
          )}

          {testResult === 'error' && (
            <View style={[styles.resultBanner, { backgroundColor: colors.dangerBg, borderColor: colors.dangerBorder }]}>
              <AlertCircle size={16} color={colors.danger} />
              <Text style={[styles.resultText, { color: colors.danger }]}>
                No se pudo conectar. Verifique que ambos dispositivos compartan la misma red.
              </Text>
            </View>
          )}

          {/* BOTONES */}
          <View style={styles.actions}>
            <Button
              variant="outline"
              size="default"
              onPress={handleTest}
              loading={testing}
              style={{ flex: 1 }}
            >
              <Wifi size={15} color={colors.text} />
              <Text style={{ color: colors.text, fontWeight: '700' }}>Probar</Text>
            </Button>

            <Button
              variant="default"
              size="default"
              onPress={handleSave}
              style={{ flex: 1.3 }}
            >
              <Text style={{ color: '#ffffff', fontWeight: '800' }}>Guardar</Text>
            </Button>
          </View>

          <Pressable style={styles.resetBtn} onPress={handleReset}>
            <RotateCcw size={13} color={colors.textMuted} style={{ marginRight: 4 }} />
            <Text style={[styles.resetText, { color: colors.textMuted }]}>
              Restablecer IP por defecto ({DEFAULT_API_URL})
            </Text>
          </Pressable>
        </View>
      </DialogContent>
    </Dialog>
  );
};

const styles = StyleSheet.create({
  body: {
    marginTop: 10,
  },
  label: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  resultBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
    marginTop: 10,
  },
  resultText: {
    fontSize: 11.5,
    fontWeight: '700',
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  resetText: {
    fontSize: 11,
    textDecorationLine: 'underline',
  },
});
