import React, { forwardRef, useState, useRef, useImperativeHandle } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  StyleSheet,
  Pressable,
  StyleProp,
  ViewStyle,
  Platform,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { radius, fonts, noOutline, useTheme } from './theme';

export interface InputProps extends TextInputProps {
  label?: string;
  hint?: string;
  error?: string;
  invalid?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  /** Renders a show/hide toggle for secure fields. */
  revealable?: boolean;
  mono?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  inputContainerStyle?: StyleProp<ViewStyle>;
}

export const Input = forwardRef<any, InputProps>(
  (
    {
      label,
      hint,
      error,
      invalid,
      leftIcon,
      rightIcon,
      revealable,
      mono,
      multiline,
      secureTextEntry,
      containerStyle,
      inputContainerStyle,
      style,
      onFocus,
      onBlur,
      editable = true,
      ...rest
    },
    ref
  ) => {
    const { ui, resolvedTheme } = useTheme();
    const [focused, setFocused] = useState(false);
    const [revealed, setRevealed] = useState(false);
    const inputRef = useRef<any>(null);

    useImperativeHandle(ref, () => inputRef.current);

    const isDark = resolvedTheme === 'dark';
    const isError = !!error || invalid;

    const borderColor = isError
      ? ui.destructiveBorder
      : focused
      ? ui.brand
      : ui.border;

    const ringStyle =
      focused && Platform.OS === 'web'
        ? ({
            boxShadow: `0 0 0 3px ${
              isError
                ? isDark
                  ? 'rgba(239, 68, 68, 0.25)'
                  : 'rgba(239, 68, 68, 0.2)'
                : isDark
                ? 'rgba(2, 132, 199, 0.35)'
                : 'rgba(2, 132, 199, 0.2)'
            }`,
          } as any)
        : {};

    return (
      <View style={[styles.fieldContainer, containerStyle]}>
        {label && (
          <View style={styles.labelRow}>
            <Text style={[styles.label, { color: ui.foreground }]}>{label}</Text>
            {hint && <Text style={[styles.hint, { color: ui.mutedForeground }]}>{hint}</Text>}
          </View>
        )}

        <Pressable
          onPress={() => inputRef.current?.focus()}
          style={[
            styles.wrapper,
            multiline && styles.wrapperMultiline,
            {
              borderColor,
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#FFFFFF',
            },
            ringStyle,
            !editable && { opacity: 0.5 },
            inputContainerStyle,
          ]}
        >
          {leftIcon && <View style={[styles.iconSlot, { marginRight: 8 }]}>{leftIcon}</View>}

          <TextInput
            ref={inputRef}
            {...rest}
            editable={editable}
            multiline={multiline}
            secureTextEntry={secureTextEntry && !revealed}
            placeholderTextColor={ui.mutedForeground}
            selectionColor={ui.brand}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
            style={[
              styles.input,
              { color: ui.foreground },
              mono && { fontFamily: fonts.mono, fontSize: 13 },
              multiline && styles.inputMultiline,
              noOutline,
              style,
            ]}
          />

          {revealable && secureTextEntry && (
            <Pressable
              onPress={(e) => {
                e?.stopPropagation?.();
                setRevealed((r) => !r);
              }}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={revealed ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              style={(s: any) => [
                styles.revealBtn,
                (s.hovered || s.pressed) && { backgroundColor: ui.accent },
                noOutline,
              ]}
            >
              {revealed ? (
                <EyeOff size={18} color={ui.mutedForeground} />
              ) : (
                <Eye size={18} color={ui.mutedForeground} />
              )}
            </Pressable>
          )}

          {rightIcon && !revealable && (
            <View style={[styles.iconSlot, { marginLeft: 8 }]}>{rightIcon}</View>
          )}
        </Pressable>

        {error && (
          <Text style={[styles.errorText, { color: ui.destructive }]}>{error}</Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  fieldContainer: {
    width: '100%',
    marginBottom: 12,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 12.5,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  hint: {
    fontSize: 11,
  },
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    borderWidth: 1.5,
    borderRadius: radius.lg,
    paddingHorizontal: 12,
  },
  wrapperMultiline: {
    height: 110,
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  iconSlot: {
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    paddingVertical: 0,
  },
  inputMultiline: {
    textAlignVertical: 'top',
    lineHeight: 18,
  },
  revealBtn: {
    padding: 6,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  errorText: {
    fontSize: 11.5,
    fontWeight: '600',
    marginTop: 4,
  },
});
