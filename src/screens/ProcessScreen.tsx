import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { useMachineStore } from '../stores/machineStore';

export default function ProcessScreen({ navigation }: any) {
  const { currentBatch, batches, startProcessing, advanceBatchStep, revertBatchStep, completeBatch, setCurrentBatch } = useMachineStore();

  React.useEffect(() => {
    if (currentBatch?.status === 'completed') {
      // navigate to summary when batch finishes
      navigation.navigate('Summary');
    }
  }, [currentBatch?.status]);

  const renderTimeline = () => {
    if (!currentBatch) return <Text style={styles.text}>No active batch.</Text>;

    const steps = (currentBatch.type === 'feed' || currentBatch.type === 'mixed') ? 5 : 4;

    const stepLabels = currentBatch.type === 'compost'
      ? ['Recognition', 'Sorting', 'Vermicasting', 'Completion']
      : ['Recognition', 'Sorting', 'Grinding', 'Dehydration', 'Completion'];

    return (
      <View style={styles.timeline}>
        <Text style={styles.batchTitle}>Batch: {currentBatch.id}</Text>
        <Text style={styles.batchSub}>Type: {currentBatch.type.toUpperCase()}</Text>

        <View style={styles.stepsRow}>
          {stepLabels.map((label, idx) => {
            const stepNum = idx + 1;
            const isActive = stepNum === currentBatch.currentStep;
            const isCompleted = stepNum < currentBatch.currentStep || currentBatch.status === 'completed';
            return (
              <View key={label} style={[styles.stepItem, isActive && styles.stepActive, isCompleted && styles.stepCompleted]}>
                <Text style={[styles.stepNum, isActive && styles.stepNumActive]}>{stepNum}</Text>
                <Text style={[styles.stepLabel, isActive && styles.stepLabelActive]}>{label}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.mutedText }]} onPress={() => revertBatchStep()}>
            <Text style={styles.actionText}>Back</Text>
          </TouchableOpacity>

          {currentBatch.status === 'queued' ? (
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={() => startProcessing()}>
              <Text style={[styles.actionText, { color: colors.cardWhite }]}>Start</Text>
            </TouchableOpacity>
          ) : currentBatch.status === 'running' ? (
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={() => advanceBatchStep()}>
              <Text style={[styles.actionText, { color: colors.cardWhite }]}>Advance</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.success }]} onPress={() => completeBatch()}>
              <Text style={[styles.actionText, { color: colors.cardWhite }]}>Complete</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderProcessSection = (type: 'feed' | 'compost') => {
    const labels = type === 'feed'
      ? ['Recognition', 'Sorting', 'Grinding', 'Dehydration', 'Completion']
      : ['Recognition', 'Sorting', 'Vermicasting', 'Completion'];

    // Determine progress count based on batch type (mixed maps feed first then compost)
    let progress = 0;
    if (currentBatch) {
      if (currentBatch.type === type) progress = currentBatch.currentStep;
      else if (currentBatch.type === 'mixed') {
        if (type === 'feed') progress = Math.min(currentBatch.currentStep, 5);
        else progress = Math.max(0, currentBatch.currentStep - 5);
      }
    }

    return (
      <View style={styles.processSection}>
        <Text style={styles.processTitle}>{type === 'feed' ? 'Feed' : 'Compost'}</Text>
        <View style={styles.stepsRow}>
          {labels.map((label, idx) => {
            const stepNum = idx + 1;
            const isActive = stepNum === progress;
            const isCompleted = stepNum <= progress && progress > 0;
            return (
              <View key={label} style={[styles.stepItem, isActive && styles.stepActive, isCompleted && styles.stepCompleted]}>
                <Text style={[styles.stepNum, isActive && styles.stepNumActive]}>{stepNum}</Text>
                <Text style={[styles.stepLabel, isActive && styles.stepLabelActive]}>{label}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Process</Text>
        </View>

        <View style={styles.section}>
          {renderProcessSection('feed')}
        </View>

        <View style={styles.section}>
          {renderProcessSection('compost')}
        </View>

        <View style={styles.section}>
          <View style={styles.actionsRow}>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.mutedText }]} onPress={() => revertBatchStep()}>
              <Text style={styles.actionText}>Back</Text>
            </TouchableOpacity>

            {currentBatch?.status === 'queued' ? (
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={() => startProcessing()}>
                <Text style={[styles.actionText, { color: colors.cardWhite }]}>Start</Text>
              </TouchableOpacity>
            ) : currentBatch?.status === 'running' ? (
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={() => advanceBatchStep()}>
                <Text style={[styles.actionText, { color: colors.cardWhite }]}>Advance</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.success }]} onPress={() => completeBatch()}>
                <Text style={[styles.actionText, { color: colors.cardWhite }]}>Complete</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.pageBackground },
  scrollContent: { padding: 16, paddingBottom: 32 },
  header: { marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '700', color: colors.primary },
  newBatch: { color: colors.primary, fontWeight: '700' },
  section: { marginTop: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.primaryText, marginBottom: 8 },
  text: { color: colors.mutedText },
  processSection: { marginTop: 12, backgroundColor: colors.cardWhite, padding: 12, borderRadius: 12 },
  processTitle: { fontSize: 16, fontWeight: '700', color: colors.primaryText, marginBottom: 8 },
  timeline: { backgroundColor: colors.cardWhite, padding: 12, borderRadius: 12 },
  batchTitle: { fontWeight: '700', color: colors.primaryText },
  batchSub: { color: colors.mutedText },
  stepsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  stepItem: { flex: 1, alignItems: 'center', padding: 8 },
  stepActive: { borderWidth: 1, borderColor: colors.primary, backgroundColor: colors.softGreenSurface, borderRadius: 8 },
  stepCompleted: { opacity: 0.6 },
  stepNum: { fontSize: 18, color: colors.mutedText, fontWeight: '700' },
  stepNumActive: { color: colors.primary },
  stepLabel: { fontSize: 12, color: colors.mutedText, marginTop: 6, textAlign: 'center' },
  stepLabelActive: { color: colors.primary },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  actionBtn: { flex: 1, padding: 12, borderRadius: 8, marginHorizontal: 6, alignItems: 'center' },
  actionText: { fontWeight: '700', color: colors.cardWhite },
  batchItem: { backgroundColor: colors.cardWhite, padding: 10, borderRadius: 8, marginBottom: 8 },
  batchText: { color: colors.primaryText, fontWeight: '600' },
});
