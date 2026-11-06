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
          shadowOpacity: resolvedTheme === 'dark' ? 0.2 : 0.04,
        },
        style,
      ]}
      {...props}
    />
  );
};

export const CardHeader: React.FC<ViewProps> = ({ style, ...props }) => (
  <View style={[styles.header, style]} {...props} />
);

export const CardTitle: React.FC<TextProps> = ({ style, ...props }) => {
  const { ui } = useTheme();
  return (
    <Text
      accessibilityRole="header"
      numberOfLines={1}
      ellipsizeMode="tail"
      style={[styles.title, { color: ui.cardForeground }, style]}
      {...props}
    />
  );
};

export const CardDescription: React.FC<TextProps> = ({ style, ...props }) => {
  const { ui } = useTheme();
  return (
    <Text
      numberOfLines={2}
      ellipsizeMode="tail"
      style={[styles.description, { color: ui.mutedForeground }, style]}
      {...props}
    />
  );
};

export const CardContent: React.FC<ViewProps> = ({ style, ...props }) => (
  <View style={[styles.content, style]} {...props} />
);

export const CardFooter: React.FC<ViewProps> = ({ style, ...props }) => {
  const { ui } = useTheme();
  return <View style={[styles.footer, { borderTopColor: ui.border }, style]} {...props} />;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    shadowColor: '#000',
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  header: {
    padding: 14,
    paddingBottom: 0,
    gap: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  description: {
    fontSize: 12,
    lineHeight: 16,
  },
  content: {
    padding: 14,
  },
  footer: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
});
