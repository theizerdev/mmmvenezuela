import React from 'react';
import { TextInput, StyleSheet, TextStyle, StyleProp, TextInputProps } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export interface InputProps extends TextInputProps {
  style?: StyleProp<TextStyle>;
}

export const Input = React.forwardRef<any, InputProps>(
  ({ style, placeholderTextColor, ...props }, ref) => {
    const { colors } = useTheme();

    return (
      <TextInput
        ref={ref}
        placeholderTextColor={placeholderTextColor || colors.textMuted}
        style={[
          styles.input,
          {
            backgroundColor: colors.inputBg,
            borderColor: colors.inputBorder,
            color: colors.text,
          },
          style,
        ]}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '600',
  },
});
