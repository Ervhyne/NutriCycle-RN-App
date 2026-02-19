import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Animated, Easing, Dimensions, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { useMachineStore } from '../stores/machineStore';
import ScreenTitle from '../components/ScreenTitle';

const { height: screenHeight } = Dimensions.get('window');

// Confetti particle component
const ConfettiPiece = ({ delay }: { delay: number }) => {
  const translateY = React.useRef(new Animated.Value(-100)).current;
  const translateX = React.useRef(new Animated.Value(0)).current;
  const rotation = React.useRef(new Animated.Value(0)).current;
  const { width: screenWidth } = Dimensions.get('window');
  const randomLeft = (Math.random() * screenWidth) - (screenWidth / 2);
  const randomDuration = 2500 + Math.random() * 1000;
  const emojis = ['🎉', '✨', '🌟', '🎊', '🎈'];
  const emoji = emojis[Math.floor(Math.random() * emojis.length)];

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: screenHeight + 100,
        duration: randomDuration,
        delay: delay,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: randomLeft,
        duration: randomDuration,
        delay: delay,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
      Animated.timing(rotation, {
        toValue: Math.random() > 0.5 ? 360 : -360,
        duration: randomDuration,
        delay: delay,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.confettiPiece,
        {
          transform: [
            { translateY },
            { translateX },
            { rotate: rotation.interpolate({
              inputRange: [0, 360],
              outputRange: ['0deg', '360deg'],
            }) },
          ],
        },
      ]}
    >
      <Text style={styles.confettiEmoji}>{emoji}</Text>
    </Animated.View>
  );
};

