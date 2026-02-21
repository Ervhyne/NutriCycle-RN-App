
import React, { useEffect } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors } from '../theme/colors';
import { useMachineStore } from '../stores/machineStore';
import ScreenTitle from '../components/ScreenTitle';
import { CheckCircle, Package, Leaf, Droplet } from 'lucide-react-native';

export default function SummaryScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { currentBatch } = useMachineStore();


  if (!currentBatch) {
    return (
      <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom }]}> 
        <View style={styles.content}>
          <ScreenTitle>No Batch</ScreenTitle>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Dashboard')}>
            <Text style={styles.buttonText}>Return to Dashboard</Text>
          </TouchableOpacity>
        </View> 
      </SafeAreaView>
    );
  }

  const hasCompostOutput = currentBatch?.compostOutput && currentBatch.compostOutput > 0;
  const hasFeedOutput = currentBatch?.feedOutput && currentBatch.feedOutput > 0;

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Success Header */}
          <View style={styles.successHeader}>
            <View style={styles.iconWrapper}>
              <CheckCircle size={64} color={colors.primary} strokeWidth={2.5} />
            </View>
            <Text style={styles.successTitle}>Batch Complete!</Text>
            <Text style={styles.successSubtitle}>Your batch has been processed successfully</Text>
          </View>

          {/* Batch Info Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Package size={24} color={colors.primary} />
              <Text style={styles.cardTitle}>Batch Information</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Batch ID</Text>
              <Text style={styles.infoValue}>{currentBatch.batchNumber}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status</Text>
              <Text style={[styles.infoValue, styles.statusBadge]}>Completed</Text>
            </View>
          </View>

          {/* Output Results Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Leaf size={24} color={colors.primary} />
              <Text style={styles.cardTitle}>Output Results</Text>
            </View>
            
            {hasFeedOutput && (
              <>
                <View style={styles.outputCard}>
                  <View style={styles.outputHeader}>
                    <Droplet size={20} color={colors.primary} />
                    <Text style={styles.outputLabel}>Feed Output</Text>
                  </View>
                  <Text style={styles.outputValue}>
                    {currentBatch?.feedOutput ?? 0} <Text style={styles.outputUnit}>kg</Text>
                  </Text>
                  {/* Optionally display a status or note here if you add a field to Batch */}
                </View>
              </>
            )}

            {hasCompostOutput && (
              <>
                {hasFeedOutput && <View style={styles.divider} />}
                <View style={styles.outputCard}>
                  <View style={styles.outputHeader}>
                    <Leaf size={20} color={colors.primary} />
                    <Text style={styles.outputLabel}>Compost Output</Text>
                  </View>
                  <Text style={styles.outputValue}>
                    {currentBatch?.compostOutput ?? 0} <Text style={styles.outputUnit}>kg</Text>
                  </Text>
                  {/* Optionally display a status or note here if you add a field to Batch */}
                </View>
              </>
            )}
          </View>

          {/* Return Button */}
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Dashboard')}>
            <Text style={styles.buttonText}>Return to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.creamBackground 
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: { 
    padding: 20, 
    paddingTop: 24 
  },
  successHeader: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 20,
  },
  iconWrapper: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: colors.mutedText,
    textAlign: 'center',
    fontWeight: '500',
  },
  card: {
    backgroundColor: colors.cardWhite,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 15,
    color: colors.mutedText,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: colors.primaryText,
    fontWeight: '700',
  },
  badge: {
    backgroundColor: colors.softGreenSurface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    overflow: 'hidden',
  },
  statusBadge: {
    backgroundColor: colors.primary,
    color: colors.cardWhite,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    backgroundColor: colors.cardBorder,
    marginVertical: 4,
  },
  outputCard: {
    paddingVertical: 12,
  },
  outputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  outputLabel: {
    fontSize: 15,
    color: colors.mutedText,
    fontWeight: '600',
  },
  outputValue: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 4,
  },
  outputUnit: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.mutedText,
  },
  outputStatus: {
    fontSize: 13,
    color: colors.mutedText,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  button: { 
    marginTop: 24,
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: { 
    color: colors.cardWhite,
    fontWeight: '700',
    fontSize: 16,
  },
});