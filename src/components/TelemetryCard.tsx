import React, { useEffect, useRef } from 'react';
import { act } from 'react';
import { getApiBaseUrl, fetchWithAuth } from '../config/api';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors } from '../theme/colors';
import { MachineTelemetry } from '../types';

// Accept batchStatus as a prop
export default function TelemetryCard({
  telemetry,
  batchStatus,
  isOnline,
  navigation,
}: {
  telemetry: MachineTelemetry | null;
  batchStatus: 'idle' | 'running' | 'completed' | 'error' | null;
  isOnline?: boolean;
  navigation?: any;
}) {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const motorState: 'idle' | 'running' | 'completed' | 'error' =
    telemetry?.motorState === 'paused'
      ? 'idle'
      : telemetry?.motorState ?? 'idle';
  const [humidity, setHumidity] = React.useState('--');
  const [temp, setTemp] = React.useState('--');
  const [feedStatus, setFeedStatus] = React.useState('--');
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    if (isOnline === false) {
      setHumidity('--');
      setTemp('--');
      setFeedStatus('--');
      setLoading(false);
      return;
    }
    // Fetch latest batch for humidity, temperature, and feedStatus
    const fetchBatch = async () => {
      setLoading(true);
      try {
        const res = await fetchWithAuth('/batches?limit=1&order=desc');
        const batches = await res.json();
        if (batches && batches.length > 0) {
          setHumidity(batches[0].humidity?.toString() ?? '--');
          setTemp(batches[0].temperature?.toString() ?? '--');
          setFeedStatus(batches[0].feedStatus ?? '--');
        } else {
          setHumidity('--');
          setTemp('--');
          setFeedStatus('--');
        }
      } catch (err) {
        setHumidity('--');
        setTemp('--');
        setFeedStatus('--');
      } finally {
        setLoading(false);
      }
    };
    fetchBatch();
  }, [isOnline]);

  const floatStyle = {
    transform: [
      {
        translateY: floatAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -8],
        }),
      },
    ],
  };

  let motorColor: string = colors.mutedText;
  if (motorState === 'running') motorColor = colors.success;
  else if (motorState === 'idle') motorColor = colors.warning;
  else if (motorState === 'completed') motorColor = colors.primary;
  else if (motorState === 'error') motorColor = colors.danger;

  // Use feedStatus from DB for process stage
  let processText = '--';
  if (feedStatus && feedStatus !== '--') {
    processText = feedStatus;
  }

  // Auto-navigate to SummaryScreen after 5 seconds if processing is completed
  useEffect(() => {
    if (processText.toLowerCase() === 'completed' && navigation) {
      const timeout = setTimeout(() => {
        navigation.navigate('Summary');
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [processText, navigation]);

  return (
    <View style={styles.container}>
      {/* Motor Status Section */}
      <View style={styles.motorSection}>
        <View style={styles.motorHeader}>
          <Text style={styles.motorLabel}>Motor Status</Text>
          <View style={[styles.motorBadge, { borderColor: motorColor }]}>
            <View style={[styles.motorDot, { backgroundColor: motorColor }]} />
            <Text style={[styles.motorText, { color: motorColor }]}>{motorState}</Text>
          </View>
        </View>
      </View>

      {/* Processing Info Section (styled like diverter) */}
      <View style={styles.diverterInfo}>
        <Text style={styles.diverterLabel}>Processing</Text>
        <Text style={styles.diverterValue}>{processText}</Text>
      </View>

      {/* Metrics Grid */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Temperature</Text>
          <View style={styles.metricContent}>
            <Animated.Text style={[styles.metricValue, floatStyle]}>
              {loading ? '--' : temp}
            </Animated.Text>
            <Text style={styles.metricUnit}>°C</Text>
          </View>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Humidity</Text>
          <View style={styles.metricContent}>
            <Animated.Text style={[styles.metricValue, floatStyle]}>
              {loading ? '--' : humidity}
            </Animated.Text>
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
    letterSpacing: 0.5,
  },
  motorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#FAFAFA',
    borderWidth: 1.5,
    gap: 6,
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
    marginBottom: 18,
    marginTop: -8,
    alignItems: 'flex-start',
  },
  diverterLabel: {
    fontSize: 11,
    color: colors.mutedText,
    fontWeight: '500',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
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