import React, { useState } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Modal } from 'react-native';
import { colors } from '../theme/colors';
import { useMachineStore } from '../stores/machineStore';
import ScreenTitle from '../components/ScreenTitle';
import { fetchWithAuth } from '../config/api';


export default function NewBatchScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { selectedMachine, addBatch, setCurrentBatch } = useMachineStore();

  const [estimatedWeight, setEstimatedWeight] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const showModal = (title: string, message: string) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  // show batch id to user
  const generatedId = React.useMemo(() => Math.random().toString(36).substring(2, 8).toUpperCase(), []);

  const handleCreate = async () => {
    if (!selectedMachine) {
      showModal('No machine selected', 'Please select a machine first.');
      return;
    }

    if (!estimatedWeight || estimatedWeight.trim() === '') {
      showModal('Missing Information', 'Please enter the estimated weight for this batch.');
      return;
    }

    const weightValue = Number(estimatedWeight);
    if (isNaN(weightValue) || weightValue <= 0) {
      showModal('Invalid Weight', 'Please enter a valid weight greater than 0.');
      return;
    }

    if (weightValue > 5) {
      showModal('Weight Limit Exceeded', 'Maximum weight is 5 kg per batch.');
      return;
    }

    try {
      const res = await fetchWithAuth('/batches', {
        method: 'POST',
        body: JSON.stringify({
          // Server expects external machineId (e.g., "NC-001")
          machineId: selectedMachine.machineId,
          estimatedWeight: weightValue,
        }),
      });
      const serverBatch = await res.json();

      // Map server batch to local store shape
      const batch = {
        id: serverBatch.id as string,
        machineId: selectedMachine.id, // local linkage to selected machine
        type: 'mixed' as const,
        status: 'running' as const,
        currentStep: 1 as const,
        estimatedWeight: weightValue,
      };

      addBatch(batch);
      setCurrentBatch(batch);
      navigation.navigate('BatchSession', { batchId: batch.id });
    } catch (err: any) {
      const msg = (err?.message || 'Failed to create batch').toString();
      // Surface common server messages nicely
      if (msg.includes('machine_not_found')) {
        showModal('Machine Not Found', 'This machine ID is not registered. Please add the machine first.');
      } else if (msg.includes('already has an active batch')) {
        showModal('Batch In Progress', 'This machine already has an active batch. Please complete or cancel it first.');
      } else if (msg.includes('estimatedWeight')) {
        showModal('Invalid Weight', 'Estimated weight must be greater than 0 and not exceed 5 kg.');
      } else {
        showModal('Error', msg);
      }
    }
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

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{modalTitle}</Text>
            <Text style={styles.modalMessage}>{modalMessage}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.creamBackground,
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primaryText,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    color: colors.mutedText,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: colors.cardWhite,
    fontSize: 16,
    fontWeight: '700',
  },
});