import React, { useState, useEffect } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ChevronRight, ChevronLeft, Calendar } from 'lucide-react-native';
import { colors } from '../theme/colors';
import ScreenTitle from '../components/ScreenTitle';
import { LineChart } from 'react-native-chart-kit';
import HistoryDetailsModal, { type HistoryDetailsItem } from '../components/HistoryDetailsModal';
import { useMachineStore } from '../stores/machineStore';
import { fetchWithAuth } from '../config/api';
import { Batch } from '../types';

const screenWidth = Dimensions.get('window').width - 64;

export default function DashboardScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { batches, setCurrentBatch, selectedMachine } = useMachineStore();
  const [serverBatches, setServerBatches] = useState<Batch[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(false);

  useEffect(() => {
    fetchServerBatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMachine?.id]);

  useEffect(() => {
    if (serverBatches.length > 0) {
      setCurrentBatch(null);
      useMachineStore.setState({ batches: serverBatches });
    }
  }, [serverBatches, setCurrentBatch]);

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
      setServerBatches([]);
    } finally {
      setLoadingBatches(false);
    }
  };

  const machineName = selectedMachine?.name ?? 'Select a machine';
  const machineLabel = machineName;

  const totalFeedOutput = serverBatches.reduce((sum, b) => sum + (b.feedOutput ?? 0), 0);
  const totalCompostOutput = serverBatches.reduce((sum, b) => sum + (b.compostOutput ?? 0), 0);
  const machineBatches = selectedMachine
    ? batches.filter((b) => b.machineId === selectedMachine.id)
    : batches;

  // Generate chart data for total output (feed + compost) per day (last 7 days) from serverBatches
  const generateChartData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toDateString();
    });

    const totalData = last7Days.map(dateStr => {
      const dayBatches = serverBatches.filter(b => {
        const batchDate = b.endTime
          ? new Date(b.endTime).toDateString()
          : b.startTime
          ? new Date(b.startTime).toDateString()
          : null;
        return batchDate === dateStr;
      });
      return dayBatches.reduce((sum, b) => (sum + (b.feedOutput ?? 0) + (b.compostOutput ?? 0)), 0);
    });

    const dayLabels = last7Days.map(d => new Date(d).toLocaleDateString(undefined, { weekday: 'short' }));
    return {
      labels: dayLabels,
      datasets: [
        {
          data: totalData.length > 0 ? totalData : [0],
          color: (opacity = 1) => `rgba(46,125,50, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  };

  const machineData = generateChartData();

  // Generate output history from real batches (deduplicated by batch number/id)
  const outputHistoryMap = new Map<string, { date: string; weight: string }>();
  machineBatches
    .filter((b) => b.endTime || b.startTime)
    .sort((a, b) => {
      const aTime = a.endTime ? new Date(a.endTime as any).getTime() : a.startTime ? new Date(a.startTime as any).getTime() : 0;
      const bTime = b.endTime ? new Date(b.endTime as any).getTime() : b.startTime ? new Date(b.startTime as any).getTime() : 0;
      return bTime - aTime;
    })
    .forEach((b) => {
      const key = b.batchNumber ?? b.id;
      if (!outputHistoryMap.has(key)) {
        outputHistoryMap.set(key, {
          date: (b.endTime || b.startTime)
            ? new Date((b.endTime || b.startTime) as any).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })
            : 'Unknown',
          weight: `${b.actualWeight ?? 0} kg`,
        });
      }
    });
  const outputHistory = Array.from(outputHistoryMap.values()).slice(0, 3);

  const totalOutput = machineBatches.reduce((sum: number, b) => sum + (b.actualWeight ?? 0), 0);

  const [historyOpen, setHistoryOpen] = useState(false);

  const historySource = selectedMachine
    ? batches.filter((b) => b.machineId === selectedMachine.id)
    : batches;

  const historyMap = new Map<string, HistoryDetailsItem>();
  historySource
    .slice()
    .sort((a, b) => {
      const aTime = a.endTime ? new Date(a.endTime as any).getTime() : a.startTime ? new Date(a.startTime as any).getTime() : 0;
      const bTime = b.endTime ? new Date(b.endTime as any).getTime() : b.startTime ? new Date(b.startTime as any).getTime() : 0;
      return bTime - aTime;
    })
    .forEach((b) => {
      const key = b.batchNumber ?? b.id;
      if (historyMap.has(key)) return;

      let feedKg = b.feedOutput ?? 0;
      let compostKg = b.compostOutput ?? 0;
      if (feedKg === 0 && compostKg === 0) {
        const total = b.actualWeight ?? 0;
        feedKg = Math.round(total / 2);
        compostKg = total - feedKg;
      }
      const endedDate = b.endTime;
      const date = endedDate
        ? new Date(endedDate as any).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })
        : 'N/A';

      historyMap.set(key, { date, batch: key, feedKg, compostKg });
    });

  const historyData: HistoryDetailsItem[] = Array.from(historyMap.values()).slice(0, 20);

  // Recent activity: sort by endTime then startTime, newest first, limit to 3
  const recentBatches = batches
    .slice()
    .sort((a, b) => {
      const aTime = a.endTime ? new Date(a.endTime as any).getTime() : a.startTime ? new Date(a.startTime as any).getTime() : 0;
      const bTime = b.endTime ? new Date(b.endTime as any).getTime() : b.startTime ? new Date(b.startTime as any).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, 3);

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom }]}> 
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 80 + insets.bottom, flexGrow: 1 }}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Lobby')} activeOpacity={0.8}>
            <ChevronLeft size={26} color={colors.primaryText} strokeWidth={2.2} />
          </TouchableOpacity>
          <ScreenTitle style={styles.headerTitle}>Dashboard</ScreenTitle>
          <View style={styles.headerSpacer} />
        </View>

        {/* Machine Card */}
        <View style={styles.machineCard}>
           <Text style={styles.machineTitle}>{machineLabel}</Text>
           <Text style={styles.machineSubtitle}>Total Feed Output: {totalFeedOutput} kg</Text>
           <Text style={styles.machineSubtitle}>Total Compost Output: {totalCompostOutput} kg</Text>
          
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
                {b.status?.toLowerCase() !== 'completed' && (
                  <TouchableOpacity
                    style={styles.viewButton}
                    onPress={() => navigation.navigate('BatchSession', { batchId: b.id })}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.viewButtonText}>View</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>

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
