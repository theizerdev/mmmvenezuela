import React from 'react';
import { StyleSheet, View } from 'react-native';
import * as SwitchPrimitive from '@rn-primitives/switch';
import { useTheme } from '../../context/ThemeContext';

export interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  activeColor?: string;
}

export const Switch = React.forwardRef<
  any,
  SwitchProps
>(({ checked, onCheckedChange, activeColor, style, disabled, ...props }, ref) => {
  const { colors, isDark } = useTheme();
  const trackActive = activeColor || colors.primary;

  const flatRootStyle = StyleSheet.flatten([
    styles.root,
    {
      backgroundColor: checked ? trackActive : (isDark ? '#334155' : '#cbd5e1'),
    },
    disabled ? { opacity: 0.5 } : null,
    style,
  ]);

  const flatThumbStyle = StyleSheet.flatten([
    styles.thumb,
    checked ? styles.thumbChecked : null,
  ]);

  return (
    <SwitchPrimitive.Root
      ref={ref}
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      style={flatRootStyle}
      {...props}
    >
      <SwitchPrimitive.Thumb style={flatThumbStyle} />
    </SwitchPrimitive.Root>
  );
});

Switch.displayName = 'Switch';

const styles = StyleSheet.create({
  root: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: 'center',
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2.5,
    elevation: 3,
  },
  thumbChecked: {
    transform: [{ translateX: 20 }],
  },
});
