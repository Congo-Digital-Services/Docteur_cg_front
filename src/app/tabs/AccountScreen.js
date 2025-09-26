import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Animated, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import useAuthStore from '../../stores/auth.store';
import Button from '../../components/Button';
import { colors, spacing, radius, textStyles } from '../../theme';

export default function AccountScreen({ navigation }) {
  const { user, token, logout } = useAuthStore();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  React.useEffect(() => {
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

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Déconnexion', style: 'destructive', onPress: logout },
      ]
    );
  };

  const renderGuestState = () => (
    <View style={s.container}>
      {/* Header avec navigation */}
      <View style={s.header}>
        <View style={s.headerTop}>
          <Text style={s.headerTitle}>Mon compte</Text>
          <View style={s.headerActions}>
            <Pressable style={s.headerAction}>
              <Ionicons name="person-outline" size={24} color="white" />
            </Pressable>
          </View>
        </View>
      </View>

      <ScrollView style={s.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View style={[
          s.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}>
          {/* Section Connexion */}
          <View style={s.loginSection}>
            <View style={s.loginContent}>
              <View style={s.shieldIcon}>
                <Ionicons name="shield-checkmark" size={32} color={colors.primary} />
              </View>
              <View style={s.loginText}>
                <Text style={s.loginDescription}>
                  Docteur CG est au service de votre santé et celle de vos proches.
                </Text>
                <Button
                  title="SE CONNECTER"
                  onPress={() => navigation.navigate('Auth', { screen: 'Login' })}
                  style={s.loginButton}
                />
              </View>
            </View>
            <View style={s.signupContainer}>
              <Text style={s.signupText}>
                Vous n'avez pas de compte? 
              </Text>
              <Pressable onPress={() => navigation.navigate('Auth', { screen: 'Signup' })}>
                <Text style={s.signupLink}>S'inscrire</Text>
              </Pressable>
            </View>
          </View>

          {/* Section Paramètres */}
          <View style={s.settingsSection}>
            <View style={s.sectionHeader}>
              <View style={s.sectionIcon}>
                <Ionicons name="settings" size={20} color={colors.primary} />
              </View>
              <Text style={s.sectionTitle}>Paramètres</Text>
            </View>
            
            <Pressable style={s.settingItem}>
              <View style={s.settingLeft}>
                <View style={s.settingIcon}>
                  <Ionicons name="globe-outline" size={20} color={colors.primary} />
                </View>
                <Text style={s.settingText}>Pays où vous avez besoin de soins</Text>
              </View>
              <View style={s.flagContainer}>
                <Text style={s.flagText}>🇨🇬</Text>
              </View>
            </Pressable>

            <Pressable style={s.settingItem} onPress={() => navigation.navigate('Privacy')}>
              <View style={s.settingLeft}>
                <View style={s.settingIcon}>
                  <Ionicons name="shield-outline" size={20} color={colors.primary} />
                </View>
                <Text style={s.settingText}>Confidentialité</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </Pressable>

            <Pressable style={s.settingItem} onPress={() => navigation.navigate('Preferences')}>
              <View style={s.settingLeft}>
                <View style={s.settingIcon}>
                  <Ionicons name="settings-outline" size={20} color={colors.primary} />
                </View>
                <Text style={s.settingText}>Mes préférences</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </Pressable>

            <Pressable style={s.settingItem} onPress={() => navigation.navigate('Legal')}>
              <View style={s.settingLeft}>
                <View style={s.settingIcon}>
                  <Ionicons name="document-text-outline" size={20} color={colors.primary} />
                </View>
                <Text style={s.settingText}>Informations légales</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </Pressable>

            <Text style={s.versionText}>v1.0.0</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );

  if (!token) {
    return renderGuestState();
  }

  return (
    <View style={s.container}>
      {/* Header avec navigation */}
      <View style={s.header}>
        <View style={s.headerTop}>
          <Text style={s.headerTitle}>Mon compte</Text>
          <View style={s.headerActions}>
            <Pressable style={s.headerAction} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={24} color="white" />
            </Pressable>
          </View>
        </View>
      </View>

      <ScrollView style={s.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View style={[
          s.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}>
          {/* Profil utilisateur */}
          <View style={s.profileSection}>
            <View style={s.profileImageContainer}>
              <View style={s.profileImage}>
                <Ionicons name="person" size={40} color={colors.primary} />
              </View>
            </View>
            <Text style={s.userName}>{user?.firstName || 'Utilisateur'} {user?.lastName || ''}</Text>
            <Text style={s.userEmail}>{user?.email || 'email@example.com'}</Text>
          </View>

          {/* Section Paramètres */}
          <View style={s.settingsSection}>
            <View style={s.sectionHeader}>
              <View style={s.sectionIcon}>
                <Ionicons name="settings" size={20} color={colors.primary} />
              </View>
              <Text style={s.sectionTitle}>Paramètres</Text>
            </View>
            
            <Pressable style={s.settingItem}>
              <View style={s.settingLeft}>
                <View style={s.settingIcon}>
                  <Ionicons name="globe-outline" size={20} color={colors.primary} />
                </View>
                <Text style={s.settingText}>Pays où vous avez besoin de soins</Text>
              </View>
              <View style={s.flagContainer}>
                <Text style={s.flagText}>🇨🇬</Text>
              </View>
            </Pressable>


            <Pressable style={s.settingItem} onPress={() => navigation.navigate('Privacy')}>
              <View style={s.settingLeft}>
                <View style={s.settingIcon}>
                  <Ionicons name="shield-outline" size={20} color={colors.primary} />
                </View>
                <Text style={s.settingText}>Confidentialité</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </Pressable>

            <Pressable style={s.settingItem} onPress={() => navigation.navigate('Preferences')}>
              <View style={s.settingLeft}>
                <View style={s.settingIcon}>
                  <Ionicons name="settings-outline" size={20} color={colors.primary} />
                </View>
                <Text style={s.settingText}>Mes préférences</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </Pressable>

            <Pressable style={s.settingItem} onPress={() => navigation.navigate('Legal')}>
              <View style={s.settingLeft}>
                <View style={s.settingIcon}>
                  <Ionicons name="document-text-outline" size={20} color={colors.primary} />
                </View>
                <Text style={s.settingText}>Informations légales</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </Pressable>

            <Text style={s.versionText}>v1.0.0</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.gradientStart,
    paddingTop: 50,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    ...textStyles.h3,
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: spacing.lg,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAction: {
    padding: spacing.sm,
    marginLeft: spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingBottom: spacing.xl,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  profileImageContainer: {
    marginBottom: spacing.lg,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  userName: {
    ...textStyles.h1,
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  userEmail: {
    ...textStyles.h3,
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  loginSection: {
    backgroundColor: colors.primaryMuted,
    borderRadius: 16,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  loginContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  shieldIcon: {
    marginRight: spacing.md,
    marginTop: spacing.xs,
  },
  loginText: {
    flex: 1,
  },
  loginDescription: {
    ...textStyles.body,
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  loginButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  signupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  signupText: {
    ...textStyles.body,
    fontSize: 14,
    color: colors.textSecondary,
  },
  signupLink: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
    marginLeft: spacing.xs,
  },
  settingsSection: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 16,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  sectionTitle: {
    ...textStyles.h3,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  settingText: {
    ...textStyles.body,
    fontSize: 15,
    color: colors.text,
    flex: 1,
  },
  settingValue: {
    ...textStyles.body,
    fontSize: 14,
    color: colors.textSecondary,
  },
  flagContainer: {
    paddingHorizontal: spacing.sm,
  },
  flagText: {
    fontSize: 20,
  },
  versionText: {
    ...textStyles.caption,
    fontSize: 12,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingHorizontal: spacing.lg,
  },
});
