import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { MachineTelemetry } from '../types';

export default function TelemetryCard({ telemetry }: { telemetry: MachineTelemetry | null }) {
  const motorState = telemetry?.motorState ?? 'idle';
  const rpm = telemetry?.grinderRPM ?? '--';
  const temp = telemetry?.dryerTemperature ?? '--';
  const humidity = telemetry?.humidity ?? '--';
  const diverter = telemetry?.diverterPosition ?? '--';
  const door = telemetry?.doorState ?? '--';

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.primaryMetric}>
          <Text style={styles.label}>Motor</Text>
          <View style={styles.pill}>
            <Text style={styles.pillValue}>{motorState}</Text>
          </View>
          <Text style={styles.subLabel}>Diverter: <Text style={styles.subValue}>{diverter}</Text></Text>
        </View>
        <View style={styles.primaryMetric}>
          <Text style={styles.label}>RPM</Text>
          <Text style={styles.bigValue}>{rpm}</Text>
          <Text style={styles.subLabel}>Door: <Text style={styles.subValue}>{door}</Text></Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.gridRow}>
        <View style={styles.gridItem}>
          <Text style={styles.gridLabel}>Temp</Text>
          <Text style={styles.gridValue}>{temp}°C</Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.gridLabel}>Humidity</Text>
          <Text style={styles.gridValue}>{humidity}%</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardSurface,
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    columnGap: 12,
  },
  primaryMetric: {
    flex: 1,
    backgroundColor: colors.softGreenSurface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  label: {
    fontSize: 12,
    color: colors.mutedText,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  pill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.cardWhite,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginTop: 6,
  },
  pillValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primaryText,
  },
  bigValue: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 6,
  },
  subLabel: {
    marginTop: 8,
    fontSize: 12,
    color: colors.mutedText,
  },
  subValue: {
    fontWeight: '700',
    color: colors.primaryText,
  },
  divider: {
    height: 1,
    backgroundColor: colors.cardBorder,
    marginVertical: 14,
    opacity: 0.7,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  gridItem: {
    flex: 1,
    backgroundColor: colors.cardWhite,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
  },
  gridLabel: {
    fontSize: 12,
    color: colors.mutedText,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  gridValue: {
    marginTop: 6,
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
});