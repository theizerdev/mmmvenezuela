import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as AvatarPrimitive from '@rn-primitives/avatar';
import { useTheme } from '../../context/ThemeContext';

export const Avatar = React.forwardRef<
  any,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ style, ...props }, ref) => {
  const { colors } = useTheme();
  const flatStyle = StyleSheet.flatten([
    styles.root,
    {
      borderColor: colors.cardBorder,
      backgroundColor: colors.cardDeep,
    },
    style,
  ]);

  return (
    <AvatarPrimitive.Root
      ref={ref}
      style={flatStyle}
      {...props}
    />
  );
});
Avatar.displayName = 'Avatar';

export const AvatarImage = React.forwardRef<
  any,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ style, ...props }, ref) => {
  const flatStyle = StyleSheet.flatten([styles.image, style]);
  return (
    <AvatarPrimitive.Image
      ref={ref}
      style={flatStyle}
      {...props}
    />
  );
});
AvatarImage.displayName = 'AvatarImage';

export const AvatarFallback = React.forwardRef<
  any,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ style, children, ...props }, ref) => {
  const { isDark } = useTheme();
  const flatStyle = StyleSheet.flatten([
    styles.fallback,
    { backgroundColor: isDark ? '#1e293b' : '#e2e8f0' },
    style,
  ]);

  return (
    <AvatarPrimitive.Fallback
      ref={ref}
      style={flatStyle}
      {...props}
    >
      {typeof children === 'string' ? (
        <Text style={[styles.fallbackText, { color: isDark ? '#f8fafc' : '#0f172a' }]}>
          {children}
        </Text>
      ) : (
        children
      )}
    </AvatarPrimitive.Fallback>
  );
});
AvatarFallback.displayName = 'AvatarFallback';

const styles = StyleSheet.create({
  root: {
    width: 80,
    height: 80,
    borderRadius: 20,
    borderWidth: 1.5,
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
