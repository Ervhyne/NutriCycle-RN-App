import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import BatchSessionNavigator from '../navigation/BatchSessionNavigator';
import { colors } from '../theme/colors';

export default function BatchSessionScreen({ navigation, route }: any) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Dashboard')} style={styles.backBtn}>
          <Text style={styles.backText}>◀ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Batch Session</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.contentWrap}>
        <BatchSessionNavigator />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cardWhite },
  header: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, backgroundColor: colors.cardWhite, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { paddingVertical: 8, paddingHorizontal: 12 },
  backText: { color: colors.primary, fontWeight: '700' },
  title: { fontSize: 16, fontWeight: '700', color: colors.primary },
  contentWrap: { flex: 1, backgroundColor: colors.creamBackground, paddingTop: 12 },
});