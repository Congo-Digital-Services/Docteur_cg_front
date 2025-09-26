import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabs from './MainTabs';
import AuthStack from './AuthStack';
import BookingStack from './BookingStack';
import HeaderGradient from './HeaderGradient';
import useAuthStore from '../stores/auth.store';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const token = useAuthStore((s) => s.token);

  return (
    <Stack.Navigator 
      initialRouteName="Auth"
      screenOptions={{ header: (p) => <HeaderGradient {...p} /> }}
    >
      <Stack.Screen name="Auth" component={AuthStack} options={{ headerShown: false }} />
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="BookingStack" component={BookingStack} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
