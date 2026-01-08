import React, { useMemo, useState } from 'react';
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

  const lineDataByRange: Record<RangeKey, ChartData> = useMemo(
    () => ({
      week: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{ data: [14, 19, 17, 22, 27, 32, 29] }],
      },
      month: {
        labels: ['W1', 'W2', 'W3', 'W4'],
        datasets: [{ data: [88, 96, 110, 104] }],
      },
      year: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{ data: [240, 260, 280, 300, 320, 310, 330, 350, 340, 360, 380, 400] }],
      },
    }),
    [],
  );

  const barDataByRange: Record<RangeKey, ChartData> = useMemo(
    () => ({
      week: {
        labels: ['Feed', 'Compost', 'Waste'],
        datasets: [{ data: [140, 95, 18] }],
      },
      month: {
        labels: ['Feed', 'Compost', 'Waste'],
        datasets: [{ data: [560, 380, 64] }],
      },
      year: {
        labels: ['Feed', 'Compost', 'Waste'],
        datasets: [{ data: [3000, 2100, 450] }],
      },
    }),
    [],
  );

  const selectedLineData = useMemo(() => lineDataByRange[range], [lineDataByRange, range]);
  const selectedBarData = useMemo(() => barDataByRange[range], [barDataByRange, range]);

  const mockCards: CardConfig[] = useMemo(() => {
    return machines.map((machine) => {
      const machineBatches = batches.filter((b) => b.machineId === machine.id);
      const totalOutput = machineBatches.reduce((sum, b) => sum + (b.actualWeight ?? 0), 0);
      const recentHistory = machineBatches
        .filter((b) => b.endTime)
        .sort((a, b) => (b.endTime?.getTime() ?? 0) - (a.endTime?.getTime() ?? 0))
        .slice(0, 3)
        .map((b) => ({
          date: b.endTime?.toLocaleDateString() ?? 'Unknown',
          value: `${b.actualWeight ?? 0} kg`,
        }));

      return {
        id: machine.id,
        title: `${machine.name} - ${totalOutput} kg`,
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

  const modalHistoryData = useMemo(
    () => [
      { date: 'April 22', batch: 'B001', feedKg: 23, compostKg: 8 },
      { date: 'April 21', batch: 'B002', feedKg: 33, compostKg: 12 },
      { date: 'April 20', batch: 'B003', feedKg: 29, compostKg: 10 },
      { date: 'April 19', batch: 'B004', feedKg: 25, compostKg: 9 },
      { date: 'April 18', batch: 'B005', feedKg: 28, compostKg: 11 },
    ],
    [],
  );

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
