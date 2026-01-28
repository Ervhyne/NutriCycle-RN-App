import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { Play, StopCircle } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { useMachineStore } from '../stores/machineStore';

export default function ControlPanel() {
  const { startProcessing, stopProcessing, currentBatch, startBatchAPI, stopBatchAPI, createBatchProcess } = useMachineStore();
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [isStopped, setIsStopped] = useState(false);
  const [loading, setLoading] = useState(false);

  // Reset isStopped when a batch starts running, set stopped when idle
  useEffect(() => {
    if (currentBatch?.status === 'running') {
      setIsStopped(false);
    } else if (currentBatch?.status === 'idle') {
      setIsStopped(true);
    }
  }, [currentBatch?.status]);

  const handleStopPress = () => {
    if (!isStopped) {
      setConfirmVisible(true);
    }
  };

  const handleStartPress = async () => {
    if (!currentBatch) {
      alert('No batch selected');
      return;
    }

    setLoading(true);
    try {
      // Start the batch status to 'running'
      await startBatchAPI();
      
      // Create process (feed or compost) - default to mixed/feed for now
      const processType = currentBatch.type === 'compost' ? 'compost' : 'feed';
      await createBatchProcess(processType);
      
      setIsStopped(false);
      startProcessing();
    } catch (err) {
      console.error('Start batch error:', err);
      alert('Failed to start batch');
    } finally {
      setLoading(false);
    }
  };

  const confirmStop = async () => {
    if (!currentBatch) {
      alert('No batch selected');
      setConfirmVisible(false);
      return;
    }

    setConfirmVisible(false);
    setLoading(true);
    
    try {
      await stopBatchAPI();
      setIsStopped(true);
      stopProcessing();
    } catch (err) {
      console.error('Stop batch error:', err);
      alert('Failed to stop batch');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'running':
        return colors.success;
      case 'idle':
        return colors.warning;
      case 'completed':
        return colors.primary;
      default:
        return colors.mutedText;
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'running':
        return 'Running';
      case 'idle':
        return 'Idle';
      case 'completed':
        return 'Completed';
      default:
        return 'No Batch';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.column}>
        <TouchableOpacity 
          style={[styles.button, loading && styles.disabled]} 
          onPress={handleStartPress} 
          activeOpacity={0.8}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.cardWhite} />
          ) : (
            <Play size={20} color={colors.cardWhite} />
          )}
          <Text style={styles.buttonText}>{loading ? 'Starting...' : 'Start'}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, styles.stop, isStopped && styles.disabled]} 
          onPress={handleStopPress} 
          activeOpacity={isStopped ? 1 : 0.8}
          disabled={isStopped || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.cardWhite} />
          ) : (
            <StopCircle size={20} color={colors.cardWhite} />
          )}
          <Text style={styles.buttonText}>{loading ? 'Stopping...' : 'Stop'}</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={confirmVisible}
        onRequestClose={() => setConfirmVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Emergency Stop</Text>
            <Text style={styles.modalMessage}>Are you sure you want to stop the machine?</Text>
            <TouchableOpacity
              style={styles.modalPrimary}
              onPress={confirmStop}
              activeOpacity={0.85}
            >
              <Text style={styles.modalPrimaryText}>OK</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setConfirmVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 18,
    marginTop: 8,
    backgroundColor: 'transparent',
    borderRadius: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  statusCard: {
    backgroundColor: colors.cardWhite,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryText,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.cardWhite,
    textTransform: 'capitalize',
  },
  statusInfo: {
    gap: 6,
  },
  statusInfoText: {
    fontSize: 13,
    color: colors.mutedText,
    fontWeight: '500',
  },
  column: {
    flexDirection: 'column',
    gap: 12,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    alignItems: 'center',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
  },
  pause: {
    backgroundColor: colors.warning,
  },
  stop: {
    backgroundColor: colors.danger,
  },
  disabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: colors.cardWhite,
    fontWeight: '800',
    marginLeft: 4,  
  },
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
    alignItems: 'center',
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
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalPrimary: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  modalPrimaryText: {
    color: colors.cardWhite,
    fontSize: 16,
    fontWeight: '700',
  },
  modalCancel: {
    paddingVertical: 12,
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
  },
  modalCancelText: {
    color: colors.mutedText,
    fontSize: 15,
    fontWeight: '600',
  },
});