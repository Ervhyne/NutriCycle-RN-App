import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Play, Pause, StopCircle, AlertOctagon } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { useMachineStore } from '../stores/machineStore';

export default function ControlPanel() {
  const { startProcessing, pauseProcessing, stopProcessing, emergencyStop, selectedMachine } = useMachineStore();

  const handleEmergency = () => {
    Alert.alert('Emergency Stop', 'Confirm emergency stop?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Emergency Stop', style: 'destructive', onPress: () => emergencyStop() },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TouchableOpacity style={styles.button} onPress={startProcessing} activeOpacity={0.8}>
          <Play size={20} color={colors.cardWhite} />
          <Text style={styles.buttonText}>Start</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.pause]} onPress={pauseProcessing} activeOpacity={0.8}>
          <Pause size={20} color={colors.cardWhite} />
          <Text style={styles.buttonText}>Pause</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.stop]} onPress={stopProcessing} activeOpacity={0.8}>
          <StopCircle size={20} color={colors.cardWhite} />
          <Text style={styles.buttonText}>Stop</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.emergency} onPress={handleEmergency} activeOpacity={0.8}>
        <AlertOctagon size={18} color={colors.cardWhite} />
        <Text style={styles.emergencyText}>Emergency Stop</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    margin: 16,
    backgroundColor: colors.cardWhite,
    borderRadius: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  button: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    marginHorizontal: 6,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  pause: {
    backgroundColor: colors.warning,
  },
  stop: {
    backgroundColor: colors.danger,
  },
  buttonText: {
    color: colors.cardWhite,
    fontWeight: '700',
    marginLeft: 4,
  },
  emergency: {
    marginTop: 4,
    backgroundColor: colors.danger,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  emergencyText: {
    color: colors.cardWhite,
    fontWeight: '700',
  },
});