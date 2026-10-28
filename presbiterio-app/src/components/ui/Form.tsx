import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { MdiIcon } from './Icon';
import { ui, useTheme } from './theme';

export const Label: React.FC<{
  children: React.ReactNode;
  invalid?: boolean;
  nativeID?: string;
  style?: StyleProp<TextStyle>;
}> = ({
  children,
  invalid,
  nativeID,
  style,
}) => {
  const { ui } = useTheme();
  return (
    <Text
      nativeID={nativeID}
      style={[
        styles.label,
        { color: invalid ? ui.destructiveForeground : ui.foreground },
        style,
      ]}
    >
      {children}
    </Text>
  );
};

interface FormFieldProps {
  label?: string;
  optional?: boolean;
  description?: string;
  error?: string | null;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  trailing?: React.ReactNode;
}

/** Label + control + description/message, mirroring shadcn's <FormItem>. */
export const FormField: React.FC<FormFieldProps> = ({ label, optional, description, error, children, style, trailing }) => {
  const { ui } = useTheme();
  return (
    <View style={[styles.field, style]}>
      {(label || trailing) && (
        <View style={styles.labelRow}>
          {label && (
            <Label invalid={!!error}>
              {label}
              {optional && <Text style={[styles.optional, { color: ui.subtle }]}>  (opcional)</Text>}
            </Label>
          )}
          {trailing}
        </View>
      )}
      {children}
      {error ? (
        <View style={styles.messageRow} accessibilityLiveRegion="polite">
          <MdiIcon name="alert-circle" size={13} color={ui.destructive} style={{ marginRight: 5, marginTop: 1 }} />
          <Text style={[styles.error, { color: ui.destructiveForeground }]}>{error}</Text>
        </View>
      ) : description ? (
        <Text style={[styles.description, { color: ui.mutedForeground }]}>{description}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  field: {
    gap: 8,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    color: ui.foreground,
    fontSize: 14,
    fontWeight: '500',
  },
  optional: {
    color: ui.subtle,
    fontWeight: '400',
    fontSize: 13,
  },
  description: {
    color: ui.mutedForeground,
    fontSize: 12.5,
    lineHeight: 18,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  error: {
    flex: 1,
    color: ui.destructiveForeground,
    fontSize: 12.5,
    fontWeight: '500',
    lineHeight: 18,
  },
});
