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
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { sendPasswordResetEmail } from 'firebase/auth';
import { ChevronLeft } from 'lucide-react-native';
import { auth } from '../../config/firebase';
import { colors } from '../../theme/colors';
import ScreenTitle from '../../components/ScreenTitle';
import { RootStackParamList } from '../../navigation/types';

type ForgotPasswordScreenNavigationProp = NavigationProp<RootStackParamList, 'ForgotPassword'>;

export const ForgotPasswordScreen = () => {
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const insets = useSafeAreaInsets();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
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

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      // Prefer public key (expo) but fall back to private key if available
      const brevoKey = process.env.EXPO_PUBLIC_BREVO_API_KEY || process.env.BREVO_API_KEY;
      if (!brevoKey) {
        throw new Error('Missing Brevo API key');
      }

      // Generate 6-digit verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Send verification code via Brevo API
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
                    <h1 style="color: #1F5F2A; margin: 0; font-size: 36px; letter-spacing: 8px;">${verificationCode}</h1>
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

      if (!response.ok) {
        const msg = await response.text();
        throw new Error(msg || 'Failed to send verification code');
      }

      // Navigate to verification screen
      navigation.navigate('VerificationCode', { email, verificationCode, purpose: 'reset' });
    } catch (error: any) {
      let errorMessage = 'Failed to send verification code';
      if (error.message) {
        errorMessage = error.message;
      }
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
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
              <ScreenTitle>Forgot Password?</ScreenTitle>
              <Text style={styles.subtitle}>
                Enter your email address to receive a password reset link
              </Text>

              {!isSubmitted ? (
                <View style={styles.form}>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="Email Address"
                      placeholderTextColor={colors.mutedText}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      editable={!loading}
                    />
                  </View>

                  <TouchableOpacity
                    style={[styles.resetButton, loading && styles.resetButtonDisabled]}
                    onPress={handleResetPassword}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color={colors.cardWhite} />
                    ) : (
                      <Text style={styles.resetButtonText}>Send Reset Link</Text>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.successContainer}>
                  <View style={styles.successIcon}>
                    <Text style={styles.successIconText}>✓</Text>
                  </View>
                  <Text style={styles.successTitle}>Check Your Email</Text>
                  <Text style={styles.successMessage}>
                    We've sent password reset instructions to {email}
                  </Text>
                  <TouchableOpacity
                    style={styles.resetButton}
                    onPress={() => navigation.navigate('Login')}
                  >
                    <Text style={styles.resetButtonText}>Back to Log In</Text>
                  </TouchableOpacity>
                </View>
              )}
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
          <Text style={styles.loadingText}>Sending verification code...</Text>
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
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primaryText,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: colors.mutedText,
    marginBottom: 32,
    lineHeight: 22,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: colors.cardWhite,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: colors.primaryText,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resetButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  resetButtonDisabled: {
    opacity: 0.6,
  },
  resetButtonText: {
    color: colors.cardWhite,
    fontSize: 16,
    fontWeight: '700',
  },
  successContainer: {
    width: '100%',
    alignItems: 'center',
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.success || colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successIconText: {
    fontSize: 48,
    color: colors.cardWhite,
    fontWeight: 'bold',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primaryText,
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 16,
    color: colors.mutedText,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    paddingHorizontal: 20,
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
});
