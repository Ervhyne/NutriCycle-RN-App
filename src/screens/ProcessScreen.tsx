import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Modal, Animated, Easing, Dimensions, TouchableOpacity } from 'react-native';
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

export default function ProcessScreen({ navigation }: any) {
  const { currentBatch, batches, startProcessing, advanceBatchStep, revertBatchStep, completeBatch, setCurrentBatch, startBatchAPI, stopBatchAPI, getBatchProcess, updateBatchProcessStage, createBatchProcess } = useMachineStore();
  const scrollViewRef = React.useRef<ScrollView>(null);
  const [showCelebration, setShowCelebration] = React.useState(false);
  const [previousStep, setPreviousStep] = React.useState(0);
  const [feedCompleted, setFeedCompleted] = React.useState(false);
  const [compostCompleted, setCompostCompleted] = React.useState(false);
  const [batchProcess, setBatchProcess] = React.useState<any>(null);
  const [fetchingProcess, setFetchingProcess] = React.useState(false);
  const [lastAdvancedStage, setLastAdvancedStage] = React.useState<string | null>(null);
  const [processInitialized, setProcessInitialized] = React.useState(false);

  React.useEffect(() => {
    if (currentBatch?.status === 'completed') {
      // Final completion - navigate to summary
      const timer = setTimeout(() => {
        navigation.navigate('Summary');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [currentBatch?.status]);

  // Fetch batch process data from database when batch starts
  React.useEffect(() => {
    if (!currentBatch) return;

    const fetchProcess = async () => {
      setFetchingProcess(true);
      try {
        let process = await getBatchProcess();
        console.log('[ProcessScreen] Batch process fetched from DB:', process);
        
        // If process doesn't exist yet, create it
        if (!process || !process.process) {
          console.log('[ProcessScreen] No process found, creating initial process');
          const batchType = currentBatch.type || 'feed';
          
          try {
            if (batchType === 'feed' || batchType === 'mixed') {
              await createBatchProcess('feed');
              console.log('[ProcessScreen] Initial feed process created');
            } else if (batchType === 'compost') {
              await createBatchProcess('compost');
              console.log('[ProcessScreen] Initial compost process created');
            }
            
            // Re-fetch to get the full structure
            process = await getBatchProcess();
            console.log('[ProcessScreen] Process after creation:', process);
          } catch (createError) {
            console.error('[ProcessScreen] Error creating process:', createError);
            // If creation fails, try to fetch again in case it was created elsewhere
            process = await getBatchProcess();
          }
        }
        
        if (process) {
          setBatchProcess(process);
          setLastAdvancedStage(process.currentStage);
          setProcessInitialized(true);
        }
      } catch (error) {
        console.error('[ProcessScreen] Error fetching process:', error);
      } finally {
        setFetchingProcess(false);
      }
    };

    // Fetch immediately when batch is running
    if (currentBatch.status === 'running') {
      setProcessInitialized(false);
      fetchProcess();
    }
  }, [currentBatch?.id, currentBatch?.status]);

  // Handle Next button click for manual advancement
  const handleNextClick = async () => {
    console.log('[ProcessScreen] Next button clicked');
    
    if (!batchProcess) {
      console.error('[ProcessScreen] No batchProcess available');
      return;
    }

    console.log('[ProcessScreen] === FULL BATCH PROCESS ===');
    console.log('[ProcessScreen] batchProcess:', batchProcess);
    console.log('[ProcessScreen] JSON.stringify:', JSON.stringify(batchProcess, null, 2));

    const feedStages = ['Sorting', 'Grinding', 'Dehydration', 'feed completed'];
    const compostStages = ['Vermicasting', 'Compost Completed'];

    // Get the process object (API returns { batchId, process: {...} })
    const process = batchProcess.process || batchProcess;
    console.log('[ProcessScreen] process object:', process);
    console.log('[ProcessScreen] process.feedStatus:', process?.feedStatus);
    console.log('[ProcessScreen] process.compostStatus:', process?.compostStatus);
    
    const currentFeedStatus = process?.feedStatus;
    const currentCompostStatus = process?.compostStatus;

    console.log('[ProcessScreen] Current status:', { currentFeedStatus, currentCompostStatus });
    console.log('[ProcessScreen] feedStages:', feedStages);
    console.log('[ProcessScreen] compostStages:', compostStages);

    try {
      // Advance feed if not completed
      if (currentFeedStatus && currentFeedStatus !== 'feed completed') {
        const feedIndex = feedStages.indexOf(currentFeedStatus);
        console.log('[ProcessScreen] Feed index:', feedIndex, 'in stages:', feedStages);
        
        if (feedIndex >= 0 && feedIndex < feedStages.length - 1) {
          const nextFeedStatus = feedStages[feedIndex + 1];
          console.log('[ProcessScreen] Button: Advancing FEED from', currentFeedStatus, 'to', nextFeedStatus);
          
          try {
            const updated = await updateBatchProcessStage(nextFeedStatus, null);
            console.log('[ProcessScreen] Feed API response:', JSON.stringify(updated, null, 2));
            
            // Wait a moment for DB to sync
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const fresh = await getBatchProcess();
            console.log('[ProcessScreen] Fresh data from DB after update:', JSON.stringify(fresh, null, 2));
            if (fresh && fresh.process) {
              console.log('[ProcessScreen] Setting batchProcess to:', fresh);
              setBatchProcess(fresh);
            } else {
              console.error('[ProcessScreen] Failed to get fresh process data from DB. Response:', fresh);
            }
          } catch (error) {
            console.error('[ProcessScreen] Error during feed advancement:', error);
          }
          return;
        } else {
          console.log('[ProcessScreen] Feed already at final stage or index not found');
        }
      }
      
      // Advance compost if feed is completed OR if we're already in compost mode
      console.log('[ProcessScreen] Checking compost advancement. Feed status:', currentFeedStatus, 'Compost status:', currentCompostStatus);
      
      if (currentFeedStatus === 'feed completed' || currentCompostStatus) {
        // If compost hasn't started yet, initialize it
        if (!currentCompostStatus) {
          console.log('[ProcessScreen] Feed completed, starting compost with Vermicasting');
          const updated = await updateBatchProcessStage(null, 'Vermicasting');
          console.log('[ProcessScreen] Compost initialized API response:', updated);
          
          const fresh = await getBatchProcess();
          console.log('[ProcessScreen] Fresh data from DB:', fresh);
          if (fresh) {
            console.log('[ProcessScreen] Setting batchProcess to:', fresh);
            setBatchProcess(fresh);
          } else {
            console.error('[ProcessScreen] Failed to get fresh data from DB');
          }
          return;
        }
        
        // If compost already started, advance it
        if (currentCompostStatus && currentCompostStatus !== 'Compost Completed') {
          const compostIndex = compostStages.indexOf(currentCompostStatus);
          console.log('[ProcessScreen] Compost index:', compostIndex, 'in stages:', compostStages);
          
          if (compostIndex >= 0 && compostIndex < compostStages.length - 1) {
            const nextCompostStatus = compostStages[compostIndex + 1];
            console.log('[ProcessScreen] Button: Advancing COMPOST from', currentCompostStatus, 'to', nextCompostStatus);
            
            const updated = await updateBatchProcessStage(null, nextCompostStatus);
            console.log('[ProcessScreen] Compost API response:', updated);
            
            const fresh = await getBatchProcess();
            console.log('[ProcessScreen] Fresh data from DB:', fresh);
            if (fresh) {
              console.log('[ProcessScreen] Setting batchProcess to:', fresh);
              setBatchProcess(fresh);
              
              // If we just completed compost, navigate to summary
              if (nextCompostStatus === 'Compost Completed') {
                console.log('[ProcessScreen] Compost completed! Navigating to Summary in 5 seconds...');
                setTimeout(() => {
                  navigation.navigate('Summary');
                }, 5000);
              }
            } else {
              console.error('[ProcessScreen] Failed to get fresh data from DB');
            }
            return;
          } else {
            console.log('[ProcessScreen] Compost already at final stage');
          }
        }
      }
      
      console.log('[ProcessScreen] No valid advancement found');
    } catch (error) {
      console.error('[ProcessScreen] Error advancing status:', error);
    }
  };

  // Detect feed completion for feed or mixed batches
  React.useEffect(() => {
    if (!currentBatch) return;
    
    const isFeedDone = (currentBatch.type === 'feed' && currentBatch.currentStep === 4) ||
                       (currentBatch.type === 'mixed' && currentBatch.currentStep === 4 && previousStep < 4);
    
    if (isFeedDone && !feedCompleted) {
      setFeedCompleted(true);
      setShowCelebration(true);
      
      const timer = setTimeout(() => {
        setShowCelebration(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [currentBatch?.currentStep, currentBatch?.type, feedCompleted, previousStep]);

  // Track previous step separately
  React.useEffect(() => {
    if (currentBatch && currentBatch.currentStep !== previousStep) {
      setPreviousStep(currentBatch.currentStep);
    }
  }, [currentBatch?.currentStep]);

  // Detect compost completion for compost or mixed batches
  React.useEffect(() => {
    if (!currentBatch) return;
    
    const isCompostDone = (currentBatch.type === 'compost' && currentBatch.currentStep === 2) ||
                          (currentBatch.type === 'mixed' && currentBatch.currentStep === 6);
    
    if (isCompostDone && !compostCompleted) {
      setCompostCompleted(true);
      setShowCelebration(true);
      
      const timer = setTimeout(() => {
        setShowCelebration(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [currentBatch?.currentStep, currentBatch?.type, compostCompleted]);

  React.useEffect(() => {
    // Auto-scroll to Compost section when Feed is completed (for mixed batches)
    if (currentBatch?.type === 'mixed' && currentBatch.currentStep > 5) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 300);
    }
  }, [currentBatch?.currentStep]);

  // Mock timer removed - using manual Next button instead

  const renderProcessSection = (type: 'feed' | 'compost') => {
    const labels = type === 'feed'
      ? ['Sorting', 'Grinding', 'Dehydration', 'feed completed']
      : ['Vermicasting', 'Compost Completed'];

    const stepImages: Record<string, any> = {
      'Sorting': require('../../assets/Sorting.gif'),
      'Grinding': require('../../assets/grinding.gif'),
      'Dehydration': require('../../assets/Dehydration.gif'),
      'feed completed': require('../../assets/feedcompletion.gif'),
      'Vermicasting': require('../../assets/Vermicasting.gif'),
      'Compost Completed': require('../../assets/Compostcompletion.png'),
    };

    // Get the process object (API returns { batchId, process: {...} })
    const process = batchProcess?.process || batchProcess;

    // Calculate progress based on status
    let progress = 0;
    let currentStatus = '';
    
    if (type === 'feed') {
      currentStatus = process?.feedStatus || '';
      if (currentStatus) {
        const statusIndex = labels.indexOf(currentStatus);
        progress = statusIndex >= 0 ? statusIndex + 1 : 0;
      }
    } else {
      currentStatus = process?.compostStatus || '';
      if (currentStatus) {
        const statusIndex = labels.indexOf(currentStatus);
        progress = statusIndex >= 0 ? statusIndex + 1 : 0;
      }
    }

    // Determine if button should be disabled for this section
    let isButtonDisabled = false;
    
    if (!batchProcess) {
      isButtonDisabled = true;
    } else if (type === 'feed') {
      // For feed: disable only if feed completed AND compost has already started
      isButtonDisabled = process?.feedStatus === 'feed completed' && process?.compostStatus;
    } else if (type === 'compost') {
      // For compost: disable only if compost is completed
      isButtonDisabled = process?.compostStatus === 'Compost Completed';
    }

    // Determine which image to show
    let imageKey = labels[0]; // default to first step
    if (progress > 0 && progress <= labels.length) {
      imageKey = labels[progress - 1];
    }

    return (
      <View style={styles.processSection}>
        <View style={styles.processHeader}>
          
          <Text style={styles.processTitle}>{type === 'feed' ? 'Feed Process' : 'Compost Process'}</Text>
        </View>

        {/* Display active step image at top */}
        {(
          <View style={styles.activeImageSection}>
            <Image 
              source={stepImages[imageKey]} 
              style={styles.activeImage} 
              resizeMode="contain" 
            />
          </View>
        )}

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

        {/* Next Button */}
        <TouchableOpacity 
          style={[styles.nextButton, (isButtonDisabled) && styles.nextButtonDisabled]}
          onPress={handleNextClick}
          disabled={isButtonDisabled}
        >
          <Text style={styles.nextButtonText}>Next →</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Determine which section to show based on batch progress
  const process = batchProcess?.process || batchProcess;
  const feedCompleteFromDB = process?.feedStatus === 'feed completed';
  const compostStarted = process?.compostStatus && process.compostStatus !== '';
  
  // Show feed process until compost has actually started
  const showFeedProcess = !compostStarted;
  const showCompostProcess = compostStarted;

  return (
    <View style={styles.container}>
      <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollContent} scrollEventThrottle={16}>
        <View style={styles.header}>
          <ScreenTitle>Process</ScreenTitle>
        </View>

        <View style={styles.cardsContainer}>
          {/* Show Feed section until compost starts */}
          {showFeedProcess && (
            <View style={styles.cardWrapper}>
              {renderProcessSection('feed')}
            </View>
          )}

          {/* Show Compost section once compost has started */}
          {showCompostProcess && (
            <View style={styles.cardWrapper}>
              {renderProcessSection('compost')}
            </View>
          )}
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
    width: 300,
    height: 300,
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
