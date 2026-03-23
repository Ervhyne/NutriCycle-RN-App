import React from 'react';
import { Modal, View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { colors } from '../theme/colors';

export type HistoryDetailsItem = {
  date: string;
  batch: string;
  feedKg: number;
  compostKg: number;
};

type Props = {
  visible: boolean;
  data: HistoryDetailsItem[];
  onClose: () => void;
};

export default function HistoryDetailsModal({ visible, data, onClose }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView
        edges={['top', 'left', 'right']}
        style={[
          styles.modalContainer,
          { paddingBottom: insets.bottom, paddingTop: Math.max(insets.top, 12) },
        ]}
      >
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.backButton} activeOpacity={0.85}>
            <ChevronLeft size={28} color={colors.primaryText} strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>History Details</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.modalContent}
        >
          {data.map((item, index) => (
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
  );
}

const styles = StyleSheet.create({
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
