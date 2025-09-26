import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DoctorDetailsScreen from '../app/doctor/DoctorDetailsScreen';
import BookingScreen from '../app/booking/BookingScreen';
import HeaderGradient from './HeaderGradient';

const Stack = createNativeStackNavigator();

export default function BookingStack() {
  return (
    <Stack.Navigator screenOptions={{ header: (p) => <HeaderGradient {...p} /> }}>
      <Stack.Screen 
        name="DoctorDetails" 
        component={DoctorDetailsScreen} 
        options={{ title: 'Détails du médecin' }} 
      />
      <Stack.Screen 
        name="Booking" 
        component={BookingScreen} 
        options={{ title: 'Prendre rendez-vous' }} 
      />
    </Stack.Navigator>
  );
}
