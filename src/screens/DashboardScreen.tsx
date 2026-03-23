import React, { useState, useEffect } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ChevronRight, ChevronLeft, Calendar } from 'lucide-react-native';
import { CalendarDays, CalendarRange, CalendarCheck } from 'lucide-react-native';
import { MoreVertical } from 'lucide-react-native';
import { colors } from '../theme/colors';
import ScreenTitle from '../components/ScreenTitle';
import { LineChart } from 'react-native-chart-kit';
import HistoryDetailsModal, { type HistoryDetailsItem } from '../components/HistoryDetailsModal';
import { useMachineStore } from '../stores/machineStore';
import { fetchWithAuth } from '../config/api';
import { Batch } from '../types';

const screenWidth = Dimensions.get('window').width - 64;

export default function DashboardScreen({ navigation }: any) {
    // Month picker state
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // default to current month
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, -1 = last week, etc.
    const [monthPickerVisible, setMonthPickerVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const { batches, setCurrentBatch, selectedMachine } = useMachineStore();
  const [serverBatches, setServerBatches] = useState<Batch[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(false);

  useEffect(() => {
    if (!selectedMachine) return;
    fetchServerBatches(true); // First load shows loading
    
    // Polling: fetch batches every 5 seconds for real-time updates (silent, no loading)
    const pollingInterval = setInterval(() => {
      fetchServerBatches(false);
    }, 5000);
    
    return () => clearInterval(pollingInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMachine?.id]);

  useEffect(() => {
    if (serverBatches.length > 0) {
      setCurrentBatch(null);
      useMachineStore.setState({ batches: serverBatches });
    }
  }, [serverBatches, setCurrentBatch]);

  const fetchServerBatches = async (showLoading = true) => {
    try {
      if (showLoading) setLoadingBatches(true);
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

  const machineName = selectedMachine?.name ?? '';
  const machineLabel = machineName;

  const totalFeedOutput = serverBatches.reduce((sum, b) => sum + (b.feedOutput ?? 0), 0);
  const totalCompostOutput = serverBatches.reduce((sum, b) => sum + (b.compostOutput ?? 0), 0);
  const machineBatches = selectedMachine
    ? batches.filter((b) => b.machineId === selectedMachine.id)
    : batches;

  // Filter menu state for chart filter
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [chartFilter, setChartFilter] = useState<'week' | 'month' | 'year'>('week');

  // Generate chart data for estimatedWeight based on chartFilter
  const generateChartData = () => {
    // Helper to get batch date - checks all possible date fields
    const getBatchDate = (b: any): Date | null => {
      const dateStr = b.endedAt || b.endTime || b.startedAt || b.startTime || b.createdAt;
      if (!dateStr) return null;
      return new Date(dateStr);
    };

    if (chartFilter === 'week') {
      // Week based on weekOffset (0 = current week, -1 = last week, etc.)
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0=Sunday, 1=Monday, ...
      // Find Monday of current week, then apply offset
      const monday = new Date(today);
      monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7) + (weekOffset * 7));
      const weekDays = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };
      });
      const totalData = weekDays.map(({ year, month, day }) => {
        const dayBatches = serverBatches.filter(b => {
          const batchDate = getBatchDate(b);
          return (
            batchDate &&
            batchDate.getFullYear() === year &&
            batchDate.getMonth() === month &&
            batchDate.getDate() === day
          );
        });
        return dayBatches.reduce((sum, b) => (sum + (b.estimatedWeight ?? 0)), 0);
      });
      const dayLabels = weekDays.map(({ year, month, day }) => {
        const d = new Date(year, month, day);
        return d.toLocaleDateString(undefined, { weekday: 'short' });
      });
      // Get week date range for display
      const weekStart = new Date(weekDays[0].year, weekDays[0].month, weekDays[0].day);
      const weekEnd = new Date(weekDays[6].year, weekDays[6].month, weekDays[6].day);
      return {
        labels: dayLabels,
        weekRange: `${weekStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`,
        datasets: [
          {
            data: totalData.some(v => v > 0) ? totalData : totalData.map(() => 0),
            color: (opacity = 1) => `rgba(46,125,50, ${opacity})`,
            strokeWidth: 2,
          },
        ],
      };
    } else if (chartFilter === 'month') {
      // Days 1 to 30/31 for selected month and year
      const year = selectedYear;
      const month = selectedMonth;
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
      const dayLabels = days.map(day => `${day}`);
      const totalData = days.map(day => {
        // Find batches for selected month day
        const dayBatches = serverBatches.filter(b => {
          const batchDate = getBatchDate(b);
          return (
            batchDate &&
            batchDate.getFullYear() === year &&
            batchDate.getMonth() === month &&
            batchDate.getDate() === day
          );
        });
        return dayBatches.reduce((sum, b) => (sum + (b.estimatedWeight ?? 0)), 0);
      });
      return {
        labels: dayLabels,
        datasets: [
          {
            data: totalData.some(v => v > 0) ? totalData : totalData.map(() => 0),
            color: (opacity = 1) => `rgba(46,125,50, ${opacity})`,
            strokeWidth: 2,
          },
        ],
      };
    } else if (chartFilter === 'year') {
      // Months January to December
      const year = new Date().getFullYear();
      const months = Array.from({ length: 12 }, (_, i) => i); // 0=Jan, 11=Dec
      const monthLabels = months.map(m => {
        const d = new Date(year, m, 1);
        return d.toLocaleDateString(undefined, { month: 'short' });
      });
      const totalData = months.map(month => {
        const monthBatches = serverBatches.filter(b => {
          const batchDate = getBatchDate(b);
          return batchDate && batchDate.getFullYear() === year && batchDate.getMonth() === month;
        });
        return monthBatches.reduce((sum, b) => (sum + (b.estimatedWeight ?? 0)), 0);
      });
      return {
        labels: monthLabels,
        datasets: [
          {
            data: totalData.some(v => v > 0) ? totalData : totalData.map(() => 0),
            color: (opacity = 1) => `rgba(46,125,50, ${opacity})`,
            strokeWidth: 2,
          },
        ],
      };
    }
    // Default fallback
    return {
      labels: [],
      datasets: [
        {
          data: [0],
          color: (opacity = 1) => `rgba(46,125,50, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  };

  // Recompute chart data when filter changes
  const machineData = React.useMemo(() => generateChartData(), [serverBatches, chartFilter, selectedMonth, selectedYear, weekOffset]);

  // Helper to get batch date - checks all possible date fields
  const getBatchDate = (b: any): Date | null => {
    const dateStr = b.endedAt || b.endTime || b.startedAt || b.startTime || b.createdAt;
    if (!dateStr) return null;
    return new Date(dateStr);
  };

  // Generate output history from real batches (deduplicated by batch number/id)
  const outputHistoryMap = new Map<string, { date: string; weight: string }>();
  serverBatches
    .filter((b) => getBatchDate(b))
    .sort((a, b) => {
      const aTime = getBatchDate(a)?.getTime() ?? 0;
      const bTime = getBatchDate(b)?.getTime() ?? 0;
      return bTime - aTime;
    })
    .forEach((b) => {
      const key = b.batchNumber ?? b.id;
      if (!outputHistoryMap.has(key)) {
        const batchDate = getBatchDate(b);
        outputHistoryMap.set(key, {
          date: batchDate
            ? batchDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })
            : 'Unknown',
          weight: `${b.estimatedWeight ?? 0} kg`,
        });
      }
    });
  const outputHistory = Array.from(outputHistoryMap.values()).slice(0, 3);

  const totalOutput = machineBatches.reduce((sum: number, b) => sum + (b.actualWeight ?? 0), 0);

  const [historyOpen, setHistoryOpen] = useState(false);

  const historyMap = new Map<string, HistoryDetailsItem>();
  serverBatches
    .slice()
    .sort((a, b) => {
      const aTime = getBatchDate(a)?.getTime() ?? 0;
      const bTime = getBatchDate(b)?.getTime() ?? 0;
      return bTime - aTime;
    })
    .forEach((b) => {
      const key = b.batchNumber ?? b.id;
      if (historyMap.has(key)) return;

      let feedKg = b.feedOutput ?? 0;
      let compostKg = b.compostOutput ?? 0;
      if (feedKg === 0 && compostKg === 0) {
        const total = b.estimatedWeight ?? 0;
        feedKg = Math.round(total / 2);
        compostKg = total - feedKg;
      }
      const batchDate = getBatchDate(b);
      const date = batchDate
        ? batchDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })
        : 'Unknown';

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
           {/* Machine Card Header: name and filter icon */}
           <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
             <Text style={styles.machineTitle}>{machineLabel} - {serverBatches.reduce((sum, b) => sum + (b.estimatedWeight ?? 0), 0)} kg</Text>
             <View style={{ position: 'relative', zIndex: 100 }}>
               <TouchableOpacity
                 style={{ padding: 8, borderRadius: 999, backgroundColor: colors.cardBorder }}
                 onPress={() => setFilterMenuVisible(true)}
               >
                 <MoreVertical size={24} color={colors.primary} />
               </TouchableOpacity>
               {/* Filter Menu Dropdown */}
               {filterMenuVisible && (
                 <View style={{ position: 'absolute', top: 44, right: 0, backgroundColor: colors.cardWhite, borderRadius: 12, minWidth: 120, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, elevation: 8 }}>
                   <TouchableOpacity
                     style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderBottomWidth: 1, borderBottomColor: colors.cardBorder }}
                     onPress={() => { setChartFilter('week'); setFilterMenuVisible(false); }}
                   >
                     <CalendarDays size={18} color={chartFilter === 'week' ? colors.primary : colors.mutedText} />
                     <Text style={{ color: chartFilter === 'week' ? colors.primary : colors.mutedText, fontWeight: '600', fontSize: 14 }}>Week</Text>
                   </TouchableOpacity>
                   <TouchableOpacity
                     style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderBottomWidth: 1, borderBottomColor: colors.cardBorder }}
                     onPress={() => { setChartFilter('month'); setFilterMenuVisible(false); }}
                   >
                     <CalendarRange size={18} color={chartFilter === 'month' ? colors.primary : colors.mutedText} />
                     <Text style={{ color: chartFilter === 'month' ? colors.primary : colors.mutedText, fontWeight: '600', fontSize: 14 }}>Month</Text>
                   </TouchableOpacity>
                   <TouchableOpacity
                     style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12 }}
                     onPress={() => { setChartFilter('year'); setFilterMenuVisible(false); }}
                   >
                     <CalendarCheck size={18} color={chartFilter === 'year' ? colors.primary : colors.mutedText} />
                     <Text style={{ color: chartFilter === 'year' ? colors.primary : colors.mutedText, fontWeight: '600', fontSize: 14 }}>Year</Text>
                   </TouchableOpacity>
                 </View>
               )}
             </View>
           </View>
           <Text style={styles.machineSubtitle}>Total Output</Text>
          
          {/* Week selector for week filter */}
          {chartFilter === 'week' && (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, marginBottom: 4 }}>
              <TouchableOpacity onPress={() => setWeekOffset(weekOffset - 1)} style={{ padding: 8 }}>
                <ChevronLeft size={20} color={colors.primary} />
              </TouchableOpacity>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.primary }}>
                {(machineData as any).weekRange || 'This Week'}
              </Text>
              <TouchableOpacity 
                onPress={() => setWeekOffset(weekOffset + 1)} 
                style={{ padding: 8 }}
                disabled={weekOffset >= 0}
              >
                <ChevronRight size={20} color={weekOffset >= 0 ? colors.mutedText : colors.primary} />
              </TouchableOpacity>
            </View>
          )}
          
          {/* Month selector for month filter */}
          {chartFilter === 'month' && (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, marginBottom: 4 }}>
              <TouchableOpacity 
                onPress={() => {
                  if (selectedMonth === 0) {
                    setSelectedMonth(11);
                    setSelectedYear(selectedYear - 1);
                  } else {
                    setSelectedMonth(selectedMonth - 1);
                  }
                }} 
                style={{ padding: 8 }}
              >
                <ChevronLeft size={20} color={colors.primary} />
              </TouchableOpacity>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.primary }}>
                {monthNames[selectedMonth]} {selectedYear}
              </Text>
              <TouchableOpacity 
                onPress={() => {
                  if (selectedMonth === 11) {
                    setSelectedMonth(0);
                    setSelectedYear(selectedYear + 1);
                  } else {
                    setSelectedMonth(selectedMonth + 1);
                  }
                }} 
                style={{ padding: 8 }}
                disabled={selectedMonth === new Date().getMonth() && selectedYear === new Date().getFullYear()}
              >
                <ChevronRight size={20} color={selectedMonth === new Date().getMonth() && selectedYear === new Date().getFullYear() ? colors.mutedText : colors.primary} />
              </TouchableOpacity>
            </View>
          )}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 16 }}>
            <LineChart
              data={machineData}
              width={
                chartFilter === 'month'
                  ? Math.max(screenWidth + 40, machineData.labels.length * 40)
                  : screenWidth + 40
              }
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
                propsForBackgroundLines: {
                  strokeDasharray: '',
                  stroke: 'rgba(200,200,200,0.5)',
                  strokeWidth: 1,
                },
                propsForLabels: {
                  fontSize: 11,
                },
                propsForDots: {
                  r: '4',
                  strokeWidth: '2',
                  stroke: colors.primary,
                },
              }}
              yAxisSuffix=" kg"
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
                  <Text
                    key={index}
                    style={{
                      position: 'absolute',
                      top: y - 18,
                      left: x - 12,
                      fontSize: 10,
                      fontWeight: '600',
                      color: colors.primary,
                    }}
                  >
                    {indexData}
                  </Text>
                ) : null
              )}
              style={styles.chart}
            />
          </ScrollView>
          {/* Month picker modal */}
          {/* Month picker modal removed: chart always shows current month */}

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
    marginTop: 8,
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
