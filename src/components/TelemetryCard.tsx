import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { MachineTelemetry } from '../types';

export default function TelemetryCard({ telemetry }: { telemetry: MachineTelemetry | null }) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={styles.label}>Motor</Text>
          <Text style={styles.value}>{telemetry?.motorState ?? 'idle'}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>RPM</Text>
          <Text style={styles.value}>{telemetry?.grinderRPM ?? '--'}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>Temp</Text>
          <Text style={styles.value}>{telemetry?.dryerTemperature ?? '--'}°C</Text>
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={styles.label}>Humidity</Text>
          <Text style={styles.value}>{telemetry?.humidity ?? '--'}%</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>Diverter</Text>
          <Text style={styles.value}>{telemetry?.diverterPosition ?? '--'}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>Door</Text>
          <Text style={styles.value}>{telemetry?.doorState ?? '--'}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardWhite,
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  item: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: colors.mutedText,
  },
  value: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryText,
    marginTop: 4,
  },
});