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

type TermsScreenNavigationProp = NavigationProp<RootStackParamList, 'Dashboard'>;

export const TermsAndConditionsScreen = () => {
  const navigation = useNavigation<TermsScreenNavigationProp>();

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
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Hero */}
          <View style={styles.heroCard}>
            <View style={styles.heroPill}>
              <Text style={styles.heroPillText}>Terms update · Dec 2025</Text>
            </View>
            <Text style={styles.heroTitle}>Terms & Conditions</Text>
            <Text style={styles.heroSubtitle}>
              What you agree to when using NutriCycle services and devices.
            </Text>
          </View>

          {/* Introduction */}
          <View style={styles.sectionCard}>
            <SectionTitle title="1. Acceptance of Terms" />
            <SectionContent text="By accessing and using the NutriCycle application, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service." />
          </View>

          {/* Use License */}
          <View style={styles.sectionCard}>
            <SectionTitle title="2. Use License" />
            <SectionContent text="Permission is granted to temporarily download one copy of the materials (information or software) on NutriCycle for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:" />
            <BulletPoint text="Modify or copy the materials" />
            <BulletPoint text="Use the materials for any commercial purpose or for any public display" />
            <BulletPoint text="Attempt to decompile or reverse engineer any software contained on the application" />
            <BulletPoint text="Remove any copyright or other proprietary notations from the materials" />
            <BulletPoint text="Transfer the materials to another person or 'mirror' the materials on any other server" />
            <BulletPoint text="Interfere with or disrupt the normal flow of dialogue within the application" />
          </View>

          {/* Disclaimer */}
          <View style={styles.sectionCard}>
            <SectionTitle title="3. Disclaimer" />
            <SectionContent text="The materials on NutriCycle are provided on an 'as is' basis. NutriCycle makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights." />
          </View>

          {/* Limitations */}
          <View style={styles.sectionCard}>
            <SectionTitle title="4. Limitations" />
            <SectionContent text="In no event shall NutriCycle or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on NutriCycle, even if NutriCycle or a NutriCycle authorized representative has been notified orally or in writing of the possibility of such damage." />
          </View>

          {/* Accuracy of Materials */}
          <View style={styles.sectionCard}>
            <SectionTitle title="5. Accuracy of Materials" />
            <SectionContent text="The materials appearing on NutriCycle could include technical, typographical, or photographic errors. NutriCycle does not warrant that any of the materials on the application are accurate, complete, or current. NutriCycle may make changes to the materials contained on the application at any time without notice." />
          </View>

          {/* Links */}
          <View style={styles.sectionCard}>
            <SectionTitle title="6. Links" />
            <SectionContent text="NutriCycle has not reviewed all of the sites linked to its application and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by NutriCycle of the site. Use of any such linked website is at the user's own risk." />
          </View>

          {/* Modifications */}
          <View style={styles.sectionCard}>
            <SectionTitle title="7. Modifications" />
            <SectionContent text="NutriCycle may revise these terms of service for the application at any time without notice. By using this application, you are agreeing to be bound by the then current version of these terms of service." />
          </View>

          {/* Governing Law */}
          <View style={styles.sectionCard}>
            <SectionTitle title="8. Governing Law" />
            <SectionContent text="These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which NutriCycle operates, and you irrevocably submit to the exclusive jurisdiction of the courts in that location." />
          </View>

          {/* User Responsibilities */}
          <View style={styles.sectionCard}>
            <SectionTitle title="9. User Responsibilities" />
            <SectionContent text="You agree to:" />
            <BulletPoint text="Use the application only for lawful purposes and in a way that does not infringe upon the rights of others or restrict their use and enjoyment of the application" />
            <BulletPoint text="Not harass or cause distress or inconvenience to any person" />
            <BulletPoint text="Not transmit obscene or offensive content or disrupt the normal flow of dialogue within the application" />
            <BulletPoint text="Not attempt to gain unauthorized access to the application or its systems" />
            <BulletPoint text="Maintain the confidentiality of your login credentials and password" />
          </View>

          {/* Termination */}
          <View style={styles.sectionCard}>
            <SectionTitle title="10. Termination of Service" />
            <SectionContent text="NutriCycle reserves the right to terminate your access to the application at any time, without notice, for conduct that NutriCycle believes violates these terms of service or is harmful to other users of the application, NutriCycle, or third parties, or for any other reason." />
          </View>

          {/* Contact */}
          <View style={styles.sectionCard}>
            <SectionTitle title="11. Contact Information" />
            <SectionContent text="If you have any questions about these Terms and Conditions, please contact us at:" />
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
