import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  StyleProp,
  ViewStyle,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MdiIcon } from './Icon';
import { radius, noOutline, useTheme } from './theme';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
}

export const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children, contentStyle }) => {
  const { ui, resolvedTheme } = useTheme();

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
            backgroundColor: resolvedTheme === 'dark' ? 'rgba(0, 0, 0, 0.78)' : 'rgba(15, 23, 42, 0.55)',
          },
        ]}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => onOpenChange(false)}
          accessibilityRole="button"
          accessibilityLabel="Cerrar diálogo"
        />
        <View
          style={[
            styles.content,
            {
              backgroundColor: ui.card,
              borderColor: ui.border,
              shadowOpacity: resolvedTheme === 'dark' ? 0.5 : 0.15,
            },
            contentStyle,
          ]}
        >
          <Pressable
            onPress={() => onOpenChange(false)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Cerrar"
            style={(s: any) => [styles.closeBtn, s.hovered && { backgroundColor: ui.accent }, noOutline]}
          >
            <MdiIcon name="close" size={18} color={ui.mutedForeground} />
          </Pressable>
          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export const DialogHeader: React.FC<{ children: React.ReactNode; style?: StyleProp<ViewStyle> }> = ({
  children,
  style,
}) => <View style={[styles.header, style]}>{children}</View>;

export const DialogTitle: React.FC<{ children: React.ReactNode; destructive?: boolean }> = ({
  children,
  destructive,
}) => {
  const { ui } = useTheme();
  return (
    <Text
      accessibilityRole="header"
      style={[styles.title, { color: destructive ? ui.destructive : ui.foreground }]}
    >
      {children}
    </Text>
  );
};

export const DialogDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { ui } = useTheme();
  return <Text style={[styles.description, { color: ui.mutedForeground }]}>{children}</Text>;
};

export const DialogBody: React.FC<{ children: React.ReactNode; style?: StyleProp<ViewStyle> }> = ({
  children,
  style,
}) => <View style={[styles.body, style]}>{children}</View>;

export const DialogFooter: React.FC<{ children: React.ReactNode; style?: StyleProp<ViewStyle> }> = ({
  children,
  style,
}) => <View style={[styles.footer, style]}>{children}</View>;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  content: {
    width: '100%',
    maxWidth: 480,
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: 24,
    shadowColor: '#000',
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 16 },
    elevation: 10,
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: 18,
    right: 18,
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  header: {
    marginBottom: 16,
    paddingRight: 24,
    gap: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 13.5,
    lineHeight: 19,
  },
  body: {
    gap: 14,
  },
  footer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
});
