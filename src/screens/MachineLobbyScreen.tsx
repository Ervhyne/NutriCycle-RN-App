import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Pressable,
  StatusBar,
  Platform,
} from 'react-native';
import { Plus, Server, Wifi, WifiOff, Camera } from 'lucide-react-native';
import { useMachineStore } from '../stores/machineStore';
import { Machine } from '../types';
import { colors } from '../theme/colors';
import BottomNavigation, { NAV_HEIGHT } from '../components/BottomNavigation';



export default function MachineLobbyScreen({ navigation }: any) {
  const { machines, selectMachine } = useMachineStore();
  const insets = useSafeAreaInsets();





  const handleSelectMachine = (machine: Machine) => {
    selectMachine(machine);
    navigation.navigate('Dashboard');
  };

  const handleAddMachine = () => {
    navigation.navigate('AddMachine');
  };



  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const renderMachineCard = ({ item }: { item: Machine }) => {
    const isHovered = hoveredId === item.id;

    return (
      <Pressable
        onPress={() => handleSelectMachine(item)}
        onHoverIn={() => Platform.OS === 'web' && setHoveredId(item.id)}
        onHoverOut={() => Platform.OS === 'web' && setHoveredId(null)}
        style={[
          styles.machineCard,
          isHovered && styles.machineCardHover,
        ]}
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
              <Text style={[styles.statusText, { color: colors.online }]}>Online</Text>
            </>
          ) : (
            <>
              <WifiOff size={20} color={colors.offline} />
              <Text style={[styles.statusText, { color: colors.offline }]}>Offline</Text>
            </>
          )}

          {item.streamUrl ? (
            <View style={{ marginTop: 6, alignItems: 'center' }}>
              <Camera size={16} color={colors.primary} />
              <Text style={[styles.statusText, { color: colors.primary, fontSize: 10 }]}>Camera</Text>
            </View>
          ) : null}
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom }]}> 
      <StatusBar barStyle="dark-content" backgroundColor={colors.pageBackground} />
      
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
          <Text style={styles.emptyText}>Add your first NutriCycle machine to get started</Text>
        </View>
      ) : (
        <FlatList
          data={machines}
          renderItem={renderMachineCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.listContent, { paddingBottom: 24 + insets.bottom + NAV_HEIGHT }]}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Add Machine FAB (square icon button) */}
      <TouchableOpacity
        style={[styles.fabSquare, { bottom: 24 + NAV_HEIGHT + insets.bottom, right: 12 + (insets.right || 0) }]}
        onPress={handleAddMachine}
        activeOpacity={0.8}
      >
        <Plus size={20} color={colors.cardWhite} />
      </TouchableOpacity>

      {/* Bottom Navigation (separated component) */}
      <BottomNavigation onTabPress={(tabKey) => {
        try { navigation.navigate(tabKey); } catch (e) { console.warn(`Navigation target '${tabKey}' may not exist.`); }
      }} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.pageBackground,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
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
  },
  machineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  machineCardHover: {
    transform: [{ translateY: -6 }],
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
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
  fabSquare: {
    position: 'absolute',
    right: 12,
    width: 56,
    height: 56,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
});
