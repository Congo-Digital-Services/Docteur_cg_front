import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, textStyles } from '../../theme';
import HeaderGradient from '../../navigation/HeaderGradient';
import Card from '../../components/Card';

export default function PrivacyScreen({ navigation }) {
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
      <HeaderGradient navigation={navigation} options={{ title: 'Confidentialité' }} back={true} />

      <Animated.View style={[
        s.content,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}>
        <ScrollView style={s.scrollView} showsVerticalScrollIndicator={false}>
          {/* Protection des données */}
          <Card variant="elevated" style={s.section}>
            <View style={s.sectionHeader}>
              <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
              <Text style={s.sectionTitle}>Protection de vos données</Text>
            </View>
            <Text style={s.sectionDescription}>
              Docteur CG s'engage à protéger vos données personnelles et médicales selon les standards les plus élevés de sécurité.
            </Text>
          </Card>

          {/* Collecte des données */}
          <Card variant="elevated" style={s.section}>
            <View style={s.sectionHeader}>
              <Ionicons name="document-text" size={24} color={colors.primary} />
              <Text style={s.sectionTitle}>Collecte des données</Text>
            </View>
            <Text style={s.sectionDescription}>
              Nous collectons uniquement les données nécessaires pour vous fournir nos services de prise de rendez-vous médicaux.
            </Text>
            
            <View style={s.dataList}>
              <View style={s.dataItem}>
                <Ionicons name="person" size={16} color={colors.textSecondary} />
                <Text style={s.dataText}>Informations personnelles (nom, prénom, date de naissance)</Text>
              </View>
              <View style={s.dataItem}>
                <Ionicons name="mail" size={16} color={colors.textSecondary} />
                <Text style={s.dataText}>Coordonnées de contact (email, téléphone)</Text>
              </View>
              <View style={s.dataItem}>
                <Ionicons name="calendar" size={16} color={colors.textSecondary} />
                <Text style={s.dataText}>Historique des rendez-vous</Text>
              </View>
              <View style={s.dataItem}>
                <Ionicons name="location" size={16} color={colors.textSecondary} />
                <Text style={s.dataText}>Localisation (pour trouver des médecins à proximité)</Text>
              </View>
            </View>
          </Card>

          {/* Utilisation des données */}
          <Card variant="elevated" style={s.section}>
            <View style={s.sectionHeader}>
              <Ionicons name="settings" size={24} color={colors.primary} />
              <Text style={s.sectionTitle}>Utilisation des données</Text>
            </View>
            <Text style={s.sectionDescription}>
              Vos données sont utilisées exclusivement pour :
            </Text>
            
            <View style={s.usageList}>
              <View style={s.usageItem}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Text style={s.usageText}>Faciliter la prise de rendez-vous</Text>
              </View>
              <View style={s.usageItem}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Text style={s.usageText}>Vous envoyer des rappels de rendez-vous</Text>
              </View>
              <View style={s.usageItem}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Text style={s.usageText}>Améliorer nos services</Text>
              </View>
              <View style={s.usageItem}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Text style={s.usageText}>Respecter nos obligations légales</Text>
              </View>
            </View>
          </Card>

          {/* Partage des données */}
          <Card variant="elevated" style={s.section}>
            <View style={s.sectionHeader}>
              <Ionicons name="people" size={24} color={colors.primary} />
              <Text style={s.sectionTitle}>Partage des données</Text>
            </View>
            <Text style={s.sectionDescription}>
              Nous ne partageons vos données qu'avec :
            </Text>
            
            <View style={s.shareList}>
              <View style={s.shareItem}>
                <Ionicons name="medical" size={16} color={colors.primary} />
                <Text style={s.shareText}>Les professionnels de santé que vous consultez</Text>
              </View>
              <View style={s.shareItem}>
                <Ionicons name="shield" size={16} color={colors.primary} />
                <Text style={s.shareText}>Nos prestataires techniques (sous contrat de confidentialité)</Text>
              </View>
              <View style={s.shareItem}>
                <Ionicons name="gavel" size={16} color={colors.primary} />
                <Text style={s.shareText}>Les autorités compétentes (si requis par la loi)</Text>
              </View>
            </View>
          </Card>

          {/* Vos droits */}
          <Card variant="elevated" style={s.section}>
            <View style={s.sectionHeader}>
              <Ionicons name="hand-right" size={24} color={colors.primary} />
              <Text style={s.sectionTitle}>Vos droits</Text>
            </View>
            <Text style={s.sectionDescription}>
              Conformément à la réglementation en vigueur au Congo, vous disposez des droits suivants :
            </Text>
            
            <View style={s.rightsList}>
              <Pressable style={s.rightItem}>
                <Ionicons name="eye" size={16} color={colors.primary} />
                <Text style={s.rightText}>Droit d'accès à vos données</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
              </Pressable>
              <Pressable style={s.rightItem}>
                <Ionicons name="create" size={16} color={colors.primary} />
                <Text style={s.rightText}>Droit de rectification</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
              </Pressable>
              <Pressable style={s.rightItem}>
                <Ionicons name="trash" size={16} color={colors.primary} />
                <Text style={s.rightText}>Droit de suppression</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
              </Pressable>
              <Pressable style={s.rightItem}>
                <Ionicons name="download" size={16} color={colors.primary} />
                <Text style={s.rightText}>Droit de portabilité</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
              </Pressable>
            </View>
          </Card>

          {/* Contact */}
          <Card variant="elevated" style={s.section}>
            <View style={s.sectionHeader}>
              <Ionicons name="mail" size={24} color={colors.primary} />
              <Text style={s.sectionTitle}>Contact</Text>
            </View>
            <Text style={s.sectionDescription}>
              Pour toute question concernant la protection de vos données, contactez notre délégué à la protection des données :
            </Text>
            
            <View style={s.contactInfo}>
              <View style={s.contactItem}>
                <Ionicons name="mail" size={16} color={colors.textSecondary} />
                <Text style={s.contactText}>privacy@docteurcg.cg</Text>
              </View>
              <View style={s.contactItem}>
                <Ionicons name="call" size={16} color={colors.textSecondary} />
                <Text style={s.contactText}>+242 06 123 45 67</Text>
              </View>
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
  dataList: {
    marginTop: spacing.sm,
  },
  dataItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  dataText: {
    ...textStyles.body,
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    flex: 1,
    lineHeight: 20,
  },
  usageList: {
    marginTop: spacing.sm,
  },
  usageItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  usageText: {
    ...textStyles.body,
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    flex: 1,
    lineHeight: 20,
  },
  shareList: {
    marginTop: spacing.sm,
  },
  shareItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  shareText: {
    ...textStyles.body,
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    flex: 1,
    lineHeight: 20,
  },
  rightsList: {
    marginTop: spacing.sm,
  },
  rightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  rightText: {
    ...textStyles.body,
    fontSize: 14,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  contactInfo: {
    marginTop: spacing.sm,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  contactText: {
    ...textStyles.body,
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  bottomSpacing: {
    height: spacing.xl,
  },
});
