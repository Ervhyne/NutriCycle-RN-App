import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import MachineScreen from './MachineScreen';
import ScreenTitle from '../components/ScreenTitle';
import { colors } from '../theme/colors';
import { useMachineStore } from '../stores/machineStore';
import { fetchWithAuth } from '../config/api';

interface ServerBatch {
  id: string;
  batchNumber?: string;
  machineId: string;
  status: string;
  estimatedWeight?: number;
  actualWeight?: number;
  startedAt?: string | null;
  endedAt?: string | null;
}

export default function BatchSessionScreen({ navigation, route }: any) {
  const { batches, addBatch, setCurrentBatch } = useMachineStore();
  const batchId = route?.params?.batchId as string | undefined;

  React.useEffect(() => {
    if (!batchId) return;

    const existing = batches.find((b) => b.id === batchId || b.batchNumber === batchId);
    if (existing) {
      setCurrentBatch(existing);
      return;
    }

    const fetchBatch = async () => {
      try {
        const res = await fetchWithAuth(`/batches/${batchId}`);
        const data: ServerBatch = await res.json();

        const resolvedId = data.id;
        const resolvedBatchNumber = data.batchNumber ?? undefined;
        const existingByNumber = resolvedBatchNumber
          ? batches.find((b) => b.batchNumber === resolvedBatchNumber)
          : undefined;
        if (existingByNumber) {
          setCurrentBatch(existingByNumber);
          return;
        }

        const localBatch = {
          id: resolvedId,
          batchNumber: resolvedBatchNumber,
          machineId: data.machineId,
          type: 'mixed' as const,
          status: (data.status as any) ?? 'queued',
          currentStep: 0 as const,
          estimatedWeight: data.estimatedWeight,
          actualWeight: data.actualWeight,
          startTime: data.startedAt ? new Date(data.startedAt) : undefined,
          endTime: data.endedAt ? new Date(data.endedAt) : undefined,
        };

        addBatch(localBatch);
        setCurrentBatch(localBatch);
      } catch (error) {
        console.error('[BatchSession] Failed to load batch:', error);
      }
    };

    fetchBatch();
  }, [batchId, batches, addBatch, setCurrentBatch]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Dashboard')} style={styles.backBtn}>
          <ChevronLeft size={26} color={colors.primaryText} strokeWidth={2.2} />
        </TouchableOpacity>
        <ScreenTitle style={{ marginLeft: 0 }}>Batch Session</ScreenTitle>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.contentWrap}>
        <MachineScreen navigation={navigation} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.creamBackground },
  header: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.creamBackground },
  backBtn: { paddingVertical: 8, paddingHorizontal: 12 },
  contentWrap: { flex: 1, backgroundColor: colors.creamBackground, paddingTop: 12 },
});