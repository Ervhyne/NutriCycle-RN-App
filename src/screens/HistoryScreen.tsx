import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  Platform,
  Modal,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { Calendar, Clock } from 'lucide-react-native';
import { colors } from '../theme/colors';
import ScreenTitle from '../components/ScreenTitle';
import { RootStackParamList } from '../navigation/types';
import { NAV_HEIGHT } from '../components/BottomNavigation';
import { fetchWithAuth } from '../config/api';

type HistoryScreenNavigationProp = NavigationProp<RootStackParamList, 'Dashboard'>;

interface BatchRecord {
  id: string;
  machineName: string;
  batchNumber: string;
  date: string;
  outputDate: string;
  status: string;
  estimatedWeight?: number;
  actualWeight?: number;
}

export const HistoryScreen = () => {
  const navigation = useNavigation<HistoryScreenNavigationProp>();
  const [selectedFilter, setSelectedFilter] = useState('All Time');
  const [batchHistory, setBatchHistory] = useState<BatchRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Fetch batches when screen loads and when it comes into focus
  useEffect(() => {
    fetchBatches();
  }, []);

  // Refetch when screen comes into focus (e.g., after creating a batch)
  useFocusEffect(
    useCallback(() => {
      fetchBatches();
    }, [])
  );

  const fetchBatches = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);
      
      const response = await fetchWithAuth('/batches', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch batch history');
      }

      const batches = await response.json();
      
      // Map API response to BatchRecord format
      // Use a Set to track unique IDs and prevent duplicates
      const uniqueBatches = new Map<string, BatchRecord>();
      
      batches.forEach((batch: any) => {
        // Only add if not already in map (prevents duplicates)
        if (!uniqueBatches.has(batch.id)) {
          uniqueBatches.set(batch.id, {
            id: batch.id,
            machineName: batch.machine?.name || batch.machine?.machineId || 'Unknown',
            batchNumber: batch.batchNumber,
            date: batch.startedAt 
              ? new Date(batch.startedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : new Date(batch.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                }),
            outputDate: batch.endedAt 
              ? new Date(batch.endedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : '-',
            status: batch.status,
            estimatedWeight: batch.estimatedWeight,
            actualWeight: batch.actualWeight,
          });
        }
      });
      
      // Convert Map to Array
      setBatchHistory(Array.from(uniqueBatches.values()));
    } catch (err) {
      console.error('Error fetching batches:', err);
      setError('Failed to load batch history');
    } finally {
      if (isRefresh) {
        setIsRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  };

  const handleRefresh = () => {
    fetchBatches(true);
  };

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  const handleOpenPicker = () => {
    setShowPicker(true);
  };

  const handleDateChange = (_event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }

    if (date) {
      setSelectedDate(date);
      setSelectedFilter(formatDate(date));
    }
  };

  const closePicker = () => setShowPicker(false);
  const insets = useSafeAreaInsets();


  const renderBatchItem = ({ item }: { item: BatchRecord }) => (
    <View style={styles.batchItem}>
      <View style={styles.batchHeader}>
        <View style={styles.batchHeaderLeft}>
          <Text style={styles.machineName}>{item.machineName}</Text>
          <Text style={styles.batchNumber}>{item.batchNumber}</Text>
        </View>
        <View style={[styles.statusPill, { 
          backgroundColor: item.status === 'completed' ? '#E8F5E9' : 
                          item.status === 'running' ? '#E3F2FD' : 
                          item.status === 'queued' ? '#FFF3E0' :
                          '#F5F5F5'
        }]}>
          <Text style={[styles.statusPillText, { 
            color: item.status === 'completed' ? colors.success : 
                   item.status === 'running' ? colors.primary : 
                   item.status === 'queued' ? '#F57C00' :
                   colors.mutedText 
          }]}>
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.batchBody}>
        <View style={styles.batchInfoGrid}>
          <View style={styles.batchInfoItem}>
            <Text style={styles.infoLabel}>DATE</Text>
            <Text style={styles.infoValue}>{item.date}</Text>
          </View>
          <View style={styles.batchInfoItem}>
            <Text style={styles.infoLabel}>OUTPUT DATE</Text>
            <Text style={styles.infoValue}>{item.outputDate}</Text>
          </View>
        </View>

        <View style={styles.batchInfoGrid}>
          <View style={styles.batchInfoItem}>
            <Text style={styles.infoLabel}>STATUS</Text>
            <Text style={[styles.infoValue, { 
              color: item.status === 'completed' ? colors.success : 
                     item.status === 'running' ? colors.primary : 
                     item.status === 'queued' ? '#F57C00' :
                     colors.mutedText
            }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
          <View style={styles.batchInfoItem}>
            <Text style={styles.infoLabel}>WEIGHT</Text>
            <Text style={styles.infoValue}>
              {item.actualWeight ? `${item.actualWeight}kg` : `~${item.estimatedWeight || 0}kg`}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <ScreenTitle>Batch History</ScreenTitle>
      </View>

      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingTop: 0, paddingBottom: NAV_HEIGHT + 24 + insets.bottom }]} 
        showsVerticalScrollIndicator={false} 
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl 
            refreshing={isRefreshing} 
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Filter Section */}
        <View style={styles.filterContainer}>
          <TouchableOpacity style={styles.filterButton} onPress={handleOpenPicker}>
            <Text style={styles.filterText}>{selectedDate ? selectedFilter : 'All Time'}</Text>
            <Calendar size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Batch History List or Empty State */}
        {isLoading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.emptyText}>Loading batches...</Text>
          </View>
        ) : error ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>{error}</Text>
            <TouchableOpacity 
                style={[styles.filterButton, { marginTop: 16 }]} 
                onPress={() => fetchBatches()}
              >
                <Text style={styles.filterText}>Retry</Text>
              </TouchableOpacity>
          </View>
        ) : batchHistory.length === 0 ? (
          <View style={styles.emptyState}>
            <Clock size={64} color={colors.mutedText} strokeWidth={1} />
            <Text style={styles.emptyText}>No batch history yet</Text>
          </View>
        ) : (
          <FlatList
            data={batchHistory}
            renderItem={renderBatchItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.listContent}
          />
        )}
      </ScrollView>

      {showPicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={selectedDate || new Date()}
          mode="date"
          display="calendar"
          onChange={handleDateChange}
          maximumDate={new Date()}
            textColor={colors.primaryText}
              style={styles.picker}
        />
      )}

      {showPicker && Platform.OS === 'ios' && (
        <Modal transparent animationType="fade" visible={showPicker} onRequestClose={closePicker}>
          <View style={styles.pickerOverlay}>
            <View style={styles.pickerCard}>
              <DateTimePicker
                value={selectedDate || new Date()}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                maximumDate={new Date()}
                textColor={colors.primary}
                style={styles.picker}
              />
              <TouchableOpacity style={styles.pickerDoneButton} onPress={closePicker}>
                <Text style={styles.pickerDoneText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}


    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.creamBackground,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: NAV_HEIGHT + 24,
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardWhite,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: Platform.OS === 'ios' ? 0.08 : 0.1,
    shadowRadius: 6,
    elevation: Platform.OS === 'android' ? 3 : 0,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryText,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  batchItem: {
    backgroundColor: colors.cardWhite,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: Platform.OS === 'ios' ? 0.08 : 0.1,
    shadowRadius: 6,
    elevation: Platform.OS === 'android' ? 3 : 0,
  },
  batchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  batchHeaderLeft: {
    flex: 1,
  },
  machineName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryText,
    marginBottom: 4,
  },
  batchNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  batchBody: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  batchInfoGrid: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  batchInfoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.mutedText,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryText,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: colors.mutedText,
    marginTop: 16,
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerCard: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  picker: {
    width: '100%',
  },
  pickerDoneButton: {
    marginTop: 12,
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  pickerDoneText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
