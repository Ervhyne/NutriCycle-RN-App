import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { RootStackParamList } from '../navigation/types';

type PrivacyScreenNavigationProp = NavigationProp<RootStackParamList, 'Dashboard'>;

export const PrivacyNoticeScreen = () => {
  const navigation = useNavigation<PrivacyScreenNavigationProp>();

  const SectionTitle = ({ title }: { title: string }) => (
    <Text style={styles.sectionTitle}>{title}</Text>
  );

  const SectionContent = ({ text }: { text: string }) => (
    <Text style={styles.sectionContent}>{text}</Text>
  );

  const BulletPoint = ({ text }: { text: string }) => (
    <View style={styles.bulletItem}>
      <Text style={styles.bulletPoint}>•</Text>
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft size={28} color={colors.primaryText} strokeWidth={2.5} />
        </TouchableOpacity> 
        <Text style={styles.headerTitle}>Privacy Notice</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Hero */}
          <View style={styles.heroCard}>
            <View style={styles.heroPill}>
              <Text style={styles.heroPillText}>Latest update · Dec 2025</Text>
            </View>
            <Text style={styles.heroTitle}>Privacy Notice</Text>
            <Text style={styles.heroSubtitle}>
              How we collect, use, and protect your data across NutriCycle devices and services.
            </Text>
          </View>

          {/* Information We Collect */}
          <View style={styles.sectionCard}>
            <SectionTitle title="1. Information We Collect" />
            <SectionContent text="We may collect the following information:" />
            <BulletPoint text="Account Information – email, password used to log in" />
            <BulletPoint text="System Data – machine logs, compost/feed production records, and sensor readings" />
            <BulletPoint text="Device Information – technical details such as device type, operating system, and connection logs" />
          </View>

          {/* How We Use Your Information */}
          <View style={styles.sectionCard}>
            <SectionTitle title="2. How We Use Your Information" />
            <SectionContent text="We use collected information to:" />
            <BulletPoint text="Operate and improve the NutriCycle system" />
            <BulletPoint text="Provide real-time monitoring, alerts, and reports" />
            <BulletPoint text="Support research, testing, and system development" />
            <BulletPoint text="Ensure system security and prevent misuse" />
          </View>

          {/* Sharing of Information */}
          <View style={styles.sectionCard}>
            <SectionTitle title="3. Sharing of Information" />
            <SectionContent text="We do not sell or rent your personal information. Data may only be shared:" />
            <BulletPoint text="With authorized developers and advisers for maintenance and research" />
            <BulletPoint text="In anonymized form for reports, publications, or academic presentations" />
          </View>

          {/* Data Retention and Security */}
          <View style={styles.sectionCard}>
            <SectionTitle title="4. Data Retention and Security" />
            <BulletPoint text="We retain system and usage data only as long as necessary for monitoring and research" />
            <BulletPoint text="All data is stored securely with encryption and access controls" />
            <BulletPoint text="While we take reasonable steps to protect your data, no system is completely secure" />
          </View>

          {/* Your Rights */}
          <View style={styles.sectionCard}>
            <SectionTitle title="5. Your Rights" />
            <SectionContent text="You may:" />
            <BulletPoint text="Request access to your information" />
            <BulletPoint text="Ask for corrections or deletion of your data" />
            <BulletPoint text="Stop using the app at any time" />
          </View>

          {/* Updates to This Notice */}
          <View style={styles.sectionCard}>
            <SectionTitle title="6. Updates to This Notice" />
            <SectionContent text="We may update this Privacy Notice from time to time. Changes will be posted within the app and will take effect immediately upon posting." />
          </View>

          {/* Contact Us */}
          <View style={styles.sectionCard}>
            <SectionTitle title="7. Contact Us" />
            <SectionContent text="If you have questions or concerns about this Privacy Notice, please contact us at:" />
            <BulletPoint text="Email: nutricycle.bscs4a.2025@gmail.com" />
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
   borderBottomColor: colors.creamBackground,
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
    paddingVertical: 20,
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  content: {
    flex: 1,
  },
  heroCard: {
    backgroundColor: colors.cardWhite,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 5,
    borderLeftColor: colors.primary,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  heroPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 10,
  },
  heroPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.2,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primaryText,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 13,
    color: colors.primaryText,
    lineHeight: 20,
  },
  sectionCard: {
    backgroundColor: colors.cardWhite,
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primaryText,
    marginBottom: 10,
  },
  sectionContent: {
    fontSize: 13,
    color: colors.primaryText,
    lineHeight: 20,
    marginBottom: 12,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 10,
    marginLeft: 8,
    alignItems: 'flex-start',
  },
  bulletPoint: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '700',
    marginRight: 10,
    marginTop: -2,
  },
  bulletText: {
    fontSize: 13,
    color: colors.primaryText,
    lineHeight: 20,
    flex: 1,
  },
});
