import React, { useEffect } from 'react';
import { View, Text, FlatList } from 'react-native';
import useBookingStore from '../../stores/booking.store';
import Button from '../../components/Button';
import { spacing } from '../../theme/spacing';

export default function CalendarScreen({ navigation }) {
  const { selectedDoctor, loadSlots, slots, selectSlot } = useBookingStore();

  useEffect(() => { if (selectedDoctor) loadSlots(selectedDoctor.id); }, [selectedDoctor]);

  if (!selectedDoctor) return <View style={{ padding: 20 }}><Text>Sélectionnez un médecin d’abord.</Text></View>;

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontWeight: '700', fontSize: 16, marginBottom: 10 }}>
        Créneaux disponibles — {selectedDoctor.title} {selectedDoctor.lastName}
      </Text>
      <FlatList
        data={slots}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <Button
            title={item.time + (item.taken ? ' · pris' : '')}
            variant="secondary"
            onPress={() => { selectSlot(item); navigation.navigate('Slots'); }}
            style={{ marginBottom: spacing.sm }}
          />
        )}
      />
    </View>
  );
}
