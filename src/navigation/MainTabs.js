import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../app/tabs/HomeScreen';
import SearchScreen from '../app/tabs/SearchScreen';
import AppointmentsScreen from '../app/tabs/AppointmentsScreen';
import AccountScreen from '../app/tabs/AccountScreen';
import colors from '../theme/colors';
import { spacing } from '../theme/spacing';
import { textStyles } from '../theme/typography';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 0,
          paddingTop: spacing.sm,
          paddingBottom: Platform.OS === 'ios' ? spacing.lg : spacing.sm,
          height: Platform.OS === 'ios' ? 90 : 70,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -1 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '400',
          marginTop: spacing.xs,
        },
        tabBarIcon: ({ color, size, focused }) => {
          const iconMap = {
            Home: focused ? 'home' : 'home-outline',
            Search: focused ? 'search' : 'search-outline',
            Appointments: focused ? 'calendar' : 'calendar-outline',
            Account: focused ? 'person' : 'person-outline'
          };
          
          return (
            <Ionicons 
              name={iconMap[route.name]} 
              size={focused ? 24 : 22} 
              color={color} 
            />
          );
        }
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ 
          title: 'Accueil',
          tabBarLabel: 'Accueil'
        }} 
      />
      <Tab.Screen 
        name="Search" 
        component={SearchScreen} 
        options={{ 
          title: 'Recherche',
          tabBarLabel: 'Recherche'
        }} 
      />
      <Tab.Screen 
        name="Appointments" 
        component={AppointmentsScreen} 
        options={{ 
          title: 'Rendez-vous',
          tabBarLabel: 'Rendez-vous'
        }} 
      />
      <Tab.Screen 
        name="Account" 
        component={AccountScreen} 
        options={{ 
          title: 'Compte',
          tabBarLabel: 'Compte'
        }} 
      />
    </Tab.Navigator>
  );
}

