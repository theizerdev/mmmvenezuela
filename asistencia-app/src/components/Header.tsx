import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import {
  Moon,
  Sun,
  Smartphone,
  Settings2,
  Check,
  Palette,
  CloudCheck,
  CloudOff,
} from 'lucide-react-native';
import { useTheme, ThemeMode } from '../context/ThemeContext';
import { Actividad } from '../types';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui';

interface HeaderProps {
  actividad?: Actividad | null;
  onOpenServerConfig?: () => void;
  serverOnline?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  actividad,
  onOpenServerConfig,
  serverOnline = true,
}) => {
  const { themeMode, isDark, colors, setThemeMode } = useTheme();
  const [themeDialogOpen, setThemeDialogOpen] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: colors.bgSecondary, borderBottomColor: colors.cardBorder }]}>
      {/* 1. BARRA SUPERIOR: IDENTIDAD INSTITUCIONAL OFICIAL MMM (LOGIN.TSX) */}
      <View style={styles.brandingRow}>
        <View style={styles.brandLeft}>
          <Image
            source={colors.logo}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.brandTextCol}>
            <Text numberOfLines={1} style={[styles.churchSub, { color: isDark ? '#cbd5e1' : '#334155' }]}>
              IGLESIA CRISTIANA PENTECOSTÉS VENEZUELA
            </Text>
            <Text numberOfLines={1} style={[styles.churchTitle, { color: colors.text }]}>
              MOVIMIENTO MISIONERO MUNDIAL
            </Text>
          </View>
        </View>

        {/* ACCIONES SUPERIORES CON SHADCN BUTTONS */}
        <View style={styles.actionsRow}>
          {/* BOTÓN SELECTOR DE TEMA */}
          <Button
            variant="ghost"
            size="icon"
            onPress={() => setThemeDialogOpen(true)}
            accessibilityLabel="Cambiar tema"
            style={styles.actionIconBtn}
          >
            {themeMode === 'system' ? (
              <Smartphone size={18} color={colors.primary} />
            ) : isDark ? (
              <Moon size={18} color="#38bdf8" />
            ) : (
              <Sun size={18} color="#d97706" />
            )}
          </Button>

          {/* BOTÓN CONFIGURACIÓN SERVIDOR */}
          {onOpenServerConfig && (
            <Button
              variant="ghost"
              size="icon"
              onPress={onOpenServerConfig}
              accessibilityLabel="Configuración de servidor"
              style={styles.actionIconBtn}
            >
              {serverOnline ? (
                <Settings2 size={18} color={colors.textSecondary} />
              ) : (
                <CloudOff size={18} color={colors.danger} />
              )}
            </Button>
          )}
        </View>
      </View>

      {/* 2. MODAL DE SELECCIÓN DE TEMA (RADIX UI DIALOG CON ESTILO SHADCN) */}
      <Dialog open={themeDialogOpen} onOpenChange={setThemeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Palette size={20} color={colors.primary} />
              <DialogTitle>Tema Visual</DialogTitle>
            </View>
            <DialogDescription>
              Seleccione la apariencia que prefiera para la aplicación:
            </DialogDescription>
          </DialogHeader>

          <View style={styles.optionsList}>
            {/* TEMA OSCURO */}
            <Pressable
              style={[
                styles.themeOption,
                {
                  backgroundColor: isDark ? colors.cardDeep : '#f8fafc',
                  borderColor: themeMode === 'dark' ? colors.primary : colors.cardBorder,
                },
              ]}
              onPress={() => {
                setThemeMode('dark');
                setThemeDialogOpen(false);
              }}
            >
              <View style={[styles.optionIconCircle, { backgroundColor: '#0f172a' }]}>
                <Moon size={16} color="#38bdf8" />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.optionTitle, { color: colors.text }]}>
                  Tema Oscuro (HUD Terminal)
                </Text>
                <Text style={[styles.optionSub, { color: colors.textSecondary }]}>
                  Fondo Slate-950 y logotipo oficial blanco
                </Text>
              </View>
              {themeMode === 'dark' && <Check size={18} color={colors.primary} />}
            </Pressable>

            {/* TEMA CLARO */}
            <Pressable
              style={[
                styles.themeOption,
                {
                  backgroundColor: isDark ? colors.cardDeep : '#f8fafc',
                  borderColor: themeMode === 'light' ? colors.primary : colors.cardBorder,
                },
              ]}
              onPress={() => {
                setThemeMode('light');
                setThemeDialogOpen(false);
              }}
            >
              <View style={[styles.optionIconCircle, { backgroundColor: '#fef3c7' }]}>
                <Sun size={16} color="#d97706" />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.optionTitle, { color: colors.text }]}>
                  Tema Claro
                </Text>
                <Text style={[styles.optionSub, { color: colors.textSecondary }]}>
                  Fondo blanco y logotipo oficial a color
                </Text>
              </View>
              {themeMode === 'light' && <Check size={18} color={colors.primary} />}
            </Pressable>

            {/* MODO AUTOMÁTICO / SISTEMA */}
            <Pressable
              style={[
                styles.themeOption,
                {
                  backgroundColor: isDark ? colors.cardDeep : '#f8fafc',
                  borderColor: themeMode === 'system' ? colors.primary : colors.cardBorder,
                },
              ]}
              onPress={() => {
                setThemeMode('system');
                setThemeDialogOpen(false);
              }}
            >
              <View style={[styles.optionIconCircle, { backgroundColor: isDark ? '#1e293b' : '#e2e8f0' }]}>
                <Smartphone size={16} color={colors.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.optionTitle, { color: colors.text }]}>
                  Automático (Sistema)
                </Text>
                <Text style={[styles.optionSub, { color: colors.textSecondary }]}>
                  Se adapta a la configuración de este dispositivo
                </Text>
              </View>
              {themeMode === 'system' && <Check size={18} color={colors.primary} />}
            </Pressable>
          </View>
        </DialogContent>
      </Dialog>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  brandingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  logo: {
    width: 36,
    height: 36,
    marginRight: 9,
  },
  brandTextCol: {
    flex: 1,
    justifyContent: 'center',
  },
  churchSub: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  churchTitle: {
    fontFamily: 'CocogooseBold',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: -0.2,
    marginTop: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionIconBtn: {
    width: 36,
    height: 36,
  },
  optionsList: {
    gap: 8,
    marginTop: 14,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  optionIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  optionSub: {
    fontSize: 11,
    marginTop: 1,
  },
});
