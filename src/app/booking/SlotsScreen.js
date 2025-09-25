import React, { useState } from 'react';
import { View, Text } from 'react-native';
import useBookingStore from '../../stores/booking.store';
import Button from '../../components/Button';
import { toast } from '../../components/Toast';
import { spacing } from '../../theme/spacing';

export default function SlotsScreen({ navigation }) {
  const { selectedDoctor, selectedSlot, book } = useBookingStore();
  const [loading, setLoading] = useState(false);

  if (!selectedSlot) return <View style={{ padding: 20 }}><Text>Aucun créneau sélectionné.</Text></View>;

  const confirm = async () => {
    setLoading(true);
    try {
      const appt = await book();
      toast.show('RDV créé (PENDING)');
      navigation.navigate('MainTabs', { screen: 'Appointments' });
    } catch (e) {
      toast.show(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontWeight: '700', fontSize: 18 }}>
        Confirmer le RDV
      </Text>
      <Text style={{ marginTop: 8, color: '#6B7280' }}>
        {selectedDoctor.title} {selectedDoctor.lastName} • {selectedDoctor.specialty}
      </Text>
      <Text style={{ marginTop: 4, color: '#6B7280' }}>
        Créneau: {selectedSlot.time}
      </Text>
      <View style={{ height: spacing.lg }} />
      <Button title={loading ? 'Création…' : 'Confirmer'} onPress={confirm} disabled={loading} />
    </View>
  );
}
