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
  Modal,
} from 'react-native';
import { QrCode, Hash, X, PlusCircle } from 'lucide-react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
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
  const [errorTitle, setErrorTitle] = useState('Error');
  const [loading, setLoading] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [showNameModal, setShowNameModal] = useState(false);

  const handleAddMachine = async () => {
    if (!machineId.trim()) {
      setErrorTitle('Missing Field');
      setErrorMessage('Please enter a Machine ID');
      setErrorModalVisible(true);
      return;
    }

    if (!machineName.trim()) {
      setErrorTitle('Missing Field');
      setErrorMessage('Please enter a Machine Name');
      setErrorModalVisible(true);
      return;
    }

    // Check if machine with same machineId already exists in store
    const { machines } = useMachineStore.getState();
    const duplicate = machines.find(
      (m) => m.machineId.toUpperCase() === machineId.trim().toUpperCase()
    );
    if (duplicate) {
      setErrorTitle('Already Added');
      setErrorMessage(`Machine "${duplicate.name || duplicate.machineId}" is already added to your account.`);
      setErrorModalVisible(true);
      return;
    }

    setLoading(true);

    try {
      // Register machine with API server
      const apiUrl = await getApiBaseUrl();
      if (!apiUrl) {
        setErrorTitle('Configuration');
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
        isOnline: registeredMachine.status === 'online' || registeredMachine.status === 'running',
      };

      addMachine(newMachine);
      setAddedMachineName(newMachine.name);
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('Error registering machine:', error);
      setErrorTitle('Oops!');
      setErrorMessage(error.message || 'Failed to register machine. Please try again.');
      setErrorModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleScanQR = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert(
          'Camera Permission Required',
          'Please allow camera access in your device settings to scan QR codes.'
        );
        return;
      }
    }
    setScanned(false);
    setScannerOpen(true);
  };

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    let scannedMachineId = '';
    let scannedName = '';

    // Try parsing as JSON (QR may contain { machineId, name })
    try {
      const parsed = JSON.parse(data);
      if (parsed.machineId) {
        scannedMachineId = parsed.machineId.trim().toUpperCase();
        scannedName = parsed.name || '';
      }
    } catch {
      // Not JSON — treat as plain machine ID
      scannedMachineId = data.trim().toUpperCase();
    }

    setMachineId(scannedMachineId);
    setMachineName(scannedName);
    setScannerOpen(false);

    // Show the name modal after QR scan
    setTimeout(() => setShowNameModal(true), 300);
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
              <Text style={styles.modalErrorTitle}>{errorTitle}</Text>
              <Text style={styles.modalErrorSubtitle}>{errorMessage}</Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setErrorModalVisible(false);
                  setErrorTitle('Error');
                }}
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

      {/* QR Scanner Modal */}
      <Modal visible={scannerOpen} animationType="slide">
        <View style={styles.scannerContainer}>
          <CameraView
            style={styles.camera}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          />
          <View style={styles.scannerOverlay}>
            <View style={styles.scannerFrame} />
            <Text style={styles.scannerHint}>Point camera at QR code on your NutriCycle device</Text>
          </View>
          <TouchableOpacity
            style={[styles.closeButton, { top: 16 + insets.top }]}
            onPress={() => setScannerOpen(false)}
          >
            <X size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Machine Name Modal (after QR scan) */}
      <Modal visible={showNameModal} animationType="fade" transparent>
        <KeyboardAvoidingView
          style={styles.nameModalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.nameModalCard}>
            <Image source={require('../../assets/Add Machine Asset.png')} style={styles.nameModalImage} resizeMode="contain" />
            <Text style={styles.nameModalTitle}>Name Your Machine</Text>
            <Text style={styles.nameModalId}>Machine ID: {machineId}</Text>

            <Text style={styles.nameModalLabel}>Machine Name</Text>
            <TextInput
              style={styles.nameModalInput}
              value={machineName}
              onChangeText={setMachineName}
              autoFocus
            />

            <TouchableOpacity
              style={[styles.nameModalAddBtn, loading && styles.nameModalAddBtnDisabled]}
              onPress={() => {
                setShowNameModal(false);
                handleAddMachine();
              }}
              activeOpacity={0.85}
              disabled={loading}
            >
              <Text style={styles.nameModalAddBtnText}>{loading ? 'Adding...' : 'Add Machine'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowNameModal(false);
                setMachineId('');
                setMachineName('');
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    color: colors.mutedText,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  /* Scanner */
  scannerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  scannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerFrame: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: colors.primary,
    borderRadius: 20,
  },
  scannerHint: {
    color: '#fff',
    fontSize: 14,
    marginTop: 20,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
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
    color: colors.primaryText,
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

  /* Name Modal (after QR scan) */
  nameModalOverlay: {
    flex: 1,
    backgroundColor: '#00000055',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  nameModalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.creamBackground,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
  nameModalImage: {
    width: 80,
    height: 80,
    marginBottom: 12,
  },
  nameModalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primaryText,
    marginBottom: 4,
  },
  nameModalId: {
    fontSize: 14,
    color: colors.mutedText,
    fontWeight: '600',
    marginBottom: 20,
  },
  nameModalLabel: {
    alignSelf: 'flex-start',
    fontSize: 16,
    fontWeight: '600',
    color: colors.primaryText,
    marginBottom: 8,
  },
  nameModalInput: {
    width: '100%',
    backgroundColor: colors.cardSurface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 16,
    padding: 18,
    fontSize: 16,
    color: colors.primaryText,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  nameModalAddBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: colors.primary,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  nameModalAddBtnDisabled: {
    opacity: 0.7,
  },
  nameModalAddBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
});
