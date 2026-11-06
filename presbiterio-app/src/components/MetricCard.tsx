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
  const { ui } = useTheme();
  const isCritical = percent >= 90;
  const isWarning = percent >= 75 && percent < 90;

  const defaultBadgeVariant: BadgeVariant = isCritical
    ? 'destructive'
    : isWarning
    ? 'warning'
    : 'outline';
  const defaultBadgeLabel = isCritical ? 'CRÍTICO' : isWarning ? 'ALTO' : 'ÓPTIMO';

  const badgeVariant = customBadgeVariant || defaultBadgeVariant;
  const badgeLabel = customBadgeLabel || defaultBadgeLabel;

  const indicatorColor =
    badgeVariant === 'success'
      ? ui.success
      : badgeVariant === 'warning'
      ? ui.warning
      : badgeVariant === 'destructive'
      ? ui.destructive
      : ui.brand;

  return (
    <Card style={[styles.card, style]}>
      {/* HEADER COMPACTO */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={[styles.iconBox, { backgroundColor: ui.muted, borderColor: ui.border }]}>
            <MdiIcon name={iconName} size={13} color={ui.brand} />
          </View>
          <Text
            style={[styles.title, { color: ui.mutedForeground }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {title}
          </Text>
        </View>
        {badgeLabel ? (
          <Badge variant={badgeVariant} size="sm">
            {badgeLabel}
          </Badge>
        ) : null}
      </View>

      {/* VALOR PRINCIPAL Y PORCENTAJE */}
      <View style={styles.valueRow}>
        <Text
          style={[styles.value, { color: ui.foreground }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {value}
        </Text>
        <Text
          style={[styles.percentText, { color: ui.mutedForeground }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {percentLabel || `${Math.round(percent)}%`}
        </Text>
      </View>

      {/* BARRA DE PROGRESO */}
      <Progress
        value={Math.max(percent, type === 'net' ? 6 : 0)}
        indicatorColor={indicatorColor}
        height={4}
        style={{ marginVertical: 6 }}
      />

      {/* SUBTEXTO CON PUNTOS SUSPENSIVOS */}
      <Text
        style={[styles.subtext, { color: ui.mutedForeground }]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {subtext}
      </Text>

      {sparklineData && sparklineData.length > 1 && (
        <Sparkline
          data={sparklineData}
          color={sparklineColor || indicatorColor}
          label="Historial (15 min)"
        />
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 11,
    borderRadius: radius.lg,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 4,
  },
  titleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    minWidth: 0,
  },
  iconBox: {
    width: 22,
    height: 22,
    borderRadius: radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  title: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    flexShrink: 1,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: 6,
    gap: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  percentText: {
    fontSize: 11,
    fontWeight: '600',
  },
  subtext: {
    fontSize: 10.5,
    fontWeight: '500',
  },
});
