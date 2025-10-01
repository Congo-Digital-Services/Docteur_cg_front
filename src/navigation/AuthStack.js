import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../app/auth/WelcomeScreen';
import LoginScreen from '../app/auth/LoginScreen';
import SignupScreen from '../app/auth/SignupScreen';
import OtpScreen from '../app/auth/OtpScreen';
import HeaderGradient from './HeaderGradient';

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        header: (props) => <HeaderGradient {...props} />
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ title: 'Bienvenue' }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Se connecter' }} />
      <Stack.Screen name="Signup" component={SignupScreen} options={{ title: "S'inscrire" }} />
      <Stack.Screen 
        name="Otp" 
        component={OtpScreen} 
        options={{ 
          title: 'Vérification OTP',
          headerShown: false // L'écran OTP a son propre header
        }} 
      />
    </Stack.Navigator>
  );
}
