import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  Animated,
  Easing,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react-native';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth } from '../config/firebase';
import { colors } from '../theme/colors';
import { RootStackParamList } from '../navigation/types';

type ChangePasswordScreenNavigationProp = NavigationProp<RootStackParamList, 'Dashboard'>;

export const ChangePasswordScreen = () => {
  const navigation = useNavigation<ChangePasswordScreenNavigationProp>();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
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

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (currentPassword === newPassword) {
      Alert.alert('Error', 'New password must be different from current password');
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        throw new Error('User not authenticated');
      }

      // Reauthenticate user with current password
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);
      setShowSuccessModal(true);
    } catch (error: any) {
      let errorMessage = 'Failed to update password';
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'Current password is incorrect';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'New password is too weak';
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'Please log out and log in again before changing your password';
      }
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              disabled={loading}
            >
              <ChevronLeft size={28} color={colors.primaryText} strokeWidth={2.5} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Change Password</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.form}>
            {/* Current Password */}
            <View style={styles.inputContainer}>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Current Password"
                  placeholderTextColor={colors.mutedText}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry={!showCurrentPassword}
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  style={styles.iconButton}
                  disabled={loading}
                >
                  {showCurrentPassword ? (
                    <Eye size={20} color={colors.primary} strokeWidth={2.4} />
                  ) : (
                    <EyeOff size={20} color={colors.primary} strokeWidth={2.4} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* New Password */}
            <View style={styles.inputContainer}>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="New Password"
                  placeholderTextColor={colors.mutedText}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNewPassword}
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  style={styles.iconButton}
                  disabled={loading}
                >
                  {showNewPassword ? (
                    <Eye size={20} color={colors.primary} strokeWidth={2.4} />
                  ) : (
                    <EyeOff size={20} color={colors.primary} strokeWidth={2.4} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputContainer}>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Confirm Password"
                  placeholderTextColor={colors.mutedText}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.iconButton}
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <Eye size={20} color={colors.primary} strokeWidth={2.4} />
                  ) : (
                    <EyeOff size={20} color={colors.primary} strokeWidth={2.4} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Update Password Button */}
            <TouchableOpacity
              style={[styles.updateButton, loading && styles.updateButtonDisabled]}
              onPress={handleUpdatePassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.cardWhite} />
              ) : (
                <Text style={styles.updateButtonText}>Update Password</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <Animated.Image
            source={require('../../assets/Logo.png')}
            style={[styles.loadingLogo, { transform: [{ rotate: spin }] }]}
            resizeMode="contain"
          />
          <Text style={styles.loadingText}>Updating password...</Text>
        </View>
      )}

      {showSuccessModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalCheckCircle}>
              <Text style={styles.modalCheckMark}>✓</Text>
            </View>
            <Text style={styles.modalTitle}>Password Reset!</Text>
            <Text style={styles.modalSubtitle}>Your password has been changed successfully.</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => navigation.navigate('Settings')}
            >
              <Text style={styles.modalButtonText}>Back to Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButtonSecondary}
              onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })}
            >
              <Text style={styles.modalButtonSecondaryText}>Login</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: Platform.OS === 'android' ? 1 : 0,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primaryText,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 44,
  },
  form: {
    padding: 24,
  },
  inputContainer: {
    marginBottom: 16,
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
  updateButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: Platform.OS === 'ios' ? 0.1 : 0.15,
    shadowRadius: 6,
    elevation: Platform.OS === 'android' ? 4 : 0,
  },
  updateButtonDisabled: {
    opacity: 0.6,
  },
  updateButtonText: {
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
    backgroundColor: colors.creamBackground,
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
    minWidth: 200,
    alignItems: 'center',
    marginBottom: 12,
  },
  modalButtonText: {
    color: colors.cardWhite,
    fontSize: 16,
    fontWeight: '700',
  },
  modalButtonSecondary: {
    backgroundColor: colors.creamBackground,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    minWidth: 200,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  modalButtonSecondaryText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
});
