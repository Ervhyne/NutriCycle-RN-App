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

type AboutNutriCycleNavigationProp = NavigationProp<RootStackParamList, 'Dashboard'>;

export const AboutNutriCycleScreen = () => {
  const navigation = useNavigation<AboutNutriCycleNavigationProp>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft size={28} color={colors.primaryText} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About NutriCycle</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Hero Section */}
          <View style={styles.heroCard}>
            <View style={styles.heroPill}>
              <Text style={styles.heroPillText}>Circular agriculture</Text>
            </View>
            <Text style={styles.mainTitle}>NutriCycle</Text>
            <View style={styles.divider} />
            <Text style={styles.heroDescription}>
              Transform vegetable waste into poultry feed and compost with AI and IoT technology.
            </Text>
          </View>

          {/* Overview */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <Text style={styles.description}>
              NutriCycle is an IoT- and AI-powered solution designed to transform vegetable waste into poultry feed meal and organic compost. Built with sustainability and agriculture in mind, NutriCycle provides an automated way of identifying, sorting, and processing vegetable by-products from wet markets such as cabbage leaves, sweet potato tops, moringa (malunggay), malunggay, papaya and root peels, and carrot trimmings.
            </Text>
          </View>

          {/* What We Do Section */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>What we do</Text>

            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <Text style={styles.featureIcon}>♻️</Text>
              </View>
              <Text style={styles.featureTitle}>Reduce Feed Waste</Text>
              <Text style={styles.featureDescription}>
                Use AI and IoT sensors to identify vegetable type, measure weight, and classify freshness.
              </Text>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <Text style={styles.featureIcon}>🌾</Text>
              </View>
              <Text style={styles.featureTitle}>Support Farmers</Text>
              <Text style={styles.featureDescription}>
                Produce cost-effective poultry feed and compost for backyard and smallholder farmers.
              </Text>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <Text style={styles.featureIcon}>🌱</Text>
              </View>
              <Text style={styles.featureTitle}>Smart Processing</Text>
              <Text style={styles.featureDescription}>
                Reduce greenhouse gas emissions from rotting vegetable waste.
              </Text>
            </View>
          </View>

          {/* Why NutriCycle Section */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Why choose us?</Text>

            <View style={styles.benefitCard}>
              <View style={styles.benefitItem}>
                <View style={styles.checkCircle}>
                  <Text style={styles.checkMark}>✓</Text>
                </View>
                <Text style={styles.benefitText}>
                  Affordable feed alternatives for local poultry farmers
                </Text>
              </View>

              <View style={styles.benefitItem}>
                <View style={styles.checkCircle}>
                  <Text style={styles.checkMark}>✓</Text>
                </View>
                <Text style={styles.benefitText}>
                  Reduces greenhouse gas emissions from rotting waste
                </Text>
              </View>

              <View style={styles.benefitItem}>
                <View style={styles.checkCircle}>
                  <Text style={styles.checkMark}>✓</Text>
                </View>
                <Text style={styles.benefitText}>
                  Circular economy — waste into value-added resources
                </Text>
              </View>

              <View style={styles.benefitItem}>
                <View style={styles.checkCircle}>
                  <Text style={styles.checkMark}>✓</Text>
                </View>
                <Text style={styles.benefitText}>
                  Real-time monitoring with quality control and alerts
                </Text>
              </View>
            </View>
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
    paddingVertical: 16,
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  content: {
    flex: 1,
  },
  // Hero Section
  heroCard: {
    backgroundColor: colors.cardWhite,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 12,
  },
  heroPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.2,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 12,
  },
  divider: {
    height: 3,
    backgroundColor: colors.primary,
    width: 40,
    marginBottom: 12,
    borderRadius: 2,
  },
  heroDescription: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primaryText,
    lineHeight: 22,
  },
  description: {
    fontSize: 13,
    color: colors.primaryText,
    lineHeight: 20,
    marginBottom: 0,
    paddingHorizontal: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primaryText,
    marginBottom: 12,
  },
  sectionCard: {
    backgroundColor: colors.cardWhite,
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
  },
  // Feature Cards
  featureCard: {
    backgroundColor: colors.cardWhite,
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
    borderTopWidth: 3,
    borderTopColor: colors.primary,
  },
  featureIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: colors.creamBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 28,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primaryText,
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 13,
    color: colors.mutedText,
    lineHeight: 19,
  },
  // Benefit Card
  benefitCard: {
    backgroundColor: colors.cardWhite,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
  },
  benefitItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    marginTop: 1,
    flexShrink: 0,
  },
  checkMark: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.cardWhite,
  },
  benefitText: {
    fontSize: 13,
    color: colors.primaryText,
    lineHeight: 20,
    flex: 1,
  },
});
