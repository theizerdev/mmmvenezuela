import React, { createContext, useContext } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

interface DialogContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DialogContext = createContext<DialogContextValue>({
  open: false,
  onOpenChange: () => {},
});

export interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({
  open = false,
  onOpenChange = () => {},
  children,
}) => {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
};

export const DialogTrigger: React.FC<{ children?: React.ReactNode; asChild?: boolean }> = ({
  children,
}) => {
  const { onOpenChange } = useContext(DialogContext);
  return <Pressable onPress={() => onOpenChange(true)}>{children}</Pressable>;
};

export const DialogPortal: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <>{children}</>
);

export const DialogClose: React.FC<{ children?: React.ReactNode; asChild?: boolean }> = ({
  children,
}) => {
  const { onOpenChange } = useContext(DialogContext);
  return <Pressable onPress={() => onOpenChange(false)}>{children}</Pressable>;
};

export const DialogOverlay: React.FC<{ children?: React.ReactNode; style?: StyleProp<ViewStyle> }> = ({
  children,
  style,
}) => <View style={[styles.overlay, style]}>{children}</View>;

export const DialogContent = React.forwardRef<
  any,
  {
    style?: StyleProp<ViewStyle>;
    children?: React.ReactNode;
    hideCloseButton?: boolean;
  }
>(({ style, children, hideCloseButton = false }, ref) => {
  const { colors, isDark } = useTheme();
  const { open, onOpenChange } = useContext(DialogContext);

  if (!open) return null;

  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={() => onOpenChange(false)}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[
          styles.overlay,
          {
            backgroundColor: isDark ? 'rgba(0, 0, 0, 0.76)' : 'rgba(15, 23, 42, 0.55)',
          },
        ]}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => onOpenChange(false)}
          accessibilityRole="button"
          accessibilityLabel="Cerrar modal"
        />

        <View
          ref={ref}
          style={[
            styles.content,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
            },
            style,
          ]}
        >
          {children}
          {!hideCloseButton && (
            <Pressable
              style={styles.closeBtn}
              hitSlop={10}
              onPress={() => onOpenChange(false)}
              accessibilityRole="button"
              accessibilityLabel="Cerrar"
            >
              <X size={18} color={colors.textSecondary} />
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
});
DialogContent.displayName = 'DialogContent';

export const DialogHeader = ({ style, ...props }: React.ComponentPropsWithoutRef<typeof View>) => (
  <View style={[styles.header, style]} {...props} />
);
DialogHeader.displayName = 'DialogHeader';

export const DialogFooter = ({ style, ...props }: React.ComponentPropsWithoutRef<typeof View>) => (
  <View style={[styles.footer, style]} {...props} />
);
DialogFooter.displayName = 'DialogFooter';

export const DialogTitle = React.forwardRef<
  any,
  { style?: StyleProp<TextStyle>; children?: React.ReactNode }
>(({ style, children }, ref) => {
  const { colors } = useTheme();
  return (
    <Text ref={ref} style={[styles.title, { color: colors.text }, style]}>
      {children}
    </Text>
  );
});
DialogTitle.displayName = 'DialogTitle';

export const DialogDescription = React.forwardRef<
  any,
  { style?: StyleProp<TextStyle>; children?: React.ReactNode }
>(({ style, children }, ref) => {
  const { colors } = useTheme();
  return (
    <Text ref={ref} style={[styles.description, { color: colors.textSecondary }, style]}>
      {children}
    </Text>
  );
});
DialogDescription.displayName = 'DialogDescription';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 20,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
    zIndex: 10,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4,
    zIndex: 20,
  },
  header: {
    marginBottom: 14,
    paddingRight: 24,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  description: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.2)',
  },
});
