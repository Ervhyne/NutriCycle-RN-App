import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function MachineScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Machine Mode - Coming Next</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.creamBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 18,
    color: colors.mutedText,
  },
});
