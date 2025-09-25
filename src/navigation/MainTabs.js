import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../app/tabs/HomeScreen';
import SearchScreen from '../app/tabs/SearchScreen';
import AppointmentsScreen from '../app/tabs/AppointmentsScreen';
import AccountScreen from '../app/tabs/AccountScreen';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#0859A1',
        tabBarIcon: ({ color, size }) => {
          const map = {
            Home: 'home',
            Search: 'search',
            Appointments: 'calendar',
            Account: 'person'
          };
          return <Ionicons name={map[route.name]} size={size} color={color} />;
        }
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Accueil' }} />
      <Tab.Screen name="Search" component={SearchScreen} options={{ title: 'Recherche' }} />
      <Tab.Screen name="Appointments" component={AppointmentsScreen} options={{ title: 'Mes RDV' }} />
      <Tab.Screen name="Account" component={AccountScreen} options={{ title: 'Compte' }} />
    </Tab.Navigator>
  );
}
