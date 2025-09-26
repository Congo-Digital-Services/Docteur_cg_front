import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Pressable,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, textStyles } from '../../theme';
import HeaderGradient from '../../navigation/HeaderGradient';
import Card from '../../components/Card';

export default function PreferencesScreen({ navigation }) {
  const [notifications, setNotifications] = useState(true);
  const [emailReminders, setEmailReminders] = useState(true);
  const [smsReminders, setSmsReminders] = useState(false);
  const [locationServices, setLocationServices] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={s.container}>
      <HeaderGradient navigation={navigation} options={{ title: 'Mes préférences' }} back={true} />

      <Animated.View style={[
        s.content,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}>
        <ScrollView style={s.scrollView} showsVerticalScrollIndicator={false}>
          {/* Notifications */}
          <Card variant="elevated" style={s.section}>
            <View style={s.sectionHeader}>
              <Ionicons name="notifications" size={24} color={colors.primary} />
              <Text style={s.sectionTitle}>Notifications</Text>
            </View>
            <Text style={s.sectionDescription}>
              Gérez vos préférences de notifications pour rester informé de vos rendez-vous.
            </Text>
            
            <View style={s.preferenceList}>
              <View style={s.preferenceItem}>
                <View style={s.preferenceLeft}>
                  <Ionicons name="notifications-outline" size={20} color={colors.textSecondary} />
                  <View style={s.preferenceText}>
                    <Text style={s.preferenceTitle}>Notifications push</Text>
                    <Text style={s.preferenceSubtitle}>Recevoir des notifications sur votre appareil</Text>
                  </View>
                </View>
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  trackColor={{ false: colors.borderLight, true: colors.primaryLight }}
                  thumbColor={notifications ? colors.primary : colors.textTertiary}
                />
              </View>

              <View style={s.preferenceItem}>
                <View style={s.preferenceLeft}>
                  <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />
                  <View style={s.preferenceText}>
                    <Text style={s.preferenceTitle}>Rappels par email</Text>
                    <Text style={s.preferenceSubtitle}>Recevoir des rappels par email</Text>
                  </View>
                </View>
                <Switch
                  value={emailReminders}
                  onValueChange={setEmailReminders}
                  trackColor={{ false: colors.borderLight, true: colors.primaryLight }}
                  thumbColor={emailReminders ? colors.primary : colors.textTertiary}
                />
              </View>

              <View style={s.preferenceItem}>
                <View style={s.preferenceLeft}>
                  <Ionicons name="chatbubble-outline" size={20} color={colors.textSecondary} />
                  <View style={s.preferenceText}>
                    <Text style={s.preferenceTitle}>Rappels par SMS</Text>
                    <Text style={s.preferenceSubtitle}>Recevoir des rappels par SMS</Text>
                  </View>
                </View>
                <Switch
                  value={smsReminders}
                  onValueChange={setSmsReminders}
                  trackColor={{ false: colors.borderLight, true: colors.primaryLight }}
                  thumbColor={smsReminders ? colors.primary : colors.textTertiary}
                />
              </View>
            </View>
          </Card>

          {/* Services */}
          <Card variant="elevated" style={s.section}>
            <View style={s.sectionHeader}>
              <Ionicons name="settings" size={24} color={colors.primary} />
              <Text style={s.sectionTitle}>Services</Text>
            </View>
            <Text style={s.sectionDescription}>
              Configurez les services pour améliorer votre expérience.
            </Text>
            
            <View style={s.preferenceList}>
              <View style={s.preferenceItem}>
                <View style={s.preferenceLeft}>
                  <Ionicons name="location-outline" size={20} color={colors.textSecondary} />
                  <View style={s.preferenceText}>
                    <Text style={s.preferenceTitle}>Services de localisation</Text>
                    <Text style={s.preferenceSubtitle}>Trouver des médecins à proximité</Text>
                  </View>
                </View>
                <Switch
                  value={locationServices}
                  onValueChange={setLocationServices}
                  trackColor={{ false: colors.borderLight, true: colors.primaryLight }}
                  thumbColor={locationServices ? colors.primary : colors.textTertiary}
                />
              </View>

              <View style={s.preferenceItem}>
                <View style={s.preferenceLeft}>
                  <Ionicons name="moon-outline" size={20} color={colors.textSecondary} />
                  <View style={s.preferenceText}>
                    <Text style={s.preferenceTitle}>Mode sombre</Text>
                    <Text style={s.preferenceSubtitle}>Interface en mode sombre</Text>
                  </View>
                </View>
                <Switch
                  value={darkMode}
                  onValueChange={setDarkMode}
                  trackColor={{ false: colors.borderLight, true: colors.primaryLight }}
                  thumbColor={darkMode ? colors.primary : colors.textTertiary}
                />
              </View>
            </View>
          </Card>

          {/* Langue et région */}
          <Card variant="elevated" style={s.section}>
            <View style={s.sectionHeader}>
              <Ionicons name="language" size={24} color={colors.primary} />
              <Text style={s.sectionTitle}>Langue et région</Text>
            </View>
            <Text style={s.sectionDescription}>
              Personnalisez la langue et la région de l'application.
            </Text>
            
            <View style={s.preferenceList}>
              <Pressable style={s.preferenceItem}>
                <View style={s.preferenceLeft}>
                  <Ionicons name="chatbubble-outline" size={20} color={colors.textSecondary} />
                  <View style={s.preferenceText}>
                    <Text style={s.preferenceTitle}>Langue de l'application</Text>
                    <Text style={s.preferenceSubtitle}>Français (Congo)</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
              </Pressable>

              <Pressable style={s.preferenceItem}>
                <View style={s.preferenceLeft}>
                  <Ionicons name="globe-outline" size={20} color={colors.textSecondary} />
                  <View style={s.preferenceText}>
                    <Text style={s.preferenceTitle}>Région</Text>
                    <Text style={s.preferenceSubtitle}>Congo</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
              </Pressable>
            </View>
          </Card>

          {/* Compte */}
          <Card variant="elevated" style={s.section}>
            <View style={s.sectionHeader}>
              <Ionicons name="person" size={24} color={colors.primary} />
              <Text style={s.sectionTitle}>Compte</Text>
            </View>
            <Text style={s.sectionDescription}>
              Gérez les paramètres de votre compte.
            </Text>
            
            <View style={s.preferenceList}>
              <Pressable style={s.preferenceItem}>
                <View style={s.preferenceLeft}>
                  <Ionicons name="key-outline" size={20} color={colors.textSecondary} />
                  <View style={s.preferenceText}>
                    <Text style={s.preferenceTitle}>Changer le mot de passe</Text>
                    <Text style={s.preferenceSubtitle}>Modifier votre mot de passe</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
              </Pressable>

              <Pressable style={s.preferenceItem}>
                <View style={s.preferenceLeft}>
                  <Ionicons name="download-outline" size={20} color={colors.textSecondary} />
                  <View style={s.preferenceText}>
                    <Text style={s.preferenceTitle}>Exporter mes données</Text>
                    <Text style={s.preferenceSubtitle}>Télécharger vos données personnelles</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
              </Pressable>

              <Pressable style={s.preferenceItem}>
                <View style={s.preferenceLeft}>
                  <Ionicons name="trash-outline" size={20} color={colors.error} />
                  <View style={s.preferenceText}>
                    <Text style={[s.preferenceTitle, { color: colors.error }]}>Supprimer mon compte</Text>
                    <Text style={s.preferenceSubtitle}>Supprimer définitivement votre compte</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
              </Pressable>
            </View>
          </Card>

          <View style={s.bottomSpacing} />
        </ScrollView>
      </Animated.View>
    </View>
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
  scrollView: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...textStyles.h3,
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  sectionDescription: {
    ...textStyles.body,
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  preferenceList: {
    marginTop: spacing.sm,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  preferenceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  preferenceText: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  preferenceTitle: {
    ...textStyles.body,
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  preferenceSubtitle: {
    ...textStyles.body,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  bottomSpacing: {
    height: spacing.xl,
  },
});
