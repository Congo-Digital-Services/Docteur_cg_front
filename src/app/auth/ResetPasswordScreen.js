import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import Input from '../../components/Input';
import Button from '../../components/Button';
import useAuthStore from '../../stores/auth.store';
import { toast } from '../../components/Toast';
import { spacing } from '../../theme/spacing';
import colors from '../../theme/colors';
import { textStyles } from '../../theme/typography';

export default function ResetPasswordScreen({ route, navigation }) {
  const { resetToken, code } = route.params || {};
  const confirmPasswordReset = useAuthStore((s) => s.confirmPasswordReset);
  const loading = useAuthStore((s) => s.loading);
  
  const { control, handleSubmit, formState: { errors }, watch } = useForm({ 
    defaultValues: { 
      newPassword: '', 
      confirmPassword: '' 
    } 
  });
  
  // Watch password for confirmation validation
  const newPassword = watch('newPassword');

  const onSubmit = async (data) => {
    try {
      await confirmPasswordReset(code, data.newPassword);
      toast.show('Mot de passe réinitialisé avec succès ✅');
      navigation.replace('MainTabs');
    } catch (e) {
      toast.show(e.message || 'Erreur lors de la réinitialisation du mot de passe');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="lock-closed" size={32} color={colors.primary} />
            </View>
            <Text style={styles.title}>Réinitialiser le mot de passe</Text>
            <Text style={styles.subtitle}>
              Créez un nouveau mot de passe pour votre compte
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Controller 
              control={control} 
              name="newPassword" 
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
                  label="Nouveau mot de passe"
                  placeholder="••••••••" 
                  secureTextEntry 
                  value={value} 
                  onChangeText={onChange}
                  error={errors.newPassword?.message}
                />
              )} 
            />
            
            <Controller 
              control={control} 
              name="confirmPassword" 
              rules={{
                required: 'La confirmation du mot de passe est requise',
                validate: value => value === newPassword || 'Les mots de passe ne correspondent pas'
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

            <Button 
              title="Réinitialiser le mot de passe" 
              onPress={handleSubmit(onSubmit)}
              loading={loading}
              fullWidth
              size="large"
              style={styles.resetButton}
              icon={<Ionicons name="checkmark-circle" size={20} color={colors.white} />}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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
  resetButton: {
    marginTop: spacing.lg,
  },
});