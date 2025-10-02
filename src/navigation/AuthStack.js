import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../app/auth/WelcomeScreen';
import LoginScreen from '../app/auth/LoginScreen';
import SignupScreen from '../app/auth/SignupScreen';
import OtpScreen from '../app/auth/OtpScreen';
import ResetPasswordScreen from '../app/auth/ResetPasswordScreen';
import HeaderGradient from './HeaderGradient';
import ForgotPasswordScreen from '@/app/auth/ForgotPasswordScreen';

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
      <Stack.Screen name="Otp" component={OtpScreen} options={{ title: 'Vérification OTP', headerShown: false }} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ title: 'Réinitialiser le mot de passe' }} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Réinitialiser le mot de passe' }} />
    </Stack.Navigator>
  );
}