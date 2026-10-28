import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as TabsPrimitive from '@rn-primitives/tabs';
import { useTheme } from '../../context/ThemeContext';

export const Tabs = TabsPrimitive.Root;

export const TabsList = React.forwardRef<
  any,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ style, ...props }, ref) => {
  const { colors, isDark } = useTheme();
  const flatStyle = StyleSheet.flatten([
    styles.list,
    {
      backgroundColor: isDark ? colors.cardDeep : '#e2e8f0',
      borderColor: colors.cardBorder,
    },
    style,
  ]);

  return (
    <TabsPrimitive.List
      ref={ref}
      style={flatStyle}
      {...props}
    />
  );
});
TabsList.displayName = 'TabsList';

export const TabsTrigger = React.forwardRef<
  any,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
    children?: React.ReactNode;
  }
>(({ style, children, value, ...props }, ref) => {
  const { colors } = useTheme();
  const { value: selectedValue } = TabsPrimitive.useRootContext();
  const isSelected = selectedValue === value;

  const flatStyle = StyleSheet.flatten([
    styles.trigger,
    isSelected ? styles.triggerActive : null,
    isSelected ? { backgroundColor: colors.primary } : null,
    style,
  ]);

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      value={value}
      style={flatStyle}
      {...props}
    >
      {typeof children === 'string' ? (
        <Text
          style={[
            styles.triggerText,
            { color: isSelected ? '#ffffff' : colors.textSecondary },
          ]}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </TabsPrimitive.Trigger>
  );
});
TabsTrigger.displayName = 'TabsTrigger';

export const TabsContent = React.forwardRef<
  any,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ style, ...props }, ref) => {
  const flatStyle = StyleSheet.flatten([styles.content, style]);
  return (
    <TabsPrimitive.Content
      ref={ref}
      style={flatStyle}
      {...props}
    />
  );
});
TabsContent.displayName = 'TabsContent';

const styles = StyleSheet.create({
  list: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 3,
    gap: 3,
  },
  trigger: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 9,
    gap: 6,
  },
  triggerActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  triggerText: {
    fontSize: 13,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
});
