import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabs from './MainTabs';
import AuthStack from './AuthStack';
import BookingStack from './BookingStack';
import HeaderGradient from './HeaderGradient';
import useAuthStore from '../stores/auth.store'; // Assurez-vous que le chemin est correct
import LoadingScreen from '../components/LoadingScreen'; // Importez l'écran de chargement
import PrivacyScreen from '../app/settings/PrivacyScreen';
import PreferencesScreen from '../app/settings/PreferencesScreen';
import LegalScreen from '../app/settings/LegalScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  // On récupère le token et le nouvel état isInitialized
  const token = useAuthStore((state) => state.token);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  // Tant que l'initialisation n'est pas terminée, on affiche l'écran de chargement
  if (!isInitialized) {
    return <LoadingScreen />;
  }

  // Une fois initialisé, on décide quelle pile de navigation afficher
  return (
    <Stack.Navigator 
      // On définit la route initiale en fonction de la présence du token
      initialRouteName={token ? "MainTabs" : "Auth"}
      screenOptions={{ header: (p) => <HeaderGradient {...p} /> }}
    >
      {/* La pile d'authentification pour les utilisateurs non connectés */}
      <Stack.Screen name="Auth" component={AuthStack} options={{ headerShown: false }} />
      
      {/* La pile principale pour les utilisateurs connectés */}
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      
      {/* Autres piles */}
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