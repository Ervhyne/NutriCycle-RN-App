import React from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { useMachineStore } from '../stores/machineStore';

export default function SummaryScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { currentBatch } = useMachineStore();

  if (!currentBatch) {
    return (
      <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom }]}>
        <View style={styles.content}>
          <Text style={styles.title}>No Batch</Text>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Dashboard')}>
            <Text style={styles.buttonText}>Return to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.content}>
        <Text style={styles.title}>Batch Summary</Text>
        <Text style={styles.row}><Text style={{ fontWeight: '700' }}>Batch ID:</Text> {currentBatch.id}</Text>
        <Text style={styles.row}><Text style={{ fontWeight: '700' }}>Type:</Text> {currentBatch.type}</Text>
        <Text style={styles.row}><Text style={{ fontWeight: '700' }}>Status:</Text> {currentBatch.status}</Text>
        <Text style={styles.row}><Text style={{ fontWeight: '700' }}>Estimated Weight:</Text> {currentBatch.estimatedWeight ?? '--'} kg</Text>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Dashboard')}>
          <Text style={styles.buttonText}>Return to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.creamBackground },
  content: { padding: 20, paddingTop: 24 },
  title: { fontSize: 24, fontWeight: '700', color: colors.primary, marginBottom: 12 },
  row: { marginBottom: 8, color: colors.primaryText },
  button: { marginTop: 20, backgroundColor: colors.primary, padding: 12, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: colors.cardWhite, fontWeight: '700' },
});