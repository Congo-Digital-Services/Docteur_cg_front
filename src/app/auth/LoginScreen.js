import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import Input from '../../components/Input';
import Button from '../../components/Button';
import useAuthStore from '../../stores/auth.store';
import { toast } from '../../components/Toast';
import { spacing } from '../../theme/spacing';
import colors from '../../theme/colors';
import { textStyles } from '../../theme/typography';

export default function LoginScreen({ navigation }) {
  const { control, handleSubmit, formState: { errors } } = useForm({ 
    defaultValues: { email: '', password: '' } 
  });
  const login = useAuthStore((s) => s.login);
  const loading = useAuthStore((s) => s.loading);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
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

  const onSubmit = async ({ email, password }) => {
    try {
      await login(email, password);
      toast.show('Connecté avec succès ✅');
      navigation.replace('MainTabs');
    } catch (e) {
      toast.show(e.message || 'Erreur de connexion');
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
              <Ionicons name="medical" size={32} color={colors.primary} />
            </View>
            <Text style={s.title}>Connexion</Text>
            <Text style={s.subtitle}>
              Connectez-vous pour accéder à votre espace personnel
            </Text>
          </View>

          {/* Form */}
          <View style={s.form}>
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
              name="password" 
              rules={{
                required: 'Le mot de passe est requis',
                minLength: {
                  value: 6,
                  message: 'Le mot de passe doit contenir au moins 6 caractères'
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

            <Button 
              title="Se connecter" 
              onPress={handleSubmit(onSubmit)}
              loading={loading}
              fullWidth
              size="large"
              style={s.loginButton}
            />

            <View style={s.divider}>
              <View style={s.dividerLine} />
              <Text style={s.dividerText}>ou</Text>
              <View style={s.dividerLine} />
            </View>

            <Button 
              title="Continuer en tant qu'invité" 
              variant="secondary"
              onPress={() => navigation.replace('MainTabs')}
              fullWidth
              style={s.guestButton}
            />
          </View>

          {/* Footer */}
          <View style={s.footer}>
            <Text style={s.footerText}>
              Pas encore de compte ?{' '}
              <Text 
                style={s.linkText}
                onPress={() => navigation.navigate('Signup')}
              >
                Créer un compte
              </Text>
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
  loginButton: {
    marginTop: spacing.lg,
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
  guestButton: {
    marginBottom: spacing.lg,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    ...textStyles.bodySmall,
    color: colors.textSecondary,
  },
  linkText: {
    color: colors.primary,
    fontWeight: '600',
  },
});
