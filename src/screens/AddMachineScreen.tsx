import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { QrCode, Hash } from 'lucide-react-native';
import { useMachineStore } from '../stores/machineStore';
import { colors } from '../theme/colors';

export default function AddMachineScreen({ navigation }: any) {
  const [machineId, setMachineId] = useState('');
  const [machineName, setMachineName] = useState('');
  const { addMachine } = useMachineStore();

  const handleAddMachine = () => {
    if (!machineId.trim()) {
      Alert.alert('Error', 'Please enter a Machine ID');
      return;
    }

    if (!machineName.trim()) {
      Alert.alert('Error', 'Please enter a Machine Name');
      return;
    }

    // In real app, validate with server here
    const newMachine = {
      id: Date.now().toString(),
      name: machineName.trim(),
      machineId: machineId.trim().toUpperCase(),
      isOnline: Math.random() > 0.3, // Random for demo
    };

    addMachine(newMachine);
    Alert.alert('Success', `${machineName} has been added!`, [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  const handleScanQR = () => {
    // Placeholder for QR scanner
    Alert.alert('QR Scanner', 'QR scanner will be implemented here');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Add Machine</Text>
        <Text style={styles.subtitle}>
          Enter machine details or scan the QR code on your NutriCycle device
        </Text>

        {/* Machine Name Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Machine Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Kitchen NutriCycle"
            value={machineName}
            onChangeText={setMachineName}
            placeholderTextColor={colors.mutedText}
          />
        </View>

        {/* Machine ID Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Machine ID</Text>
          <View style={styles.inputWithIcon}>
            <Hash size={20} color={colors.mutedText} />
            <TextInput
              style={styles.inputField}
              placeholder="e.g., NC-8F2A-91"
              value={machineId}
              onChangeText={setMachineId}
              placeholderTextColor={colors.mutedText}
              autoCapitalize="characters"
            />
          </View>
        </View>

        {/* QR Scanner Button */}
        <TouchableOpacity
          style={styles.scanButton}
          onPress={handleScanQR}
          activeOpacity={0.7}
        >
          <QrCode size={24} color={colors.primary} />
          <Text style={styles.scanText}>Scan QR Code</Text>
        </TouchableOpacity>

        {/* Add Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddMachine}
          activeOpacity={0.8}
        >
          <Text style={styles.addButtonText}>Add Machine</Text>
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.creamBackground,
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.mutedText,
    marginBottom: 32,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primaryText,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.cardWhite,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.primaryText,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardWhite,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  inputField: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: colors.primaryText,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.softGreenSurface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
    gap: 8,
  },
  scanText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  addButton: {
    backgroundColor: colors.primary,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  addButtonText: {
    color: colors.cardWhite,
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    padding: 18,
    alignItems: 'center',
  },
  cancelText: {
    color: colors.mutedText,
    fontSize: 16,
    fontWeight: '500',
  },
});
