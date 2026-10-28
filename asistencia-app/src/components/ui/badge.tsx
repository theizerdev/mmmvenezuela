import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, StyleProp } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { useTheme } from '../../context/ThemeContext';

export interface BadgeProps
  extends React.ComponentPropsWithoutRef<typeof View>,
    VariantProps<typeof badgeVariants> {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success';
}

const badgeVariants = cva(
  'inline-flex flex-row items-center rounded-lg px-2.5 py-1 text-xs font-bold',
  {
    variants: {
      variant: {
        default: 'bg-indigo-600 text-white',
        secondary: 'bg-slate-800 text-slate-300',
        destructive: 'bg-rose-600 text-white',
        outline: 'border border-slate-700 text-slate-300',
        success: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  style,
  textStyle,
  ...props
}) => {
  const { colors, isDark } = useTheme();

  const getStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'destructive':
        return {
          container: { backgroundColor: colors.danger },
          text: { color: '#ffffff' },
        };
      case 'secondary':
        return {
          container: { backgroundColor: isDark ? '#1e293b' : '#e2e8f0' },
          text: { color: colors.textSecondary },
        };
      case 'outline':
        return {
          container: {
            backgroundColor: isDark ? colors.cardDeep : 'transparent',
            borderWidth: 1,
            borderColor: colors.cardBorder,
          },
          text: { color: colors.textSecondary },
        };
      case 'success':
        return {
          container: {
            backgroundColor: isDark ? colors.success + '20' : colors.successBg,
            borderWidth: 1,
            borderColor: colors.successBorder,
          },
          text: { color: colors.success },
        };
      case 'default':
      default:
        return {
          container: { backgroundColor: colors.primary },
          text: { color: '#ffffff' },
        };
    }
  };

  const { container: vContainer, text: vText } = getStyles();

  return (
    <View style={[styles.badge, vContainer, style]} {...props}>
      {typeof children === 'string' ? (
        <Text style={[styles.text, vText, textStyle]}>{children}</Text>
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
    paddingVertical: 3.5,
    borderRadius: 8,
    gap: 4,
  },
  text: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});

