import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Share, PlusSquare, X, Smartphone } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { radius } from './ui/theme';

export const IosInstallBanner: React.FC = () => {
  const { ui, resolvedTheme } = useTheme();
  const [visible, setVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    const isStandalone =
      (window.navigator as any).standalone === true ||
      window.matchMedia?.('(display-mode: standalone)').matches;

    if (isStandalone) {
      setVisible(false);
      return;
    }

    const ua = window.navigator.userAgent || '';
    const iOSDevice =
      /iPad|iPhone|iPod/.test(ua) ||
      (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);

    if (iOSDevice) {
      setIsIos(true);
      setVisible(true);
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  if (!visible) return null;

  const isDark = resolvedTheme === 'dark';

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      setVisible(false);
    }
  };

  return (
    <View
      style={[
        styles.banner,
        {
          backgroundColor: isDark ? '#14161D' : '#FFFFFF',
          borderColor: ui.brand,
        },
      ]}
    >
      <View style={[styles.iconBox, { backgroundColor: ui.brandSoft }]}>
        <Smartphone size={18} color={ui.brand} />
      </View>

      <View style={styles.textCol}>
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={[styles.title, { color: ui.foreground }]}
        >
          {isIos ? 'Instalar App en tu iPhone' : 'Instalar App Presbiterio'}
        </Text>

        {isIos ? (
          <View style={styles.stepsRow}>
            <Text style={[styles.stepText, { color: ui.mutedForeground }]}>
              En Safari toca{' '}
            </Text>
            <Share size={12} color={ui.brand} />
            <Text style={[styles.stepText, { color: ui.foreground, fontWeight: '600' }]}>
              {' '}Compartir{' '}
            </Text>
            <Text style={[styles.stepText, { color: ui.mutedForeground }]}>y luego </Text>
            <PlusSquare size={12} color={ui.brand} />
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[styles.stepText, { color: ui.foreground, fontWeight: '600' }]}
            >
              {' '}Agregar a inicio
            </Text>
          </View>
        ) : (
          <TouchableOpacity onPress={handleInstallClick} activeOpacity={0.75}>
            <Text style={[styles.installLink, { color: ui.brand }]}>
              Toca aquí para instalar en tu pantalla de inicio →
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        onPress={() => setVisible(false)}
        style={[styles.closeBtn, { backgroundColor: ui.muted }]}
        hitSlop={8}
        accessibilityLabel="Cerrar aviso de instalación"
      >
        <X size={14} color={ui.mutedForeground} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radius.lg,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
    gap: 10,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textCol: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  stepText: {
    fontSize: 11,
    lineHeight: 15,
  },
  installLink: {
    fontSize: 11,
    fontWeight: '600',
  },
  closeBtn: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});

