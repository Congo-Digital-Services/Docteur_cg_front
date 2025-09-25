import React from 'react';
import { View, StyleSheet } from 'react-native';
import colors from '../theme/colors';
import { radius } from '../theme/radius';
import { spacing } from '../theme/spacing';

export default function Card({ children, style }) {
  return <View style={[s.card, style]}>{children}</View>;
}
const s = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border
  }
});
