import React from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { colors } from '../theme/colors';
import { LineChart, BarChart } from 'react-native-chart-kit';
import ScreenTitle from '../components/ScreenTitle';

const screenWidth = Dimensions.get('window').width - 32;

export default function ReportsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

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
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 0, paddingBottom: 80 + insets.bottom }}>
        <View style={styles.header}>
          <ScreenTitle style={{ textAlign: 'center' }}>Reports</ScreenTitle>
        </View>

        <Text style={styles.sectionTitle}>Weekly Throughput</Text>
        <LineChart
          data={sampleLineData}
          width={screenWidth}
          height={220}
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
          height={180}
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={{
            backgroundGradientFrom: colors.cardWhite,
            backgroundGradientTo: colors.cardWhite,
            color: (opacity = 1) => `rgba(46,125,50, ${opacity})`,
          }}
          style={styles.chart}
        />

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.creamBackground },
  header: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: colors.primary, marginLeft: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.primaryText, marginTop: 8, marginLeft: 8 },
  chart: { borderRadius: 12, marginTop: 8, backgroundColor: colors.cardWhite, padding: 8 },
});
