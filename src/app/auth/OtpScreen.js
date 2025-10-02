import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Alert, Platform, TextInput, KeyboardAvoidingView, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/Button';
import { spacing } from '../../theme/spacing';
import colors from '../../theme/colors';
import { textStyles } from '../../theme/typography';
import useAuthStore from '../../stores/auth.store';
import Toast from '../../components/Toast';

export default function OtpScreen({ route, navigation }) {
  const { email, phone, purpose, token } = route.params || {};
  const confirmAccount = useAuthStore((s) => s.confirmAccount);
  const confirmPasswordReset = useAuthStore((s) => s.confirmPasswordReset);
  const resendVerificationCode = useAuthStore((s) => s.resendVerificationCode);
  const loading = useAuthStore((s) => s.loading);
  
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes en secondes
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = useRef([]);
  const timerRef = useRef(null);
  const toast = useRef(null);

  // Compte à rebours
  useEffect(() => {
    if (timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timeLeft]);

  // Format du temps restant
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Gestion de la saisie du code
  const handleCodeChange = (value, index) => {
    if (value.length > 1) return; // Un seul caractère par champ
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus sur le champ suivant
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Gestion de la suppression
  const handleKeyPress = (key, index) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Vérification du code OTP
  const handleVerify = async () => {
    const otpCode = code.join('');
    
    if (otpCode.length !== 6) {
      toast.current?.show('Veuillez saisir le code complet');
      return;
    }

    try {
      if (purpose === 'ACCOUNT_VERIFICATION') {
        await confirmAccount(otpCode);
        toast.current?.show('Compte vérifié avec succès ✅');
        navigation.replace('MainTabs');
      } else if (purpose === 'PASSWORD_RESET') {
        navigation.navigate('ResetPassword', { 
          resetToken: token, 
          code: otpCode 
        });
      }
    } catch (error) {
      toast.current?.show(error.message || 'Code OTP invalide');
      setCode(['', '', '', '', '', '']); // Reset du code
      inputRefs.current[0]?.focus();
    }
  };

  // Renvoyer le code OTP
  const handleResend = async () => {
    setResendLoading(true);
    try {
      await resendVerificationCode();
      toast.current?.show('Nouveau code envoyé ✅');
      setTimeLeft(300);
      setCanResend(false);
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (error) {
      toast.current?.show(error.message || 'Erreur lors du renvoi');
    } finally {
      setResendLoading(false);
    }
  };

  const contactInfo = phone || email;
  const contactType = phone ? 'SMS' : 'email';

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <LinearGradient
        colors={[colors.primaryDark, colors.primary, colors.primaryLight]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.header}>
              <Button
                variant="tertiary"
                onPress={() => navigation.goBack()}
                style={styles.backButton}
                icon={<Ionicons name="arrow-back" size={24} color="white" />}
              />
            </View>

            {/* Contenu principal */}
            <View style={styles.content}>
              <View style={styles.iconContainer}>
                <Ionicons name="shield-checkmark" size={48} color="white" />
              </View>

              <Text style={styles.title}>Vérification OTP</Text>
              <Text style={styles.subtitle}>
                Nous avons envoyé un code à 6 chiffres par {contactType}
              </Text>
              <Text style={styles.contactInfo}>{contactInfo}</Text>

              {/* Champs de saisie OTP */}
              <View style={styles.otpContainer}>
                {code.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => (inputRefs.current[index] = ref)}
                    style={styles.otpInput}
                    value={digit}
                    onChangeText={(text) => handleCodeChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e.nativeEvent.key, index)}
                    keyboardType="numeric"
                    maxLength={1}
                    selectTextOnFocus
                    textAlign="center"
                    autoFocus={index === 0}
                  />
                ))}
              </View>

              {/* Bouton de vérification */}
              <Button
                title="Vérifier"
                variant="secondary"
                onPress={handleVerify}
                loading={loading}
                disabled={loading || code.join('').length !== 6}
                size="large"
                fullWidth
                style={styles.verifyButton}
              />

              {/* Compte à rebours et renvoi */}
              <View style={styles.resendContainer}>
                {!canResend ? (
                  <Text style={styles.timerText}>
                    Renvoyer dans {formatTime(timeLeft)}
                  </Text>
                ) : (
                  <Button
                    title="Renvoyer le code"
                    variant="tertiary"
                    onPress={handleResend}
                    loading={resendLoading}
                    disabled={resendLoading}
                    style={styles.resendButton}
                  />
                )}
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </LinearGradient>

      <Toast ref={toast} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: spacing.sm,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...textStyles.h1,
    color: 'white',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    ...textStyles.body,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  contactInfo: {
    ...textStyles.semibold,
    color: 'white',
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  otpInput: {
    width: 50,
    height: 60,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  verifyButton: {
    marginBottom: spacing.lg,
  },
  resendContainer: {
    alignItems: 'center',
  },
  timerText: {
    ...textStyles.body,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  resendButton: {
    paddingHorizontal: spacing.lg,
  },
});