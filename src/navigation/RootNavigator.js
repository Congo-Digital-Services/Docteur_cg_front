import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabs from './MainTabs';
import AuthStack from './AuthStack';
import BookingStack from './BookingStack';
import HeaderGradient from './HeaderGradient';
import useAuthStore from '../stores/auth.store';
import PrivacyScreen from '../app/settings/PrivacyScreen';
import PreferencesScreen from '../app/settings/PreferencesScreen';
import LegalScreen from '../app/settings/LegalScreen';

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
      <Stack.Screen 
        name="Privacy" 
        component={PrivacyScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="Preferences" 
        component={PreferencesScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="Legal" 
        component={LegalScreen} 
        options={{ headerShown: false }} 
      />
    </Stack.Navigator>
  );
}
