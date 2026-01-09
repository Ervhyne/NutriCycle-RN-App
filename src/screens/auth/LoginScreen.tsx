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
  Image,
  Animated,
  Easing,
  Modal,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenTitle from '../../components/ScreenTitle';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { Eye, EyeOff } from 'lucide-react-native';
import { auth, db } from '../../config/firebase';
import { colors } from '../../theme/colors';
import { RootStackParamList } from '../../navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

type LoginScreenNavigationProp = NavigationProp<RootStackParamList, 'Login'>;

export const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [existingUserEmail, setExistingUserEmail] = useState('');
  const [pendingLoginCredentials, setPendingLoginCredentials] = useState<{email: string, password: string} | null>(null);
  const spinValue = useRef(new Animated.Value(0)).current;

  // Disable back button when session modal is showing
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (showSessionModal) {
          return true; // Prevent back navigation
        }
        return false;
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => backHandler.remove();
    }, [showSessionModal])
  );

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

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage('Please enter both email and password');
      setShowErrorModal(true);
      return;
    }

    setLoading(true);
    try {
      // Generate or get unique device/session ID
      let deviceId = await AsyncStorage.getItem('deviceSessionId');
      if (!deviceId) {
        deviceId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        await AsyncStorage.setItem('deviceSessionId', deviceId);
      }

      // Sign in to Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
      const userId = userCredential.user.uid;

      // Check for existing active session in Firestore
      const sessionRef = doc(db, 'activeSessions', userId);
      const sessionDoc = await getDoc(sessionRef);

      if (sessionDoc.exists()) {
        const sessionData = sessionDoc.data();
        const existingDeviceId = sessionData.deviceId;

        if (existingDeviceId && existingDeviceId !== deviceId) {
          // Conflict: another device is logged in
          // Set a flag to prevent RootNavigator from auto-navigating
          await AsyncStorage.setItem('showingSessionModal', 'true');
          
          // Keep user signed in temporarily - they'll choose to continue or cancel
          setExistingUserEmail(email.trim().toLowerCase());
          setPendingLoginCredentials({ email: email.trim().toLowerCase(), password });
          setLoading(false);
          
          // Use setTimeout to ensure state updates and modal renders properly
          setTimeout(() => {
            setShowSessionModal(true);
          }, 100);
          
          return;
        }
      }

      // No conflict — proceed with login
      await setDoc(sessionRef, {
        userId,
        email: email.trim().toLowerCase(),
        deviceId,
        loginTime: serverTimestamp(),
        lastActive: serverTimestamp(),
      });

      await Promise.all([
        AsyncStorage.setItem('loggedInUserEmail', email.trim().toLowerCase()),
        AsyncStorage.setItem('loggedInUserId', userId),
      ]);

      setLoading(false);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Lobby' }],
      });
    } catch (error: any) {
      setLoading(false);
      let errorMsg = 'Failed to login';
      if (error.code === 'auth/invalid-email') errorMsg = 'Invalid email address';
      else if (error.code === 'auth/user-not-found') errorMsg = 'No account found with this email';
      else if (error.code === 'auth/wrong-password') errorMsg = 'Incorrect password';
      else if (error.code === 'auth/invalid-credential') errorMsg = 'Invalid email or password';

      setErrorMessage(errorMsg);
      setShowErrorModal(true);
    }
  };

  const handleForceLogin = async () => {
    if (!pendingLoginCredentials) return;

    setShowSessionModal(false);
    setLoading(true);

    try {
      // Clear the flag now that user chose to continue
      await AsyncStorage.removeItem('showingSessionModal');
      
      // User is already authenticated from handleLogin
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      const userId = currentUser.uid;

      // Get the device ID
      let deviceId = await AsyncStorage.getItem('deviceSessionId');
      if (!deviceId) {
        deviceId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        await AsyncStorage.setItem('deviceSessionId', deviceId);
      }

      // Force update the session - this invalidates other devices
      const sessionRef = doc(db, 'activeSessions', userId);
      await setDoc(sessionRef, {
        userId,
        email: pendingLoginCredentials.email,
        deviceId,
        loginTime: serverTimestamp(),
        lastActive: serverTimestamp(),
        forcedLogin: true,
      });

      // Save user info locally
      await Promise.all([
        AsyncStorage.setItem('loggedInUserEmail', pendingLoginCredentials.email),
        AsyncStorage.setItem('loggedInUserId', userId),
      ]);

      setPendingLoginCredentials(null);
      setLoading(false);

      // Navigate to Lobby
      navigation.reset({
        index: 0,
        routes: [{ name: 'Lobby' }],
      });
    } catch (error: any) {
      setLoading(false);
      setPendingLoginCredentials(null);

      let errorMsg = 'Failed to continue login';
      if (error.code) {
        if (error.code === 'auth/invalid-email') errorMsg = 'Invalid email address';
        else if (error.code === 'auth/user-not-found') errorMsg = 'No account found';
        else if (error.code === 'auth/wrong-password') errorMsg = 'Incorrect password';
        else if (error.code === 'auth/invalid-credential') errorMsg = 'Invalid credentials';
      }

      setErrorMessage(errorMsg);
      setShowErrorModal(true);
    }
  };

  const handleCancelForceLogin = async () => {
    setShowSessionModal(false);
    setPendingLoginCredentials(null);
    setEmail('');
    setPassword('');

    // Clear the flag
    await AsyncStorage.removeItem('showingSessionModal');
    
    // Sign out any temporary auth state
    signOut(auth).catch((err) => console.error('Sign out error:', err));
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            {/* Logo */}
            <View style={styles.logoContainer}>
              <Image
                source={require('../../../assets/Logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>

            {/* Title and Subtitle */}
            <ScreenTitle>Welcome to NutriCycle</ScreenTitle>
            <Text style={styles.subtitle}>Log in to manage vegetable wastes</Text>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor={colors.mutedText}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordInputWrapper}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Enter your password"
                    placeholderTextColor={colors.mutedText}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    editable={!loading}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <Eye size={20} color={colors.primary} />
                    ) : (
                      <EyeOff size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={styles.forgotPasswordContainer}
                onPress={() => navigation.navigate('ForgotPassword')}
                disabled={loading}
              >
                <Text style={styles.forgotPassword}>Forgot password?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.cardWhite} size="large" />
                ) : (
                  <Text style={styles.loginButtonText}>Login</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Sign Up Link */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('SignUp')}
                disabled={loading}
              >
                <Text style={styles.signUpLink}>Sign up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Error Modal */}
      <Modal visible={showErrorModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitleError}>Login Failed</Text>
            <View style={styles.modalBody}>
              <View style={styles.errorIconContainer}>
                <Text style={styles.errorIcon}>⚠️</Text>
              </View>
              <Text style={styles.errorMessage}>{errorMessage}</Text>
            </View>
            <TouchableOpacity style={styles.modalButton} onPress={() => setShowErrorModal(false)}>
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Active Session Detected Modal */}
      <Modal visible={showSessionModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitleWarning}>Active Session Detected</Text>
            <View style={styles.modalBody}>
              <View style={styles.warningIconContainer}>
                <Text style={styles.warningIcon}>🔒</Text>
              </View>
              <Text style={styles.sessionMessage}>
                This account ({existingUserEmail}) is currently logged in on another device.
              </Text>
              <Text style={styles.sessionSubMessage}>
                Only one device can be logged in at a time. Continuing will log out the other device.
              </Text>
            </View>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={handleCancelForceLogin}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextSecondary]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={handleForceLogin}>
                <Text style={styles.modalButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Full-screen Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <Animated.Image
            source={require('../../../assets/Logo.png')}
            style={[styles.loadingLogo, { transform: [{ rotate: spin }] }]}
            resizeMode="contain"
          />
          <Text style={styles.loadingText}>Logging in...</Text>
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
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoImage: {
    width: 120,
    height: 120,
  },
  subtitle: {
    fontSize: 16,
    color: colors.mutedText,
    marginBottom: 32,
    textAlign: 'center',
    fontWeight: '600',
  },
  form: {
    width: '100%',
    maxWidth: 350,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryText,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.cardWhite,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: colors.primaryText,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  passwordInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardWhite,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  passwordInput: {
    flex: 1,
    padding: 14,
    fontSize: 16,
    color: colors.primaryText,
  },
  eyeIcon: {
    padding: 10,
    paddingRight: 14,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPassword: {
    fontSize: 14,
    color: colors.primaryText,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: colors.cardWhite,
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  footerText: {
    fontSize: 14,
    color: colors.mutedText,
  },
  signUpLink: {
    fontSize: 14,
    color: colors.primary,
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
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: colors.creamBackground,
    borderRadius: 16,
    padding: 24,
  },
  modalTitleError: {
    fontSize: 18,
    fontWeight: '700',
    color: '#D32F2F',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalTitleWarning: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F57C00',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalBody: {
    marginBottom: 20,
  },
  errorIconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  errorIcon: {
    fontSize: 48,
  },
  warningIconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  warningIcon: {
    fontSize: 48,
  },
  errorMessage: {
    fontSize: 14,
    color: colors.primaryText,
    lineHeight: 20,
    textAlign: 'center',
  },
  sessionMessage: {
    fontSize: 14,
    color: colors.primaryText,
    lineHeight: 20,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 8,
  },
  sessionSubMessage: {
    fontSize: 13,
    color: colors.mutedText,
    lineHeight: 18,
    textAlign: 'center',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  modalButtonText: {
    color: colors.cardWhite,
    fontSize: 16,
    fontWeight: '700',
  },
  modalButtonTextSecondary: {
    color: colors.primary,
  },
});