import React from 'react';
import { Pressable, Text, View, ActivityIndicator, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { radius, noOutline, useTheme } from './theme';

type Variant = 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link' | 'brand';
type Size = 'default' | 'sm' | 'lg' | 'icon';

export interface ButtonProps {
  children?: React.ReactNode;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
  accessibilityLabel?: string;
  testID?: string;
}

const sizeStyles: Record<Size, ViewStyle> = {
  default: { height: 40, paddingHorizontal: 16 },
  sm: { height: 34, paddingHorizontal: 12 },
  lg: { height: 44, paddingHorizontal: 20 },
  icon: { height: 36, width: 36, paddingHorizontal: 0 },
};

export const Button: React.FC<ButtonProps> = ({
  children,
  onPress,
  variant = 'default',
  size = 'default',
  disabled,
  loading,
  leftIcon,
  rightIcon,
  style,
  fullWidth,
  accessibilityLabel,
  testID,
}) => {
  const { ui, resolvedTheme } = useTheme();

  const variantStyles: Record<Variant, { bg: string; bgHover: string; fg: string; border?: string }> = {
    default: {
      bg: ui.primary,
      bgHover: resolvedTheme === 'dark' ? '#E4E4E7' : '#1E293B',
      fg: ui.primaryForeground,
    },
    secondary: {
      bg: ui.secondary,
      bgHover: ui.accent,
      fg: ui.secondaryForeground,
    },
    outline: {
      bg: 'transparent',
      bgHover: ui.muted,
      fg: ui.foreground,
      border: ui.border,
    },
    ghost: {
      bg: 'transparent',
      bgHover: ui.muted,
      fg: ui.foreground,
    },
    destructive: {
      bg: resolvedTheme === 'dark' ? '#7F1D1D' : '#FEE2E2',
      bgHover: resolvedTheme === 'dark' ? '#991B1B' : '#FECACA',
      fg: resolvedTheme === 'dark' ? '#FEF2F2' : '#B91C1C',
      border: resolvedTheme === 'dark' ? undefined : '#FCA5A5',
    },
    link: {
      bg: 'transparent',
      bgHover: 'transparent',
      fg: ui.brand,
    },
    brand: {
      bg: ui.brand,
      bgHover: ui.brand,
      fg: resolvedTheme === 'dark' ? '#000000' : '#FFFFFF',
    },
  };

  const v = variantStyles[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      testID={testID}
      nativeID={testID}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      style={(state: any) => [
        styles.base,
        sizeStyles[size],
        {
          backgroundColor: state.hovered || state.pressed ? v.bgHover : v.bg,
          borderColor: v.border ?? 'transparent',
          borderWidth: v.border ? 1 : 0,
          opacity: isDisabled ? 0.5 : state.pressed ? 0.9 : 1,
        },
        state.focused && { borderColor: ui.ring, borderWidth: 1 },
        fullWidth && { alignSelf: 'stretch' },
        noOutline,
        style,
      ]}
    >
      {(state: any) => (
        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator size="small" color={v.fg} style={children ? { marginRight: 8 } : undefined} />
          ) : (
            leftIcon && <View style={children ? { marginRight: 8 } : undefined}>{leftIcon}</View>
          )}
          {typeof children === 'string' || typeof children === 'number' || (Array.isArray(children) && children.every((c: any) => typeof c === 'string' || typeof c === 'number')) ? (
            <Text
              style={[
                styles.label,
                size === 'sm' && { fontSize: 13 },
                { color: v.fg },
                variant === 'link' && state.hovered && { textDecorationLine: 'underline' },
              ]}
              numberOfLines={1}
            >
              {Array.isArray(children) ? children.join('') : children}
            </Text>
          ) : (
            children
          )}
          {rightIcon && !loading && <View style={children ? { marginLeft: 8 } : undefined}>{rightIcon}</View>}
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
});
