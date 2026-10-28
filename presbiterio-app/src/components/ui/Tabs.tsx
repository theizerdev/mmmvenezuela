import React from 'react';
import { View, Text, Pressable, StyleSheet, StyleProp, ViewStyle, useWindowDimensions } from 'react-native';
import { MdiIcon } from './Icon';
import { radius, noOutline, useTheme } from './theme';

export interface TabItem<T extends string> {
  value: T;
  label: string;
  shortLabel?: string;
  icon?: string;
  badge?: string | number;
}

interface TabsListProps<T extends string> {
  value: T;
  onValueChange: (value: T) => void;
  items: TabItem<T>[];
  testIDPrefix?: string;
  style?: StyleProp<ViewStyle>;
}

/** Responsive segmented control equivalent to Radix Tabs (TabsList + TabsTrigger). */
export function TabsList<T extends string>({
  value,
  onValueChange,
  items,
  testIDPrefix,
  style,
}: TabsListProps<T>) {
  const { ui, resolvedTheme } = useTheme();
  const { width } = useWindowDimensions();
  const isNarrow = width < 400;

  return (
    <View style={[styles.list, { backgroundColor: ui.muted }, style]} accessibilityRole="tablist">
      {items.map((item) => {
        const active = item.value === value;
        const displayLabel = isNarrow && item.shortLabel ? item.shortLabel : item.label;

        return (
          <Pressable
            key={item.value}
            testID={testIDPrefix ? `${testIDPrefix}-${item.value}` : undefined}
            nativeID={testIDPrefix ? `${testIDPrefix}-${item.value}` : undefined}
            onPress={() => onValueChange(item.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={(s: any) => [
              styles.trigger,
              isNarrow && styles.triggerNarrow,
              active && [
                styles.triggerActive,
                {
                  backgroundColor: ui.card,
                  borderColor: ui.brand,
                  shadowOpacity: resolvedTheme === 'dark' ? 0.3 : 0.08,
                },
              ],
              !active && s.hovered && { backgroundColor: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' },
              noOutline,
            ]}
          >
            {item.icon && (
              <MdiIcon
                name={item.icon}
                size={isNarrow ? 12 : 14}
                color={active ? ui.brand : ui.mutedForeground}
                style={{ marginRight: isNarrow ? 4 : 6 }}
              />
            )}
            <Text
              style={[
                styles.triggerText,
                { color: active ? ui.brand : ui.mutedForeground },
                isNarrow && styles.triggerTextNarrow,
                active && styles.triggerTextActive,
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {displayLabel}
            </Text>

            {item.badge !== undefined && item.badge !== null && item.badge !== 0 ? (
              <View
                style={[
                  styles.badgePill,
                  active
                    ? { backgroundColor: ui.muted }
                    : { backgroundColor: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' },
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    { color: active ? ui.foreground : ui.mutedForeground },
                  ]}
                >
                  {item.badge}
                </Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    flexDirection: 'row',
    borderRadius: radius.lg,
    padding: 3,
    minHeight: 38,
    alignItems: 'center',
    width: '100%',
  },
  trigger: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    paddingVertical: 6,
    paddingHorizontal: 6,
    minHeight: 32,
  },
  triggerNarrow: {
    paddingHorizontal: 4,
    paddingVertical: 5,
  },
  triggerActive: {
    borderWidth: 1,
    shadowColor: '#000',
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  triggerText: {
    fontSize: 12.5,
    fontWeight: '500',
    textAlign: 'center',
  },
  triggerTextNarrow: {
    fontSize: 11.5,
  },
  triggerTextActive: {
    fontWeight: '600',
  },
  badgePill: {
    marginLeft: 5,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
