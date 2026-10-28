import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Card } from './ui/Card';
import { Progress } from './ui/Progress';
import { Badge, BadgeVariant } from './ui/Badge';
import { Sparkline } from './ui/Sparkline';
import { radius, useTheme, MdiIcon } from './ui/theme';

interface MetricCardProps {
  title: string;
  value: string;
  percent: number;
  subtext: string;
  iconName: string;
  type?: 'cpu' | 'ram' | 'disk' | 'net';
  badgeLabel?: string;
  badgeVariant?: BadgeVariant;
  percentLabel?: string;
  sparklineData?: number[];
  sparklineColor?: string;
  style?: StyleProp<ViewStyle>;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  percent,
  subtext,
  iconName,
  type,
  badgeLabel: customBadgeLabel,
  badgeVariant: customBadgeVariant,
  percentLabel,
  sparklineData,
  sparklineColor,
  style,
}) => {
  const { ui, resolvedTheme } = useTheme();
  const isCritical = percent >= 90;
  const isWarning = percent >= 75 && percent < 90;

  const defaultBadgeVariant: BadgeVariant = isCritical ? 'destructive' : isWarning ? 'warning' : 'outline';
  const defaultBadgeLabel = isCritical ? 'CRÍTICO' : isWarning ? 'ALTO' : 'ÓPTIMO';

  const badgeVariant = customBadgeVariant || defaultBadgeVariant;
  const badgeLabel = customBadgeLabel || defaultBadgeLabel;

  return (
    <Card style={[styles.card, style]}>
      {/* HEADER DE LA TARJETA */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={[styles.iconBox, { backgroundColor: ui.muted, borderColor: ui.border }]}>
            <MdiIcon name={iconName} size={15} color={ui.brand} />
          </View>
          <Text style={[styles.title, { color: ui.mutedForeground }]} numberOfLines={1}>
            {title}
          </Text>
        </View>
        <Badge variant={badgeVariant} size="sm">
          {badgeLabel}
        </Badge>
      </View>

      {/* VALOR PRINCIPAL Y PORCENTAJE */}
      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: ui.foreground }]} numberOfLines={1}>
          {value}
        </Text>
        <Text style={[styles.percentText, { color: ui.mutedForeground }]} numberOfLines={1}>
          {percentLabel || `${Math.round(percent)}%`}
        </Text>
      </View>

      {/* BARRA DE PROGRESO */}
      <Progress
        value={Math.max(percent, type === 'net' ? 6 : 0)}
        height={5}
        style={{ marginVertical: 8 }}
      />

      {/* SUBTEXTO */}
      <Text style={[styles.subtext, { color: ui.subtle }]} numberOfLines={1} ellipsizeMode="tail">
        {subtext}
      </Text>

      {sparklineData && sparklineData.length > 1 && (
        <Sparkline
          data={sparklineData}
          color={sparklineColor || (isCritical ? ui.destructive : isWarning ? ui.warning : ui.brand)}
          label="Historial (15 min)"
        />
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: radius.xl,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  titleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconBox: {
    width: 26,
    height: 26,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  title: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    flex: 1,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 6,
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  percentText: {
    fontSize: 13,
    fontWeight: '700',
  },
  subtext: {
    fontSize: 11,
    fontWeight: '500',
  },
});
