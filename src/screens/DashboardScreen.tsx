import React from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import { Plus } from 'lucide-react-native';
import { colors } from '../theme/colors';
import ScreenTitle from '../components/ScreenTitle';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { useMachineStore } from '../stores/machineStore';

const screenWidth = Dimensions.get('window').width - 32;

export default function DashboardScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { batches, setCurrentBatch } = useMachineStore();

  const sampleLineData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{ data: [12, 18, 15, 20, 24, 30, 28] }],
  };

  const sampleBarData = {
    labels: ['Feed', 'Compost'],
    datasets: [{ data: [120, 80] }],
  };

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 80 + insets.bottom, flexGrow: 1 }}>
        <View style={styles.headerRow}>
          <ScreenTitle>Dashboard</ScreenTitle>
          <TouchableOpacity style={styles.headerButton} onPress={() => navigation.navigate('Machines')}>
            <Text style={styles.headerButtonText}>Machines</Text>
          </TouchableOpacity>
        </View> 

        <Text style={styles.sectionTitle}>Weekly Throughput</Text>
        <LineChart
          data={sampleLineData}
          width={screenWidth}
          height={260}
          chartConfig={{
            backgroundGradientFrom: colors.cardWhite,
            backgroundGradientTo: colors.cardWhite,
            color: (opacity = 1) => `rgba(31,95,42, ${opacity})`,
            decimalPlaces: 0,
          }}
          style={styles.chart}
        />

        <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Output Comparison</Text>
        <BarChart
          data={sampleBarData}
          width={screenWidth}
          height={200}
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={{
            backgroundGradientFrom: colors.cardWhite,
            backgroundGradientTo: colors.cardWhite,
            color: (opacity = 1) => `rgba(46,125,50, ${opacity})`,
          }}
          style={styles.chart}
        />

        <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Activity</Text>
        {batches.length === 0 ? (
          <Text style={styles.text}>No batch activity yet.</Text>
        ) : (
          batches.slice().reverse().map((b) => (
            <View key={b.id} style={styles.batchItem}>
              <Text style={styles.batchText}>{b.id} • {b.type} • {b.status}</Text>
              <View style={{ marginTop: 8, flexDirection: 'row', justifyContent: 'flex-end' }}>
                <TouchableOpacity style={{ paddingVertical: 6, paddingHorizontal: 10, backgroundColor: colors.softGreenSurface, borderRadius: 8 }} onPress={() => { setCurrentBatch(b); navigation.navigate('BatchSession', { batchId: b.id }); }}>
                  <Text style={{ color: colors.primary, fontWeight: '700' }}>View</Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.creamBackground },
  title: { fontSize: 24, fontWeight: '700', color: colors.primary, marginLeft: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.primaryText, marginTop: 8, marginLeft: 8 },
  chart: { borderRadius: 12, marginTop: 8, backgroundColor: colors.cardWhite, padding: 8 },
  text: { color: colors.mutedText },
  batchItem: { backgroundColor: colors.cardWhite, padding: 10, borderRadius: 8, marginTop: 8 },
  batchText: { color: colors.primaryText, fontWeight: '600' },
  fab: { position: 'absolute', width: 56, height: 56, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  fabTextLarge: { color: colors.cardWhite, fontSize: 28, lineHeight: 30 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerButton: { backgroundColor: colors.cardWhite, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: colors.border },
  headerButtonText: { color: colors.primary, fontWeight: '700' },
});
