import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import colors from '../theme/colors';
import { radius } from '../theme/radius';
import { spacing } from '../theme/spacing';

export default function Badge({ label, tone = 'primary' }) {
  const bg = tone === 'danger' ? colors.danger : colors.primary;
  return (
    <View style={[s.root, { backgroundColor: bg }]}>
      <Text style={s.text}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  root: { paddingHorizontal: spacing.sm, height: 26, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  text: { color: 'white', fontWeight: '600' }
});
