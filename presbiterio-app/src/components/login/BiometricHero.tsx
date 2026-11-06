import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import { Fingerprint } from 'lucide-react-native';
import { radius, useTheme } from '../ui/theme';

interface BiometricHeroProps {
  caption: string;
  onPress: () => void;
  loading?: boolean;
}

const ND = Platform.OS !== 'web';

/** Botón de huella/biometría con anillo pulsante: acción principal del acceso rápido. */
export const BiometricHero: React.FC<BiometricHeroProps> = ({ caption, onPress, loading }) => {
  const { ui } = useTheme();
  const pulse = useRef(new Animated.Value(0)).current;
  const press = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: 1900,
        easing: Easing.out(Easing.quad),
        useNativeDriver: ND,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.45] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0] });

  const animatePress = (to: number) =>
    Animated.spring(press, { toValue: to, useNativeDriver: ND, friction: 6, tension: 220 }).start();

  return (
    <View style={styles.wrap}>
      <View style={styles.stage}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.ring,
            {
              borderColor: ui.brand,
              opacity: ringOpacity,
              transform: [{ scale: ringScale }],
            },
          ]}
        />
        <Animated.View style={{ transform: [{ scale: press }] }}>
          <Pressable
            onPress={onPress}
            onPressIn={() => animatePress(0.95)}
            onPressOut={() => animatePress(1)}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel={caption}
            style={[
              styles.circle,
              {
                backgroundColor: ui.brandSoft,
                borderColor: ui.brand,
                shadowColor: ui.brand,
              },
            ]}
          >
            {loading ? (
              <ActivityIndicator size="small" color={ui.brand} />
            ) : (
              <Fingerprint size={32} color={ui.brand} strokeWidth={1.6} />
            )}
          </Pressable>
        </Animated.View>
      </View>
      <Text
        style={[styles.caption, { color: ui.mutedForeground }]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {caption}
      </Text>
    </View>
  );
};

const SIZE = 68;

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginVertical: 4,
  },
  stage: {
    width: SIZE * 1.5,
    height: SIZE * 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 1.5,
  },
  circle: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  caption: {
    fontSize: 11.5,
    fontWeight: '600',
    marginTop: -4,
  },
});
