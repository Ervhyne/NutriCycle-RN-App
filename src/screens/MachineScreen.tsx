import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { colors } from '../theme/colors';
import TelemetryCard from '../components/TelemetryCard';
import ControlPanel from '../components/ControlPanel';
import { useMachineStore } from '../stores/machineStore';

export default function MachineScreen({ navigation }: any) {
  const { selectedMachine, telemetry } = useMachineStore();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View>
            <Text style={styles.machineName}>{selectedMachine?.name ?? 'No Machine Selected'}</Text>
            <Text style={styles.machineStatus}>{selectedMachine?.isOnline ? 'Online' : 'Offline'}</Text>
          </View>
          <View style={{ flexDirection: 'row' }} />
        </View>

        {/* Camera / Stream */}
        <View style={styles.cameraContainer}>
          {selectedMachine?.streamUrl ? (
            <View style={styles.videoWrapper}>
              <Video
                source={{ uri: selectedMachine.streamUrl }}
                style={styles.video}
                resizeMode={ResizeMode.COVER}
                useNativeControls
                shouldPlay={selectedMachine?.isOnline}
              />
            </View>
          ) : (
            <View style={styles.cameraPlaceholder}>
              <Text style={styles.cameraText}>Camera Feed Placeholder</Text>

            </View>
          )}
        </View>

        {/* Telemetry */}
        <TelemetryCard telemetry={telemetry} />

        {/* Controls */}
        <ControlPanel />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.creamBackground,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  machineName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  machineStatus: {
    fontSize: 14,
    color: colors.mutedText,
  },
  cameraContainer: {
    padding: 16,
  },
  videoWrapper: {
    height: 260,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  cameraPlaceholder: {
    height: 260,
    borderRadius: 12,
    backgroundColor: '#00000008',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraText: {
    color: colors.mutedText,
    fontSize: 16,
  },
  smallButton: {
    backgroundColor: colors.cardWhite,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  smallButtonText: {
    color: colors.primary,
    fontWeight: '700',
  },
});
