import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Card from './Card';
import colors from '../theme/colors';
import { spacing } from '../theme/spacing';

export default function DoctorCard({ doctor, distanceKm, onPress }) {
  return (
    <Pressable onPress={onPress}>
      <Card style={s.card}>
        <Text style={s.name}>{doctor.title} {doctor.lastName}</Text>
        <Text style={s.spec}>{doctor.specialty} • {doctor.city}</Text>
        <View style={{ height: 6 }} />
        <Text style={s.meta}>{distanceKm != null ? `${distanceKm.toFixed(1)} km` : 'Distance —'}</Text>
      </Card>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: { marginBottom: spacing.md },
  name: { fontSize: 16, fontWeight: '700', color: colors.text },
  spec: { color: colors.textMuted },
  meta: { color: colors.textMuted, fontSize: 12 }
});
