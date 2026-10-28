import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import {
  Calendar,
  ChevronRight,
  Check,
  MapPin,
  Users,
} from 'lucide-react-native';
import { Actividad, Sesion } from '../types';
import { useTheme } from '../context/ThemeContext';
import {
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui';

interface ActivitySelectorProps {
  actividades: Actividad[];
  actividadActual: Actividad | null;
  sesionActual: Sesion | null;
  onSelectActividad: (actividad: Actividad) => void;
  onSelectSesion: (sesion: Sesion) => void;
  loading?: boolean;
}

export const ActivitySelector: React.FC<ActivitySelectorProps> = ({
  actividades,
  actividadActual,
  sesionActual,
  onSelectActividad,
  onSelectSesion,
  loading = false,
}) => {
  const { colors, isDark } = useTheme();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, borderBottomColor: colors.cardBorder }]}>
      <Pressable
        style={({ pressed }) => [
          styles.selectorBar,
          {
            backgroundColor: isDark ? colors.cardDeep : '#ffffff',
            borderColor: colors.cardBorder,
          },
          pressed && { opacity: 0.88 },
        ]}
        onPress={() => setDialogOpen(true)}
      >
        {/* ICONO CALENDARIO */}
        <View style={[styles.iconBox, { backgroundColor: isDark ? '#1e1b4b' : '#ede9fe' }]}>
          <Calendar size={18} color={colors.primary} />
        </View>

        {/* DATOS DE LA ACTIVIDAD */}
        <View style={styles.textContainer}>
          <View style={styles.labelRow}>
            <View style={styles.liveDot} />
            <Text style={[styles.microLabel, { color: colors.textSecondary }]}>
              ACTIVIDAD NACIONAL SELECCIONADA
            </Text>
          </View>

          <Text style={[styles.activityName, { color: colors.text }]} numberOfLines={1}>
            {actividadActual?.nombre || (loading ? 'Cargando actividad...' : 'Sin actividad activa')}
          </Text>

          <Text style={[styles.sesionSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
            {sesionActual ? `• ${sesionActual.nombre}` : 'Sesión General'}
            {actividadActual?.lugar ? ` (${actividadActual.lugar})` : ''}
          </Text>
        </View>

        {/* CONTADOR DE PRESENTES (BADGE SHADCN) */}
        <View style={styles.rightGroup}>
          <View style={[styles.attendeesBadge, { backgroundColor: colors.successBg, borderColor: colors.successBorder }]}>
            <Users size={13} color={colors.success} style={{ marginRight: 3 }} />
            <Text style={[styles.attendeesCount, { color: colors.text }]}>
              {actividadActual?.total_presentes ?? 0}
            </Text>
            <Text style={[styles.attendeesLabel, { color: colors.success }]}>
              PRESENTES
            </Text>
          </View>

          <ChevronRight size={18} color={colors.textSecondary} />
        </View>
      </Pressable>

      {/* DIALOG SHADCN / RADIX PRIMITIVE */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent style={{ maxHeight: '85%' }}>
          <DialogHeader>
            <DialogTitle>Actividades y Sesiones</DialogTitle>
            <DialogDescription>
              Seleccione la actividad y el bloque para la acreditación:
            </DialogDescription>
          </DialogHeader>

          <ScrollView style={{ maxHeight: 380, marginTop: 10 }}>
            {actividades.map((item) => {
              const isSelected = item.id === actividadActual?.id;
              return (
                <View
                  key={item.id}
                  style={[
                    styles.activityItemCard,
                    {
                      backgroundColor: isDark ? colors.cardDeep : '#f8fafc',
                      borderColor: isSelected ? colors.primary : colors.cardBorder,
                    },
                  ]}
                >
                  <Pressable
                    style={styles.activityItemHeader}
                    onPress={() => {
                      onSelectActividad(item);
                      if (item.sesiones.length <= 1) {
                        setDialogOpen(false);
                      }
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={[styles.activityItemTitle, { color: colors.text }]}>
                          {item.nombre}
                        </Text>
                        <Badge variant="secondary">
                          <Text style={{ fontSize: 10, fontWeight: '700' }}>{item.tipo}</Text>
                        </Badge>
                      </View>
                      <Text style={[styles.activityItemDates, { color: colors.textSecondary }]}>
                        {item.lugar || 'Nacional'} • {item.fecha_inicio} al {item.fecha_fin}
                      </Text>
                    </View>

                    {isSelected && <Check size={18} color={colors.primary} />}
                  </Pressable>

                  {/* SESIONES DISPONIBLES */}
                  {item.sesiones && item.sesiones.length > 0 && (
                    <View style={styles.sessionsGroup}>
                      <Text style={[styles.sessionsHeaderTitle, { color: colors.textSecondary }]}>
                        BLOQUES / SESIONES:
                      </Text>
                      {item.sesiones.map((ses) => {
                        const isSesionActive = isSelected && ses.id === sesionActual?.id;
                        return (
                          <Pressable
                            key={ses.id}
                            style={[
                              styles.sessionRow,
                              {
                                backgroundColor: isSesionActive ? colors.primary : (isDark ? colors.card : '#ffffff'),
                                borderColor: isSesionActive ? colors.primary : colors.cardBorder,
                              },
                            ]}
                            onPress={() => {
                              onSelectActividad(item);
                              onSelectSesion(ses);
                              setDialogOpen(false);
                            }}
                          >
                            <Text
                              style={[
                                styles.sessionText,
                                { color: isSesionActive ? '#ffffff' : colors.text },
                              ]}
                            >
                              {ses.nombre}
                            </Text>
                            {isSesionActive && <Check size={14} color="#ffffff" />}
                          </Pressable>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>
        </DialogContent>
      </Dialog>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  selectorBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  microLabel: {
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  activityName: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 1,
  },
  sesionSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 8,
  },
  attendeesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  attendeesCount: {
    fontSize: 13,
    fontWeight: '900',
  },
  attendeesLabel: {
    fontSize: 8.5,
    fontWeight: '800',
  },
  activityItemCard: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 12,
    marginBottom: 10,
  },
  activityItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activityItemTitle: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  activityItemDates: {
    fontSize: 11,
    marginTop: 2,
  },
  sessionsGroup: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.2)',
    gap: 5,
  },
  sessionsHeaderTitle: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  sessionText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
