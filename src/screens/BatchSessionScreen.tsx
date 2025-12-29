import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import BatchSessionNavigator from '../navigation/BatchSessionNavigator';
import ScreenTitle from '../components/ScreenTitle';
import { colors } from '../theme/colors';

export default function BatchSessionScreen({ navigation, route }: any) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Dashboard')} style={styles.backBtn}>
          <Text style={styles.backText}>◀ Back</Text>
        </TouchableOpacity>
        <ScreenTitle style={{ marginLeft: 0 }}>Batch Session</ScreenTitle>
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
  header: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.cardWhite },
  backBtn: { paddingVertical: 8, paddingHorizontal: 12 },
  backText: { color: colors.primary, fontWeight: '700' },
  contentWrap: { flex: 1, backgroundColor: colors.creamBackground, paddingTop: 12 },
});