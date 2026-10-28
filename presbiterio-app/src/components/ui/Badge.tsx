import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { radius, useTheme } from './theme';

type BadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning' | 'brand';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  style?: StyleProp<ViewStyle>;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', style, icon }) => {
  const { ui, resolvedTheme } = useTheme();

  const variants: Record<BadgeVariant, { bg: string; border: string; fg: string }> = {
    default: { bg: ui.primary, border: 'transparent', fg: ui.primaryForeground },
    secondary: { bg: ui.secondary, border: ui.border, fg: ui.secondaryForeground },
    outline: { bg: 'transparent', border: ui.border, fg: ui.foreground },
    destructive: { bg: ui.destructiveSoft, border: ui.destructiveBorder, fg: ui.destructive },
    success: {
      bg: ui.successSoft,
      border: resolvedTheme === 'dark' ? 'rgba(34, 197, 94, 0.35)' : 'rgba(22, 163, 74, 0.35)',
      fg: resolvedTheme === 'dark' ? '#86EFAC' : '#15803D',
    },
    warning: {
      bg: resolvedTheme === 'dark' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(217, 119, 6, 0.12)',
      border: resolvedTheme === 'dark' ? 'rgba(245, 158, 11, 0.35)' : 'rgba(217, 119, 6, 0.35)',
      fg: resolvedTheme === 'dark' ? '#FCD34D' : '#B45309',
    },
    brand: {
      bg: ui.brandSoft,
      border: ui.brand,
      fg: ui.brand,
    },
  };

  const v = variants[variant];
  return (
    <View style={[styles.badge, { backgroundColor: v.bg, borderColor: v.border }, style]}>
      {icon && <View style={{ marginRight: 4 }}>{icon}</View>}
      {typeof children === 'string' ? (
        <Text style={[styles.text, { color: v.fg }]}>{children}</Text>
      ) : (
        children
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: radius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
