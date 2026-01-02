import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  Animated,
  Easing,
  Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp, useRoute, RouteProp } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import { sendPasswordResetEmail, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../config/firebase';
import { colors } from '../../theme/colors';
import ScreenTitle from '../../components/ScreenTitle';
import { RootStackParamList } from '../../navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

type VerificationCodeScreenNavigationProp = NavigationProp<RootStackParamList, 'VerificationCode'>;
type VerificationCodeScreenRouteProp = RouteProp<RootStackParamList, 'VerificationCode'>;

export const VerificationCodeScreen = () => {
  const navigation = useNavigation<VerificationCodeScreenNavigationProp>();
  const route = useRoute<VerificationCodeScreenRouteProp>();
  const { email, verificationCode, purpose, password, confirmPassword } = route.params;
  
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1200,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinValue.stopAnimation();
      spinValue.setValue(0);
    }
  }, [loading, spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const insets = useSafeAreaInsets();

  const handleCodeChange = (text: string, index: number) => {
    if (text.length > 1) {
      text = text.slice(-1);
    }

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const enteredCode = code.join('');
    
    if (enteredCode.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit code');
      return;
    }

    if (enteredCode !== verificationCode) {
      Alert.alert('Error', 'Invalid verification code. Please try again.');
      return;
    }

    setLoading(true);
    try {
      if (purpose === 'reset') {
        // Password reset flow
        const resetUrl = process.env.EXPO_PUBLIC_PASSWORD_RESET_REDIRECT || 'https://authnutricycle.firebaseapp.com';
        await sendPasswordResetEmail(auth, email, { url: resetUrl });
        setShowSuccessModal(true);
      } else if (purpose === 'signup') {
        // Signup flow - create account after verification
        const userCredential = await createUserWithEmailAndPassword(auth, email, password!);
        const userId = userCredential.user.uid;
        
        // Generate a unique device/session ID
        let deviceId = await AsyncStorage.getItem('deviceSessionId');
        if (!deviceId) {
          deviceId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          await AsyncStorage.setItem('deviceSessionId', deviceId);
        }
        
        // Create session in Firestore
        const sessionRef = doc(db, 'activeSessions', userId);
        await setDoc(sessionRef, {
          userId: userId,
          email: email,
          deviceId: deviceId,
          loginTime: serverTimestamp(),
          lastActive: serverTimestamp(),
        });
        
        // Store the logged-in user's email and ID
        await AsyncStorage.setItem('loggedInUserEmail', email);
        await AsyncStorage.setItem('loggedInUserId', userId);
        setShowSuccessModal(true);
      }
    } catch (error: any) {
      let errorMessage = 'Failed to complete verification';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      }
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const newCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      const brevoKey = process.env.EXPO_PUBLIC_BREVO_API_KEY || process.env.BREVO_API_KEY;
      if (!brevoKey) {
        throw new Error('Missing Brevo API key');
      }

      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': brevoKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: { name: 'NutriCycle', email: 'micodelacruz519@gmail.com' },
          to: [{ email }],
          subject: 'Your NutriCycle Verification Code',
          htmlContent: `
            <html>
              <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
                  <h2 style="color: #1F5F2A; margin-bottom: 20px;">NutriCycle Verification Code</h2>
                  <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                    Your verification code is:
                  </p>
                  <div style="background-color: #FBF6C8; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
                    <h1 style="color: #1F5F2A; margin: 0; font-size: 36px; letter-spacing: 8px;">${newCode}</h1>
                  </div>
                  <p style="font-size: 14px; color: #666;">
                    This code will expire in 10 minutes. Please do not share this code with anyone.
                  </p>
                </div>
              </body>
            </html>
          `,
        }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Verification code resent to your email');
        navigation.setParams({ verificationCode: newCode } as any);
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to resend verification code');
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: Math.min(insets.top, 12), paddingBottom: insets.bottom }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 32 + insets.bottom }]} keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              disabled={loading}
            >
              <ChevronLeft size={28} color={colors.primaryText} strokeWidth={2} />
            </TouchableOpacity>

            <View style={styles.formContainer}>
              <ScreenTitle>Verification Code</ScreenTitle>
              <Text style={styles.subtitle}>
                Please enter the 6-digit verification code sent to your email address.
              </Text>

              <View style={styles.codeContainer}>
                {code.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => {
                      inputRefs.current[index] = ref;
                    }}
                    style={styles.codeInput}
                    value={digit}
                    onChangeText={(text) => handleCodeChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                    editable={!loading}
                  />
                ))}
              </View>

              <View style={styles.resendContainer}>
                <Text style={styles.resendText}>Didn't receive the code? </Text>
                <TouchableOpacity onPress={handleResend} disabled={resending || loading}>
                  <Text style={[styles.resendLink, (resending || loading) && styles.resendLinkDisabled]}>
                    Resend
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.verifyButton, (loading || showSuccessModal) && styles.verifyButtonDisabled]}
                onPress={handleVerify}
                disabled={loading || showSuccessModal}
              >
                {loading ? (
                  <ActivityIndicator color={colors.cardWhite} />
                ) : (
                  <Text style={styles.verifyButtonText}>Verify</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <Animated.Image
            source={require('../../../assets/Logo.png')}
            style={[styles.loadingLogo, { transform: [{ rotate: spin }] }]}
            resizeMode="contain"
          />
          <Text style={styles.loadingText}>Verifying code...</Text>
        </View>
      )}

      {showSuccessModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalCheckCircle}>
              <Text style={styles.modalCheckMark}>✓</Text>
            </View>
            <Text style={styles.modalTitle}>{purpose === 'signup' ? 'Account Created!' : 'Password Reset!'}</Text>
            <Text style={styles.modalSubtitle}>
              {purpose === 'signup' 
                ? 'Your account has been created successfully.' 
                : 'Your password has been reset successfully.'}
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.modalButtonText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.creamBackground,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingTop: 16,
  },
  backButton: {
    paddingLeft: 16,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primaryText,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.mutedText,
    marginBottom: 40,
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  codeInput: {
    width: 50,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.cardWhite,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    color: colors.primaryText,
    marginHorizontal: 6,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  resendText: {
    fontSize: 14,
    color: colors.mutedText,
  },
  resendLink: {
    fontSize: 14,
    color: colors.primaryText,
    fontWeight: '700',
  },
  resendLinkDisabled: {
    opacity: 0.5,
  },
  verifyButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    width: '100%',
  },
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    color: colors.cardWhite,
    fontSize: 16,
    fontWeight: '700',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FBF6C8CC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingLogo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#00000044',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '90%',
    backgroundColor: '#FBF6C8',
    borderRadius: 16,
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  modalCheckCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  modalCheckMark: {
    fontSize: 40,
    color: colors.cardWhite,
    fontWeight: '700',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primaryText,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.mutedText,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    minWidth: 180,
    alignItems: 'center',
  },
  modalButtonText: {
    color: colors.cardWhite,
    fontSize: 16,
    fontWeight: '700',
  },
});
