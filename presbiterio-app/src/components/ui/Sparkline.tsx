import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { ui, radius } from './theme';

interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
  maxVal?: number;
  label?: string;
}

/**
 * High-performance, responsive mini-sparkline bar chart without external dependencies.
 * Visualizes trends over the last metric intervals.
 */
export const Sparkline: React.FC<SparklineProps> = ({
  data,
  color = ui.brand,
  height = 24,
  maxVal,
  label,
}) => {
  if (!data || data.length === 0) {
    return null;
  }

  // Calculate scaling
  const effectiveMax = maxVal || Math.max(...data, 1);
  const min = Math.min(...data);
  const latest = data[data.length - 1];
  const previous = data.length > 1 ? data[data.length - 2] : latest;
  const isRising = latest > previous;
  const isFalling = latest < previous;

  return (
    <View style={styles.container}>
      <View style={[styles.barsContainer, { height }]}>
        {data.map((val, idx) => {
          const ratio = Math.min(Math.max(val / effectiveMax, 0.08), 1);
          const barHeight = Math.max(ratio * height, 2);
          const isLatest = idx === data.length - 1;

          return (
            <View key={idx} style={styles.barSlot}>
              <View
                style={[
                  styles.bar,
                  {
                    height: barHeight,
                    backgroundColor: isLatest ? color : `${color}88`,
                  },
                  isLatest && styles.barActive,
                ]}
              />
            </View>
          );
        })}
      </View>

      <View style={styles.trendRow}>
        {label && <Text style={styles.label}>{label}</Text>}
        <Text style={styles.trendText}>
          {isRising ? '↗ Tendencia al alza' : isFalling ? '↘ Tendencia a la baja' : '→ Estable'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    width: '100%',
    gap: 3,
  },
  barSlot: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    maxWidth: 6,
    borderRadius: radius.sm,
  },
  barActive: {
    opacity: 1,
  },
  trendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  label: {
    fontSize: 9.5,
    color: ui.mutedForeground,
    fontWeight: '500',
  },
  trendText: {
    fontSize: 9,
    color: ui.mutedForeground,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
});
