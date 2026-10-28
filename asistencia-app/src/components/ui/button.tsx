import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { useTheme } from '../../context/ThemeContext';

const buttonVariants = cva(
  'flex-row items-center justify-center font-bold transition-all',
  {
    variants: {
      variant: {
        default: '',
        destructive: '',
        outline: '',
        secondary: '',
        ghost: '',
        link: '',
      },
      size: {
        default: 'h-11 px-4',
        sm: 'h-9 px-3',
        lg: 'h-12 px-6',
        icon: 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ComponentPropsWithoutRef<typeof Pressable>,
    VariantProps<typeof buttonVariants> {
  children?: React.ReactNode;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Button = React.forwardRef<any, ButtonProps>(
  (
    {
      children,
      variant = 'default',
      size = 'default',
      loading = false,
      disabled,
      style,
      textStyle,
      ...props
    },
    ref
  ) => {
    const { colors, isDark } = useTheme();

    const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
      switch (variant) {
        case 'destructive':
          return {
            container: { backgroundColor: colors.danger },
            text: { color: '#ffffff' },
          };
        case 'outline':
          return {
            container: {
              backgroundColor: isDark ? colors.card : '#ffffff',
              borderWidth: 1,
              borderColor: colors.cardBorder,
            },
            text: { color: colors.text },
          };
        case 'secondary':
          return {
            container: {
              backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
              borderWidth: 1,
              borderColor: colors.cardBorder,
            },
            text: { color: colors.text },
          };
        case 'ghost':
          return {
            container: { backgroundColor: 'transparent' },
            text: { color: colors.text },
          };
        case 'link':
          return {
            container: { backgroundColor: 'transparent' },
            text: { color: colors.primary, textDecorationLine: 'underline' },
          };
        case 'default':
        default:
          return {
            container: {
              backgroundColor: colors.primary,
              shadowColor: '#4f46e5',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 2,
            },
            text: { color: '#ffffff' },
          };
      }
    };

    const getSizeStyles = (): ViewStyle => {
      switch (size) {
        case 'sm':
          return { height: 36, paddingHorizontal: 12, borderRadius: 8 };
        case 'lg':
          return { height: 48, paddingHorizontal: 20, borderRadius: 12 };
        case 'icon':
          return { width: 40, height: 40, padding: 0, borderRadius: 10, alignItems: 'center', justifyContent: 'center' };
        case 'default':
        default:
          return { height: 44, paddingHorizontal: 16, borderRadius: 10 };
      }
    };

    const { container: vContainer, text: vText } = getVariantStyles();
    const sContainer = getSizeStyles();

    return (
      <Pressable
        ref={ref}
        disabled={disabled || loading}
        style={({ pressed }) => [
          styles.base,
          vContainer,
          sContainer,
          pressed && { opacity: 0.85, transform: [{ scale: 0.985 }] },
          disabled && { opacity: 0.45 },
          style,
        ]}
        {...props}
      >
        {loading ? (
          <ActivityIndicator size="small" color={vText.color || '#ffffff'} />
        ) : typeof children === 'string' ? (
          <Text
            style={[
              styles.text,
              vText,
              size === 'sm' && { fontSize: 12 },
              size === 'lg' && { fontSize: 15, fontWeight: '800' },
              textStyle,
            ]}
          >
            {children}
          </Text>
        ) : (
          children
        )}
      </Pressable>
    );
  }
);

Button.displayName = 'Button';

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  text: {
    fontSize: 13.5,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
});
