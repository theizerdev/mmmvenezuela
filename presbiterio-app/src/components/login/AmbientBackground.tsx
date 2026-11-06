import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { useTheme } from '../ui/theme';

interface GlowProps {
  cx: number;
  cy: number;
  size: number;
  color: string;
  layerOpacity: number;
  layers?: number;
}

/**
 * Simula un resplandor radial (sin librerías nativas) apilando círculos concéntricos
 * muy translúcidos: el centro acumula más opacidad y el borde se desvanece.
 */
const Glow: React.FC<GlowProps> = ({ cx, cy, size, color, layerOpacity, layers = 9 }) => (
  <>
    {Array.from({ length: layers }, (_, i) => {
      const s = size * (1 - i / layers);
      return (
        <View
          key={i}
          style={{
            position: 'absolute',
            left: cx - s / 2,
            top: cy - s / 2,
            width: s,
            height: s,
            borderRadius: s / 2,
            backgroundColor: color,
            opacity: layerOpacity,
          }}
        />
      );
    })}
  </>
);

/** Fondo ambiental del login: resplandores de marca + anillos sutiles. */
export const AmbientBackground: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const { ui, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const glowOpacity = isDark ? 0.03 : 0.022;

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.clip]}>
      {/* Resplandor principal, detrás del logo */}
      <Glow
        cx={width / 2}
        cy={height * 0.22}
        size={Math.max(width, 360) * 1.25}
        color={ui.brand}
        layerOpacity={glowOpacity}
      />
      {/* Resplandor secundario, esquina inferior */}
      <Glow
        cx={width * 0.95}
        cy={height * 0.92}
        size={Math.max(width, 360) * 0.95}
        color={ui.brand}
        layerOpacity={glowOpacity * 0.7}
        layers={7}
      />

      {/* Anillos concéntricos muy tenues (detalle de profundidad) */}
      {[220, 340, 470].map((d) => (
        <View
          key={d}
          style={{
            position: 'absolute',
            left: width / 2 - d / 2,
            top: height * 0.22 - d / 2,
            width: d,
            height: d,
            borderRadius: d / 2,
            borderWidth: 1,
            borderColor: ui.brand,
            opacity: isDark ? 0.07 : 0.06,
          }}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  clip: {
    overflow: 'hidden',
  },
});

