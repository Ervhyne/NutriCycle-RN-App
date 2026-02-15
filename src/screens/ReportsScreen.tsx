import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { colors } from '../theme/colors';
import { LineChart, BarChart } from 'react-native-chart-kit';
import ScreenTitle from '../components/ScreenTitle';
import HistoryDetailsModal from '../components/HistoryDetailsModal';
import { Filter, Calendar, ChevronRight, XCircle } from 'lucide-react-native';
import { fetchWithAuth } from '../config/api';
import { ApiBatch, ApiMachine } from '../types';

const screenWidth = Dimensions.get('window').width - 32;
const cardWidth = screenWidth;

type RangeKey = 'week' | 'month' | 'year';
type ChartData = { labels: string[]; datasets: { data: number[] }[] };
type CardConfig = {
  id: string;
  title: string;
  subtitle: string;
  chartData: ChartData;
  chartType: 'bar' | 'line';
  history: { date: string; value: string }[];
};

export default function ReportsScreen() {
  const insets = useSafeAreaInsets();
  const [range, setRange] = useState<RangeKey>('week');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);
  const [machines, setMachines] = useState<ApiMachine[]>([]);
  const [batches, setBatches] = useState<ApiBatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch machines and batches from API
  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      // Fetch machines first (includes batches with process data)
      const machinesResponse = await fetchWithAuth('/machines', {
        method: 'GET',
      });

      if (machinesResponse.ok) {
        const machinesData = await machinesResponse.json();
        setMachines(machinesData);

        const batchesFromMachines = machinesData.flatMap((machine: ApiMachine) =>
          (machine.batches ?? []).map((batch: ApiBatch) => ({
            ...batch,
            machineId: batch.machineId || machine.id,
            machine: batch.machine ?? {
              id: machine.id,
              machineId: machine.machineId,
              name: machine.name,
            },
          }))
        );

        if (batchesFromMachines.length > 0) {
          const batchesWithProcessData = batchesFromMachines.map((batch: ApiBatch) => ({
            ...batch,
            compostOutput: batch.process?.compostOutputWeight,
            feedOutput: batch.process?.feedOutputWeight,
          }));

          setBatches(batchesWithProcessData);
          return;
        }
      }

      // Fallback: fetch batches directly if machines response has no batches
      const response = await fetchWithAuth('/batches', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch batches');
      }

      const apiBatches = await response.json();

      // Process data is included via the 'process' relation from the backend
      const batchesWithProcessData = apiBatches.map((batch: ApiBatch) => ({
        ...batch,
        machineId: batch.machine?.id || batch.machineId,
        compostOutput: batch.process?.compostOutputWeight,
        feedOutput: batch.process?.feedOutputWeight,
      }));

      setBatches(batchesWithProcessData);
    } catch (error) {
      console.error('Error fetching batches:', error);
    } finally {
      if (isRefresh) {
        setIsRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  // Helper function to get date range based on selected range
  const getDateRange = useCallback((rangeType: RangeKey): Date => {
    const now = new Date();
    const startDate = new Date();
    
    if (rangeType === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else if (rangeType === 'month') {
      startDate.setMonth(now.getMonth() - 1);
    } else {
      startDate.setFullYear(now.getFullYear() - 1);
    }
    
    return startDate;
  }, []);

  // Calculate line chart data from real batches
  const lineDataByRange: Record<RangeKey, ChartData> = useMemo(() => {
    const now = new Date();
    const completedBatches = batches.filter(b => b.status === 'completed' && b.endedAt);

    const weekData = () => {
      const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const data = new Array(7).fill(0);
      const startDate = getDateRange('week');
      
      completedBatches.forEach(batch => {
        const endDate = batch.endedAt ? new Date(batch.endedAt) : null;
        if (endDate && endDate >= startDate) {
          const dayIndex = (endDate.getDay() + 6) % 7; // Convert to Mon=0, Sun=6
          const output = (batch.compostOutput || 0) + (batch.feedOutput || 0);
          data[dayIndex] += output;
        }
      });
      
      return { labels, datasets: [{ data: data.map(v => Math.round(v * 10) / 10) }] };
    };

    const monthData = () => {
      const labels = ['W1', 'W2', 'W3', 'W4'];
      const data = new Array(4).fill(0);
      const startDate = getDateRange('month');
      
      completedBatches.forEach(batch => {
        const endDate = batch.endedAt ? new Date(batch.endedAt) : null;
        if (endDate && endDate >= startDate) {
          const weekIndex = Math.min(Math.floor((endDate.getDate() - 1) / 7), 3);
          const output = (batch.compostOutput || 0) + (batch.feedOutput || 0);
          data[weekIndex] += output;
        }
      });
      
      return { labels, datasets: [{ data: data.map(v => Math.round(v * 10) / 10) }] };
    };

    const yearData = () => {
      const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const data = new Array(12).fill(0);
      const startDate = getDateRange('year');
      
      completedBatches.forEach(batch => {
        const endDate = batch.endedAt ? new Date(batch.endedAt) : null;
        if (endDate && endDate >= startDate) {
          const monthIndex = endDate.getMonth();
          const output = (batch.compostOutput || 0) + (batch.feedOutput || 0);
          data[monthIndex] += output;
        }
      });
      
      return { labels, datasets: [{ data: data.map(v => Math.round(v * 10) / 10) }] };
    };

    return {
      week: weekData(),
      month: monthData(),
      year: yearData(),
    };
  }, [batches, getDateRange]);

  // Calculate bar chart data from real batches (compost vs feed output)
  const barDataByRange: Record<RangeKey, ChartData> = useMemo(() => {
    const calculateByType = (rangeType: RangeKey) => {
      const startDate = getDateRange(rangeType);
      const completedBatches = batches.filter(
        b => b.status === 'completed' && b.endedAt && new Date(b.endedAt) >= startDate
      );

      const feedTotal = completedBatches.reduce((sum, b) => sum + (b.feedOutput ?? 0), 0);
      const compostTotal = completedBatches.reduce((sum, b) => sum + (b.compostOutput ?? 0), 0);

      return {
        labels: ['Feed', 'Compost'],
        datasets: [{ 
          data: [
            Math.round(feedTotal * 10) / 10, 
            Math.round(compostTotal * 10) / 10
          ] 
        }],
      };
    };

    return {
      week: calculateByType('week'),
      month: calculateByType('month'),
      year: calculateByType('year'),
    };
  }, [batches, getDateRange]);

  const selectedLineData = useMemo(() => lineDataByRange[range], [lineDataByRange, range]);

  const mockCards: CardConfig[] = useMemo(() => {
    return machines.map((machine) => {
      const machineBatches = batches.filter((b) => b.machineId === machine.id);
      const completedBatches = machineBatches.filter(b => b.status === 'completed');
      const totalCompostOutput = completedBatches.reduce((sum, b) => sum + (b.compostOutput ?? 0), 0);
      const totalFeedOutput = completedBatches.reduce((sum, b) => sum + (b.feedOutput ?? 0), 0);
      const totalOutput = totalCompostOutput + totalFeedOutput;
      
      const recentHistory = machineBatches
        .filter((b) => b.endedAt)
        .sort((a, b) => {
          const dateA = a.endedAt ? new Date(a.endedAt).getTime() : 0;
          const dateB = b.endedAt ? new Date(b.endedAt).getTime() : 0;
          return dateB - dateA;
        })
        .slice(0, 5)
        .map((b) => {
          const output = (b.compostOutput || 0) + (b.feedOutput || 0);
          return {
            date: b.endedAt ? new Date(b.endedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Unknown',
            value: `${Math.round(output * 10) / 10} kg`,
          };
        });

      return {
        id: machine.id,
        title: `${machine.name || machine.machineId} - ${Math.round(totalOutput * 10) / 10} kg`,
        subtitle: 'Total Output (Compost + Feed)',
        chartData: selectedLineData,
        chartType: 'line' as const,
        history: recentHistory.length > 0 ? recentHistory : [{ date: 'No data', value: '0 kg' }],
      };
    });
  }, [machines, batches, selectedLineData]);

  const handleSelectRange = (value: RangeKey) => {
    setRange(value);
    setIsFilterOpen(false);
  };

  const hasMachines = machines.length > 0;

  const rangeLabel = useMemo(() => {
    if (range === 'week') return 'Week';
    if (range === 'month') return 'Month';
    return 'Year';
  }, [range]);

  // Calculate overall totals across all machines
  const overallTotals = useMemo(() => {
    const completedBatches = batches.filter(b => b.status === 'completed');
    const totalCompost = completedBatches.reduce((sum, b) => sum + (b.compostOutput ?? 0), 0);
    const totalFeed = completedBatches.reduce((sum, b) => sum + (b.feedOutput ?? 0), 0);
    const totalOutput = totalCompost + totalFeed;

    return {
      compost: Math.round(totalCompost * 10) / 10,
      feed: Math.round(totalFeed * 10) / 10,
      total: Math.round(totalOutput * 10) / 10,
    };
  }, [batches]);

  // Get real history data for selected machine
  const modalHistoryData = useMemo(() => {
    if (!selectedMachine) return [];
    
    return batches
      .filter(b => b.machineId === selectedMachine && b.status === 'completed' && b.endedAt)
      .sort((a, b) => {
        const dateA = a.endedAt ? new Date(a.endedAt).getTime() : 0;
        const dateB = b.endedAt ? new Date(b.endedAt).getTime() : 0;
        return dateB - dateA;
      })
      .map(batch => ({
        date: batch.endedAt ? new Date(batch.endedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Unknown',
        batch: batch.batchNumber || batch.id.substring(0, 8).toUpperCase(),
        feedKg: Math.round((batch.feedOutput ?? 0) * 10) / 10,
        compostKg: Math.round((batch.compostOutput ?? 0) * 10) / 10,
      }));
  }, [selectedMachine, batches]);

  const handleViewHistory = (machineId: string) => {
    setSelectedMachine(machineId);
    setShowHistoryModal(true);
  };

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ScrollView 
        contentContainerStyle={{ padding: 16, paddingTop: 0, paddingBottom: 80 + insets.bottom }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <View style={styles.header}>
          <ScreenTitle style={{ textAlign: 'center' }}>Reports</ScreenTitle>
        </View>

        {isLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.emptyText}>Loading reports...</Text>
          </View>
        ) : hasMachines && batches.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Machine Outputs</Text>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.cardsColumn}
              style={styles.cardsScroll}
            >
              {mockCards.map((card) => (
                <View key={card.id} style={[styles.card, { width: cardWidth }]}> 
                <Text style={styles.cardTitle}>{card.title}</Text>
                <Text style={styles.cardSubtitle}>{card.subtitle}</Text>

                {card.chartType === 'bar' ? (
                  <BarChart
                    data={card.chartData}
                    width={cardWidth - 32}
                    height={160}
                    yAxisLabel=""
                    yAxisSuffix=""
                    chartConfig={{
                      backgroundGradientFrom: colors.cardWhite,
                      backgroundGradientTo: colors.cardWhite,
                      color: (opacity = 1) => `rgba(46,125,50, ${opacity})`,
                      decimalPlaces: 0,
                    }}
                    style={styles.cardChart}
                  />
                ) : (
                  <LineChart
                    data={card.chartData}
                    width={cardWidth - 32}
                    height={160}
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
                    style={styles.cardChart}
                  />
                )}

                <View style={styles.historyHeader}>
                  <Text style={styles.historyTitle}>Output History</Text>
                  <TouchableOpacity
                    style={styles.viewHistoryContainer}
                    onPress={() => handleViewHistory(card.id)}
                  >
                    <Text style={styles.viewHistoryButton}>View History</Text>
                    <ChevronRight size={16} color={colors.primary} />
                  </TouchableOpacity>
                </View>
                {card.history.map((item) => (
                  <View key={`${card.id}-${item.date}`} style={styles.historyRow}>
                    <View style={styles.historyLeft}>
                      <Calendar size={16} color={colors.mutedText} />
                      <Text style={styles.historyDate}>{item.date}</Text>
                    </View>
                    <Text style={styles.historyValue}>{item.value}</Text>
                  </View>
                ))}
              </View>
            ))}
            </ScrollView>
          </>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <XCircle size={56} color={colors.mutedText} />
            </View>
            <Text style={styles.emptyTitle}>No Reports</Text>
            <Text style={styles.emptyText}>
              {hasMachines ? 'No completed batches yet' : 'Add a machine to start seeing reports'}
            </Text>
          </View>
        )}
      </ScrollView>

      <HistoryDetailsModal
        visible={showHistoryModal}
        data={modalHistoryData}
        onClose={() => setShowHistoryModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.creamBackground },
  header: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: colors.primary, marginLeft: 8 },
  filterWrapper: { position: 'relative', overflow: 'visible', zIndex: 10 },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.cardWhite,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  filterLabel: { fontSize: 14, color: colors.primaryText, fontWeight: '600' },
  filterMenu: {
    position: 'absolute',
    top: 48,
    right: 0,
    backgroundColor: colors.cardWhite,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  filterMenuItem: { paddingHorizontal: 14, paddingVertical: 10 },
  filterMenuItemActive: { backgroundColor: colors.softGreenSurface },
  filterMenuText: { fontSize: 14, color: colors.primaryText, fontWeight: '600' },
  filterMenuTextActive: { color: colors.primary },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.primaryText, marginTop: 8, marginLeft: 8 },
  cardsScroll: { flex: 1, marginTop: 8 },
  cardsColumn: { paddingVertical: 8, gap: 12, paddingBottom: 8 },
  card: {
    backgroundColor: colors.cardWhite,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 6,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: colors.primaryText },
  cardSubtitle: { fontSize: 13, color: colors.mutedText, marginTop: 2 },
  cardChart: { marginTop: 12, borderRadius: 12 },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: colors.creamBackground,
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.mutedText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  historyTitle: { fontSize: 14, fontWeight: '700', color: colors.primaryText, marginTop: 16 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 },
  viewHistoryContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  viewHistoryButton: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  historyLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  historyDate: { fontSize: 13, color: colors.primaryText },
  historyValue: { fontSize: 13, color: colors.primaryText, fontWeight: '700' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, paddingVertical: 250 },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.cardSurface,
    alignItems: 'center',
    justifyContent: 'center',
    
    marginTop: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  emptyTitle: { fontSize: 26, fontWeight: '700', color: colors.primary, marginBottom: 10 },
  emptyText: { fontSize: 16, color: colors.mutedText, textAlign: 'center' },
  loadingState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 100 },
});
