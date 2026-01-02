import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { signOut } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { colors } from '../theme/colors';
import ScreenTitle from '../components/ScreenTitle';
import { RootStackParamList } from '../navigation/types';
import { NAV_HEIGHT } from '../components/BottomNavigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, deleteDoc } from 'firebase/firestore';

type SettingsScreenNavigationProp = NavigationProp<RootStackParamList, 'Dashboard'>;

export const SettingsScreen = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const insets = useSafeAreaInsets();

  const handleLogOut = async () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          try {
            const userId = auth.currentUser?.uid;
            
            // Delete session from Firestore
            if (userId) {
              try {
                const sessionRef = doc(db, 'activeSessions', userId);
                await deleteDoc(sessionRef);
              } catch (firestoreError) {
                console.warn('Failed to delete session from Firestore:', firestoreError);
                // Continue with logout even if Firestore fails
              }
            }
            
            await signOut(auth);
            // Clear stored session data
            await AsyncStorage.removeItem('loggedInUserEmail');
            await AsyncStorage.removeItem('loggedInUserId');
            // Reset navigation stack so back button won't show Settings
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          } catch (error) {
            console.error('Logout error:', error);
            Alert.alert('Error', 'Failed to log out. Please try again.');
          }
        },
      },
    ]);
  };

  const handleTabPress = (tabKey: string) => {
    if (tabKey === 'Machines') {
      navigation.navigate('Lobby');
    } else if (tabKey === 'Reports') {
      navigation.navigate('Dashboard');
    } else if (tabKey === 'History') {
      navigation.navigate('History');
    }
    // Settings tab is current tab, do nothing
  };

  const SettingRow = ({ label, onPress }: { label: string; onPress: () => void }) => (
    <TouchableOpacity style={styles.settingRow} onPress={onPress}>
      <Text style={styles.settingLabel}>{label}</Text>
      <ChevronRight size={20} color={colors.mutedText} strokeWidth={2} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <ScreenTitle>Settings</ScreenTitle>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: 0, paddingBottom: NAV_HEIGHT + 24 + insets.bottom }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Account Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <View style={styles.sectionContent}>
            <SettingRow 
              label="Change Password" 
              onPress={() => navigation.navigate('ChangePassword')}
            />
            <View style={styles.divider} />
            <SettingRow 
              label="Notifications" 
              onPress={() => navigation.navigate('Notifications')}
            />
          </View>
        </View>

        {/* Support & Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support & Information</Text>
          <View style={styles.sectionContent}>
            <SettingRow 
              label="Contact Us" 
              onPress={() => navigation.navigate('ContactUs')}
            />
            <View style={styles.divider} />
            <SettingRow 
              label="About NutriCycle" 
              onPress={() => navigation.navigate('AboutNutriCycle')}
            />
            <View style={styles.divider} />
            <SettingRow 
              label="Terms & Conditions" 
                onPress={() => navigation.navigate('TermsAndConditions')}
            />
            <View style={styles.divider} />
            <SettingRow 
              label="Privacy Notice" 
                onPress={() => navigation.navigate('PrivacyNotice')}
            />
          </View>
        </View>

        {/* Log Out Button */}
        <View style={styles.logOutSection}>
          <TouchableOpacity
            style={styles.logOutButton}
            onPress={handleLogOut}
          >
            <Text style={styles.logOutButtonText}>LOG OUT</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>


    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.creamBackground,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: NAV_HEIGHT + 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryText,
    paddingHorizontal: 24,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: colors.cardWhite,
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.primaryText,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 0,
  },
  logOutSection: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  logOutButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logOutButtonText: {
    color: colors.cardWhite,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
