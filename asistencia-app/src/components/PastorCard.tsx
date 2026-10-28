import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  CheckCircle2,
  AlertTriangle,
  BadgeCheck,
  Heart,
  ArrowLeft,
  Check,
  Church,
  MapPin,
  CreditCard,
} from 'lucide-react-native';
import { Pastor, AsistenciaPrevia } from '../types';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import {
  Card,
  Badge,
  Button,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Switch,
} from './ui';

interface PastorCardProps {
  pastor: Pastor;
  asistioConConyuge: boolean;
  onToggleConyuge: (value: boolean) => void;
  onConfirmar: () => void;
  onCancelar?: () => void;
  loading?: boolean;
  yaRegistrado?: boolean;
  asistenciaPrevia?: AsistenciaPrevia | null;
  exitoRegistro?: boolean;
  horaRegistroExitoso?: string;
}

export const PastorCard: React.FC<PastorCardProps> = ({
  pastor,
  asistioConConyuge,
  onToggleConyuge,
  onConfirmar,
  onCancelar,
  loading = false,
  yaRegistrado = false,
  asistenciaPrevia,
  exitoRegistro = false,
  horaRegistroExitoso,
}) => {
  const { colors, isDark } = useTheme();

  const photoUri = pastor.foto ? api.resolveImageUrl(pastor.foto) : null;
  const initials = `${pastor.nombres?.charAt(0) || ''}${pastor.apellidos?.charAt(0) || ''}`.toUpperCase() || 'P';

  return (
    <Card style={styles.card}>
      {/* 1. BANNER DE ALERTA O ÉXITO (SHADCN ALERT) */}
      {yaRegistrado && (
        <View style={[styles.statusAlert, { backgroundColor: colors.warningBg, borderColor: colors.warningBorder }]}>
          <AlertTriangle size={18} color={colors.warning} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.statusAlertTitle, { color: colors.warning }]}>
              Asistencia ya registrada en esta sesión
            </Text>
            <Text style={[styles.statusAlertSub, { color: isDark ? '#fde68a' : '#92400e' }]}>
              Registrado a las {asistenciaPrevia?.hora || 'un horario anterior'}
            </Text>
          </View>
        </View>
      )}

      {exitoRegistro && (
        <View style={[styles.statusAlert, { backgroundColor: colors.successBg, borderColor: colors.successBorder }]}>
          <CheckCircle2 size={18} color={colors.success} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.statusAlertTitle, { color: colors.success }]}>
              ¡Asistencia Registrada Exitosamente!
            </Text>
            <Text style={[styles.statusAlertSub, { color: isDark ? '#a7f3d0' : '#065f46' }]}>
              Acreditado en el sistema a las {horaRegistroExitoso || 'ahora'}
            </Text>
          </View>
        </View>
      )}

      {/* 2. CABECERA: AVATAR DE CREDENCIAL + NOMBRES + BADGES */}
      <View style={styles.headerRow}>
        <Avatar alt={pastor.nombre_completo}>
          {photoUri ? <AvatarImage source={{ uri: photoUri }} /> : null}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>

        <View style={styles.headerInfo}>
          <View style={styles.badgesRow}>
            <Badge variant="default" style={styles.rankBadge}>
              <BadgeCheck size={12} color="#ffffff" style={{ marginRight: 3 }} />
              <Text style={styles.badgeTextWhite}>{pastor.nivel_ministerial || 'Obrero'}</Text>
            </Badge>

            <Badge variant="outline">
              <CreditCard size={11} color={colors.textSecondary} style={{ marginRight: 3 }} />
              <Text style={[styles.badgeTextMono, { color: colors.textSecondary }]}>
                {pastor.documento}
              </Text>
            </Badge>

            {pastor.codigo ? (
              <Badge variant="secondary">
                <Text style={[styles.badgeTextMono, { color: colors.textSecondary }]}>
                  CÓD: {pastor.codigo}
                </Text>
              </Badge>
            ) : null}
          </View>

          <Text style={[styles.pastorName, { color: colors.text }]} numberOfLines={2}>
            {pastor.nombre_completo}
          </Text>
        </View>
      </View>

      {/* 3. CAJAS DE INFORMACIÓN: EXTENSIÓN Y SEDE MINISTERIAL */}
      <View style={styles.gridContainer}>
        {/* CAJA EXTENSIÓN DONDE LABORA (REQUERIMIENTO PRINCIPAL) */}
        <View style={[styles.infoPanel, { backgroundColor: isDark ? colors.cardDeep : '#f8fafc', borderColor: colors.cardBorder }]}>
          <View style={styles.panelHeader}>
            <Church size={14} color={colors.indigo} />
            <Text style={[styles.panelSubtitle, { color: colors.textSecondary }]}>
              EXTENSIÓN / IGLESIA DONDE LABORA
            </Text>
          </View>
          <Text style={[styles.panelMainText, { color: colors.text }]} numberOfLines={2}>
            {pastor.extension_nombre || pastor.iglesia || 'Sede Principal MMM'}
          </Text>
          {pastor.extension_estado ? (
            <View style={styles.panelSubRow}>
              <MapPin size={11} color={colors.textMuted} />
              <Text style={[styles.panelSubText, { color: colors.textMuted }]}>
                {pastor.extension_estado}
              </Text>
            </View>
          ) : null}
        </View>

        {/* CAJA PRESBITERIO / ZONA */}
        <View style={[styles.infoPanel, { backgroundColor: isDark ? colors.cardDeep : '#f8fafc', borderColor: colors.cardBorder }]}>
          <View style={styles.panelHeader}>
            <MapPin size={14} color={colors.accent} />
            <Text style={[styles.panelSubtitle, { color: colors.textSecondary }]}>
              PRESBITERIO / ZONA
            </Text>
          </View>
          <Text style={[styles.panelMainText, { color: colors.text }]} numberOfLines={1}>
            {pastor.zona ? `Zona ${pastor.zona}` : 'Nacional'}
            {pastor.distrito ? ` • Distrito ${pastor.distrito}` : ''}
          </Text>
          <Text style={[styles.panelSubText, { color: colors.textMuted }]}>
            {pastor.estado || 'Venezuela'}
          </Text>
        </View>
      </View>

      {/* 4. SECCIÓN CÓNYUGE MINISTERIAL (RADIX SWITCH CON ESTILO SHADCN) */}
      <View style={[styles.spouseBox, { backgroundColor: colors.pinkBg, borderColor: colors.pinkBorder }]}>
        <View style={styles.spouseLeft}>
          <Heart size={18} color="#ec4899" fill="#ec4899" style={{ marginRight: 10 }} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.spouseTitle, { color: colors.pinkText }]}>
              ¿Su cónyuge se encuentra presente?
            </Text>
            <Text style={[styles.spouseSubtitle, { color: colors.text }]} numberOfLines={1}>
              {pastor.nombre_conyuge
                ? `Acreditar a: ${pastor.nombre_conyuge}`
                : 'Acreditar cónyuge ministerial acompañante'}
            </Text>
          </View>
        </View>

        <Switch
          checked={asistioConConyuge}
          onCheckedChange={onToggleConyuge}
          activeColor="#ec4899"
        />
      </View>

      {/* 5. BOTONES DE ACCIÓN SHADCN */}
      <View style={styles.actionsRow}>
        {onCancelar && (
          <Button
            variant="outline"
            onPress={onCancelar}
            disabled={loading}
            style={styles.cancelBtn}
          >
            <ArrowLeft size={16} color={colors.textSecondary} />
            <Text style={{ color: colors.textSecondary, fontWeight: '700' }}>Volver</Text>
          </Button>
        )}

        <Button
          variant={yaRegistrado ? 'secondary' : 'default'}
          onPress={onConfirmar}
          disabled={loading || yaRegistrado}
          loading={loading}
          style={styles.confirmBtn}
        >
          <Check size={18} color="#ffffff" />
          <Text style={styles.confirmBtnText}>
            {yaRegistrado ? 'Ya Registrado' : 'Registrar Asistencia'}
          </Text>
        </Button>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginVertical: 8,
  },
  statusAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
    gap: 10,
  },
  statusAlertTitle: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  statusAlertSub: {
    fontSize: 11,
    marginTop: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginBottom: 6,
  },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeTextWhite: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  badgeTextMono: {
    fontSize: 11,
    fontWeight: '700',
  },
  pastorName: {
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 21,
  },
  gridContainer: {
    gap: 8,
    marginBottom: 12,
  },
  infoPanel: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  panelSubtitle: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  panelMainText: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  panelSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  panelSubText: {
    fontSize: 11,
    fontWeight: '600',
  },
  spouseBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  spouseLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  spouseTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  spouseSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cancelBtn: {
    flex: 1,
  },
  confirmBtn: {
    flex: 2,
  },
  confirmBtnText: {
    color: '#ffffff',
    fontSize: 13.5,
    fontWeight: '800',
  },
});
