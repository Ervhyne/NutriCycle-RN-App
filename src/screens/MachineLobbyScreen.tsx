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
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Plus, Wifi, WifiOff, Camera, MoreHorizontal, XCircle } from 'lucide-react-native';
import MachineIcon from '../components/MachineIcon';
import ScreenTitle from '../components/ScreenTitle';
import { useMachineStore } from '../stores/machineStore';
import { Machine } from '../types';
import { colors } from '../theme/colors';
import { NAV_HEIGHT } from '../components/BottomNavigation';
import { auth } from '../config/firebase';
import { fetchWithAuth, getApiBaseUrl } from '../config/api';



export default function MachineLobbyScreen({ navigation }: any) {
  const { machines, selectMachine, removeMachine, updateMachine, batches, setMachines, clearMachine } = useMachineStore();
  const insets = useSafeAreaInsets();

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [machineToDelete, setMachineToDelete] = useState<string | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [machineToEdit, setMachineToEdit] = useState<Machine | null>(null);
  const [editedName, setEditedName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMachinesFromFirestore();
  }, []);

  const fetchMachinesFromFirestore = async () => {
    setLoading(true);
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        console.log('No user logged in');
        setLoading(false);
        return;
      }

      // Read API base URL via helper (Settings or env)
      const apiUrl = await getApiBaseUrl();
      if (!apiUrl) {
        Alert.alert('Error', 'No API URL configured. Please set it in Settings.');
        setLoading(false);
        return;
      }

      console.log('Fetching machines from API:', apiUrl);

      // Fetch machines from the API server using the helper
      const endpoint = `/machines?userId=${userId}`;
      const response = await fetchWithAuth(endpoint, { method: 'GET' });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Fetch failed', {
          status: response.status,
          endpoint,
          errorText,
        });
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const machinesData = data.machines || data || [];

      // Replace machines with the latest list from API to avoid stale entries between accounts
      clearMachine();
      setMachines(machinesData);

      console.log(`Loaded ${machinesData.length} machines from API`);
    } catch (error) {
      console.error('Error fetching machines from API:', error);
      Alert.alert('Error', 'Failed to load machines from server. Please check your API URL in Settings.');
    } finally {
      setLoading(false);
    }
  };





  const handleSelectMachine = (machine: Machine) => {
    selectMachine(machine);
    navigation.navigate('Dashboard');
  };

  const handleAddMachine = () => {
    navigation.navigate('AddMachine');
  };

  const handleRefresh = () => {
    fetchMachinesFromFirestore();
  };



  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleEditMachine = (machine: Machine) => {
    setOpenMenuId(null);
    setMachineToEdit(machine);
    setEditedName(machine.name);
    setEditModalVisible(true);
  };

  const handleDeleteMachine = (machineId: string) => {
    setOpenMenuId(null);
    setMachineToDelete(machineId);
    setDeleteModalVisible(true);
  };

  const confirmDelete = () => {
    if (machineToDelete) {
      removeMachine(machineToDelete);
    }
    setDeleteModalVisible(false);
    setMachineToDelete(null);
  };

  const cancelDelete = () => {
    setDeleteModalVisible(false);
    setMachineToDelete(null);
  };

  const confirmEditName = () => {
    if (machineToEdit && editedName.trim()) {
      updateMachine(machineToEdit.id, { name: editedName.trim() });
      setEditModalVisible(false);
      setMachineToEdit(null);
      setEditedName('');
    }
  };

  const cancelEdit = () => {
    setEditModalVisible(false);
    setMachineToEdit(null);
    setEditedName('');
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

            {/* Activity badge (Idle / Running) */}
            {item.isOnline && (() => {
              const running = batches.some((b) => b.machineId === item.id && b.status === 'running');
              return (
                <View style={[styles.activityPill, running ? styles.activityRunning : styles.activityIdle, { marginLeft: 'auto' }]}>
                  <Text style={[styles.activityText, running ? { color: colors.cardWhite } : { color: colors.primary }]}>{running ? 'Running' : 'Idle'}</Text>
                </View>
              );
            })()}
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
        <ScreenTitle>Machines</ScreenTitle>
        <Text style={styles.subtitle}>Select a machine to continue</Text>
      </View>

      {/* Machines List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading machines...</Text>
        </View>
      ) : machines.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <XCircle size={56} color={colors.mutedText} />
          </View>
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
          onRefresh={handleRefresh}
          refreshing={loading}
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

      {deleteModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Delete Machine</Text>
            <Text style={styles.modalSubtitle}>Are you sure you want to delete this machine?</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalSecondaryButton} onPress={cancelDelete}>
                <Text style={styles.modalSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalPrimaryButton} onPress={confirmDelete}>
                <Text style={styles.modalPrimaryText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {editModalVisible && machineToEdit && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Machine Name</Text>
            <TextInput
              style={styles.editInput}
              placeholder="Machine name"
              placeholderTextColor={colors.mutedText}
              value={editedName}
              onChangeText={setEditedName}
              maxLength={50}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalSecondaryButton} onPress={cancelEdit}>
                <Text style={styles.modalSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalPrimaryButton} onPress={confirmEditName}>
                <Text style={styles.modalPrimaryText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}


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
  activityPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  activityRunning: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  activityIdle: {
    backgroundColor: colors.softGreenSurface,
    borderColor: colors.cardBorder,
  },
  activityText: {
    fontSize: 12,
    fontWeight: '700',
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
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.cardSurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
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
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#00000044',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '90%',
    backgroundColor: colors.creamBackground,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primaryText,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.mutedText,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  modalSecondaryButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.cardWhite,
  },
  modalSecondaryText: {
    color: colors.primaryText,
    fontSize: 15,
    fontWeight: '700',
  },
  modalPrimaryButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  modalPrimaryText: {
    color: colors.cardWhite,
    fontSize: 15,
    fontWeight: '700',
  },
  editInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.primaryText,
    backgroundColor: colors.cardWhite,
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 16,
    color: colors.mutedText,
    marginTop: 16,
  },
});
