import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Card from '../../components/Card';
import useAuthStore from '../../stores/auth.store';
import { toast } from '../../components/Toast';
import { spacing } from '../../theme/spacing';
import colors from '../../theme/colors';
import { textStyles } from '../../theme/typography';

export default function SignupScreen({ navigation }) {
  const { control, handleSubmit, formState: { errors }, watch } = useForm({ 
    defaultValues: { 
      firstName: '', 
      lastName: '', 
      email: '', 
      phone: '',
      password: '', 
      confirmPassword: '',
      acceptTerms: false
    } 
  });
  const register = useAuthStore((s) => s.register);
  const loading = useAuthStore((s) => s.loading);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Watch password for confirmation validation
  const password = watch('password');

  useEffect(() => {
    // Animation d'entrée simple
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

   const onSubmit = async (data) => {
    try {
      const result = await register(data);
      toast.show('Compte créé avec succès ✅');
      
      // Naviguer vers l'écran OTP avec les paramètres nécessaires
      navigation.navigate('Otp', {
        email: data.email,
        phone: data.phone,
        purpose: 'ACCOUNT_VERIFICATION',
        token: result.confirmationToken
      });
    } catch (e) {
      toast.show(e.message || 'Erreur lors de la création du compte');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={s.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={[
          s.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}>
          {/* Header */}
          <View style={s.header}>
            <View style={s.iconContainer}>
              <Ionicons name="person-add" size={32} color={colors.primary} />
            </View>
            <Text style={s.title}>Créer un compte</Text>
            <Text style={s.subtitle}>
              Rejoignez-nous pour accéder à tous nos services
            </Text>
          </View>

          {/* Form */}
          <View style={s.form}>
            <Controller 
              control={control} 
              name="firstName" 
              rules={{
                required: 'Le prénom est requis',
                minLength: {
                  value: 2,
                  message: 'Le prénom doit contenir au moins 2 caractères'
                }
              }}
              render={({ field: { onChange, value } }) => (
                <Input 
                  label="Prénom"
                  placeholder="Votre prénom" 
                  value={value} 
                  onChangeText={onChange}
                  error={errors.firstName?.message}
                  autoCapitalize="words"
                />
              )} 
            />
            
            <Controller 
              control={control} 
              name="lastName" 
              rules={{
                required: 'Le nom est requis',
                minLength: {
                  value: 2,
                  message: 'Le nom doit contenir au moins 2 caractères'
                }
              }}
              render={({ field: { onChange, value } }) => (
                <Input 
                  label="Nom"
                  placeholder="Votre nom de famille" 
                  value={value} 
                  onChangeText={onChange}
                  error={errors.lastName?.message}
                  autoCapitalize="words"
                />
              )} 
            />
            
            <Controller 
              control={control} 
              name="email" 
              rules={{
                required: 'L\'email est requis',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Format d\'email invalide'
                }
              }}
              render={({ field: { onChange, value } }) => (
                <Input 
                  label="Adresse email"
                  placeholder="votre@email.com" 
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  value={value} 
                  onChangeText={onChange}
                  error={errors.email?.message}
                />
              )} 
            />
            
            <Controller 
              control={control} 
              name="phone" 
              rules={{
                required: 'Le numéro de téléphone est requis',
                pattern: {
                  value: /^(04|05|06)[0-9]{7}$/,
                  message: 'Format de téléphone invalide'
                }
              }}
              render={({ field: { onChange, value } }) => (
                <Input 
                  label="Numéro de téléphone"
                  placeholder="06 123 4567" 
                  keyboardType="phone-pad"
                  autoComplete="tel"
                  value={value} 
                  onChangeText={onChange}
                  error={errors.phone?.message}
                />
              )} 
            />
            
            <Controller 
              control={control} 
              name="password" 
              rules={{
                required: 'Le mot de passe est requis',
                minLength: {
                  value: 8,
                  message: 'Le mot de passe doit contenir au moins 8 caractères'
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message: 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
                }
              }}
              render={({ field: { onChange, value } }) => (
                <Input 
                  label="Mot de passe"
                  placeholder="••••••••" 
                  secureTextEntry 
                  value={value} 
                  onChangeText={onChange}
                  error={errors.password?.message}
                />
              )} 
            />
            
            <Controller 
              control={control} 
              name="confirmPassword" 
              rules={{
                required: 'La confirmation du mot de passe est requise',
                validate: value => value === password || 'Les mots de passe ne correspondent pas'
              }}
              render={({ field: { onChange, value } }) => (
                <Input 
                  label="Confirmer le mot de passe"
                  placeholder="••••••••" 
                  secureTextEntry 
                  value={value} 
                  onChangeText={onChange}
                  error={errors.confirmPassword?.message}
                />
              )} 
            />

            {/* Boutons */}
            <View style={s.buttonContainer}>
              <Button 
                title="Créer mon compte" 
                onPress={handleSubmit(onSubmit)}
                loading={loading}
                fullWidth
                size="large"
                style={s.signupButton}
                icon={<Ionicons name="checkmark-circle" size={20} color={colors.white} />}
              />

              <View style={s.divider}>
                <View style={s.dividerLine} />
                <Text style={s.dividerText}>ou</Text>
                <View style={s.dividerLine} />
              </View>

              <Button 
                title="Retour à la connexion" 
                variant="secondary"
                onPress={() => navigation.navigate('Login')}
                fullWidth
                style={s.loginButton}
                icon={<Ionicons name="arrow-back" size={20} color={colors.primary} />}
              />
            </View>
          </View>

          {/* Footer */}
          <View style={s.footer}>
            <Text style={s.footerText}>
              En créant un compte, vous acceptez nos{' '}
              <Text style={s.linkText}>conditions d'utilisation</Text>
              {' '}et notre{' '}
              <Text style={s.linkText}>politique de confidentialité</Text>
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: spacing.section,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.section,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...textStyles.h1,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...textStyles.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    marginBottom: spacing.section,
  },
  buttonContainer: {
    marginTop: spacing.lg,
  },
  signupButton: {
    marginBottom: spacing.lg,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    ...textStyles.caption,
    color: colors.textTertiary,
    marginHorizontal: spacing.md,
  },
  loginButton: {
    marginBottom: spacing.lg,
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  footerText: {
    ...textStyles.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  linkText: {
    color: colors.primary,
    fontWeight: '600',
  },
});
