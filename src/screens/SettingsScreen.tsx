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
import { auth } from '../config/firebase';
import { colors } from '../theme/colors';
import { RootStackParamList } from '../navigation/types';
import { NAV_HEIGHT } from '../components/BottomNavigation';

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
            await signOut(auth);
            // Reset navigation stack so back button won't show Settings
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          } catch (error) {
            Alert.alert('Error', 'Failed to log out');
          }
        },
      },
    ]);
  };


  const SettingRow = ({ label, onPress }: { label: string; onPress: () => void }) => (
    <TouchableOpacity style={styles.settingRow} onPress={onPress}>
      <Text style={styles.settingLabel}>{label}</Text>
      <ChevronRight size={20} color={colors.mutedText} strokeWidth={2} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}> 
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: NAV_HEIGHT + 24 + insets.bottom }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
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
              onPress={() => Alert.alert('Contact Us', 'Email: nutricycle.project@gmail.com')}
            />
            <View style={styles.divider} />
            <SettingRow 
              label="About NutriCycle" 
              onPress={() => Alert.alert('About NutriCycle', 'NutriCycle v1.0.0\n\nAn IoT and AI-powered system for converting vegetable waste into poultry feed and compost.')}
            />
            <View style={styles.divider} />
            <SettingRow 
              label="Terms & Conditions" 
              onPress={() => Alert.alert('Terms & Conditions', 'Please review our terms and conditions in the app settings or contact support.')}
            />
            <View style={styles.divider} />
            <SettingRow 
              label="Privacy Notice" 
              onPress={() => Alert.alert('Privacy Notice', 'Your privacy is important to us. Please contact support for details.')}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primaryText,
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
