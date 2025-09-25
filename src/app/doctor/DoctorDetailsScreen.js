import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getDoctor } from '../../services/doctors';
import Button from '../../components/Button';
import useBookingStore from '../../stores/booking.store';
import useAuthStore from '../../stores/auth.store';
import LoginRequireModal from '../../components/LoginRequireModal';
import { spacing } from '../../theme/spacing';

export default function DoctorDetailsScreen({ route, navigation }) {
  const { id } = route.params;
  const [doctor, setDoctor] = useState(null);
  const token = useAuthStore((s) => s.token);
  const [needLogin, setNeedLogin] = useState(false);
  const selectDoctor = useBookingStore((s) => s.selectDoctor);

  useEffect(() => { (async () => setDoctor(await getDoctor(id)))(); }, [id]);

  const goBooking = () => {
    if (!token) return setNeedLogin(true);
    selectDoctor(doctor);
    navigation.navigate('Booking', { screen: 'Calendar' });
  };

  if (!doctor) return null;
  return (
    <View style={s.root}>
      <Text style={s.name}>{doctor.title} {doctor.lastName}</Text>
      <Text style={s.meta}>{doctor.specialty} • {doctor.city}</Text>
      <View style={{ height: spacing.lg }} />
      <Button title="Prendre RDV" onPress={goBooking} />
      <LoginRequireModal
        visible={needLogin}
        onClose={() => setNeedLogin(false)}
        onLogin={() => navigation.navigate('Auth', { screen: 'Login' })}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, padding: 20 },
  name: { fontSize: 22, fontWeight: '800' },
  meta: { color: '#6B7280', marginTop: 6 }
});
