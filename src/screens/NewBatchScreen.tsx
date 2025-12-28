import React, { useState } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { colors } from '../theme/colors';
import { useMachineStore } from '../stores/machineStore';
import ScreenTitle from '../components/ScreenTitle';


export default function NewBatchScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { selectedMachine, addBatch, setCurrentBatch } = useMachineStore();

  const [estimatedWeight, setEstimatedWeight] = useState('');

  // show batch id to user
  const generatedId = React.useMemo(() => Math.random().toString(36).substring(2, 8).toUpperCase(), []);

  const handleCreate = () => {
    if (!selectedMachine) {
      Alert.alert('No machine selected', 'Please select a machine first.');
      return;
    }

    const batch = {
      id: generatedId,
      machineId: selectedMachine.id,
      type: 'mixed' as const,
      status: 'queued' as const,
      currentStep: 1 as const,
      estimatedWeight: Number(estimatedWeight) || undefined,
    };

    addBatch(batch);
    setCurrentBatch(batch);
    // navigate into session for this batch
    navigation.navigate('BatchSession', { batchId: batch.id });
  };

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom, flex: 1 }]}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 24 + insets.bottom, flexGrow: 1, justifyContent: 'space-between' }]} keyboardShouldPersistTaps="handled">
        <View>
          <ScreenTitle>New Batch</ScreenTitle>

          <Text style={styles.subtitle}>Batch ID: <Text style={{ fontWeight: '700' }}>{generatedId}</Text></Text>

          <Text style={[styles.label, { marginTop: 12 }]}>Estimated Weight (kg)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={estimatedWeight}
            onChangeText={setEstimatedWeight}
            placeholder="e.g., 12.5"
            placeholderTextColor={colors.mutedText}
          />
        </View>

        <View>
          <TouchableOpacity style={styles.createButton} onPress={handleCreate} activeOpacity={0.8}>
            <Text style={styles.createText}>Start Batch</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.creamBackground },
  content: { padding: 20, paddingTop: 24 },
  title: { fontSize: 28, fontWeight: '700', color: colors.primary, marginBottom: 12 },
  subtitle: { color: colors.mutedText, marginBottom: 12 },
  label: { fontSize: 14, color: colors.primaryText, marginBottom: 8 },
  row: { flexDirection: 'row', gap: 12 },
  option: { flex: 1, padding: 12, borderRadius: 10, backgroundColor: colors.cardWhite, alignItems: 'center' },
  optionActive: { backgroundColor: colors.softGreenSurface, borderWidth: 1, borderColor: colors.primary },
  optionText: { color: colors.primaryText, fontWeight: '600' },
  optionTextActive: { color: colors.primary },
  input: { backgroundColor: colors.cardWhite, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: colors.border, color: colors.primaryText },
  createButton: { backgroundColor: colors.primary, padding: 14, borderRadius: 12, marginTop: 24, alignItems: 'center' },
  createText: { color: colors.cardWhite, fontWeight: '700' },
  cancelButton: { padding: 12, alignItems: 'center', marginTop: 12 },
  cancelText: { color: colors.mutedText },
});