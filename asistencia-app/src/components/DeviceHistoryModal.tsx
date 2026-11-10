import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import {
  Smartphone,
  CheckCircle2,
  CloudOff,
  Clock,
  Heart,
  Trash2,
  X,
  History,
  ShieldCheck,
} from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { DeviceHistoryItem } from '../types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Badge,
  Button,
} from './ui';

interface DeviceHistoryModalProps {
  visible: boolean;
  onClose: () => void;
}

export const DeviceHistoryModal: React.FC<DeviceHistoryModalProps> = ({
  visible,
  onClose,
}) => {
  const { colors, isDark } = useTheme();
  const [historyItems, setHistoryItems] = useState<DeviceHistoryItem[]>([]);
  const [deviceName, setDeviceName] = useState<string>(api.getDeviceName());

  const reloadData = useCallback(() => {
    setDeviceName(api.getDeviceName());
    setHistoryItems(api.getDeviceHistory());
  }, []);

  useEffect(() => {
    if (visible) {
      reloadData();
    }
  }, [visible, reloadData]);

  const handleClearHistory = () => {
    Alert.alert(
      'Limpiar Historial Local',
      '¿Está seguro de que desea limpiar el registro local de este terminal? Las asistencias ya sincronizadas no se perderán en el servidor.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpiar',
          style: 'destructive',
          onPress: async () => {
            await api.clearDeviceHistory();
            reloadData();
          },
        },
      ]
    );
  };

  const totalCount = historyItems.length;
  const syncedCount = historyItems.filter((h) => h.estado === 'sincronizado').length;
  const offlineCount = historyItems.filter((h) => h.estado === 'en_cola_offline').length;

  return (
    <Dialog open={visible} onOpenChange={(open) => !open && onClose()}>
      <DialogContent style={styles.dialogContent}>
        <DialogHeader>
          <View style={styles.headerTitleRow}>
            <View style={styles.titleWithIcon}>
              <History size={20} color={colors.primary} />
              <DialogTitle>Histórico de este Dispositivo</DialogTitle>
            </View>
          </View>
          <DialogDescription>
            Registro de marcajes y acreditaciones efectuadas exclusivamente desde esta terminal:
          </DialogDescription>
        </DialogHeader>

        {/* NOMBRE DE LA TERMINAL Y CONTADORES */}
        <View style={[styles.terminalCard, { backgroundColor: isDark ? '#0f172a' : '#f1f5f9', borderColor: colors.cardBorder }]}>
          <View style={styles.terminalNameRow}>
            <Smartphone size={16} color={colors.primary} />
            <Text style={[styles.terminalNameText, { color: colors.text }]}>
              {deviceName}
            </Text>
          </View>

          <View style={styles.kpiRow}>
            <View style={styles.kpiItem}>
              <Text style={[styles.kpiValue, { color: colors.text }]}>{totalCount}</Text>
              <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Total Marcados</Text>
            </View>

            <View style={[styles.kpiDivider, { backgroundColor: colors.cardBorder }]} />

            <View style={styles.kpiItem}>
              <Text style={[styles.kpiValue, { color: colors.success }]}>{syncedCount}</Text>
              <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Sincronizados</Text>
            </View>

            <View style={[styles.kpiDivider, { backgroundColor: colors.cardBorder }]} />

            <View style={styles.kpiItem}>
              <Text style={[styles.kpiValue, { color: colors.warning }]}>{offlineCount}</Text>
              <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>En Cola</Text>
            </View>
          </View>
        </View>

        {/* LISTADO DE ASISTENCIAS DEL DISPOSITIVO */}
        <ScrollView style={styles.listScrollView} contentContainerStyle={styles.listScrollContent}>
          {historyItems.length === 0 ? (
            <View style={styles.emptyContainer}>
              <History size={36} color={colors.textSecondary} style={{ opacity: 0.4, marginBottom: 8 }} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                Aún no hay marcajes en este terminal
              </Text>
              <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                Los obreros registrados desde este equipo aparecerán aquí con su estado de sincronización.
              </Text>
            </View>
          ) : (
            historyItems.map((item, idx) => {
              const photoUri = item.foto ? api.resolveImageUrl(item.foto) : null;
              const parts = (item.nombre_completo || 'P').trim().split(' ');
              const initials = `${parts[0]?.charAt(0) || ''}${parts[1]?.charAt(0) || ''}`.toUpperCase() || 'P';

              return (
                <View
                  key={item.id || idx}
                  style={[
                    styles.itemRow,
                    { borderBottomColor: colors.cardBorder },
                    idx === historyItems.length - 1 && { borderBottomWidth: 0 },
                  ]}
                >
                  <Avatar alt={item.nombre_completo} style={styles.itemAvatar}>
                    {photoUri ? <AvatarImage source={{ uri: photoUri }} /> : null}
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>

                  <View style={styles.itemInfo}>
                    <View style={styles.itemTopLine}>
                      <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>
                        {item.nombre_completo}
                      </Text>
                      {item.asistio_con_conyuge && (
                        <Badge variant="secondary" style={styles.spouseBadge}>
                          <Heart size={10} color="#ec4899" fill="#ec4899" style={{ marginRight: 3 }} />
                          <Text style={styles.spouseBadgeText}>+Cónyuge</Text>
                        </Badge>
                      )}
                    </View>

                    <Text style={[styles.itemSub, { color: colors.textSecondary }]} numberOfLines={1}>
                      {item.documento} • {item.zona ? `Zona ${item.zona}` : 'Nacional'} • {item.extension_nombre}
                    </Text>

                    <View style={styles.itemMetaRow}>
                      <Clock size={11} color={colors.textSecondary} style={{ marginRight: 3 }} />
                      <Text style={[styles.itemTime, { color: colors.textSecondary }]}>
                        {item.hora} • {item.sesion}
                      </Text>
                    </View>
                  </View>

                  <Badge
                    variant={item.estado === 'sincronizado' ? 'success' : 'outline'}
                    style={styles.statusBadge}
                  >
                    {item.estado === 'sincronizado' ? (
                      <CheckCircle2 size={11} color={colors.success} style={{ marginRight: 3 }} />
                    ) : (
                      <CloudOff size={11} color={colors.warning} style={{ marginRight: 3 }} />
                    )}
                    <Text
                      style={[
                        styles.statusBadgeText,
                        { color: item.estado === 'sincronizado' ? colors.success : colors.warning },
                      ]}
                    >
                      {item.estado === 'sincronizado' ? 'Sincronizado' : 'Offline'}
                    </Text>
                  </Badge>
                </View>
              );
            })
          )}
        </ScrollView>

        {/* ACCIONES DEL MODAL */}
        <View style={styles.modalActions}>
          {historyItems.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onPress={handleClearHistory}
              style={{ borderColor: colors.cardBorder }}
            >
              <Trash2 size={14} color={colors.danger} style={{ marginRight: 4 }} />
              <Text style={{ color: colors.danger, fontSize: 12, fontWeight: '700' }}>
                Limpiar Local
              </Text>
            </Button>
          )}

          <Button
            variant="default"
            size="sm"
            onPress={onClose}
            style={{ flex: 1, marginLeft: historyItems.length > 0 ? 8 : 0 }}
          >
            <Text style={{ color: '#ffffff', fontWeight: '800' }}>Cerrar</Text>
          </Button>
        </View>
      </DialogContent>
    </Dialog>
  );
};

const styles = StyleSheet.create({
  dialogContent: {
    maxHeight: '85%',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  terminalCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    marginBottom: 8,
  },
  terminalNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  terminalNameText: {
    fontSize: 13,
    fontWeight: '800',
  },
  kpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  kpiItem: {
    alignItems: 'center',
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 1,
  },
  kpiDivider: {
    width: 1,
    height: 24,
  },
  listScrollView: {
    maxHeight: 280,
    marginVertical: 4,
  },
  listScrollContent: {
    paddingVertical: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
  },
  itemAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
  },
  itemInfo: {
    flex: 1,
    marginRight: 6,
  },
  itemTopLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  spouseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  spouseBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#ec4899',
  },
  itemSub: {
    fontSize: 11,
    marginTop: 1,
  },
  itemMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  itemTime: {
    fontSize: 10,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
});

