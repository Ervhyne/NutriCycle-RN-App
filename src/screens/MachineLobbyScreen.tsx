import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Animated,
  Platform,
} from 'react-native';
import { Plus, Server, Wifi, WifiOff, Camera, BarChart, Clock, Settings } from 'lucide-react-native';
import { useMachineStore } from '../stores/machineStore';
import { Machine } from '../types';
import { colors } from '../theme/colors';

const NAV_HEIGHT = 72; // visual height of the nav (without safe area)

export default function MachineLobbyScreen({ navigation }: any) {
  const { machines, selectMachine } = useMachineStore();
  const insets = useSafeAreaInsets();

  const [selected, setSelected] = useState<string>('Machines');

  const TABS = [
    { key: 'Machines', label: 'Machines', Icon: Server },
    { key: 'Reports', label: 'Reports', Icon: BarChart },
    { key: 'History', label: 'History', Icon: Clock },
    { key: 'Settings', label: 'Settings', Icon: Settings },
  ];

  // Animated values for icon scale
  const iconScales = useRef<Record<string, Animated.Value>>(
    TABS.reduce<Record<string, Animated.Value>>((acc, t) => {
      acc[t.key] = new Animated.Value(t.key === selected ? 1.15 : 1);
      return acc;
    }, {})
  ).current;

  // Entrance animation for the nav
  const barTranslateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.timing(barTranslateY, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [barTranslateY]);

  const handleSelectMachine = (machine: Machine) => {
    selectMachine(machine);
    navigation.navigate('Dashboard');
  };

  const handleAddMachine = () => {
    navigation.navigate('AddMachine');
  };

  const onPressTab = (tabKey: string) => {
    if (tabKey === selected) return;

    // animate icon scales
    Animated.parallel([
      Animated.spring(iconScales[tabKey], { toValue: 1.15, useNativeDriver: true }),
      Animated.spring(iconScales[selected], { toValue: 1, useNativeDriver: true }),
    ]).start();

    setSelected(tabKey);

    // Navigate to screen matching the tab key if available
    try {
      navigation.navigate(tabKey);
    } catch (e) {
      // Fallback: navigate to root or do nothing
      console.warn(`Navigation target '${tabKey}' may not exist.`);
    }
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
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom }]}> 
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

      {/* Bottom Navigation - safe area aware */}
      <View style={[styles.bottomNavWrapper, { paddingBottom: insets.bottom }]}> 
        <Animated.View style={[styles.bottomNav, { transform: [{ translateY: barTranslateY }] }]}> 
          {TABS.map((tab) => {
            const isActive = selected === tab.key;
            const scale = iconScales[tab.key] || new Animated.Value(1);
            const Icon = tab.Icon as any;

            return (
              <TouchableOpacity
                key={tab.key}
                style={styles.tabButton}
                onPress={() => onPressTab(tab.key)}
                activeOpacity={0.85}
              >
                <Animated.View style={{ transform: [{ scale }] }}>
                  <Icon size={22} color={isActive ? colors.navActive : colors.navInactive} />
                </Animated.View>
                <Text style={[styles.tabLabel, { color: isActive ? '#000' : colors.navInactive }]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </Animated.View>
      </View>
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
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  bottomNavWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  bottomNav: {
    width: '100%',
    marginHorizontal: 0,
    height: NAV_HEIGHT,
    borderRadius: 0,
    backgroundColor: colors.cardWhite,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    // shadow on top border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
    borderTopWidth: 1,
    borderTopColor: '#00000010',
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
