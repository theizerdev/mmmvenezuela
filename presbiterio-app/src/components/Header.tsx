import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import {
  Moon,
  Sun,
  Smartphone,
  Settings2,
  ShieldCheck,
  Fingerprint,
  Bell,
  BellOff,
  LogOut,
  Palette,
  CloudOff,
} from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Actividad } from '../types';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/Dialog';
import { radius } from './ui/theme';

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
  const { ui, resolvedTheme, themeMode, setThemeMode } = useTheme();
  const {
    user,
    logout,
    toggleModoSilencioso,
    biometricsAvailable,
    biometricsEnabled,
    enableBiometrics,
    disableBiometrics,
  } = useAuth();

  const [themeDialogOpen, setThemeDialogOpen] = useState(false);
  const [userProfileDialogOpen, setUserProfileDialogOpen] = useState(false);

  const isDark = resolvedTheme === 'dark';

  return (
    <View style={[styles.container, { backgroundColor: ui.card, borderBottomColor: ui.border }]}>
      {/* 1. BARRA SUPERIOR INSTITUCIONAL OFICIAL MMM */}
      <View style={styles.brandingRow}>
        <View style={styles.brandLeft}>
          <Image
            source={isDark ? require('../../assets/logo_light.png') : require('../../assets/logo_color.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.brandTextCol}>
            <Text numberOfLines={1} style={[styles.churchSub, { color: ui.mutedForeground }]}>
              IGLESIA CRISTIANA PENTECOSTÉS VENEZUELA
            </Text>
            <Text numberOfLines={1} style={[styles.churchTitle, { color: ui.foreground }]}>
              MOVIMIENTO MISIONERO MUNDIAL
            </Text>
          </View>
        </View>

        {/* ACCIONES SUPERIORES */}
        <View style={styles.actionsRow}>
          {/* BADGE DE USUARIO / PERFIL */}
          {user && (
            <TouchableOpacity
              style={[styles.userBadgeBtn, { backgroundColor: ui.muted, borderColor: ui.border }]}
              onPress={() => setUserProfileDialogOpen(true)}
            >
              <ShieldCheck size={14} color={ui.brand} />
              <Text style={[styles.userBadgeText, { color: ui.foreground }]} numberOfLines={1}>
                {user.es_supervisor ? 'Supervisor' : `Zona ${user.zona}`}
              </Text>
            </TouchableOpacity>
          )}

          {/* SELECTOR DE TEMA */}
          <TouchableOpacity
            style={[styles.actionIconBtn, { backgroundColor: ui.muted, borderColor: ui.border }]}
            onPress={() => setThemeDialogOpen(true)}
            accessibilityLabel="Cambiar tema"
          >
            {themeMode === 'system' ? (
              <Smartphone size={16} color={ui.brand} />
            ) : isDark ? (
              <Moon size={16} color="#38bdf8" />
            ) : (
              <Sun size={16} color="#f59e0b" />
            )}
          </TouchableOpacity>

          {/* CONFIGURACIÓN SERVIDOR */}
          {onOpenServerConfig && (
            <TouchableOpacity
              style={[styles.actionIconBtn, { backgroundColor: ui.muted, borderColor: ui.border }]}
              onPress={onOpenServerConfig}
              accessibilityLabel="Configurar servidor"
            >
              {serverOnline ? (
                <Settings2 size={16} color={ui.mutedForeground} />
              ) : (
                <CloudOff size={16} color={ui.destructive} />
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 2. MODAL DE SELECCIÓN DE TEMA */}
      <Dialog open={themeDialogOpen} onOpenChange={setThemeDialogOpen}>
        <DialogHeader>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Palette size={20} color={ui.brand} />
            <DialogTitle>Tema Visual</DialogTitle>
          </View>
          <DialogDescription>
            Personalice la apariencia del panel ejecutivo:
          </DialogDescription>
        </DialogHeader>

        <View style={styles.dialogOptionsList}>
          <TouchableOpacity
            style={[
              styles.themeOptionItem,
              {
                backgroundColor: ui.muted,
                borderColor: themeMode === 'dark' ? ui.brand : ui.border,
              },
            ]}
            onPress={() => {
              setThemeMode('dark');
              setThemeDialogOpen(false);
            }}
          >
            <Moon size={18} color="#38bdf8" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[styles.optionTitle, { color: ui.foreground }]}>Tema Oscuro (Sentinela HUD)</Text>
              <Text style={[styles.optionSub, { color: ui.mutedForeground }]}>Fondo Zinc-950 de alta concentración</Text>
            </View>
            {themeMode === 'dark' && <Badge variant="brand">ACTIVO</Badge>}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.themeOptionItem,
              {
                backgroundColor: ui.muted,
                borderColor: themeMode === 'light' ? ui.brand : ui.border,
              },
            ]}
            onPress={() => {
              setThemeMode('light');
              setThemeDialogOpen(false);
            }}
          >
            <Sun size={18} color="#f59e0b" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[styles.optionTitle, { color: ui.foreground }]}>Tema Claro</Text>
              <Text style={[styles.optionSub, { color: ui.mutedForeground }]}>Fondo Slate limpio y logotipo a color</Text>
            </View>
            {themeMode === 'light' && <Badge variant="brand">ACTIVO</Badge>}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.themeOptionItem,
              {
                backgroundColor: ui.muted,
                borderColor: themeMode === 'system' ? ui.brand : ui.border,
              },
            ]}
            onPress={() => {
              setThemeMode('system');
              setThemeDialogOpen(false);
            }}
          >
            <Smartphone size={18} color={ui.brand} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[styles.optionTitle, { color: ui.foreground }]}>Automático (Sistema)</Text>
              <Text style={[styles.optionSub, { color: ui.mutedForeground }]}>Sigue la apariencia del dispositivo</Text>
            </View>
            {themeMode === 'system' && <Badge variant="brand">ACTIVO</Badge>}
          </TouchableOpacity>
        </View>
      </Dialog>

      {/* 3. MODAL DE PERFIL DEL USUARIO / PRESBÍTERO */}
      {user && (
        <Dialog open={userProfileDialogOpen} onOpenChange={setUserProfileDialogOpen}>
          <DialogHeader>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <ShieldCheck size={20} color={ui.brand} />
              <DialogTitle>Sesión de Liderazgo</DialogTitle>
            </View>
            <DialogDescription>
              Información de su cuenta y preferencias de alerta:
            </DialogDescription>
          </DialogHeader>

          <View style={styles.dialogOptionsList}>
            {/* CARD DE DATOS */}
            <View style={[styles.profileCard, { backgroundColor: ui.muted, borderColor: ui.border }]}>
              <Text style={[styles.profileName, { color: ui.foreground }]}>{user.name}</Text>
              <Text style={[styles.profileEmail, { color: ui.mutedForeground }]}>{user.email}</Text>
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
                {user.es_supervisor ? (
                  <Badge variant="brand">SUPERVISOR NACIONAL</Badge>
                ) : (
                  <Badge variant="brand">PRESBÍTERO ZONA {user.zona}</Badge>
                )}
              </View>
            </View>

            {/* OPCIÓN HUELLA */}
            {biometricsAvailable && (
              <TouchableOpacity
                style={[styles.prefRow, { backgroundColor: ui.muted, borderColor: ui.border }]}
                onPress={async () => {
                  if (biometricsEnabled) {
                    await disableBiometrics();
                  } else {
                    await enableBiometrics();
                  }
                }}
              >
                <Fingerprint size={20} color={ui.brand} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={[styles.optionTitle, { color: ui.foreground }]}>Acceso con Huella</Text>
                  <Text style={[styles.optionSub, { color: ui.mutedForeground }]}>
                    {biometricsEnabled ? 'Habilitado en este teléfono' : 'Desactivado'}
                  </Text>
                </View>
                <Badge variant={biometricsEnabled ? 'success' : 'outline'}>
                  {biometricsEnabled ? 'ACTIVO' : 'ACTIVAR'}
                </Badge>
              </TouchableOpacity>
            )}

            {/* MODO SILENCIOSO */}
            <TouchableOpacity
              style={[styles.prefRow, { backgroundColor: ui.muted, borderColor: ui.border }]}
              onPress={toggleModoSilencioso}
            >
              {user.push_modo_silencioso ? (
                <BellOff size={20} color={ui.warning} />
              ) : (
                <Bell size={20} color={ui.success} />
              )}
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.optionTitle, { color: ui.foreground }]}>Modo Silencioso / Plenaria</Text>
                <Text style={[styles.optionSub, { color: ui.mutedForeground }]}>
                  {user.push_modo_silencioso ? 'Sonido pausado' : 'Alertas audibles activas'}
                </Text>
              </View>
              <Badge variant={user.push_modo_silencioso ? 'warning' : 'success'}>
                {user.push_modo_silencioso ? 'SILENCIADO' : 'SONIDO'}
              </Badge>
            </TouchableOpacity>

            {/* CERRAR SESIÓN */}
            <Button
              variant="destructive"
              onPress={async () => {
                setUserProfileDialogOpen(false);
                await logout();
              }}
              style={{ marginTop: 8 }}
            >
              Cerrar Sesión
            </Button>
          </View>
        </Dialog>
      )}
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
    marginRight: 6,
  },
  logo: {
    width: 34,
    height: 34,
    marginRight: 8,
  },
  brandTextCol: {
    flex: 1,
    justifyContent: 'center',
  },
  churchSub: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  churchTitle: {
    fontFamily: 'CocogooseBold',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: -0.2,
    marginTop: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userBadgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 32,
    paddingHorizontal: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: 5,
  },
  userBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  actionIconBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogOptionsList: {
    gap: 10,
    marginTop: 14,
  },
  themeOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: radius.lg,
    borderWidth: 1.5,
  },
  optionTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  optionSub: {
    fontSize: 11,
    marginTop: 1,
  },
  profileCard: {
    padding: 12,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  profileName: {
    fontSize: 14,
    fontWeight: '800',
  },
  profileEmail: {
    fontSize: 12,
    marginTop: 1,
  },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
});

