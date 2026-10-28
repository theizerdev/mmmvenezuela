import React from 'react';
import { View, Text, StyleSheet, ViewProps, TextProps } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export const Card = React.forwardRef<any, ViewProps>(
  ({ style, ...props }, ref) => {
    const { colors, isDark } = useTheme();
    return (
      <View
        ref={ref}
        style={[
          styles.card,
          {
            backgroundColor: isDark ? colors.card : '#ffffff',
            borderColor: colors.cardBorder,
          },
          style,
        ]}
        {...props}
      />
    );
  }
);
Card.displayName = 'Card';

export const CardHeader = React.forwardRef<any, ViewProps>(
  ({ style, ...props }, ref) => <View ref={ref} style={[styles.header, style]} {...props} />
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<any, TextProps>(
  ({ style, ...props }, ref) => {
    const { colors } = useTheme();
    return <Text ref={ref} style={[styles.title, { color: colors.text }, style]} {...props} />;
  }
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef<any, TextProps>(
  ({ style, ...props }, ref) => {
    const { colors } = useTheme();
    return <Text ref={ref} style={[styles.description, { color: colors.textSecondary }, style]} {...props} />;
  }
);
CardDescription.displayName = 'CardDescription';

export const CardContent = React.forwardRef<any, ViewProps>(
  ({ style, ...props }, ref) => <View ref={ref} style={[styles.content, style]} {...props} />
);
CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef<any, ViewProps>(
  ({ style, ...props }, ref) => <View ref={ref} style={[styles.footer, style]} {...props} />
);
CardFooter.displayName = 'CardFooter';

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    marginBottom: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  description: {
    fontSize: 13,
    marginTop: 3,
    lineHeight: 18,
  },
  content: {
    // padding area
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 14,
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.2)',
  },
});
