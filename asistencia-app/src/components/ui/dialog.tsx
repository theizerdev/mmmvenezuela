import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as DialogPrimitive from '@rn-primitives/dialog';
import { X } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogPortal = DialogPrimitive.Portal;
export const DialogClose = DialogPrimitive.Close;

export const DialogOverlay = React.forwardRef<
  any,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ style, ...props }, ref) => {
  const flatStyle = StyleSheet.flatten([styles.overlay, style]);
  return (
    <DialogPrimitive.Overlay
      ref={ref}
      style={flatStyle}
      {...props}
    />
  );
});
DialogOverlay.displayName = 'DialogOverlay';

export const DialogContent = React.forwardRef<
  any,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    hideCloseButton?: boolean;
  }
>(({ style, children, hideCloseButton = false, ...props }, ref) => {
  const { colors } = useTheme();

  const flatContentStyle = StyleSheet.flatten([
    styles.content,
    {
      backgroundColor: colors.card,
      borderColor: colors.cardBorder,
    },
    style,
  ]);

  return (
    <DialogPortal>
      <DialogOverlay>
        <DialogPrimitive.Content
          ref={ref}
          style={flatContentStyle}
          {...props}
        >
          {children}
          {!hideCloseButton && (
            <DialogPrimitive.Close asChild>
              <Pressable style={styles.closeBtn} hitSlop={8}>
                <X size={18} color={colors.textSecondary} />
              </Pressable>
            </DialogPrimitive.Close>
          )}
        </DialogPrimitive.Content>
      </DialogOverlay>
    </DialogPortal>
  );
});
DialogContent.displayName = 'DialogContent';

export const DialogHeader = ({ style, ...props }: React.ComponentPropsWithoutRef<typeof View>) => (
  <View style={StyleSheet.flatten([styles.header, style])} {...props} />
);
DialogHeader.displayName = 'DialogHeader';

export const DialogFooter = ({ style, ...props }: React.ComponentPropsWithoutRef<typeof View>) => (
  <View style={StyleSheet.flatten([styles.footer, style])} {...props} />
);
DialogFooter.displayName = 'DialogFooter';

export const DialogTitle = React.forwardRef<
  any,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ style, ...props }, ref) => {
  const { colors } = useTheme();
  const flatStyle = StyleSheet.flatten([styles.title, { color: colors.text }, style]);
  return (
    <DialogPrimitive.Title
      ref={ref}
      style={flatStyle}
      {...props}
    />
  );
});
DialogTitle.displayName = 'DialogTitle';

export const DialogDescription = React.forwardRef<
  any,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ style, ...props }, ref) => {
  const { colors } = useTheme();
  const flatStyle = StyleSheet.flatten([styles.description, { color: colors.textSecondary }, style]);
  return (
    <DialogPrimitive.Description
      ref={ref}
      style={flatStyle}
      {...props}
    />
  );
});
DialogDescription.displayName = 'DialogDescription';

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 50,
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
    zIndex: 51,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4,
  },
  header: {
    marginBottom: 16,
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
