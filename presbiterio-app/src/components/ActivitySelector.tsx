import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import {
  Calendar,
  ChevronRight,
  Check,
  MapPin,
  Users,
} from 'lucide-react-native';
import { Actividad, Sesion } from '../types';
import { useTheme } from '../context/ThemeContext';
import { Badge } from './ui/Badge';
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from './ui/Dialog';
import { radius } from './ui/theme';

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
  const { ui, resolvedTheme } = useTheme();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: ui.background, borderBottomColor: ui.border }]}>
      <View style={styles.responsiveInner}>
        <TouchableOpacity
          style={[
            styles.selectorBar,
            {
              backgroundColor: ui.card,
              borderColor: ui.border,
            },
          ]}
          onPress={() => setDialogOpen(true)}
          activeOpacity={0.8}
        >
        {/* ICONO CALENDARIO */}
        <View style={[styles.iconBox, { backgroundColor: ui.brandSoft }]}>
          <Calendar size={18} color={ui.brand} />
        </View>

        {/* DATOS DE LA ACTIVIDAD */}
        <View style={styles.textContainer}>
          <View style={styles.labelRow}>
            <View style={[styles.liveDot, { backgroundColor: ui.success }]} />
            <Text style={[styles.microLabel, { color: ui.mutedForeground }]}>
              ACTIVIDAD NACIONAL SELECCIONADA
            </Text>
          </View>

          <Text style={[styles.activityName, { color: ui.foreground }]} numberOfLines={1}>
            {actividadActual?.nombre || (loading ? 'Cargando actividad...' : 'Sin actividad activa')}
          </Text>

          <Text style={[styles.sesionSubtitle, { color: ui.mutedForeground }]} numberOfLines={1}>
            {sesionActual ? `• ${sesionActual.nombre}` : 'Sesión General'}
            {actividadActual?.lugar ? ` (${actividadActual.lugar})` : ''}
          </Text>
        </View>

        {/* CONTADOR DE PRESENTES */}
        <View style={styles.rightGroup}>
          <View style={[styles.attendeesBadge, { backgroundColor: ui.successSoft, borderColor: ui.border }]}>
            <Users size={12} color={ui.success} style={{ marginRight: 3 }} />
            <Text style={[styles.attendeesCount, { color: ui.foreground }]}>
              {actividadActual?.total_presentes ?? 0}
            </Text>
            <Text style={[styles.attendeesLabel, { color: ui.success }]}>
              PRESENTES
            </Text>
          </View>

          <ChevronRight size={16} color={ui.mutedForeground} />
        </View>
      </TouchableOpacity>
      </View>

      {/* MODAL DIALOG */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogHeader>
          <DialogTitle>Actividades Nacionales</DialogTitle>
          <DialogDescription>
            Seleccione el evento convocado para filtrar los datos:
          </DialogDescription>
        </DialogHeader>

        <ScrollView style={{ maxHeight: 380, marginTop: 10 }}>
          {actividades.map((item, index) => {
            const isSelected = item.id === actividadActual?.id;
            return (
              <View
                key={`act-${item.id ?? index}`}
                style={[
                  styles.activityItemCard,
                  {
                    backgroundColor: ui.card,
                    borderColor: isSelected ? ui.brand : ui.border,
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.activityItemHeader}
                  onPress={() => {
                    onSelectActividad(item);
                    setDialogOpen(false);
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.activityItemTitle, { color: ui.foreground }]}>
                      {item.nombre}
                    </Text>
                    <View style={styles.activityItemSubRow}>
                      <MapPin size={12} color={ui.mutedForeground} />
                      <Text style={[styles.activityItemDate, { color: ui.mutedForeground }]}>
                        {item.lugar || 'Sede Nacional MMM'} • {item.fecha}
                      </Text>
                    </View>
                  </View>
                  {isSelected && <Badge variant="brand">SELECCIONADO</Badge>}
                </TouchableOpacity>

                {/* SESIONES */}
                {isSelected && item.sesiones && item.sesiones.length > 0 && (
                  <View style={[styles.sessionsBox, { borderTopColor: ui.border }]}>
                    <Text style={[styles.sessionsHeader, { color: ui.mutedForeground }]}>
                      BLOQUES DE ACTIVIDAD:
                    </Text>
                    <View style={styles.sessionsGrid}>
                      {item.sesiones.map((ses, sIndex) => {
                        const isSesSelected = ses.id === sesionActual?.id;
                        return (
                          <TouchableOpacity
                            key={`ses-${ses.id ?? sIndex}`}
                            style={[
                              styles.sessionChip,
                              {
                                backgroundColor: isSesSelected ? ui.brandSoft : ui.muted,
                                borderColor: isSesSelected ? ui.brand : ui.border,
                              },
                            ]}
                            onPress={() => {
                              onSelectSesion(ses);
                              setDialogOpen(false);
                            }}
                          >
                            <Text
                              style={[
                                styles.sessionChipText,
                                {
                                  color: isSesSelected ? ui.brand : ui.foreground,
                                  fontWeight: isSesSelected ? '800' : '600',
                                },
                              ]}
                            >
                              {ses.nombre}
                            </Text>
                            {isSesSelected && <Check size={12} color={ui.brand} style={{ marginLeft: 4 }} />}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
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
  responsiveInner: {
    width: '100%',
    maxWidth: 1100,
    alignSelf: 'center',
  },
  selectorBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.xl,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  microLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  activityName: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 17,
  },
  sesionSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 6,
  },
  attendeesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  attendeesCount: {
    fontSize: 13,
    fontWeight: '800',
    marginRight: 4,
  },
  attendeesLabel: {
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  activityItemCard: {
    borderRadius: radius.lg,
    borderWidth: 1.5,
    marginBottom: 10,
    overflow: 'hidden',
  },
  activityItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  activityItemTitle: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  activityItemSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  activityItemDate: {
    fontSize: 11,
  },
  sessionsBox: {
    borderTopWidth: 1,
    padding: 10,
  },
  sessionsHeader: {
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  sessionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  sessionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  sessionChipText: {
    fontSize: 11,
  },
});
