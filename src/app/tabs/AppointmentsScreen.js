import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import useBookingStore from '../../stores/booking.store';
import Button from '../../components/Button';
import { spacing } from '../../theme/spacing';
import colors from '../../theme/colors';

export default function AppointmentsScreen() {
  const { appointments, loadMine, cancel } = useBookingStore();

  useEffect(() => { loadMine(); }, []);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <FlatList
        data={appointments}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={s.card}>
            <Text style={s.title}>RDV #{item.id}</Text>
            <Text style={s.meta}>Slot: {item.slotId}</Text>
            <Text style={s.badge(item.status)}>{item.status}</Text>
            <View style={{ height: spacing.sm }} />
            {item.status !== 'DECLINED' ? (
              <Button title="Annuler" variant="secondary" onPress={() => cancel(item.id)} />
            ) : null}
          </View>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>Aucun RDV</Text>}
      />
    </View>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: spacing.md, marginBottom: spacing.md },
  title: { fontWeight: '700' },
  meta: { color: colors.textMuted, marginTop: 4 },
  badge: (status) => ({ marginTop: 6, color: status === 'PENDING' ? '#F59E0B' : status === 'CONFIRMED' ? '#10B981' : '#EF4444', fontWeight: '700' })
});
