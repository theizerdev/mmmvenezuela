import React, { forwardRef, useState, useRef, useImperativeHandle } from 'react';
import {
  View,
  TextInput,
  TextInputProps,
  StyleSheet,
  Pressable,
  StyleProp,
  ViewStyle,
  Platform,
} from 'react-native';
import { MdiIcon } from './Icon';
import { radius, fonts, noOutline, useTheme } from './theme';

export interface InputProps extends TextInputProps {
  invalid?: boolean;
  leftIcon?: string;
  /** Renders a show/hide toggle for secure fields. */
  revealable?: boolean;
  mono?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

export const Input = forwardRef<any, InputProps>(
  (
    {
      invalid,
      leftIcon,
      revealable,
      mono,
      multiline,
      secureTextEntry,
      containerStyle,
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

    const borderColor = invalid
      ? ui.destructiveBorder
      : focused
      ? ui.brand
      : ui.border;

    const ringStyle =
      focused && Platform.OS === 'web'
        ? ({ boxShadow: `0 0 0 2px ${ui.brandSoft || 'rgba(0, 240, 255, 0.2)'}` } as any)
        : {};

    return (
      <Pressable
        onPress={() => inputRef.current?.focus()}
        style={[
          styles.wrapper,
          multiline && styles.wrapperMultiline,
          {
            borderColor,
            backgroundColor: resolvedTheme === 'dark' ? 'rgba(255,255,255,0.03)' : '#FFFFFF',
          },
          ringStyle,
          !editable && { opacity: 0.5 },
          containerStyle,
        ]}
      >
        {leftIcon && (
          <MdiIcon
            name={leftIcon}
            size={16}
            color={focused ? ui.brand : ui.mutedForeground}
            style={[styles.leftIcon, multiline && { marginTop: 2 }]}
          />
        )}
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
              styles.reveal,
              (s.hovered || s.pressed) && { backgroundColor: ui.accent },
              noOutline,
            ]}
          >
            <MdiIcon
              name={revealed ? 'eye-off' : 'eye'}
              size={16}
              color={ui.mutedForeground}
            />
          </Pressable>
        )}
      </Pressable>
    );
  }
);
Input.displayName = 'Input';

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 42,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 12,
  },
  wrapperMultiline: {
    height: 120,
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  leftIcon: {
    marginRight: 8,
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
  reveal: {
    marginLeft: 6,
    padding: 4,
    borderRadius: radius.sm,
  },
});
