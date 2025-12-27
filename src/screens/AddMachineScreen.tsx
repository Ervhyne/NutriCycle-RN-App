import React, { useState } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { QrCode, Hash } from 'lucide-react-native';
import { useMachineStore } from '../stores/machineStore';
import { colors } from '../theme/colors';

export default function AddMachineScreen({ navigation }: any) {
  const [machineId, setMachineId] = useState('');
  const [machineName, setMachineName] = useState('');
  const { addMachine } = useMachineStore();
  const insets = useSafeAreaInsets();

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
    <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom }]}>
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.headerRow}>
          <Image source={require('../../assets/Machine Asset.png')} style={styles.headerImage} resizeMode="contain" />
          <View style={styles.headerText}>
            <Text style={styles.title}>Add Machine</Text>
            <Text style={styles.subtitle}>Enter machine details or scan the QR code on your NutriCycle device</Text>
          </View>
        </View>

        <View style={styles.divider} />

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
          style={[styles.addButton, { marginBottom: 16 + insets.bottom }]}
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.creamBackground,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 18,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerImage: {
    width: 100,
    height: 100,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: colors.mutedText,
    marginBottom: 6,
    lineHeight: 20,
  },
  divider: {
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#E7E0C2',
    marginVertical: 12,
    opacity: 0.6,
  },
  inputContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primaryText,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.cardSurface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 16,
    padding: 18,
    fontSize: 16,
    color: colors.primaryText,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardSurface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputField: {
    flex: 1,
    paddingLeft: 12,
    fontSize: 16,
    color: colors.primaryText,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.statusBackground,
    padding: 18,
    borderRadius: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
  },
  scanText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.contentText,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  addButtonText: {
    color: colors.cardWhite,
    fontSize: 20,
    fontWeight: '700',
  },
  cancelButton: {
    padding: 18,
    alignItems: 'center',
  },
  cancelText: {
    color: colors.mutedText,
    fontSize: 16,
    fontWeight: '600',
  },
});
