import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import ApexCharts from 'apexcharts';

interface ApexChartProps {
  options: any;
  series: any;
  type?: 'bar' | 'line' | 'donut' | 'pie' | 'radialBar' | 'area';
  height?: number | string;
}

export const ApexChart: React.FC<ApexChartProps> = ({
  options,
  series,
  type = 'bar',
  height = 320,
}) => {
  const containerRef = useRef<View | null>(null);
  const chartInstance = useRef<ApexCharts | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    let targetEl: HTMLElement | null = null;
    if (containerRef.current) {
      // In React Native Web, View ref resolves to the HTML div element
      targetEl = containerRef.current as unknown as HTMLElement;
    }

    if (!targetEl) return;

    if (chartInstance.current) {
      try {
        chartInstance.current.destroy();
      } catch {
        // Ignored
      }
      chartInstance.current = null;
    }

    const mergedOptions = {
      ...options,
      chart: {
        ...(options?.chart || {}),
        type,
        height,
        toolbar: {
          show: false,
          ...(options?.chart?.toolbar || {}),
        },
      },
      series,
    };

    try {
      const chart = new ApexCharts(targetEl, mergedOptions);
      chart.render();
      chartInstance.current = chart;
    } catch (e) {
      console.warn('[ApexChart] Error rendering chart:', e);
    }

    return () => {
      if (chartInstance.current) {
        try {
          chartInstance.current.destroy();
        } catch {
          // Ignored
        }
        chartInstance.current = null;
      }
    };
  }, [options, series, type, height]);

  if (Platform.OS !== 'web') {
    return (
      <View style={[styles.fallback, { height: typeof height === 'number' ? height : 280 }]}>
        <Text style={styles.fallbackText}>Gráfico interactivo ApexCharts</Text>
      </View>
    );
  }

  return (
    <View
      ref={containerRef}
      style={{
        width: '100%',
        minHeight: typeof height === 'number' ? height : 320,
      }}
    />
  );
};

const styles = StyleSheet.create({
  fallback: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  fallbackText: {
    fontSize: 12,
    color: '#94a3b8',
  },
});
