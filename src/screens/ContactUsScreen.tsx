import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
  Linking,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { ChevronLeft, Mail } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { RootStackParamList } from '../navigation/types';

type ContactNavigationProp = NavigationProp<RootStackParamList, 'Dashboard'>;

export const ContactUsScreen = () => {
  const navigation = useNavigation<ContactNavigationProp>();

  const handleOpenWebsite = async () => {
    const url = 'https://nutricycle.vercel.app/?fbclid=IwY2xjawPJdlNleHRuA2FlbQIxMQBzcnRjBmFwcF9pZAEwAAEeMOI1GEONSOgUjUZhgeLvqC2M8sfb6WvtzkoWwiZDgy9Fv42mObqbHE2AayM_aem_n9R9vl0YLgm1nVJ6bwLEqg';
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (e) {
      // Silent fail; keep UX simple
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeft size={26} color={colors.primaryText} strokeWidth={2.2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact Us</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Hero */}
          <View style={styles.heroCard}>
            <View style={styles.heroPill}>
              <Text style={styles.heroPillText}>Support · Helpdesk</Text>
            </View>
            <Text style={styles.title}>Get in Touch</Text>
            <Text style={styles.subtitle}>Have questions about NutriCycle? We're here to help.</Text>
          </View>

          {/* Contact CTA */}
          <View style={styles.sectionCard}>
            <TouchableOpacity style={styles.ctaButton} activeOpacity={0.9} onPress={handleOpenWebsite}>
              <View style={styles.ctaContent}>
                <Mail size={18} color={colors.cardWhite} strokeWidth={2.2} />
                <Text style={styles.ctaText}>Contact via Website</Text>
              </View>
            </TouchableOpacity>
            <Text style={styles.helpText}>We usually respond within 1 business day.</Text>
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
    marginLeft: -4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primaryText,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 32,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 32,
  },
  content: {
    flex: 1,
  },
  heroCard: {
    backgroundColor: colors.cardWhite,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
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
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2E7D32',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: colors.primaryText,
    marginBottom: 4,
  },
  sectionCard: {
    backgroundColor: colors.cardWhite,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
  },
  ctaButton: {
    backgroundColor: '#1B5E20',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ctaText: {
    color: colors.cardWhite,
    fontSize: 14,
    fontWeight: '700',
  },
  helpText: {
    marginTop: 12,
    fontSize: 12,
    color: colors.mutedText,
  },
});
