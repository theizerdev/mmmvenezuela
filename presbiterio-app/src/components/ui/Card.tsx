import React from 'react';
import { View, Text, StyleSheet, ViewProps, TextProps } from 'react-native';
import { radius, useTheme } from './theme';

export const Card: React.FC<ViewProps> = ({ style, ...props }) => {
  const { ui, resolvedTheme } = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: ui.card,
          borderColor: ui.border,
          shadowOpacity: resolvedTheme === 'dark' ? 0.35 : 0.08,
        },
        style,
      ]}
      {...props}
    />
  );
};

export const CardHeader: React.FC<ViewProps> = ({ style, ...props }) => <View style={[styles.header, style]} {...props} />;

export const CardTitle: React.FC<TextProps> = ({ style, ...props }) => {
  const { ui } = useTheme();
  return <Text accessibilityRole="header" style={[styles.title, { color: ui.cardForeground }, style]} {...props} />;
};

export const CardDescription: React.FC<TextProps> = ({ style, ...props }) => {
  const { ui } = useTheme();
  return <Text style={[styles.description, { color: ui.mutedForeground }, style]} {...props} />;
};

export const CardContent: React.FC<ViewProps> = ({ style, ...props }) => <View style={[styles.content, style]} {...props} />;

export const CardFooter: React.FC<ViewProps> = ({ style, ...props }) => {
  const { ui } = useTheme();
  return <View style={[styles.footer, { borderTopColor: ui.border }, style]} {...props} />;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    shadowColor: '#000',
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  header: {
    padding: 24,
    paddingBottom: 0,
    gap: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.4,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  content: {
    padding: 24,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
