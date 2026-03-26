import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors';
import { LineChart } from 'react-native-chart-kit';
import ScreenTitle from '../components/ScreenTitle';
import HistoryDetailsModal from '../components/HistoryDetailsModal';
import { Calendar, ChevronRight, ChevronLeft, XCircle, MoreVertical, CalendarDays, CalendarRange, CalendarCheck } from 'lucide-react-native';
import { fetchWithAuth } from '../config/api';
import { auth } from '../config/firebase';
import { ApiBatch, ApiMachine } from '../types';

const screenWidth = Dimensions.get('window').width - 64;

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function ReportsScreen() {
  const insets = useSafeAreaInsets();
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(null);
  const [machines, setMachines] = useState<ApiMachine[]>([]);
  const [batches, setBatches] = useState<ApiBatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Filter state per machine
  const [machineFilters, setMachineFilters] = useState<Record<string, {
    chartFilter: 'week' | 'month' | 'year';
    filterMenuVisible: boolean;
    selectedMonth: number;
    selectedYear: number;
    weekOffset: number;
  }>>({});

  const getMachineFilter = (machineId: string) => {
    return machineFilters[machineId] || {
      chartFilter: 'week',
      filterMenuVisible: false,
      selectedMonth: new Date().getMonth(),
      selectedYear: new Date().getFullYear(),
      weekOffset: 0,
    };
  };

  const updateMachineFilter = (machineId: string, updates: Partial<typeof machineFilters[string]>) => {
    setMachineFilters(prev => ({
      ...prev,
      [machineId]: { ...getMachineFilter(machineId), ...updates }
    }));
  };

  // Fetch machines and batches from API
  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const userId = auth.currentUser?.uid ?? await AsyncStorage.getItem('loggedInUserId');
      const machinesEndpoint = userId
        ? `/machines?userId=${encodeURIComponent(userId)}`
        : '/machines';

      const machinesResponse = await fetchWithAuth(machinesEndpoint, { method: 'GET' });

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
          setBatches(batchesFromMachines);
          return;
        }
      }

      // Fallback: fetch batches directly
      const response = await fetchWithAuth('/batches', { method: 'GET' });
      if (response.ok) {
        const apiBatches = await response.json();
        setBatches(apiBatches);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  // Helper to get batch date
  const getBatchDate = (b: any): Date | null => {
    const dateStr = b.endedAt || b.endTime || b.startedAt || b.startTime || b.createdAt;
    if (!dateStr) return null;
    return new Date(dateStr);
  };

  // Generate chart data for a specific machine
  const generateChartData = (machineId: string, machineBatches: ApiBatch[]) => {
    const filter = getMachineFilter(machineId);
    const { chartFilter, selectedMonth, selectedYear, weekOffset } = filter;

    if (chartFilter === 'week') {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const monday = new Date(today);
      monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7) + (weekOffset * 7));
      const weekDays = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };
      });
      const totalData = weekDays.map(({ year, month, day }) => {
        const dayBatches = machineBatches.filter(b => {
          const batchDate = getBatchDate(b);
          return batchDate && batchDate.getFullYear() === year && batchDate.getMonth() === month && batchDate.getDate() === day;
        });
        return dayBatches.reduce((sum, b) => sum + (b.estimatedWeight ?? 0), 0);
      });
      const dayLabels = weekDays.map(({ year, month, day }) => {
        const d = new Date(year, month, day);
        return d.toLocaleDateString(undefined, { weekday: 'short' });
      });
      const weekStart = new Date(weekDays[0].year, weekDays[0].month, weekDays[0].day);
      const weekEnd = new Date(weekDays[6].year, weekDays[6].month, weekDays[6].day);
      return {
        labels: dayLabels,
        weekRange: `${weekStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`,
        datasets: [{ data: totalData.some(v => v > 0) ? totalData : totalData.map(() => 0), color: (opacity = 1) => `rgba(46,125,50, ${opacity})`, strokeWidth: 2 }],
      };
    } else if (chartFilter === 'month') {
      const year = selectedYear;
      const month = selectedMonth;
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
      const dayLabels = days.map(day => `${day}`);
      const totalData = days.map(day => {
        const dayBatches = machineBatches.filter(b => {
          const batchDate = getBatchDate(b);
          return batchDate && batchDate.getFullYear() === year && batchDate.getMonth() === month && batchDate.getDate() === day;
        });
        return dayBatches.reduce((sum, b) => sum + (b.estimatedWeight ?? 0), 0);
      });
      return {
        labels: dayLabels,
        datasets: [{ data: totalData.some(v => v > 0) ? totalData : totalData.map(() => 0), color: (opacity = 1) => `rgba(46,125,50, ${opacity})`, strokeWidth: 2 }],
      };
    } else {
      const year = new Date().getFullYear();
      const months = Array.from({ length: 12 }, (_, i) => i);
      const monthLabels = months.map(m => new Date(year, m, 1).toLocaleDateString(undefined, { month: 'short' }));
      const totalData = months.map(month => {
        const monthBatches = machineBatches.filter(b => {
          const batchDate = getBatchDate(b);
          return batchDate && batchDate.getFullYear() === year && batchDate.getMonth() === month;
        });
        return monthBatches.reduce((sum, b) => sum + (b.estimatedWeight ?? 0), 0);
      });
      return {
        labels: monthLabels,
        datasets: [{ data: totalData.some(v => v > 0) ? totalData : totalData.map(() => 0), color: (opacity = 1) => `rgba(46,125,50, ${opacity})`, strokeWidth: 2 }],
      };
    }
  };

  // Get history data for modal
  const modalHistoryData = useMemo(() => {
    if (!selectedMachineId) return [];
    return batches
      .filter(b => b.machineId === selectedMachineId && getBatchDate(b))
      .sort((a, b) => (getBatchDate(b)?.getTime() ?? 0) - (getBatchDate(a)?.getTime() ?? 0))
      .map(batch => ({
        date: getBatchDate(batch)?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) || 'Unknown',
        batch: batch.batchNumber || batch.id.substring(0, 8).toUpperCase(),
        feedKg: Math.round((batch.feedOutput ?? 0) * 10) / 10,
        compostKg: Math.round((batch.compostOutput ?? 0) * 10) / 10,
      }));
  }, [selectedMachineId, batches]);

  const handleViewHistory = (machineId: string) => {
    setSelectedMachineId(machineId);
    setShowHistoryModal(true);
  };

  const hasMachines = machines.length > 0;

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ScrollView 
        contentContainerStyle={{ padding: 16, paddingTop: 0, paddingBottom: 80 + insets.bottom }}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={colors.primary} colors={[colors.primary]} />
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
        ) : hasMachines ? (
          <>
            <Text style={styles.sectionTitle}>Machine Outputs</Text>
            {machines.map((machine) => {
              const machineBatches = batches.filter(b => b.machineId === machine.id);
              const filter = getMachineFilter(machine.id);
              const chartData = generateChartData(machine.id, machineBatches);
              const totalEstimatedWeight = machineBatches.reduce((sum, b) => sum + (b.estimatedWeight ?? 0), 0);
              
              // Output history for this machine
              const outputHistory = machineBatches
                .filter(b => getBatchDate(b))
                .sort((a, b) => (getBatchDate(b)?.getTime() ?? 0) - (getBatchDate(a)?.getTime() ?? 0))
                .slice(0, 3)
                .map(b => ({
                  date: getBatchDate(b)?.toLocaleDateString(undefined, { month: 'long', day: 'numeric' }) || 'Unknown',
                  weight: `${b.estimatedWeight ?? 0} g`,
                }));

              return (
                <View key={machine.id} style={styles.machineCard}>
                  {/* Header with title and filter */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={styles.machineTitle}>{machine.name || machine.machineId} - {totalEstimatedWeight} g</Text>
                    <View style={{ position: 'relative', zIndex: 100 }}>
                      <TouchableOpacity
                        style={{ padding: 8, borderRadius: 999, backgroundColor: colors.cardBorder }}
                        onPress={() => updateMachineFilter(machine.id, { filterMenuVisible: !filter.filterMenuVisible })}
                      >
                        <MoreVertical size={24} color={colors.primary} />
                      </TouchableOpacity>
                      {filter.filterMenuVisible && (
                        <View style={{ position: 'absolute', top: 44, right: 0, backgroundColor: colors.cardWhite, borderRadius: 12, minWidth: 120, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, elevation: 8, zIndex: 1000 }}>
                          <TouchableOpacity
                            style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderBottomWidth: 1, borderBottomColor: colors.cardBorder }}
                            onPress={() => updateMachineFilter(machine.id, { chartFilter: 'week', filterMenuVisible: false })}
                          >
                            <CalendarDays size={18} color={filter.chartFilter === 'week' ? colors.primary : colors.mutedText} />
                            <Text style={{ color: filter.chartFilter === 'week' ? colors.primary : colors.mutedText, fontWeight: '600', fontSize: 14 }}>Week</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderBottomWidth: 1, borderBottomColor: colors.cardBorder }}
                            onPress={() => updateMachineFilter(machine.id, { chartFilter: 'month', filterMenuVisible: false })}
                          >
                            <CalendarRange size={18} color={filter.chartFilter === 'month' ? colors.primary : colors.mutedText} />
                            <Text style={{ color: filter.chartFilter === 'month' ? colors.primary : colors.mutedText, fontWeight: '600', fontSize: 14 }}>Month</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12 }}
                            onPress={() => updateMachineFilter(machine.id, { chartFilter: 'year', filterMenuVisible: false })}
                          >
                            <CalendarCheck size={18} color={filter.chartFilter === 'year' ? colors.primary : colors.mutedText} />
                            <Text style={{ color: filter.chartFilter === 'year' ? colors.primary : colors.mutedText, fontWeight: '600', fontSize: 14 }}>Year</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>
                  <Text style={styles.machineSubtitle}>Total Output</Text>

                  {/* Week selector */}
                  {filter.chartFilter === 'week' && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, marginBottom: 4 }}>
                      <TouchableOpacity onPress={() => updateMachineFilter(machine.id, { weekOffset: filter.weekOffset - 1 })} style={{ padding: 8 }}>
                        <ChevronLeft size={20} color={colors.primary} />
                      </TouchableOpacity>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: colors.primary }}>
                        {(chartData as any).weekRange || 'This Week'}
                      </Text>
                      <TouchableOpacity 
                        onPress={() => updateMachineFilter(machine.id, { weekOffset: filter.weekOffset + 1 })} 
                        style={{ padding: 8 }}
                        disabled={filter.weekOffset >= 0}
                      >
                        <ChevronRight size={20} color={filter.weekOffset >= 0 ? colors.mutedText : colors.primary} />
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Month selector */}
                  {filter.chartFilter === 'month' && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, marginBottom: 4 }}>
                      <TouchableOpacity 
                        onPress={() => {
                          if (filter.selectedMonth === 0) {
                            updateMachineFilter(machine.id, { selectedMonth: 11, selectedYear: filter.selectedYear - 1 });
                          } else {
                            updateMachineFilter(machine.id, { selectedMonth: filter.selectedMonth - 1 });
                          }
                        }} 
                        style={{ padding: 8 }}
                      >
                        <ChevronLeft size={20} color={colors.primary} />
                      </TouchableOpacity>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: colors.primary }}>
                        {monthNames[filter.selectedMonth]} {filter.selectedYear}
                      </Text>
                      <TouchableOpacity 
                        onPress={() => {
                          if (filter.selectedMonth === 11) {
                            updateMachineFilter(machine.id, { selectedMonth: 0, selectedYear: filter.selectedYear + 1 });
                          } else {
                            updateMachineFilter(machine.id, { selectedMonth: filter.selectedMonth + 1 });
                          }
                        }} 
                        style={{ padding: 8 }}
                        disabled={filter.selectedMonth === new Date().getMonth() && filter.selectedYear === new Date().getFullYear()}
                      >
                        <ChevronRight size={20} color={filter.selectedMonth === new Date().getMonth() && filter.selectedYear === new Date().getFullYear() ? colors.mutedText : colors.primary} />
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Chart */}
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 16 }}>
                    <LineChart
                      data={chartData}
                      width={filter.chartFilter === 'month' ? Math.max(screenWidth + 40, chartData.labels.length * 40) : screenWidth + 40}
                      height={220}
                      yAxisLabel=""
                      chartConfig={{
                        backgroundGradientFrom: colors.cardWhite,
                        backgroundGradientTo: colors.cardWhite,
                        color: (opacity = 1) => `rgba(31,95,42, ${opacity})`,
                        strokeWidth: 2,
                        decimalPlaces: 1,
                        fillShadowGradient: 'rgba(31,95,42, 0.3)',
                        fillShadowGradientOpacity: 1,
                        propsForBackgroundLines: { strokeDasharray: '', stroke: 'rgba(200,200,200,0.5)', strokeWidth: 1 },
                        propsForLabels: { fontSize: 11 },
                        propsForDots: { r: '4', strokeWidth: '2', stroke: colors.primary },
                      }}
                      yAxisSuffix=" g"
                      fromZero={true}
                      bezier
                      withHorizontalLines={true}
                      withVerticalLines={true}
                      withDots={true}
                      withShadow={true}
                      withInnerLines={true}
                      segments={5}
                      renderDotContent={({ x, y, index, indexData }) => (
                        indexData > 0 ? (
                          <Text key={index} style={{ position: 'absolute', top: y - 18, left: x - 12, fontSize: 10, fontWeight: '600', color: colors.primary }}>
                            {indexData}
                          </Text>
                        ) : null
                      )}
                      style={styles.chart}
                    />
                  </ScrollView>

                  {/* Output History */}
                  <View style={styles.historyHeader}>
                    <Text style={styles.historyTitle}>Output History</Text>
                    <TouchableOpacity style={styles.viewHistoryButton} onPress={() => handleViewHistory(machine.id)}>
                      <Text style={styles.viewHistoryText}>View History</Text>
                      <ChevronRight size={18} color={colors.primary} />
                    </TouchableOpacity>
                  </View>

                  {outputHistory.length > 0 ? (
                    outputHistory.map((entry, index) => (
                      <View key={index} style={styles.historyItem}>
                        <View style={styles.historyLeft}>
                          <Calendar size={18} color={colors.mutedText} />
                          <Text style={styles.historyDate}>{entry.date}</Text>
                        </View>
                        <Text style={styles.historyWeight}>{entry.weight}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.noHistoryText}>No output history yet</Text>
                  )}
                </View>
              );
            })}
          </>
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
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.primaryText, marginTop: 8, marginLeft: 8 },
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
  machineTitle: { fontSize: 20, fontWeight: '700', color: colors.primary, marginBottom: 4 },
  machineSubtitle: { fontSize: 14, color: colors.mutedText, marginBottom: 8 },
  chart: { borderRadius: 12, marginTop: 8 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 12 },
  historyTitle: { fontSize: 16, fontWeight: '700', color: colors.primary },
  viewHistoryButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  viewHistoryText: { fontSize: 14, fontWeight: '600', color: colors.primary },
  historyItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(200,200,200,0.2)' },
  historyLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  historyDate: { fontSize: 14, color: colors.mutedText, fontWeight: '500' },
  historyWeight: { fontSize: 16, fontWeight: '700', color: colors.primary },
  noHistoryText: { fontSize: 14, color: colors.mutedText, paddingVertical: 12 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, paddingVertical: 250 },
  emptyIcon: { width: 96, height: 96, borderRadius: 48, backgroundColor: colors.cardSurface, alignItems: 'center', justifyContent: 'center', marginTop: 20, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 4, borderWidth: 1, borderColor: colors.cardBorder },
  emptyTitle: { fontSize: 26, fontWeight: '700', color: colors.primary, marginBottom: 10 },
  emptyText: { fontSize: 16, color: colors.mutedText, textAlign: 'center' },
  loadingState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 100 },
});
