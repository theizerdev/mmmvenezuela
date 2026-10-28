import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from './ui/Card';
import { Progress } from './ui/Progress';
import { Badge } from './ui/Badge';
import { Sparkline } from './ui/Sparkline';
import { ui, radius, useTheme, MdiIcon } from './ui/theme';

interface MetricCardProps {
  title: string;
  value: string;
  percent: number;
  subtext: string;
  iconName: string;
  type?: 'cpu' | 'ram' | 'disk' | 'net';
  badgeLabel?: string;
  badgeVariant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning' | 'brand';
  percentLabel?: string;
  sparklineData?: number[];
  sparklineColor?: string;
  style?: any;
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

  const defaultBadgeVariant = isCritical ? 'destructive' : isWarning ? 'warning' : 'outline';
  const defaultBadgeLabel = isCritical ? 'CRÍTICO' : isWarning ? 'ALTO' : 'ÓPTIMO';

  const badgeVariant = customBadgeVariant || defaultBadgeVariant;
  const badgeLabel = customBadgeLabel || defaultBadgeLabel;

  return (
    <Card style={[styles.card, style]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={[styles.iconBox, { backgroundColor: ui.muted, borderColor: ui.border }]}>
            <MdiIcon name={iconName} size={16} color={ui.foreground} />
          </View>
          <Text style={[styles.title, { color: ui.mutedForeground }]} numberOfLines={1}>
            {title}
          </Text>
        </View>
        <Badge variant={badgeVariant}>{badgeLabel}</Badge>
      </View>

      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: ui.foreground }]} numberOfLines={1}>
          {value}
        </Text>
        <Text style={[styles.percentText, { color: ui.mutedForeground }]} numberOfLines={1}>
          {percentLabel || `${percent.toFixed(0)}%`}
        </Text>
      </View>

      <Progress
        value={Math.max(percent, type === 'net' ? 6 : 0)}
        height={6}
        style={{ marginVertical: 8 }}
      />

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
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    backgroundColor: ui.muted,
    borderWidth: 1,
    borderColor: ui.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  title: {
    color: ui.mutedForeground,
    fontSize: 13,
    fontWeight: '500',
    flexShrink: 1,
  },
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 4,
    gap: 8,
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
    color: ui.foreground,
    letterSpacing: -0.5,
    flexShrink: 1,
  },
  percentText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: ui.mutedForeground,
    flexShrink: 0,
  },
  subtext: {
    fontSize: 11.5,
    color: ui.subtle,
    marginTop: 2,
  },
});
