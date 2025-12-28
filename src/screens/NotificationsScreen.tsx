import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { RootStackParamList } from '../navigation/types';

type NotificationsScreenNavigationProp = NavigationProp<RootStackParamList, 'Dashboard'>;

export const NotificationsScreen = () => {
  const navigation = useNavigation<NotificationsScreenNavigationProp>();
  const [processingAlerts, setProcessingAlerts] = useState(true);
  const [reminderNotifications, setReminderNotifications] = useState(true);
  const insets = useSafeAreaInsets();

  const NotificationItem = ({
    title,
    description,
    value,
    onToggle,
  }: {
    title: string;
    description: string;
    value: boolean;
    onToggle: (value: boolean) => void;
  }) => (
    <View style={styles.notificationItem}>
      <View style={styles.notificationInfo}>
        <Text style={styles.notificationTitle}>{title}</Text>
        <Text style={styles.notificationDescription}>{description}</Text>
      </View>
      <TouchableOpacity 
        onPress={() => onToggle(!value)}
        activeOpacity={0.7}
        style={styles.switchContainer}
      >
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: '#D0D0D0', true: '#90EE90' }}
          thumbColor={value ? colors.primary : '#F0F0F0'}
          style={styles.switch}
          pointerEvents="none"
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { paddingTop: Math.min(insets.top, 12), paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft size={28} color={colors.primaryText} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 24 + insets.bottom }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Alerts Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alerts</Text>
          <View style={styles.sectionContent}>
            <NotificationItem
              title="Processing Alerts"
              description="When processing starts, stops, or has issues."
              value={processingAlerts}
              onToggle={setProcessingAlerts}
            />
            <View style={styles.divider} />
            <NotificationItem
              title="Notifications"
              description="Reminders to complete processing task."
              value={reminderNotifications}
              onToggle={setReminderNotifications}
            />
          </View>
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
  scrollContent: {
    paddingTop: 24,
    paddingBottom: 24,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: Platform.OS === 'ios' ? 0.08 : 0.1,
    shadowRadius: 6,
    elevation: Platform.OS === 'android' ? 3 : 0,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  notificationInfo: {
    flex: 1,
    marginRight: 12,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primaryText,
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 13,
    color: colors.mutedText,
    lineHeight: 18,
  },
  switch: {
    transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }],
  },
  switchContainer: {
    padding: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 0,
  },
});
