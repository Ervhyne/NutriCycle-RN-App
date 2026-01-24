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
import ScreenTitle from '../components/ScreenTitle';
import { fetchWithAuth, getApiBaseUrl } from '../config/api';
import { auth } from '../config/firebase';

export default function AddMachineScreen({ navigation }: any) {
  const [machineId, setMachineId] = useState('');
  const [machineName, setMachineName] = useState('');
  const { addMachine } = useMachineStore();
  const insets = useSafeAreaInsets();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [addedMachineName, setAddedMachineName] = useState('');
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddMachine = async () => {
    if (!machineId.trim()) {
      setErrorMessage('Please enter a Machine ID');
      setErrorModalVisible(true);
      return;
    }

    if (!machineName.trim()) {
      setErrorMessage('Please enter a Machine Name');
      setErrorModalVisible(true);
      return;
    }

    setLoading(true);

    try {
      // Register machine with API server
      const apiUrl = await getApiBaseUrl();
      if (!apiUrl) {
        setErrorMessage('No API URL configured. Please set it in Settings.');
        setErrorModalVisible(true);
        setLoading(false);
        return;
      }

      const response = await fetchWithAuth('/machines/register', {
        method: 'POST',
        body: JSON.stringify({
          machineId: machineId.trim().toUpperCase(),
          name: machineName.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to register machine' }));
        throw new Error(errorData.error || `Server returned ${response.status}`);
      }

      const data = await response.json();
      const registeredMachine = data.machine;

      // Add machine to local store
      const newMachine = {
        id: registeredMachine.id || Date.now().toString(),
        name: registeredMachine.name || machineName.trim(),
        machineId: registeredMachine.machineId || machineId.trim().toUpperCase(),
        isOnline: false, // Default to offline until MQTT connection
      };

      addMachine(newMachine);
      setAddedMachineName(newMachine.name);
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('Error registering machine:', error);
      setErrorMessage(error.message || 'Failed to register machine. Please try again.');
      setErrorModalVisible(true);
    } finally {
      setLoading(false);
    }
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
          <Image source={require('../../assets/Add Machine Asset.png')} style={styles.headerImage} resizeMode="contain" />
          <View style={styles.headerText}>
            <ScreenTitle>Add Machine</ScreenTitle>
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
          style={[styles.addButton, { marginBottom: 16 + insets.bottom }, loading && styles.addButtonDisabled]}
          onPress={handleAddMachine}
          activeOpacity={0.8}
          disabled={loading}
        >
          <Text style={styles.addButtonText}>{loading ? 'Adding...' : 'Add Machine'}</Text>
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        {errorModalVisible && (
          <View style={styles.modalOverlay} pointerEvents="box-none">
            <View style={styles.modalCard}>
              <Text style={styles.modalErrorTitle}>Error</Text>
              <Text style={styles.modalErrorSubtitle}>{errorMessage}</Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setErrorModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {showSuccessModal && (
          <View style={styles.modalOverlay} pointerEvents="box-none">
            <View style={styles.modalCard}>
              <View style={styles.modalCheckCircle}>
                <Text style={styles.modalCheckMark}>✓</Text>
              </View>
              <Text style={styles.modalTitle}>Machine Added!</Text>
              <Text style={styles.modalSubtitle}>{addedMachineName} has been added to your machines.</Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => { setShowSuccessModal(false); navigation.goBack(); }}
              >
                <Text style={styles.modalButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
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
    borderRadius: 10,
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
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addButtonDisabled: {
    opacity: 0.6,
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

  /* Success modal */
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00000055',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.creamBackground,
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
  },
  modalCheckCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modalCheckMark: {
    color: colors.cardWhite,
    fontSize: 32,
    fontWeight: '700',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primaryText,
    marginBottom: 6,
  },
  modalErrorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#D32F2F',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.mutedText,
    marginBottom: 14,
    textAlign: 'center',
  },
  modalErrorSubtitle: {
    fontSize: 14,
    color: colors.primaryText,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
  },
  modalButtonText: {
    color: colors.cardWhite,
    fontWeight: '700',
    fontSize: 16,
  },
});
