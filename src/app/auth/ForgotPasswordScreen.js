import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
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

export default function ForgotPasswordScreen({ navigation }) {
  const { control, handleSubmit, formState: { errors } } = useForm({ 
    defaultValues: { email: '', phone: '' } 
  });
  const requestPasswordReset = useAuthStore((s) => s.requestPasswordReset);
  const loading = useAuthStore((s) => s.loading);
  const [method, setMethod] = useState('email'); // 'email' or 'phone'

  const onSubmit = async (data) => {
    try {
      const result = await requestPasswordReset({
        email: method === 'email' ? data.email : undefined,
        phone: method === 'phone' ? data.phone : undefined
      });
      
      toast.show('Code de réinitialisation envoyé ✅');
      
      // Naviguer vers l'écran OTP
      navigation.navigate('Otp', {
        email: method === 'email' ? data.email : undefined,
        phone: method === 'phone' ? data.phone : undefined,
        purpose: 'PASSWORD_RESET',
        token: result.resetToken
      });
    } catch (e) {
      toast.show(e.message || 'Erreur lors de la demande de réinitialisation');
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
            <Text style={styles.title}>Mot de passe oublié</Text>
            <Text style={styles.subtitle}>
              Entrez votre adresse email ou numéro de téléphone pour réinitialiser votre mot de passe
            </Text>
          </View>

          {/* Méthode de réinitialisation */}
          <Card style={styles.methodCard}>
            <View style={styles.methodContainer}>
              <Button
                title="Par email"
                variant={method === 'email' ? 'primary' : 'secondary'}
                onPress={() => setMethod('email')}
                style={styles.methodButton}
                icon={<Ionicons name="mail" size={20} color={method === 'email' ? colors.white : colors.primary} />}
              />
              <Button
                title="Par SMS"
                variant={method === 'phone' ? 'primary' : 'secondary'}
                onPress={() => setMethod('phone')}
                style={styles.methodButton}
                icon={<Ionicons name="phone-portrait" size={20} color={method === 'phone' ? colors.white : colors.primary} />}
              />
            </View>
          </Card>

          {/* Form */}
          <View style={styles.form}>
            {method === 'email' ? (
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
            ) : (
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
            )}

            <Button 
              title="Envoyer le code de réinitialisation" 
              onPress={handleSubmit(onSubmit)}
              loading={loading}
              fullWidth
              size="large"
              style={styles.sendButton}
              icon={<Ionicons name="send" size={20} color={colors.white} />}
            />

            <Button 
              title="Retour à la connexion" 
              variant="secondary"
              onPress={() => navigation.navigate('Login')}
              fullWidth
              style={styles.loginButton}
              icon={<Ionicons name="arrow-back" size={20} color={colors.primary} />}
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
  methodCard: {
    marginBottom: spacing.lg,
  },
  methodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  methodButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  form: {
    marginBottom: spacing.section,
  },
  sendButton: {
    marginBottom: spacing.lg,
  },
  loginButton: {
    marginBottom: spacing.lg,
  },
});