import React, { useMemo, useState } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { colors } from '../theme/colors';
import { LineChart, BarChart } from 'react-native-chart-kit';
import ScreenTitle from '../components/ScreenTitle';
import { Filter, Calendar, ChevronRight, ArrowLeft, ChevronLeft } from 'lucide-react-native';

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

  const mockCards: CardConfig[] = useMemo(
    () => [
      {
        id: 'a',
        title: 'Machine A - 85 kg',
        subtitle: 'Total Output',
        chartData: selectedLineData,
        chartType: 'line',
        history: [
          { date: 'April 22', value: '23 kg' },
          { date: 'April 21', value: '33 kg' },
          { date: 'April 20', value: '29 kg' },
        ],
      },
      {
        id: 'b',
        title: 'Machine B - 67 kg',
        subtitle: 'Total Output',
        chartData: selectedLineData,
        chartType: 'line',
        history: [
          { date: 'April 22', value: '19 kg' },
          { date: 'April 21', value: '27 kg' },
          { date: 'April 20', value: '21 kg' },
        ],
      },
    ],
    [selectedBarData, selectedLineData],
  );

  const handleSelectRange = (value: RangeKey) => {
    setRange(value);
    setIsFilterOpen(false);
  };

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

        <Text style={styles.sectionTitle}>Outputs</Text>
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
      </ScrollView>

      <Modal
        visible={showHistoryModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowHistoryModal(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { paddingBottom: insets.bottom, paddingTop: Math.min(insets.top, 12) }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setShowHistoryModal(false)}
              style={styles.backButton}
            >
              <ChevronLeft size={28} color={colors.primaryText} strokeWidth={2.5} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>History Details</Text>
            <View style={{ width: 60 }} />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalContent}
          >
            {modalHistoryData.map((item, index) => (
              <View key={index} style={styles.historyCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.batchBadge}>
                    <Text style={styles.batchBadgeText}>{item.batch}</Text>
                  </View>
                  <Text style={styles.cardDate}>{item.date}</Text>
                </View>

                <View style={styles.cardDivider} />

                <View style={styles.dataRow}>
                  <View style={styles.dataItem}>
                    <Text style={styles.dataLabel}>Feed Output</Text>
                    <Text style={styles.dataValue}>{item.feedKg} kg</Text>
                  </View>
                  <View style={styles.dataSeparator} />
                  <View style={styles.dataItem}>
                    <Text style={styles.dataLabel}>Compost Output</Text>
                    <Text style={styles.dataValue}>{item.compostKg} kg</Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
  modalContainer: { flex: 1, backgroundColor: colors.creamBackground },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.creamBackground,
    borderBottomWidth: 0,
    position: 'relative',
  },
  backButtoniOS: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 4,
  },
  backButtonText: { fontSize: 16, fontWeight: '600', color: colors.primary },
  backButton: {
    padding: 8,
    marginLeft: -8,
    position: 'absolute',
    left: 16,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.primaryText, textAlign: 'center' },
  modalContent: { paddingHorizontal: 16, paddingVertical: 20, gap: 14, paddingBottom: 24 },
  historyCard: {
    backgroundColor: colors.cardWhite,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  batchBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  batchBadgeText: { fontSize: 12, fontWeight: '700', color: colors.cardWhite },
  cardDate: { fontSize: 14, fontWeight: '600', color: colors.mutedText },
  cardDivider: { height: 1, backgroundColor: colors.cardBorder, marginBottom: 14 },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  dataItem: { flex: 1, alignItems: 'center' },
  dataSeparator: { width: 1, height: 40, backgroundColor: colors.cardBorder, marginHorizontal: 12 },
  dataLabel: { fontSize: 12, color: colors.mutedText, fontWeight: '600', marginBottom: 6 },
  dataValue: { fontSize: 20, fontWeight: '700', color: colors.primary },
});
