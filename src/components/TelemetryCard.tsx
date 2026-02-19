import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { colors } from '../theme/colors';
import { MachineTelemetry } from '../types';

// Accept batchStatus as a prop
export default function TelemetryCard({ telemetry, batchStatus }: { telemetry: MachineTelemetry | null, batchStatus: 'idle' | 'running' | 'completed' | 'error' | null }) {
  // Use batchStatus for motor state badge
  const motorState = batchStatus ?? 'idle';
  const temp = telemetry?.dryerTemperature && telemetry.dryerTemperature > 0 ? telemetry.dryerTemperature : '--';
  const humidity = telemetry?.humidity && telemetry.humidity > 0 ? telemetry.humidity : '--';
  const diverter = telemetry?.diverterPosition ?? '--';

  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();
    return () => loop.stop();
  }, [floatAnim]);

  const floatStyle = {
    transform: [
      {
        translateY: floatAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [-2, 2],
        }),
      },
    ],
  };

  let motorColor: string = colors.mutedText;
  if (motorState === 'running') motorColor = colors.success;
  else if (motorState === 'idle') motorColor = colors.warning;
  else if (motorState === 'completed') motorColor = colors.primary;
  else if (motorState === 'error') motorColor = colors.danger;

  return (
    <View style={styles.container}>
      {/* Motor Status Section */}
      <View style={styles.motorSection}>
        <View style={styles.motorHeader}>
          <Text style={styles.motorLabel}>Motor Status</Text>
          <View style={[styles.motorBadge, { borderColor: motorColor }]}>
            <View style={[styles.motorDot, { backgroundColor: motorColor }]} />
            <Text style={[styles.motorText, { color: motorColor }]}>{motorState.charAt(0).toUpperCase() + motorState.slice(1)}</Text>
          </View>
        </View>
        <View style={styles.diverterInfo}>
          <Text style={styles.diverterLabel}>Diverter Position:</Text>
          <Text style={styles.diverterValue}>{diverter}</Text>
        </View>
      </View>

      {/* Metrics Grid */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Temperature</Text>
          <View style={styles.metricContent}>
            <Animated.Text style={[styles.metricValue, floatStyle]}>{temp}</Animated.Text>
            <Text style={styles.metricUnit}>°C</Text>
          </View>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Humidity</Text>
          <View style={styles.metricContent}>
            <Animated.Text style={[styles.metricValue, floatStyle]}>{humidity}</Animated.Text>
            <Text style={styles.metricUnit}>%</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardWhite,
    padding: 20,
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  motorSection: {
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  motorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  motorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.mutedText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  motorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1.5,
    gap: 6,
    backgroundColor: '#FAFAFA',
  },
  motorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  motorText: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  diverterInfo: {
    backgroundColor: colors.softGreenSurface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  diverterLabel: {
    fontSize: 11,
    color: colors.mutedText,
    fontWeight: '500',
    marginBottom: 4,
  },
  diverterValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primaryText,
    textTransform: 'capitalize',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 14,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    color: colors.mutedText,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 8,
  },
  metricContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
  },
  metricUnit: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.mutedText,
  },
});