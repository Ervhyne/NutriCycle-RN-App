import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { colors } from '../theme/colors';
import { useMachineStore } from '../stores/machineStore';
import ScreenTitle from '../components/ScreenTitle';

export default function ProcessScreen({ navigation }: any) {
  const { currentBatch, batches, startProcessing, advanceBatchStep, revertBatchStep, completeBatch, setCurrentBatch } = useMachineStore();
  const scrollViewRef = React.useRef<ScrollView>(null);

  React.useEffect(() => {
    if (currentBatch?.status === 'completed') {
      // navigate to summary when batch finishes
      navigation.navigate('Summary');
    }
  }, [currentBatch?.status]);

  React.useEffect(() => {
    // Auto-scroll to Compost section when Feed is completed (for mixed batches)
    if (currentBatch?.type === 'mixed' && currentBatch.currentStep > 5) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 300);
    }
  }, [currentBatch?.currentStep]);

  const renderProcessSection = (type: 'feed' | 'compost') => {
    const labels = type === 'feed'
      ? ['Recognition', 'Sorting', 'Grinding', 'Dehydration', 'Completion']
      : ['Recognition', 'Sorting', 'Vermicasting', 'Completion'];

    const stepImages: Record<string, any> = {
      'Recognition': require('../../assets/step1.png'),
      'Sorting': require('../../assets/sorting.gif'),
      'Grinding': require('../../assets/Grinder.gif'),
      'Dehydration': require('../../assets/step4.png'),
      'Completion': require('../../assets/step3.png'),
      'Vermicasting': require('../../assets/step3.png'),
    };

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
        <View style={styles.processHeader}>
          
          <Text style={styles.processTitle}>{type === 'feed' ? 'Feed' : 'Compost'}</Text>
        </View>

        {/* Display active step image at top */}
        {(
          <View style={styles.activeImageSection}>
            <Image 
              source={stepImages[labels[progress > 0 ? progress - 1 : 0]]} 
              style={styles.activeImage} 
              resizeMode="contain" 
            />
          </View>
        )}

        <View style={styles.stepsRow}>
          {labels.map((label, idx) => {
            const stepNum = idx + 1;
            const isActive = stepNum === progress;
            const isCompleted = stepNum <= progress && progress > 0;
            return (
              <View key={`${type}-step-${idx}`} style={[styles.stepItem, isActive && styles.stepActive, isCompleted && styles.stepCompleted]}>
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
      <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollContent} scrollEventThrottle={16}>
        <View style={styles.header}>
          <ScreenTitle>Process</ScreenTitle>
        </View>

        <View style={styles.cardsContainer}>
          <View style={styles.cardWrapper}>
            {renderProcessSection('feed')}
          </View>

          <View style={styles.cardWrapper}>
            {renderProcessSection('compost')}
          </View>
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
  container: { flex: 1, backgroundColor: colors.creamBackground },
  scrollContent: { padding: 16, paddingBottom: 32 },
  header: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '700', color: colors.primary },
  newBatch: { color: colors.primary, fontWeight: '700' },
  section: { marginTop: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.primaryText, marginBottom: 8 },
  text: { color: colors.mutedText },
  cardsContainer: {
    flexDirection: 'column',
    gap: 12,
    marginTop: 16,
    marginBottom: 16,
  },
  cardWrapper: {
    flex: 1,
  },
  processSection: {
    marginTop: 16,
    backgroundColor: colors.cardWhite,
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  processHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  processIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  processTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    flex: 1,
  },
  activeImageSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 3,
    paddingHorizontal: 12,
    backgroundColor: colors.cardSurface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 16,
  },
  activeImage: {
    width: 210,
    height: 210,
  },
  timeline: {
    backgroundColor: colors.cardWhite,
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  batchTitle: { fontSize: 18, fontWeight: '700', color: colors.primaryText, marginBottom: 4 },
  batchSub: { fontSize: 13, color: colors.mutedText, marginBottom: 16 },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 16,
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
    padding: 8,
    borderRadius: 12,
  },
  stepActive: {
    padding: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.softGreenSurface,
    borderRadius: 12,
  },
  stepCompleted: {
    opacity: 0.5,
  },
  stepImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: colors.cardSurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  stepImage: {
    width: 100,
    height: 50,
  },
  stepNum: {
    fontSize: 20,
    color: colors.mutedText,
    fontWeight: '800',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cardSurface,
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: 40,
    marginTop: 10,
  },
  stepNumActive: {
    color: colors.cardWhite,
    backgroundColor: colors.primary,
  },
  stepLabel: {
    fontSize: 11,
    color: colors.mutedText,
    marginTop: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  stepLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 20,
  },
  actionBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionText: { fontWeight: '700', color: colors.cardWhite, fontSize: 16 },
  batchItem: { backgroundColor: colors.cardWhite, padding: 10, borderRadius: 8, marginBottom: 8 },
  batchText: { color: colors.primaryText, fontWeight: '600' },
});
