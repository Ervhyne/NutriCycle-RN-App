import React, { useState, useEffect } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Plus, ChevronRight, ChevronLeft, Calendar } from 'lucide-react-native';
import { colors } from '../theme/colors';
import ScreenTitle from '../components/ScreenTitle';
import { LineChart } from 'react-native-chart-kit';
import HistoryDetailsModal, { type HistoryDetailsItem } from '../components/HistoryDetailsModal';
import { useMachineStore } from '../stores/machineStore';
import { fetchWithAuth } from '../config/api';

const screenWidth = Dimensions.get('window').width - 64;

interface Batch {
  id: string;
  batchNumber?: string;
  machineId: string;
  estimatedWeight: number;
  actualWeight?: number;
  status: string;
  createdAt: string;
  completedAt?: string;
}

export default function DashboardScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { batches, setCurrentBatch, selectedMachine } = useMachineStore();
  const [serverBatches, setServerBatches] = useState<Batch[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(false);

  useEffect(() => {
    fetchServerBatches();
  }, [selectedMachine?.id]);

  const fetchServerBatches = async () => {
    try {
      setLoadingBatches(true);
      const endpoint = selectedMachine?.machineId 
        ? `/batches?machineId=${selectedMachine.machineId}`
        : '/batches';
      const res = await fetchWithAuth(endpoint);
      const data = await res.json();
      setServerBatches(Array.isArray(data) ? data : data.batches || []);
    } catch (err) {
      console.error('Failed to fetch batches:', err);
      setServerBatches([]);
    } finally {
      setLoadingBatches(false);
    }
  };

  const machineName = selectedMachine?.name ?? 'Select a machine';
  const machineLabel = machineName;

  const machineBatches = selectedMachine
    ? batches.filter((b) => b.machineId === selectedMachine.id)
    : batches;

  const machineData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{ 
      data: [14, 19, 17, 23, 27, 31, 28],
      color: (opacity = 1) => `rgba(46,125,50, ${opacity})`,
      strokeWidth: 2,
    }],
  };

  const outputHistory = [
    { date: 'April 22', weight: '23 kg' },
    { date: 'April 21', weight: '33 kg' },
    { date: 'April 20', weight: '29 kg' },
  ];

  const totalOutput = machineBatches.reduce((sum, b) => sum + (b.actualWeight ?? 0), 0);

  const [historyOpen, setHistoryOpen] = React.useState(false);

  const historyData: HistoryDetailsItem[] = (selectedMachine ? batches.filter((b) => b.machineId === selectedMachine.id) : batches)
    .slice()
    .sort((a, b) => {
      const aTime = a.endTime ? new Date(a.endTime).getTime() : a.startTime ? new Date(a.startTime).getTime() : 0;
      const bTime = b.endTime ? new Date(b.endTime).getTime() : b.startTime ? new Date(b.startTime).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, 20)
    .map((b) => {
      const total = b.actualWeight ?? 0;
      let feedKg = 0;
      let compostKg = 0;
      if (b.type === 'feed') feedKg = total;
      else if (b.type === 'compost') compostKg = total;
      else {
        // mixed: split weight equally
        feedKg = Math.round(total / 2);
        compostKg = total - feedKg;
      }
      const date = b.endTime
        ? new Date(b.endTime).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })
        : b.startTime
        ? new Date(b.startTime).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })
        : 'Unknown';
      return { date, batch: b.id, feedKg, compostKg } as HistoryDetailsItem;
    });

  // Recent activity: sort by endTime then startTime, newest first, limit to 3
  const recentBatches = batches
    .slice()
    .sort((a, b) => {
      const aTime = a.endTime ? new Date(a.endTime).getTime() : a.startTime ? new Date(a.startTime).getTime() : 0;
      const bTime = b.endTime ? new Date(b.endTime).getTime() : b.startTime ? new Date(b.startTime).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, 3);

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 80 + insets.bottom, flexGrow: 1 }}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <ChevronLeft size={26} color={colors.primaryText} strokeWidth={2.2} />
          </TouchableOpacity>
          <ScreenTitle style={styles.headerTitle}>Dashboard</ScreenTitle>
          <View style={styles.headerSpacer} />
        </View>

        {/* Machine Card */}
        <View style={styles.machineCard}>
          <Text style={styles.machineTitle}>{machineLabel} - {totalOutput} kg</Text>
          <Text style={styles.machineSubtitle}>Total Output</Text>
          
          <LineChart
            data={machineData}
            width={screenWidth}
            height={220}
            chartConfig={{
              backgroundGradientFrom: colors.cardWhite,
              backgroundGradientTo: colors.cardWhite,
              color: (opacity = 1) => `rgba(31,95,42, ${opacity})`,
              strokeWidth: 2,
              decimalPlaces: 0,
              fillShadowGradient: 'rgba(31,95,42, 0.3)',
              fillShadowGradientOpacity: 1,
            }}
            bezier
            style={styles.chart}
          />

          {/* Output History Section */}
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Output History</Text>
            <TouchableOpacity 
              style={styles.viewHistoryButton}
              onPress={() => setHistoryOpen(true)}
            >
              <Text style={styles.viewHistoryText}>View History</Text>
              <ChevronRight size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {outputHistory.map((entry, index) => (
            <View key={index} style={styles.historyItem}>
              <View style={styles.historyLeft}>
                <Calendar size={18} color={colors.mutedText} />
                <Text style={styles.historyDate}>{entry.date}</Text>
              </View>
              <Text style={styles.historyWeight}>{entry.weight}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Recent Activity</Text>
        {loadingBatches ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : serverBatches.length === 0 ? (
          <Text style={styles.text}>No batch activity yet.</Text>
        ) : (
          serverBatches.slice(0, 3).map((b) => (
            <View key={b.id} style={styles.batchItem}>
              <View style={styles.batchTopRow}>
                <Text style={styles.batchId}>{b.batchNumber || b.id}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{b.status}</Text>
                </View>
              </View>
              <View style={styles.batchBottomRow}>
                <Text style={styles.batchMeta}>{b.actualWeight || b.estimatedWeight} kg</Text>
                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() => navigation.navigate('BatchSession', { batchId: b.id })}
                  activeOpacity={0.85}
                >
                  <Text style={styles.viewButtonText}>View</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* New Batch FAB (bottom-right) */}
      <TouchableOpacity
        style={[styles.fab, { right: 16, bottom: 16 + insets.bottom }]}
        onPress={() => navigation.navigate('NewBatch')}
        activeOpacity={0.8}
      >
        <Plus size={20} color={colors.cardWhite} />
      </TouchableOpacity> 

      {/* History Details Modal */}
      <HistoryDetailsModal
        visible={historyOpen}
        data={historyData}
        onClose={() => setHistoryOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.creamBackground },
  title: { fontSize: 24, fontWeight: '700', color: colors.primary, marginLeft: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.primaryText, marginTop: 8, marginLeft: 8 },
  chart: { 
    borderRadius: 12, 
    marginTop: 16,
    marginLeft: -8,
  },
  text: { color: colors.mutedText },
  batchItem: { backgroundColor: colors.cardWhite, padding: 12, borderRadius: 12, marginTop: 10, borderWidth: 1, borderColor: colors.cardBorder},
  batchTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  batchId: { color: colors.primaryText, fontWeight: '700', fontSize: 14 },
  statusBadge: { backgroundColor: colors.softGreenSurface, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  statusText: { color: colors.primary, fontWeight: '700', fontSize: 12, textTransform: 'capitalize' },
  batchBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  batchMeta: { color: colors.mutedText, fontWeight: '600' },
  viewButton: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: colors.primary, borderRadius: 10 },
  viewButtonText: { color: colors.cardWhite, fontWeight: '500' },
  loadingContainer: { paddingVertical: 16, justifyContent: 'center', alignItems: 'center' },
  fab: { position: 'absolute', width: 56, height: 56, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  fabTextLarge: { color: colors.cardWhite, fontSize: 28, lineHeight: 30 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  headerTitle: { flex: 1, textAlign: 'center' },
  headerSpacer: { width: 44, height: 44 },
  machineCard: {
    backgroundColor: colors.cardWhite,
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  machineTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  machineSubtitle: {
    fontSize: 14,
    color: colors.mutedText,
    marginBottom: 8,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  viewHistoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewHistoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(200,200,200,0.2)',
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  historyDate: {
    fontSize: 14,
    color: colors.mutedText,
    fontWeight: '500',
  },
  historyWeight: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
});
