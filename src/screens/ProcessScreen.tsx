import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Modal, Animated, Easing, Dimensions, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { useMachineStore } from '../stores/machineStore';
import ScreenTitle from '../components/ScreenTitle';
import { ChevronRight } from 'lucide-react-native';

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

export default function ProcessScreen({ navigation }: any) {
  const { currentBatch, batches, startProcessing, advanceBatchStep, revertBatchStep, completeBatch, setCurrentBatch } = useMachineStore();
  const scrollViewRef = React.useRef<ScrollView>(null);
  const [mockSeconds, setMockSeconds] = React.useState(5);
  const [showCelebration, setShowCelebration] = React.useState(false);
  const [previousStep, setPreviousStep] = React.useState(0);
  const [feedCompleted, setFeedCompleted] = React.useState(false);
  const [compostCompleted, setCompostCompleted] = React.useState(false);

  React.useEffect(() => {
    if (currentBatch?.status === 'completed') {
      // Final completion - navigate to summary
      const timer = setTimeout(() => {
        navigation.navigate('Summary');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [currentBatch?.status]);

  // Detect feed completion (step 5) for feed or mixed batches
  React.useEffect(() => {
    if (currentBatch && !feedCompleted) {
      const isFeedDone = (currentBatch.type === 'feed' && currentBatch.currentStep === 5) ||
                         (currentBatch.type === 'mixed' && currentBatch.currentStep === 5 && previousStep < 5);
      
      if (isFeedDone) {
        setFeedCompleted(true);
        setShowCelebration(true);
        
        // Hide celebration after 2 seconds
        const timer = setTimeout(() => {
          setShowCelebration(false);
        }, 2000);
        
        return () => clearTimeout(timer);
      }
    }
    setPreviousStep(currentBatch?.currentStep || 0);
  }, [currentBatch?.currentStep, feedCompleted]);

  // Detect compost completion for compost or mixed batches
  React.useEffect(() => {
    if (currentBatch && !compostCompleted) {
      const isCompostDone = (currentBatch.type === 'compost' && currentBatch.currentStep === 4) ||
                            (currentBatch.type === 'mixed' && currentBatch.currentStep === 9);
      
      if (isCompostDone) {
        setCompostCompleted(true);
        setShowCelebration(true);
        
        // Hide celebration after 2 seconds
        const timer = setTimeout(() => {
          setShowCelebration(false);
        }, 2000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [currentBatch?.currentStep, compostCompleted]);

  React.useEffect(() => {
    // Auto-scroll to Compost section when Feed is completed (for mixed batches)
    if (currentBatch?.type === 'mixed' && currentBatch.currentStep > 5) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 300);
    }
  }, [currentBatch?.currentStep]);

  // Mock timer (5-second loop) - automatically advances steps only when running
  React.useEffect(() => {
    // Only run timer if batch is actively running (not stopped or paused)
    if (currentBatch?.status !== 'running') {
      return;
    }

    const timer = setInterval(() => {
      setMockSeconds((prev) => {
        if (prev <= 1) {
          // When timer resets, advance the batch step
          advanceBatchStep();
          return 5;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [currentBatch?.status, advanceBatchStep]);

  const renderProcessSection = (type: 'feed' | 'compost') => {
    const labels = type === 'feed'
      ? ['Recognition', 'Sorting', 'Grinding', 'Dehydration', 'Completion']
      : ['Recognition', 'Sorting', 'Vermicasting', 'Completion'];

    const stepImages: Record<string, any> = {
      'Recognition': require('../../assets/step1.png'),
      'Sorting': require('../../assets/sorting.gif'),
      'Grinding': require('../../assets/Grinder.gif'),
      'Dehydration': require('../../assets/Dehydration.gif'),
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
            <TouchableOpacity 
              style={styles.nextButton}
              onPress={() => advanceBatchStep()}
              activeOpacity={0.8}
            >
              <Text style={styles.nextButtonText}>Next</Text>
              <ChevronRight size={20} color={colors.cardWhite} strokeWidth={2.5} />
            </TouchableOpacity>
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

  // Determine which section to show based on batch progress
  const showFeedOnly = currentBatch?.type === 'mixed' && currentBatch.currentStep <= 5;
  const showCompostOnly = currentBatch?.type === 'mixed' && currentBatch.currentStep > 5;

  return (
    <View style={styles.container}>
      <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollContent} scrollEventThrottle={16}>
        <View style={styles.header}>
          <ScreenTitle>Process</ScreenTitle>
        </View>

        <View style={styles.cardsContainer}>
          {/* Show Feed section first, then switch to Compost when Feed is completed */}
          {(currentBatch?.type === 'feed' || showFeedOnly || !currentBatch?.type) && (
            <View style={styles.cardWrapper}>
              {renderProcessSection('feed')}
            </View>
          )}

          {(currentBatch?.type === 'compost' || showCompostOnly) && (
            <View style={styles.cardWrapper}>
              {renderProcessSection('compost')}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.timerCard} key={`timer-${mockSeconds}`}>
            <Text style={styles.timerLabel}>Mock Timer</Text>
            <Text style={styles.timerValue}>00:0{mockSeconds}</Text>
            <Text style={styles.timerHint}>Replaces Back/Start buttons for prototype only</Text>
          </View>
        </View>
      </ScrollView>

      {/* Confetti Celebration */}
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
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 12,
    gap: 8,
  },
  nextButtonText: {
    color: colors.cardWhite,
    fontWeight: '700',
    fontSize: 16,
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
