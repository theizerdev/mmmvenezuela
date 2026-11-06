import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { radius, useTheme } from './theme';

interface ProgressProps {
  value: number; // 0 to 100
  style?: StyleProp<ViewStyle>;
  indicatorColor?: string;
  trackColor?: string;
  height?: number;
}

/** Barra de progreso Shadcn/UI. Usa el tema activo en tiempo real (no tokens estáticos). */
export const Progress: React.FC<ProgressProps> = ({
  value,
  style,
  indicatorColor,
  trackColor,
  height = 6,
}) => {
  const { ui } = useTheme();
  const clamped = Math.min(Math.max(Number.isFinite(value) ? value : 0, 0), 100);

  return (
    <View
      style={[styles.root, { height, backgroundColor: trackColor ?? ui.muted }, style]}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped) }}
    >
      <View
        style={[
          styles.indicator,
          {
            width: `${clamped}%`,
            backgroundColor: indicatorColor ?? ui.brand,
            height,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    width: '100%',
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  indicator: {
    borderRadius: radius.full,
  },
});
