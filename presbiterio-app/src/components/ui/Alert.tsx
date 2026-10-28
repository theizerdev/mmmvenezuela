import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, StyleProp, ViewStyle } from 'react-native';
import { MdiIcon } from './Icon';
import { radius, useTheme } from './theme';

interface AlertProps {
  variant?: 'default' | 'destructive' | 'success';
  title: string;
  description?: string;
  icon?: string;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({ variant = 'default', title, description, icon, style, children }) => {
  const { ui, resolvedTheme } = useTheme();
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fade.setValue(0);
    Animated.timing(fade, { toValue: 1, duration: 180, useNativeDriver: true }).start();
  }, [title, description]);

  const palette =
    variant === 'destructive'
      ? {
          bg: ui.destructiveSoft,
          border: ui.destructiveBorder,
          fg: resolvedTheme === 'dark' ? ui.destructiveForeground : ui.destructive,
          icon: ui.destructive,
        }
      : variant === 'success'
      ? {
          bg: ui.successSoft,
          border: resolvedTheme === 'dark' ? 'rgba(34,197,94,0.4)' : 'rgba(22,163,74,0.4)',
          fg: resolvedTheme === 'dark' ? '#86EFAC' : '#15803D',
          icon: ui.success,
        }
      : { bg: ui.muted, border: ui.border, fg: ui.foreground, icon: ui.brand };

  const iconName = icon ?? (variant === 'destructive' ? 'alert-circle-outline' : variant === 'success' ? 'check-circle-outline' : 'information-outline');

  return (
    <Animated.View
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
      style={[
        styles.alert,
        { backgroundColor: palette.bg, borderColor: palette.border, opacity: fade, transform: [{ translateY: fade.interpolate({ inputRange: [0, 1], outputRange: [-4, 0] }) }] },
        style,
      ]}
    >
      <MdiIcon name={iconName} size={16} color={palette.icon} style={{ marginTop: 1, marginRight: 10 }} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, { color: palette.fg }]}>{title}</Text>
        {description ? <Text style={[styles.description, { color: palette.fg, opacity: 0.9 }]}>{description}</Text> : null}
        {typeof children === 'string' ? (
          <Text style={[styles.description, { color: palette.fg, opacity: 0.9 }]}>{children}</Text>
        ) : (
          children
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  alert: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  description: {
    fontSize: 12.5,
    lineHeight: 18,
  },
});
