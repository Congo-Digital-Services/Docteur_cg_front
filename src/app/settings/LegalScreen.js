import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../theme/colors';
import { textStyles } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export default function LegalScreen({ navigation }) {
  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <View style={s.header}>
        <Ionicons name="document-text" size={32} color={colors.primary} />
        <Text style={s.title}>Mentions légales</Text>
      </View>

      <View style={s.section}>
        <Text style={s.sectionTitle}>Éditeur du site</Text>
        <Text style={s.text}>
          Docteur CG est une application mobile développée pour faciliter la prise de rendez-vous médicaux en République du Congo.
        </Text>
      </View>

      <View style={s.section}>
        <Text style={s.sectionTitle}>Hébergement</Text>
        <Text style={s.text}>
          Les données de l'application sont hébergées de manière sécurisée conformément aux standards internationaux de protection des données.
        </Text>
      </View>

      <View style={s.section}>
        <Text style={s.sectionTitle}>Protection des données</Text>
        <Text style={s.text}>
          Nous nous engageons à protéger vos données personnelles conformément au RGPD et aux lois congolaises en vigueur.
        </Text>
      </View>

      <View style={s.section}>
        <Text style={s.sectionTitle}>Utilisation</Text>
        <Text style={s.text}>
          L'utilisation de cette application implique l'acceptation des présentes conditions d'utilisation.
        </Text>
      </View>

      <View style={s.section}>
        <Text style={s.sectionTitle}>Contact</Text>
        <Text style={s.text}>
          Pour toute question concernant les mentions légales, vous pouvez nous contacter via l'application.
        </Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingVertical: spacing.lg,
  },
  title: {
    ...textStyles.bold,
    fontSize: 24,
    color: colors.text,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  sectionTitle: {
    ...textStyles.semibold,
    fontSize: 18,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  text: {
    ...textStyles.body,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
