import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  FlatList,
  Platform,
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Calendar, Clock } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { RootStackParamList } from '../navigation/types';
import BottomNavigation, { NAV_HEIGHT } from '../components/BottomNavigation';

type HistoryScreenNavigationProp = NavigationProp<RootStackParamList, 'Dashboard'>;

interface BatchRecord {
  id: string;
  machineName: string;
  batchNumber: string;
  date: string;
  outputDate: string;
}

export const HistoryScreen = () => {
  const navigation = useNavigation<HistoryScreenNavigationProp>();
  const [selectedFilter, setSelectedFilter] = useState('All Time');
  const [batchHistory] = useState<BatchRecord[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

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

  const handleTabPress = (tabKey: string) => {
    if (tabKey === 'Machines') {
      navigation.navigate('Lobby');
    } else if (tabKey === 'Reports') {
      navigation.navigate('Dashboard');
    } else if (tabKey === 'Settings') {
      navigation.navigate('Settings');
    }
    // History tab is current tab, do nothing
  };

  const renderBatchItem = ({ item }: { item: BatchRecord }) => (
    <View style={styles.batchItem}>
      <View style={styles.batchRow}>
        <View style={styles.batchColumn}>
          <Text style={styles.columnLabel}>Machine Name</Text>
          <Text style={styles.columnValue}>{item.machineName}</Text>
        </View>
        <View style={styles.batchColumn}>
          <Text style={styles.columnLabel}>Batch Number</Text>
          <Text style={styles.columnValue}>{item.batchNumber}</Text>
        </View>
      </View>
      <View style={styles.batchRow}>
        <View style={styles.batchColumn}>
          <Text style={styles.columnLabel}>Date</Text>
          <Text style={styles.columnValue}>{item.date}</Text>
        </View>
        <View style={styles.batchColumn}>
          <Text style={styles.columnLabel}>Output Date</Text>
          <Text style={styles.columnValue}>{item.outputDate}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Batch History</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Filter Section */}
        <View style={styles.filterContainer}>
          <TouchableOpacity style={styles.filterButton} onPress={handleOpenPicker}>
            <Text style={styles.filterText}>{selectedDate ? selectedFilter : 'All Time'}</Text>
            <Calendar size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Column Headers */}
        {batchHistory.length > 0 && (
          <View style={styles.columnHeaders}>
            <View style={styles.headerColumn}>
              <Text style={styles.headerText}>Machine Name</Text>
            </View>
            <View style={styles.headerColumn}>
              <Text style={styles.headerText}>Batch Number</Text>
            </View>
            <View style={styles.headerColumn}>
              <Text style={styles.headerText}>Date</Text>
            </View>
            <View style={styles.headerColumn}>
              <Text style={styles.headerText}>Output Date</Text>
            </View>
          </View>
        )}

        {/* Batch History List or Empty State */}
        {batchHistory.length === 0 ? (
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

      <BottomNavigation onTabPress={handleTabPress} selectedTab="History" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.creamBackground,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: Platform.OS === 'android' ? 1 : 0,
    borderBottomColor: '#E5E5E5',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primaryText,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: NAV_HEIGHT + 24,
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
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
  columnHeaders: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
    backgroundColor: colors.creamBackground,
  },
  headerColumn: {
    flex: 1,
    marginRight: 8,
  },
  headerText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.mutedText,
    textTransform: 'uppercase',
  },
  listContent: {
    paddingHorizontal: 16,
  },
  batchItem: {
    backgroundColor: colors.cardWhite,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: Platform.OS === 'ios' ? 0.08 : 0.1,
    shadowRadius: 6,
    elevation: Platform.OS === 'android' ? 3 : 0,
  },
  batchRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  batchColumn: {
    flex: 1,
    marginRight: 8,
  },
  columnLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.mutedText,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  columnValue: {
    fontSize: 14,
    fontWeight: '500',
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
