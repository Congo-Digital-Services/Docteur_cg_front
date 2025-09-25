import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CalendarScreen from '../app/booking/CalendarScreen';
import SlotsScreen from '../app/booking/SlotsScreen';
import HeaderGradient from './HeaderGradient';

const Stack = createNativeStackNavigator();

export default function BookingStack() {
  return (
    <Stack.Navigator screenOptions={{ header: (p) => <HeaderGradient {...p} /> }}>
      <Stack.Screen name="Calendar" component={CalendarScreen} options={{ title: 'Calendrier' }} />
      <Stack.Screen name="Slots" component={SlotsScreen} options={{ title: 'Créneaux' }} />
    </Stack.Navigator>
  );
}