export default function ProcessScreen() {
  const { currentBatch } = useMachineStore();
  const scrollViewRef = useRef<ScrollView>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [previousStep, setPreviousStep] = useState(0);
  const [feedCompleted, setFeedCompleted] = useState(false);
  const [compostCompleted, setCompostCompleted] = useState(false);

  // Celebration and scroll logic
  useEffect(() => {
    if (!currentBatch) return;
    const isFeedDone = (currentBatch.type === 'feed' && currentBatch.currentStep === 4) ||
      (currentBatch.type === 'mixed' && currentBatch.currentStep === 4 && previousStep < 4);
    if (isFeedDone && !feedCompleted) {
      setFeedCompleted(true);
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [currentBatch?.currentStep, currentBatch?.type, feedCompleted, previousStep]);
  useEffect(() => {
    if (currentBatch && currentBatch.currentStep !== previousStep) {
      setPreviousStep(currentBatch.currentStep);
    }
  }, [currentBatch?.currentStep]);
  useEffect(() => {
    if (!currentBatch) return;
    const isCompostDone = (currentBatch.type === 'compost' && currentBatch.currentStep === 2) ||
      (currentBatch.type === 'mixed' && currentBatch.currentStep === 6);
    if (isCompostDone && !compostCompleted) {
      setCompostCompleted(true);
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [currentBatch?.currentStep, currentBatch?.type, compostCompleted]);
  useEffect(() => {
    if (currentBatch?.type === 'mixed' && currentBatch.currentStep > 5) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 300);
    }
  }, [currentBatch?.currentStep]);

  // Render process section
  const renderProcessSection = (type: 'feed' | 'compost') => {
    const labels = type === 'feed'
      ? ['Sorting', 'Grinding', 'Dehydration', 'Feed Completed']
      : ['Vermicasting', 'Compost Completed'];
    const stepImages: Record<string, any> = {
      'Sorting': require('../../assets/Sorting.gif'),
      'Grinding': require('../../assets/grinding.gif'),
      'Dehydration': require('../../assets/Dehydration.gif'),
      'Feed Completed': require('../../assets/feedcompletion.gif'),
      'Vermicasting': require('../../assets/Vermicasting.gif'),
      'Compost Completed': require('../../assets/Compostcompletion.png'),
    };
    // Map currentStep to progress for each process type
    let progress = 0;
    if (type === 'feed') {
      if (currentBatch?.type === 'feed' || currentBatch?.type === 'mixed') {
        // Feed steps: 1-4 (Sorting, Grinding, Dehydration, Feed Completed)
        progress = Math.min(currentBatch.currentStep, 4);
      }
    } else {
      if (currentBatch?.type === 'compost') {
        // Compost steps: 1-2 (Vermicasting, Compost Completed)
        progress = Math.max(0, Math.min(currentBatch.currentStep - 1, 2));
      } else if (currentBatch?.type === 'mixed') {
        // Mixed: compost steps start at step 5 (steps 5-6)
        progress = currentBatch.currentStep >= 5 ? Math.min(currentBatch.currentStep - 4, 2) : 0;
      }
    }
    let imageKey = labels[0];
    if (progress > 0 && progress <= labels.length) {
      imageKey = labels[progress - 1];
    }
    return (
      <View style={styles.processSection}>
        <View style={styles.processHeader}>
          <Text style={styles.processTitle}>{type === 'feed' ? 'Feed Process' : 'Compost Process'}</Text>
        </View>
        <View style={styles.activeImageSection}>
          <Image 
            key={`gif-${type}-${imageKey}`}
            source={stepImages[imageKey]} 
            style={styles.activeImage} 
            resizeMode="contain"
          />
        </View>
        <View style={styles.stepsRow}>
          {labels.map((label, idx) => {
            const stepNum = idx + 1;
            const isActive = stepNum === progress;
            const isCompleted = stepNum < progress;
            return (
              <View key={`${type}-step-${idx}`} style={[styles.stepCard, isActive && styles.stepCardActive, isCompleted && styles.stepCardCompleted]}>
                <View style={[styles.stepNumber, isActive && styles.stepNumberActive, isCompleted && styles.stepNumberCompleted]}>
                  <Text style={[isActive || isCompleted ? { color: colors.cardWhite, fontSize: 24, fontWeight: '800' } : { color: colors.mutedText, fontSize: 20, fontWeight: '800' }]}>
                    {stepNum}
                  </Text>
                </View>
                <Text style={[styles.stepCardLabel, isActive && styles.stepCardLabelActive]}>{label}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  if (!currentBatch) {
    return (
      <View style={styles.container}>
        <ScreenTitle>No Batch Running</ScreenTitle>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollContent} scrollEventThrottle={16}>
        <View style={styles.header}>
          <ScreenTitle>Process</ScreenTitle>
        </View>
        <View style={styles.cardsContainer}>
          <View style={styles.cardWrapper}>
            {renderProcessSection('feed')}
            {(currentBatch.type === 'compost' || currentBatch.type === 'mixed') && renderProcessSection('compost')}
          </View>
        </View>
      </ScrollView>
      {showCelebration && (
        <View key={`confetti-${feedCompleted}-${compostCompleted}`} style={styles.confettiContainer}>
          {Array.from({ length: 60 }).map((_, idx) => (
            <ConfettiPiece key={idx} delay={idx * 20} />
          ))}
        </View>
      )}
    </View>
  );
}
// end of ProcessScreen component

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
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.cardSurface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 16,
  },
  activeImage: {
    width: 320,
    height: 260,
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
    alignItems: 'center',
    marginTop: 20,
    gap: 12,
    paddingHorizontal: 8,
  },
  stepCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 16,
    backgroundColor: colors.cardWhite,
  },
  stepCardActive: {
    backgroundColor: colors.softGreenSurface,
  },
  stepCardCompleted: {
    backgroundColor: colors.cardWhite,
  },
  stepNumber: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.cardSurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    fontSize: 28,
    fontWeight: '800',
    color: colors.mutedText,
    lineHeight: 60,
    textAlignVertical: 'center',
  },
  stepNumberActive: {
    backgroundColor: colors.primary,
    color: colors.cardWhite,
    fontSize: 32,
    fontWeight: '900',
  },
  stepNumberCompleted: {
    backgroundColor: colors.primary,
    color: colors.cardWhite,
  },
  stepCardLabel: {
    fontSize: 9,
    color: colors.mutedText,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 18,
  },
  stepCardLabelActive: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 10,
  },
  nextButton: {
    marginTop: 20,
    paddingVertical: 14,
    paddingHorizontal: 32,
    backgroundColor: colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.cardWhite,
  },
  nextButtonDisabled: {
    opacity: 0.5,
    backgroundColor: colors.mutedText,
  },
  timerCard: {
    backgroundColor: colors.cardWhite,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  timerLabel: {
    fontSize: 14,
    color: colors.mutedText,
    marginBottom: 8,
    fontWeight: '600',
  },
  timerValue: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1,
  },
  timerHint: {
    marginTop: 6,
    fontSize: 12,
    color: colors.mutedText,
    textAlign: 'center',
  },
  batchItem: { backgroundColor: colors.cardWhite, padding: 10, borderRadius: 8, marginBottom: 8 },
  batchText: { color: colors.primaryText, fontWeight: '600' },
  statusText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.mutedText,
    textAlign: 'center',
    fontWeight: '600',
  },
  stageText: {
    marginTop: 8,
    fontSize: 13,
    color: colors.primary,
    textAlign: 'center',
    fontWeight: '700',
  },
  processStatusCard: {
    backgroundColor: colors.cardWhite,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  statusLabel: {
    fontSize: 12,
    color: colors.mutedText,
    marginBottom: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stageValue: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
    textAlign: 'center',
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  confettiPiece: {
    position: 'absolute',
    top: -50,
  },
  confettiEmoji: {
    fontSize: 30,
  },
  celebrationMessage: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  celebrationTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  celebrationSubtext: {
    fontSize: 16,
    color: colors.primaryText,
    textAlign: 'center',
    fontWeight: '600',
  },
});
