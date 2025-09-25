import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { spacing } from '../theme/spacing';
import colors from '../theme/colors';

export default function EmptyState({ title = 'Aucun résultat', subtitle }) {
  return (
    <View style={s.root}>
      <Text style={s.title}>{title}</Text>
      {subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  root: { padding: spacing.lg, alignItems: 'center' },
  title: { fontWeight: '700', fontSize: 18 },
  subtitle: { color: colors.textMuted, marginTop: 6, textAlign: 'center' }
});
