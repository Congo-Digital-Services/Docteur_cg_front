import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Animated, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import useAuthStore from '../../stores/auth.store';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { colors, spacing, radius, textStyles } from '../../theme';

export default function AccountScreen({ navigation }) {
  const { user, token, logout } = useAuthStore();
  const insets = useSafeAreaInsets();

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
    <View style={s.guestContainer}>
      <Ionicons name="person-circle-outline" size={80} color={colors.textSecondary} />
      <Text style={s.guestTitle}>Connectez-vous</Text>
      <Text style={s.guestSubtitle}>
        Accédez à votre espace personnel pour gérer vos rendez-vous
      </Text>
      <Button
        title="Se connecter"
        onPress={() => navigation.navigate('Auth', { screen: 'Login' })}
        style={s.guestButton}
      />
    </View>
  );

  if (!token) {
    return (
      <SafeAreaView style={s.container} edges={['top']}>
        <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={s.header}>
            <View style={{ width: 24 }} />
            <Text style={s.title}>Mon compte</Text>
            <View style={{ width: 24 }} />
          </View>
        </LinearGradient>
        {renderGuestState()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {/* Header */}
      <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={s.header}>
          <View style={{ width: 24 }} />
          <Text style={s.title}>Mon compte</Text>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      <Animated.View style={[
        s.content,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}>
        <ScrollView style={s.scrollView} showsVerticalScrollIndicator={false}>
          {/* Profil utilisateur */}
          <Card variant="elevated" style={s.profileCard}>
            <View style={s.profileHeader}>
              <View style={s.avatar}>
                <Ionicons name="person" size={32} color={colors.primary} />
              </View>
              <View style={s.profileInfo}>
                <Text style={s.userName}>
                  {user?.firstName || 'Prénom'} {user?.lastName || 'Nom'}
                </Text>
                <Text style={s.userEmail}>{user?.email || 'email@example.com'}</Text>
              </View>
            </View>
          </Card>

          {/* Mes informations */}
          <Card variant="elevated" style={s.section}>
            <Text style={s.sectionTitle}>Mes informations</Text>
            <View style={s.infoRow}>
              <Ionicons name="person-outline" size={20} color={colors.textSecondary} />
              <View style={s.infoContent}>
                <Text style={s.infoLabel}>Nom complet</Text>
                <Text style={s.infoValue}>
                  {user?.firstName || 'Prénom'} {user?.lastName || 'Nom'}
                </Text>
              </View>
            </View>
            <View style={s.infoRow}>
              <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />
              <View style={s.infoContent}>
                <Text style={s.infoLabel}>Email</Text>
                <Text style={s.infoValue}>{user?.email || 'email@example.com'}</Text>
              </View>
            </View>
            <View style={s.infoRow}>
              <Ionicons name="call-outline" size={20} color={colors.textSecondary} />
              <View style={s.infoContent}>
                <Text style={s.infoLabel}>Téléphone</Text>
                <Text style={s.infoValue}>{user?.phone || 'Non renseigné'}</Text>
              </View>
            </View>
          </Card>

          {/* Mes rendez-vous */}
          <Card variant="elevated" style={s.section}>
            <Text style={s.sectionTitle}>Mes rendez-vous</Text>
            <Pressable style={s.menuItem} onPress={() => navigation.navigate('Appointments')}>
              <View style={s.menuItemLeft}>
                <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                <Text style={s.menuItemText}>Voir mes rendez-vous</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </Pressable>
            <Pressable style={s.menuItem} onPress={() => navigation.navigate('Search')}>
              <View style={s.menuItemLeft}>
                <Ionicons name="search-outline" size={20} color={colors.primary} />
                <Text style={s.menuItemText}>Prendre un rendez-vous</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </Pressable>
          </Card>

          {/* Paramètres */}
          <Card variant="elevated" style={s.section}>
            <Text style={s.sectionTitle}>Paramètres</Text>
            <Pressable style={s.menuItem}>
              <View style={s.menuItemLeft}>
                <Ionicons name="notifications-outline" size={20} color={colors.primary} />
                <Text style={s.menuItemText}>Notifications</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </Pressable>
            <Pressable style={s.menuItem}>
              <View style={s.menuItemLeft}>
                <Ionicons name="shield-outline" size={20} color={colors.primary} />
                <Text style={s.menuItemText}>Confidentialité</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </Pressable>
            <Pressable style={s.menuItem}>
              <View style={s.menuItemLeft}>
                <Ionicons name="help-circle-outline" size={20} color={colors.primary} />
                <Text style={s.menuItemText}>Aide</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </Pressable>
          </Card>

          {/* Déconnexion */}
          <View style={s.logoutContainer}>
            <Button
              title="Se déconnecter"
              variant="secondary"
              onPress={handleLogout}
              style={s.logoutButton}
            />
          </View>

          <View style={s.bottomSpacing} />
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  header: {
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center'
  },
  title: { 
    color: 'white', 
    fontSize: 18, 
    fontWeight: '700', 
    textAlign: 'center', 
    flex: 1 
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  profileCard: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    ...textStyles.h3,
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  userEmail: {
    ...textStyles.body,
    fontSize: 14,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...textStyles.h4,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  infoContent: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  infoLabel: {
    ...textStyles.caption,
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    ...textStyles.body,
    fontSize: 14,
    color: colors.textPrimary,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemText: {
    ...textStyles.body,
    fontSize: 14,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  logoutContainer: {
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  logoutButton: {
    marginTop: spacing.lg,
  },
  bottomSpacing: {
    height: spacing.xl,
  },
  // Styles pour l'état invité
  guestContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  guestTitle: {
    ...textStyles.h2,
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  guestSubtitle: {
    ...textStyles.body,
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  guestButton: {
    marginTop: spacing.lg,
  },
});
