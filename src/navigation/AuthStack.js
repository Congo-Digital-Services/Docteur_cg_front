import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../app/auth/WelcomeScreen';
import LoginScreen from '../app/auth/LoginScreen';
import SignupScreen from '../app/auth/SignupScreen';
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
    </Stack.Navigator>
  );
}
