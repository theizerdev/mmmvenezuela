import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { ui, radius } from './theme';

interface ProgressProps {
  value: number; // 0 to 100
  style?: StyleProp<ViewStyle>;
  indicatorColor?: string;
  height?: number;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  style,
  indicatorColor,
  height = 8,
}) => {
  const clamped = Math.min(Math.max(value, 0), 100);
  const color =
    indicatorColor ??
    (clamped >= 90
      ? ui.destructive
      : clamped >= 75
      ? ui.warning
      : ui.foreground);

  return (
    <View style={[styles.root, { height }, style]}>
      <View
        style={[
          styles.indicator,
          {
            width: `${clamped}%`,
            backgroundColor: color,
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
    backgroundColor: ui.muted,
    borderRadius: radius.full,
    overflow: 'hidden',
    position: 'relative',
  },
  indicator: {
    borderRadius: radius.full,
  },
});
