import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import BatchSessionNavigator from '../navigation/BatchSessionNavigator';
import ScreenTitle from '../components/ScreenTitle';
import { colors } from '../theme/colors';

export default function BatchSessionScreen({ navigation, route }: any) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Dashboard')} style={styles.backBtn}>
          <ChevronLeft size={26} color={colors.primaryText} strokeWidth={2.2} />
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
  container: { flex: 1, backgroundColor: colors.creamBackground },
  header: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.creamBackground },
  backBtn: { paddingVertical: 8, paddingHorizontal: 12 },
  contentWrap: { flex: 1, backgroundColor: colors.creamBackground, paddingTop: 12 },
});