import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { radius, useTheme } from './theme';

export type BadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning' | 'brand';
export type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  style,
  textStyle,
  icon,
}) => {
  const { ui, resolvedTheme } = useTheme();

  const isDark = resolvedTheme === 'dark';

  const variants: Record<BadgeVariant, { bg: string; border: string; fg: string }> = {
    default: {
      bg: ui.primary,
      border: 'transparent',
      fg: ui.primaryForeground,
    },
    secondary: {
      bg: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
      border: ui.border,
      fg: ui.secondaryForeground,
    },
    outline: {
      bg: 'transparent',
      border: ui.border,
      fg: ui.foreground,
    },
    destructive: {
      bg: ui.destructiveSoft,
      border: ui.destructiveBorder,
      fg: ui.destructive,
    },
    success: {
      bg: isDark ? 'rgba(34, 197, 94, 0.15)' : 'rgba(22, 163, 74, 0.12)',
      border: isDark ? 'rgba(34, 197, 94, 0.4)' : 'rgba(22, 163, 74, 0.35)',
      fg: isDark ? '#4ade80' : '#15803d',
    },
    warning: {
      bg: isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(217, 119, 6, 0.12)',
      border: isDark ? 'rgba(245, 158, 11, 0.4)' : 'rgba(217, 119, 6, 0.35)',
      fg: isDark ? '#fbbf24' : '#b45309',
    },
    brand: {
      bg: isDark ? 'rgba(2, 132, 199, 0.18)' : 'rgba(2, 132, 199, 0.12)',
      border: isDark ? 'rgba(56, 189, 248, 0.4)' : 'rgba(2, 132, 199, 0.35)',
      fg: isDark ? '#38bdf8' : '#0284c7',
    },
  };

  const sizes: Record<BadgeSize, { padH: number; padV: number; fontSize: number; gap: number }> = {
    sm: { padH: 6, padV: 2, fontSize: 10, gap: 3 },
    md: { padH: 8, padV: 3, fontSize: 11, gap: 4 },
    lg: { padH: 10, padV: 4.5, fontSize: 12, gap: 5 },
  };

  const v = variants[variant] || variants.default;
  const s = sizes[size] || sizes.md;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: v.bg,
          borderColor: v.border,
          paddingHorizontal: s.padH,
          paddingVertical: s.padV,
          gap: s.gap,
        },
        style,
      ]}
    >
      {icon && <View style={{ flexShrink: 0 }}>{icon}</View>}
      {React.isValidElement(children) ? (
        children
      ) : (
        <Text
          numberOfLines={1}
          style={[
            styles.text,
            {
              color: v.fg,
              fontSize: s.fontSize,
            },
            textStyle,
          ]}
        >
          {children}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
    flexShrink: 0,
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
});
