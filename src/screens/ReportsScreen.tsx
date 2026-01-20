import React, { useMemo, useState, useCallback } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { LineChart, BarChart } from 'react-native-chart-kit';
import ScreenTitle from '../components/ScreenTitle';
import HistoryDetailsModal from '../components/HistoryDetailsModal';
import { Filter, Calendar, ChevronRight, XCircle } from 'lucide-react-native';
import { useMachineStore } from '../stores/machineStore';

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
  const { machines, batches } = useMachineStore();
  const [range, setRange] = useState<RangeKey>('week');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);

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
    const completedBatches = batches.filter(b => b.status === 'completed' && b.endTime);

    const weekData = () => {
      const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const data = new Array(7).fill(0);
      const startDate = getDateRange('week');
      
      completedBatches.forEach(batch => {
        if (batch.endTime && batch.endTime >= startDate) {
          const dayIndex = (batch.endTime.getDay() + 6) % 7; // Convert to Mon=0, Sun=6
          data[dayIndex] += batch.actualWeight ?? 0;
        }
      });
      
      return { labels, datasets: [{ data: data.map(v => Math.round(v)) }] };
    };

    const monthData = () => {
      const labels = ['W1', 'W2', 'W3', 'W4'];
      const data = new Array(4).fill(0);
      const startDate = getDateRange('month');
      
      completedBatches.forEach(batch => {
        if (batch.endTime && batch.endTime >= startDate) {
          const weekIndex = Math.min(Math.floor((batch.endTime.getDate() - 1) / 7), 3);
          data[weekIndex] += batch.actualWeight ?? 0;
        }
      });
      
      return { labels, datasets: [{ data: data.map(v => Math.round(v)) }] };
    };

    const yearData = () => {
      const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const data = new Array(12).fill(0);
      const startDate = getDateRange('year');
      
      completedBatches.forEach(batch => {
        if (batch.endTime && batch.endTime >= startDate) {
          const monthIndex = batch.endTime.getMonth();
          data[monthIndex] += batch.actualWeight ?? 0;
        }
      });
      
      return { labels, datasets: [{ data: data.map(v => Math.round(v)) }] };
    };

    return {
      week: weekData(),
      month: monthData(),
      year: yearData(),
    };
  }, [batches, getDateRange]);

  // Calculate bar chart data from real batches by type
  const barDataByRange: Record<RangeKey, ChartData> = useMemo(() => {
    const calculateByType = (rangeType: RangeKey) => {
      const startDate = getDateRange(rangeType);
      const completedBatches = batches.filter(
        b => b.status === 'completed' && b.endTime && b.endTime >= startDate
      );

      const feedTotal = completedBatches
        .filter(b => b.type === 'feed')
        .reduce((sum, b) => sum + (b.actualWeight ?? 0), 0);
      
      const compostTotal = completedBatches
        .filter(b => b.type === 'compost')
        .reduce((sum, b) => sum + (b.actualWeight ?? 0), 0);
      
      const mixedTotal = completedBatches
        .filter(b => b.type === 'mixed')
        .reduce((sum, b) => sum + (b.actualWeight ?? 0), 0);

      return {
        labels: ['Feed', 'Compost', 'Mixed'],
        datasets: [{ 
          data: [
            Math.round(feedTotal), 
            Math.round(compostTotal), 
            Math.round(mixedTotal)
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
      const totalOutput = completedBatches.reduce((sum, b) => sum + (b.actualWeight ?? 0), 0);
      
      const recentHistory = machineBatches
        .filter((b) => b.endTime)
        .sort((a, b) => (b.endTime?.getTime() ?? 0) - (a.endTime?.getTime() ?? 0))
        .slice(0, 5)
        .map((b) => ({
          date: b.endTime?.toLocaleDateString() ?? 'Unknown',
          value: `${b.actualWeight ?? 0} kg`,
        }));

      return {
        id: machine.id,
        title: `${machine.name} - ${Math.round(totalOutput)} kg`,
        subtitle: 'Total Output',
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

  // Get real history data for selected machine
  const modalHistoryData = useMemo(() => {
    if (!selectedMachine) return [];
    
    return batches
      .filter(b => b.machineId === selectedMachine && b.status === 'completed' && b.endTime)
      .sort((a, b) => (b.endTime?.getTime() ?? 0) - (a.endTime?.getTime() ?? 0))
      .map(batch => ({
        date: batch.endTime?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) ?? 'Unknown',
        batch: batch.id.substring(0, 8).toUpperCase(),
        feedKg: batch.type === 'feed' ? Math.round(batch.actualWeight ?? 0) : 0,
        compostKg: batch.type === 'compost' ? Math.round(batch.actualWeight ?? 0) : 0,
      }));
  }, [selectedMachine, batches]);

  const handleViewHistory = (machineId: string) => {
    setSelectedMachine(machineId);
    setShowHistoryModal(true);
  };

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 0, paddingBottom: 80 + insets.bottom }}>
        <View style={styles.header}>
          <ScreenTitle style={{ textAlign: 'center' }}>Reports</ScreenTitle>
        </View>

        {hasMachines && <Text style={styles.sectionTitle}>Outputs</Text>}

        {hasMachines ? (
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
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <XCircle size={56} color={colors.mutedText} />
            </View>
            <Text style={styles.emptyTitle}>No Reports</Text>
            <Text style={styles.emptyText}>Add a machine to start seeing reports</Text>
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
});
