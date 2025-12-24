import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { PlusCircle, Server, Wifi, WifiOff } from 'lucide-react-native';
import { useMachineStore } from '../stores/machineStore';
import { Machine } from '../types';
import { colors } from '../theme/colors';

export default function MachineLobbyScreen({ navigation }: any) {
  const { machines, selectMachine } = useMachineStore();

  const handleSelectMachine = (machine: Machine) => {
    selectMachine(machine);
    navigation.navigate('Main');
  };

  const handleAddMachine = () => {
    navigation.navigate('AddMachine');
  };

  const renderMachineCard = ({ item }: { item: Machine }) => (
    <TouchableOpacity
      style={styles.machineCard}
      onPress={() => handleSelectMachine(item)}
      activeOpacity={0.7}
    >
      {/* Machine Avatar */}
      <View style={styles.machineAvatar}>
        <Server size={32} color={colors.primary} />
      </View>

      {/* Machine Info */}
      <View style={styles.machineInfo}>
        <Text style={styles.machineName}>{item.name}</Text>
        <Text style={styles.machineId}>{item.machineId}</Text>
      </View>

      {/* Status Indicator */}
      <View style={styles.statusContainer}>
        {item.isOnline ? (
          <>
            <Wifi size={20} color={colors.online} />
            <Text style={[styles.statusText, { color: colors.online }]}>
              Online
            </Text>
          </>
        ) : (
          <>
            <WifiOff size={20} color={colors.offline} />
            <Text style={[styles.statusText, { color: colors.offline }]}>
              Offline
            </Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.creamBackground} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>NutriCycle</Text>
        <Text style={styles.subtitle}>Select a machine to continue</Text>
      </View>

      {/* Machines List */}
      {machines.length === 0 ? (
        <View style={styles.emptyState}>
          <Server size={64} color={colors.mutedText} />
          <Text style={styles.emptyTitle}>No Machines</Text>
          <Text style={styles.emptyText}>
            Add your first NutriCycle machine to get started
          </Text>
        </View>
      ) : (
        <FlatList
          data={machines}
          renderItem={renderMachineCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Add Machine FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleAddMachine}
        activeOpacity={0.8}
      >
        <PlusCircle size={24} color={colors.cardWhite} />
        <Text style={styles.fabText}>Add Machine</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.creamBackground,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.mutedText,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  machineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardWhite,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  machineAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.softGreenSurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  machineInfo: {
    flex: 1,
  },
  machineName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primaryText,
    marginBottom: 4,
  },
  machineId: {
    fontSize: 14,
    color: colors.mutedText,
    fontFamily: 'monospace',
  },
  statusContainer: {
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.primaryText,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: colors.mutedText,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    gap: 8,
  },
  fabText: {
    color: colors.cardWhite,
    fontSize: 16,
    fontWeight: '600',
  },
});
