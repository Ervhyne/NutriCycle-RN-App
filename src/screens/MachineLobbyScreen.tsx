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
  Alert,
  Image,
} from 'react-native';
import { Plus, Wifi, WifiOff, Camera, MoreHorizontal } from 'lucide-react-native';
import MachineIcon from '../components/MachineIcon';
import { useMachineStore } from '../stores/machineStore';
import { Machine } from '../types';
import { colors } from '../theme/colors';
import { NAV_HEIGHT } from '../components/BottomNavigation';



export default function MachineLobbyScreen({ navigation }: any) {
  const { machines, selectMachine, removeMachine } = useMachineStore();
  const insets = useSafeAreaInsets();

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);





  const handleSelectMachine = (machine: Machine) => {
    selectMachine(machine);
    navigation.navigate('Dashboard');
  };

  const handleAddMachine = () => {
    navigation.navigate('AddMachine');
  };



  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleEditMachine = (machine: Machine) => {
    setOpenMenuId(null);
    navigation.navigate('AddMachine', { mode: 'edit', machine });
  };

  const handleDeleteMachine = (machineId: string) => {
    setOpenMenuId(null);
    Alert.alert('Delete Machine', 'Are you sure you want to delete this machine?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removeMachine(machineId) },
    ]);
  };

  const renderMachineCard = ({ item }: { item: Machine }) => {
    const isHovered = hoveredId === item.id;
    const isMenuOpen = openMenuId === item.id;

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
        {/* three-dot menu */}
        <View style={styles.moreWrapper} pointerEvents="box-none">
          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => setOpenMenuId(isMenuOpen ? null : item.id)}
            activeOpacity={0.8}
          >
            <MoreHorizontal size={20} color={colors.iconPrimary} />
          </TouchableOpacity>

          {isMenuOpen ? (
            <View style={styles.menuBox}>
              <TouchableOpacity style={styles.menuItem} onPress={() => handleEditMachine(item)}>
                <Text style={styles.menuText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => handleDeleteMachine(item.id)}>
                <Text style={[styles.menuText, { color: colors.danger }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>

        {/* Machine Avatar */}
        <View style={styles.machineAvatar}>
          <Image source={require('../../assets/Machine Asset.png')} style={styles.machineImage} resizeMode="contain" />
        </View>

        {/* Machine Info */}
        <View style={styles.machineInfo}>
          <Text style={styles.machineName}>{item.name}</Text>
          <Text style={styles.machineId}><Text style={styles.machineIdLabel}>ID: </Text><Text style={styles.machineIdValue}>{item.machineId}</Text></Text>

          {/* footer row */}
          <View style={styles.cardFooter}>
            <View style={[styles.statusPill, item.isOnline ? styles.statusOnline : styles.statusOffline]}>
              {item.isOnline ? (
                <>
                  <Wifi size={14} color={colors.success} />
                  <Text style={[styles.statusPillText, { marginLeft: 6 }]}>Online</Text>
                </>
              ) : (
                <>
                  <WifiOff size={14} color={colors.offline} />
                  <Text style={[styles.statusPillText, { marginLeft: 6 }]}>Offline</Text>
                </>
              )}
            </View>

            {/* Camera indicator stays optional */}
            {item.streamUrl ? (
              <View style={styles.cameraPill}>
                <Camera size={12} color={colors.primary} />
                <Text style={[styles.statusPillText, { color: colors.primary, marginLeft: 6 }]}>Camera</Text>
              </View>
            ) : null}
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom }]}> 
      <StatusBar barStyle="dark-content" backgroundColor={colors.creamBackground} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Machines</Text>
        <Text style={styles.subtitle}>Select a machine to continue</Text>
      </View>

      {/* Machines List */}
      {machines.length === 0 ? (
        <View style={styles.emptyState}>
          <Image source={require('../../assets/Machine Asset.png')} style={styles.emptyImage} resizeMode="contain" />
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


    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.creamBackground,
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
    backgroundColor: colors.cardSurface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2.5,
    borderColor: colors.cardBorder,
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
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  machineAvatar: {
    width: 95,
    height: 80,
    borderRadius: 15,
    backgroundColor: '#E7E6B9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 5,
    borderColor: colors.cardBorder,
  },
  machineImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  machineInfo: {
    flex: 1,
  },
  machineName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.contentText,
    marginBottom: 6,
  },
  machineId: {
    fontSize: 14,
    color: colors.mutedText,
  },
  machineIdLabel: {
    color: colors.mutedText,
    fontSize: 14,
  },
  machineIdValue: {
    color: colors.contentText,
    fontSize: 14,
    fontWeight: '700',
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  moreWrapper: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 4,
    alignItems: 'flex-end',
  },
  moreButton: {
    padding: 6,
    borderRadius: 8,
  },
  menuBox: {
    marginTop: 8,
    backgroundColor: colors.cardSurface,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  menuItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  menuText: {
    fontSize: 14,
    color: colors.primaryText,
    fontWeight: '600',
  },
  cardFooter: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusPill: {
    backgroundColor: colors.statusBackground,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  statusOnline: {
    // kept for future fine-grained overrides (no bg override)
  },
  statusOffline: {
    // kept for future fine-grained overrides (no bg override)
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.contentText,
  },
  cameraPill: {
    backgroundColor: colors.cardSurface,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: colors.mutedText,
    textAlign: 'center',
  },
  emptyImage: {
    width: 120,
    height: 120,
    marginBottom: 12,
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
