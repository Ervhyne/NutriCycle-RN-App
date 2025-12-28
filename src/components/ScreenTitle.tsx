import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { colors } from '../theme/colors';

type Props = {
  children: React.ReactNode;
  style?: TextStyle | TextStyle[];
};

export default function ScreenTitle({ children, style }: Props) {
  return <Text style={[styles.title, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 6,
    marginBottom: 8,
  },
});
