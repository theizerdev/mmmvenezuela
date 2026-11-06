import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { Button } from '../ui/Button';

interface ActionButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'outline';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** Wrapper sobre el Button de Shadcn/UI para mantener consistencia hermética. */
export const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  onPress,
  loading,
  disabled,
  variant = 'primary',
  leftIcon,
  rightIcon,
  style,
}) => {
  return (
    <Button
      variant={variant === 'primary' ? 'brand' : 'outline'}
      size="default"
      fullWidth
      onPress={onPress}
      loading={loading}
      disabled={disabled}
      leftIcon={leftIcon}
      rightIcon={rightIcon}
      style={style}
    >
      {label}
    </Button>
  );
};
