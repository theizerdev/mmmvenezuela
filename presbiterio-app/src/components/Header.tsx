import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import {
  Moon,
  Sun,
  Smartphone,
  Settings2,
  ShieldCheck,
  KeyRound,
  Bell,
  BellOff,
  Palette,
  CloudOff,
} from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Actividad } from '../types';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from './ui/Dialog';
import { SetupQuickAccessModal } from './SetupQuickAccessModal';
import { radius } from './ui/theme';

interface HeaderProps {
  actividad?: Actividad | null;
  onOpenServerConfig?: () => void;
  serverOnline?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenServerConfig,
  serverOnline = true,
}) => {
  const { ui, resolvedTheme, themeMode, setThemeMode } = useTheme();
  const {
    user,
    logout,
    toggleModoSilencioso,
    biometricsEnabled,
    hasPinConfigured,
    platformAuthName,
  } = useAuth();

  const [themeDialogOpen, setThemeDialogOpen] = useState(false);
  const [userProfileDialogOpen, setUserProfileDialogOpen] = useState(false);
  const [quickAccessModalOpen, setQuickAccessModalOpen] = useState(false);

  const isDark = resolvedTheme === 'dark';

  return (
    <View style={[styles.container, { backgroundColor: ui.card, borderBottomColor: ui.border }]}>
      <View style={styles.responsiveInner}>
        {/* 1. BARRA SUPERIOR INSTITUCIONAL COMPACTA SHADCN */}
        <View style={styles.brandingRow}>
          <View style={styles.brandLeft}>
            <Image
              source={
                isDark
                  ? require('../../assets/logo_light.png')
                  : require('../../assets/logo_color.png')
              }
              style={styles.logo}
              resizeMode="contain"
            />
            <View style={styles.brandTextCol}>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[styles.churchSub, { color: ui.mutedForeground }]}
              >
                MMM VENEZUELA • PRESBITERIO
              </Text>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[styles.churchTitle, { color: ui.foreground }]}
              >
                Movimiento Misionero Mundial
              </Text>
            </View>
          </View>

          {/* ACCIONES SUPERIORES */}
          <View style={styles.actionsRow}>
            {user && (
              <TouchableOpacity
                style={[styles.userBadgeBtn, { backgroundColor: ui.muted, borderColor: ui.border }]}
                onPress={() => setUserProfileDialogOpen(true)}
                activeOpacity={0.7}
              >
                <ShieldCheck size={13} color={ui.brand} />
                <Text
                  style={[styles.userBadgeText, { color: ui.foreground }]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {user.es_supervisor ? 'Supervisor' : `Zona ${user.zona}`}
                </Text>
              </TouchableOpacity>
            )}

            {/* SELECTOR DE TEMA */}
            <TouchableOpacity
              style={[styles.actionIconBtn, { backgroundColor: ui.muted, borderColor: ui.border }]}
              onPress={() => setThemeDialogOpen(true)}
              accessibilityLabel="Cambiar tema"
              activeOpacity={0.7}
            >
              {themeMode === 'system' ? (
                <Smartphone size={14} color={ui.brand} />
              ) : isDark ? (
                <Moon size={14} color="#38bdf8" />
              ) : (
                <Sun size={14} color="#f59e0b" />
              )}
            </TouchableOpacity>

            {/* CONFIGURACIÓN SERVIDOR */}
            {onOpenServerConfig && (
              <TouchableOpacity
                style={[styles.actionIconBtn, { backgroundColor: ui.muted, borderColor: ui.border }]}
                onPress={onOpenServerConfig}
                accessibilityLabel="Configurar servidor"
                activeOpacity={0.7}
              >
                {serverOnline ? (
                  <Settings2 size={14} color={ui.mutedForeground} />
                ) : (
                  <CloudOff size={14} color={ui.destructive} />
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* 2. MODAL DE SELECCIÓN DE TEMA */}
      <Dialog open={themeDialogOpen} onOpenChange={setThemeDialogOpen}>
        <DialogHeader>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Palette size={18} color={ui.brand} />
            <DialogTitle>Tema Visual</DialogTitle>
          </View>
          <DialogDescription>Personalice la apariencia del panel ejecutivo:</DialogDescription>
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
            <Moon size={16} color="#38bdf8" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[styles.optionTitle, { color: ui.foreground }]}
              >
                Tema Oscuro
              </Text>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[styles.optionSub, { color: ui.mutedForeground }]}
              >
                Fondo oscuro de alto contraste
              </Text>
            </View>
            {themeMode === 'dark' && <Badge variant="brand" size="sm">ACTIVO</Badge>}
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
            <Sun size={16} color="#f59e0b" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[styles.optionTitle, { color: ui.foreground }]}
              >
                Tema Claro
              </Text>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[styles.optionSub, { color: ui.mutedForeground }]}
              >
                Fondo claro limpio e institucional
              </Text>
            </View>
            {themeMode === 'light' && <Badge variant="brand" size="sm">ACTIVO</Badge>}
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
            <Smartphone size={16} color={ui.brand} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[styles.optionTitle, { color: ui.foreground }]}
              >
                Automático (Sistema)
              </Text>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[styles.optionSub, { color: ui.mutedForeground }]}
              >
                Sigue la apariencia del dispositivo
              </Text>
            </View>
            {themeMode === 'system' && <Badge variant="brand" size="sm">ACTIVO</Badge>}
          </TouchableOpacity>
        </View>
      </Dialog>

      {/* 3. MODAL DE PERFIL DEL USUARIO / PRESBÍTERO */}
      {user && (
        <Dialog open={userProfileDialogOpen} onOpenChange={setUserProfileDialogOpen}>
          <DialogHeader>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <ShieldCheck size={18} color={ui.brand} />
              <DialogTitle>Sesión de Liderazgo</DialogTitle>
            </View>
            <DialogDescription>
              Información de su cuenta y preferencias de acceso:
            </DialogDescription>
          </DialogHeader>

          <View style={styles.dialogOptionsList}>
            {/* CARD DE DATOS */}
            <View style={[styles.profileCard, { backgroundColor: ui.muted, borderColor: ui.border }]}>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[styles.profileName, { color: ui.foreground }]}
              >
                {user.name}
              </Text>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[styles.profileEmail, { color: ui.mutedForeground }]}
              >
                {user.email}
              </Text>
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
                {user.es_supervisor ? (
                  <Badge variant="brand" size="sm">SUPERVISOR NACIONAL</Badge>
                ) : (
                  <Badge variant="brand" size="sm">PRESBÍTERO ZONA {user.zona}</Badge>
                )}
              </View>
            </View>

            {/* OPCIÓN CONFIGURAR LLAVE DE ACCESO RÁPIDO */}
            <TouchableOpacity
              style={[styles.prefRow, { backgroundColor: ui.muted, borderColor: ui.border }]}
              onPress={() => {
                setUserProfileDialogOpen(false);
                setQuickAccessModalOpen(true);
              }}
            >
              <KeyRound size={18} color={ui.brand} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={[styles.optionTitle, { color: ui.foreground }]}
                >
                  {/Windows/i.test(platformAuthName)
                    ? 'Windows Hello / Llave de Acceso'
                    : 'Llave de Acceso del Dispositivo'}
                </Text>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={[styles.optionSub, { color: ui.mutedForeground }]}
                >
                  {hasPinConfigured && biometricsEnabled
                    ? 'PIN y Biometría activos'
                    : biometricsEnabled
                    ? 'Sensor biométrico activo'
                    : hasPinConfigured
                    ? 'PIN numérico configurado'
                    : 'Configurar acceso rápido'}
                </Text>
              </View>
              <Badge variant={hasPinConfigured || biometricsEnabled ? 'success' : 'outline'} size="sm">
                {hasPinConfigured || biometricsEnabled ? 'ACTIVO' : 'AJUSTAR'}
              </Badge>
            </TouchableOpacity>

            {/* MODO SILENCIOSO */}
            <TouchableOpacity
              style={[styles.prefRow, { backgroundColor: ui.muted, borderColor: ui.border }]}
              onPress={toggleModoSilencioso}
            >
              {user.push_modo_silencioso ? (
                <BellOff size={18} color={ui.warning} />
              ) : (
                <Bell size={18} color={ui.success} />
              )}
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={[styles.optionTitle, { color: ui.foreground }]}
                >
                  Modo Silencioso / Plenaria
                </Text>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={[styles.optionSub, { color: ui.mutedForeground }]}
                >
                  {user.push_modo_silencioso ? 'Sonido pausado' : 'Alertas audibles activas'}
                </Text>
              </View>
              <Badge variant={user.push_modo_silencioso ? 'warning' : 'success'} size="sm">
                {user.push_modo_silencioso ? 'SILENCIADO' : 'SONIDO'}
              </Badge>
            </TouchableOpacity>

            {/* CERRAR SESIÓN */}
            <Button
              variant="destructive"
              size="default"
              fullWidth
              onPress={async () => {
                setUserProfileDialogOpen(false);
                await logout();
              }}
              style={{ marginTop: 4 }}
            >
              Cerrar Sesión
            </Button>
          </View>
        </Dialog>
      )}

      {/* MODAL CONFIGURACIÓN LLAVE DE ACCESO */}
      <SetupQuickAccessModal
        visible={quickAccessModalOpen}
        onClose={() => setQuickAccessModalOpen(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  responsiveInner: {
    width: '100%',
    maxWidth: 1100,
    alignSelf: 'center',
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
    minWidth: 0,
  },
  logo: {
    width: 32,
    height: 32,
    marginRight: 8,
  },
  brandTextCol: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
  },
  churchSub: {
    fontSize: 8.5,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  churchTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginTop: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  userBadgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 30,
    paddingHorizontal: 8,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: 4,
    maxWidth: 115,
  },
  userBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  actionIconBtn: {
    width: 30,
    height: 30,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogOptionsList: {
    gap: 8,
    marginTop: 12,
  },
  themeOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  optionTitle: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  optionSub: {
    fontSize: 11,
    marginTop: 1,
  },
  profileCard: {
    padding: 10,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  profileName: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  profileEmail: {
    fontSize: 11.5,
    marginTop: 1,
  },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: radius.md,
    borderWidth: 1,
  },
});
