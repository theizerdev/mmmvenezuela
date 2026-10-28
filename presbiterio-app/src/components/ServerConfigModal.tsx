import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import {
  Server,
  Wifi,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
} from 'lucide-react-native';
import { api, DEFAULT_API_URL } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/Dialog';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Alert } from './ui/Alert';
import { radius } from './ui/theme';

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
  const { ui } = useTheme();
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
    try {
      const resp = await fetch(`${url.trim().replace(/\/+$/, '')}/api/v1/actividades`);
      const ok = resp.ok;
      setTestResult(ok ? 'success' : 'error');
    } catch {
      setTestResult('error');
    } finally {
      setTesting(false);
    }
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
      <DialogHeader>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Server size={20} color={ui.brand} />
          <DialogTitle>Servidor Central MMM</DialogTitle>
        </View>
        <DialogDescription>
          Ajuste la dirección IP o dominio del servidor Laravel de Venezuela:
        </DialogDescription>
      </DialogHeader>

      <View style={{ gap: 14, marginVertical: 12 }}>
        <View style={{ gap: 6 }}>
          <Text style={[styles.label, { color: ui.foreground }]}>DIRECCIÓN IP O HOST</Text>
          <View style={[styles.inputBox, { backgroundColor: ui.input, borderColor: ui.border }]}>
            <Wifi size={16} color={ui.mutedForeground} style={{ marginLeft: 12, marginRight: 8 }} />
            <Input
              value={url}
              onChangeText={setUrl}
              placeholder="http://192.168.1.100"
              autoCapitalize="none"
              autoCorrect={false}
              style={{ flex: 1, borderWidth: 0 }}
            />
          </View>
        </View>

        {/* RESULTADO DE LA PRUEBA */}
        {testResult === 'success' && (
          <Alert variant="success" title="Conexión Exitosa" description="El servidor nacional respondió correctamente." />
        )}

        {testResult === 'error' && (
          <Alert variant="destructive" title="Sin Conexión" description="No se pudo contactar con el backend. Verifique que ambos dispositivos estén en la misma red Wi-Fi." />
        )}

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button
            variant="outline"
            onPress={handleTest}
            loading={testing}
            style={{ flex: 1 }}
          >
            Probar Enlace
          </Button>

          <Button
            variant="ghost"
            onPress={handleReset}
            style={{ paddingHorizontal: 12 }}
          >
            <RotateCcw size={15} color={ui.mutedForeground} />
          </Button>
        </View>
      </View>

      <DialogFooter>
        <Button variant="outline" onPress={onClose} style={{ marginRight: 8 }}>
          Cancelar
        </Button>
        <Button variant="brand" onPress={handleSave}>
          Guardar Servidor
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    height: 44,
  },
});
