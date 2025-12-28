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
  Modal,
  Image,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Eye, EyeOff } from 'lucide-react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { colors } from '../../theme/colors';
import ScreenTitle from '../../components/ScreenTitle';
import { RootStackParamList } from '../../navigation/types';

type SignUpScreenNavigationProp = NavigationProp<RootStackParamList, 'SignUp'>;

interface PasswordRequirements {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasSpecialChar: boolean;
  hasNumeric: boolean;
}

export const SignUpScreen = () => {
  const navigation = useNavigation<SignUpScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const [showPasswordMismatch, setShowPasswordMismatch] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const spinValue = useRef(new Animated.Value(0)).current;

  const validatePasswordRequirements = (pwd: string): PasswordRequirements => {
    return {
      minLength: pwd.length >= 8,
      hasUppercase: /[A-Z]/.test(pwd),
      hasLowercase: /[a-z]/.test(pwd),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
      hasNumeric: /[0-9]/.test(pwd),
    };
  };

  const passwordRequirements = validatePasswordRequirements(password);
  const allRequirementsMet = Object.values(passwordRequirements).every(req => req);

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

  const canSubmit =
    agreeToTerms && email.trim().length > 0 && password.length > 0 && confirmPassword.length > 0 && !loading;

  const handleSignUp = async () => {
    if (!agreeToTerms) {
      Alert.alert('Terms Required', 'Please agree to terms and conditions');
      return;
    }

    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setShowPasswordMismatch(true);
      return;
    }

    // Check if password requirements are met, if not show modal
    if (!allRequirementsMet) {
      setShowPasswordRequirements(true);
      return;
    }

    setLoading(true);
    try {
      // Generate 6-digit verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Send verification code via Brevo API
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

      // Navigate to verification screen with password for account creation later
      navigation.navigate('VerificationCode', { 
        email, 
        verificationCode,
        purpose: 'signup',
        password,
        confirmPassword,
      });
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
            <Image source={require('../../../assets/Logo.png')} style={styles.logo} />
            <ScreenTitle>Create Account</ScreenTitle>
            <Text style={styles.subtitle}>Join the NutriCycle.</Text>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your Email Address"
                  placeholderTextColor={colors.mutedText}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Enter your Password"
                    placeholderTextColor={colors.mutedText}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.iconButton}>
                    {showPassword ? (
                      <Eye size={20} color={colors.primary} strokeWidth={2.4} />
                    ) : (
                      <EyeOff size={20} color={colors.primary} strokeWidth={2.4} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Confirm your Password"
                    placeholderTextColor={colors.mutedText}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.iconButton}
                  >
                    {showConfirmPassword ? (
                      <Eye size={20} color={colors.primary} strokeWidth={2.4} />
                    ) : (
                      <EyeOff size={20} color={colors.primary} strokeWidth={2.4} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.termsContainer}>
                <TouchableOpacity 
                  style={[styles.checkbox, agreeToTerms && styles.checkboxChecked]}
                  onPress={() => setAgreeToTerms(!agreeToTerms)}
                >
                  <Text style={styles.checkboxText}>{agreeToTerms ? '✓' : ''}</Text>
                </TouchableOpacity>
                <View style={styles.termsTextContainer}>
                  <Text style={styles.termsText}>By continuing you agree to our </Text>
                  <TouchableOpacity onPress={() => setShowTermsModal(true)}>
                    <Text style={styles.termsLink}>Terms &amp; Conditions</Text>
                  </TouchableOpacity>
                  <Text style={styles.termsText}> and </Text>
                  <TouchableOpacity onPress={() => setShowPrivacyModal(true)}>
                    <Text style={styles.termsLink}>Privacy Notice</Text>
                  </TouchableOpacity>
                  <Text style={styles.termsText}>.</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.signUpButton, (!canSubmit) && styles.signUpButtonDisabled]}
                onPress={handleSignUp}
                disabled={!canSubmit}
              >
                {loading ? (
                  <ActivityIndicator color={colors.cardWhite} />
                ) : (
                  <Text style={styles.signUpButtonText}>Sign Up</Text>
                )}
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.loginLink}>Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={showTermsModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Terms &amp; Conditions</Text>
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalText}>
                By accessing and using the NutriCycle Mobile App, you agree to comply with and be bound by these Terms & Conditions. If you do not agree, please do not use the app.
              </Text>
              <Text style={styles.modalText}>
                NutriCycle is developed as an IoT- and AI-powered prototype designed to convert vegetable waste into poultry feed and compost. The app allows operators to:
              </Text>
              <Text style={styles.modalText}>• Monitor machine activity in real-time</Text>
              <Text style={styles.modalText}>• Track feed and compost production</Text>
              <Text style={styles.modalText}>• Receive system alerts and notifications</Text>
              <Text style={styles.modalText}>
                Users must provide accurate login details (e.g., email, password). The system should only be operated by trained personnel. Users must not misuse the app or attempt unauthorized access. Users are not liable for any misuse, equipment damage, or unintended consequences resulting from system use. Users acknowledge that the machine is not designed for unsupervised or large-scale operations.
              </Text>
              <Text style={styles.modalText}>
                All designs, concepts, and content of NutriCycle remain the property of the project developers. Users may not copy, redistribute, or commercially use the system without permission.
              </Text>
              <Text style={styles.modalText}>
                These Terms & Conditions may be updated as the system evolves. Users will be notified of significant changes within the app.
              </Text>
              <Text style={styles.modalText}>
                For inquiries, support, or feedback regarding NutriCycle, please contact us:
              </Text>
              <Text style={styles.modalText}>Email: nutricycle.project@gmail.com</Text>
            </ScrollView>
            <TouchableOpacity style={styles.modalButton} onPress={() => setShowTermsModal(false)}>
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showPrivacyModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Privacy Notice</Text>
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalText}>
                NutriCycle respects your privacy. This notice explains what data we collect, why we collect it, and how we protect it when you use the app.
              </Text>
              <Text style={styles.modalText}>
                We collect your email address and basic account information to create and manage your account, send verification codes, and provide app features.
              </Text>
              <Text style={styles.modalText}>
                Operational telemetry from the machine (e.g., status, production metrics) may be associated with your account to improve reliability and user experience.
              </Text>
              <Text style={styles.modalText}>
                Your data is stored securely and is not sold or shared with third parties except service providers strictly necessary to operate the app (e.g., email delivery).
              </Text>
              <Text style={styles.modalText}>
                You can request deletion of your account and related data at any time by contacting: nutricycle.project@gmail.com.
              </Text>
              <Text style={styles.modalText}>
                We may update this notice as the system evolves. Significant changes will be communicated within the app.
              </Text>
            </ScrollView>
            <TouchableOpacity style={styles.modalButton} onPress={() => setShowPrivacyModal(false)}>
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showPasswordRequirements} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Password Requirements</Text>
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <RequirementRow 
                met={passwordRequirements.minLength}
                text="At least 8 characters"
              />
              <RequirementRow 
                met={passwordRequirements.hasUppercase}
                text="Uppercase character (A-Z)"
              />
              <RequirementRow 
                met={passwordRequirements.hasLowercase}
                text="Lowercase character (a-z)"
              />
              <RequirementRow 
                met={passwordRequirements.hasNumeric}
                text="Numeric character (0-9)"
              />
              <RequirementRow 
                met={passwordRequirements.hasSpecialChar}
                text="Special character (!@#$%...)"
              />
            </ScrollView>
            <TouchableOpacity style={styles.modalButton} onPress={() => setShowPasswordRequirements(false)}>
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showPasswordMismatch} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitleError}>Passwords Do Not Match</Text>
            <View style={styles.modalBody}>
              <View style={styles.errorIconContainer}>
                <Text style={styles.errorIcon}>⚠️</Text>
              </View>
              <Text style={styles.errorMessage}>
                The password and confirm password fields do not match. Please ensure both passwords are identical.
              </Text>
            </View>
            <TouchableOpacity style={styles.modalButton} onPress={() => setShowPasswordMismatch(false)}>
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {loading && (
        <View style={styles.loadingOverlay}>
          <Animated.Image
            source={require('../../../assets/Logo.png')}
            style={[styles.loadingLogo, { transform: [{ rotate: spin }] }]}
            resizeMode="contain"
          />
          <Text style={styles.loadingText}>Creating account...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const RequirementRow = ({ met, text }: { met: boolean; text: string }) => (
  <View style={styles.requirementRow}>
    <Text style={[
      styles.requirementCheckmark, 
      met ? styles.requirementCheckmarkMet : styles.requirementCheckmarkUnmet
    ]}>
      {met ? '✓' : '✕'}
    </Text>
    <Text style={[
      styles.requirementText, 
      met ? styles.requirementTextMet : styles.requirementTextUnmet
    ]}>
      {text}
    </Text>
  </View>
);

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
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primaryText,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.mutedText,
    marginBottom: 28,
    textAlign: 'center',
     fontWeight: '600',
  },
  form: {
    width: '100%',
    maxWidth: 350,
    alignItems: 'center',
  },
  inputContainer: {
    width: '100%',
    maxWidth: 350,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: colors.cardWhite,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.primaryText,
    borderWidth: 1,
    borderColor: '#C6D3C1',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardWhite,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  passwordInput: {
    flex: 1,
    padding: 14,
    fontSize: 16,
    color: colors.primaryText,
  },
  iconButton: {
    paddingRight: 14,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signUpButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
    width: '100%',
    maxWidth: 350,
  },
  signUpButtonDisabled: {
    opacity: 0.5,
  },
  signUpButtonText: {
    color: colors.cardWhite,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: colors.mutedText,
  },
  loginLink: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    marginBottom: 12,
    paddingHorizontal: 12,
    width: '100%',
    maxWidth: 350,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: 12,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxText: {
    color: colors.cardWhite,
    fontSize: 14,
    fontWeight: 'bold',
  },
  termsTextContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  termsText: {
    fontSize: 12,
    color: colors.mutedText,
    lineHeight: 18,
  },
  termsLink: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000070',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: colors.creamBackground,
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primaryText,
    textAlign: 'center',
    marginBottom: 12,
  },
  modalTitleError: {
    fontSize: 18,
    fontWeight: '700',
    color: '#D32F2F',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalBody: {
    marginBottom: 16,
  },
  modalText: {
    fontSize: 14,
    color: colors.primaryText,
    lineHeight: 20,
    marginBottom: 10,
  },
  modalButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalButtonText: {
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
  requirementsContainer: {
    width: '100%',
    maxWidth: 350,
    backgroundColor: '#F0F4EE',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryText,
    marginBottom: 12,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementCheckmark: {
    fontSize: 16,
    color: '#999',
    marginRight: 8,
    fontWeight: 'bold',
    width: 20,
  },
  requirementCheckmarkMet: {
    color: colors.primary,
  },
  requirementCheckmarkUnmet: {
    color: '#D32F2F',
  },
  requirementText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  requirementTextMet: {
    color: colors.primaryText,
    fontWeight: '500',
  },
  requirementTextUnmet: {
    color: '#D32F2F',
    fontWeight: '500',
  },
  mismatchWarning: {
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#D32F2F',
  },
  mismatchWarningText: {
    color: '#D32F2F',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorIconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  errorIcon: {
    fontSize: 48,
  },
  errorMessage: {
    fontSize: 14,
    color: colors.primaryText,
    lineHeight: 20,
    textAlign: 'center',
  },
});
