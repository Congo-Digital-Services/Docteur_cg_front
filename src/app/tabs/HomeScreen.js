// src/app/tabs/HomeScreen.jsx
import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Dimensions, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useThemeMode } from '../../theme/ThemeContext';
import { spacing } from '../../theme/spacing';
import colors from '../../theme/colors';   // ← palette centrale (aucune couleur en dur)
import { textStyles } from '../../theme/typography';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const { toggle, mode } = useThemeMode();

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(16)).current;
  const cardAnimations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0)
  ]).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();

    // Animations échelonnées des cartes
    cardAnimations.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 500,
        delay: 200 + (index * 100),
        useNativeDriver: true,
      }).start();
    });
  }, []);

  return (
    <ScrollView
      style={[s.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: spacing.section }}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER HERO */}
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.hero}
      >
        <View style={s.heroTopBar}>
          <View style={s.logoContainer}>
            <Text style={s.logoText}>Docteur CG</Text>
          </View>
          <Pressable onPress={() => navigation.navigate('Login')}>
            <Text style={[s.linkLight, textStyles.medium]}>Se connecter</Text>
          </Pressable>
        </View>

        <Text style={[s.heroTitle, { color: colors.textInverse }]}>
          Vivez{'\n'}en <Text style={s.heroTitleAccent}>meilleure santé</Text>
        </Text>

        {/* Barre "Rechercher" (pill) */}
        <Pressable onPress={() => navigation.navigate('Search')} style={s.searchPill}>
          <Ionicons name="search" size={18} color={colors.primary} />
          <Text style={[s.searchPillText, { color: colors.primary }]}>RECHERCHER</Text>
        </Pressable>
      </LinearGradient>

      <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>
        {/* CARTE INFO */}
        <InfoCard
          title="Besoin d'un rendez-vous médical ? Trouvez le professionnel de santé adapté à vos besoins"
          onPress={() => navigation.navigate('Search')}
        />

        {/* CTA soignant */}
        <Pressable onPress={() => {}} style={[s.ctaDark, { backgroundColor: colors.ctaDark }]}>
          <Text style={[s.ctaDarkText, textStyles.semibold]}>{`Vous êtes soignant ?`}</Text>
        </Pressable>

        {/* SECTION AVANTAGES */}
        <Text style={[s.sectionTitle, { color: colors.text }]}>Votre compagnon de santé au quotidien</Text>

        <View style={s.featuresContainer}>
          <Animated.View style={[
            { opacity: cardAnimations[0], transform: [{ translateY: cardAnimations[0].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }
          ]}>
            <FeatureCard
              icon="calendar"
              title="Accédez aux soins plus facilement"
              desc="Réservez des consultations en présentiel et recevez des rappels pour ne jamais les manquer."
              color="#1E40AF"
              bgColor="#DBEAFE"
            />
          </Animated.View>
          <Animated.View style={[
            { opacity: cardAnimations[1], transform: [{ translateY: cardAnimations[1].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }
          ]}>
            <FeatureCard
              icon="shield-checkmark"
              title="Sécurité et confidentialité"
              desc="Vos données médicales sont protégées et sécurisées selon les normes les plus strictes."
              color="#059669"
              bgColor="#D1FAE5"
            />
          </Animated.View>
          <Animated.View style={[
            { opacity: cardAnimations[2], transform: [{ translateY: cardAnimations[2].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }
          ]}>
            <FeatureCard
              icon="time"
              title="Disponibilité 24h/24"
              desc="Recherchez et réservez vos rendez-vous à tout moment, même en dehors des heures d'ouverture."
              color="#DC2626"
              bgColor="#FEE2E2"
            />
          </Animated.View>
        </View>

        {/* Actions rapides colorées */}
        <View style={s.quickRow}>
          <QuickActionColor
            icon="search"
            label="Rechercher"
            color="#1E40AF"
            bgColor="#DBEAFE"
            onPress={() => navigation.navigate('Search')}
          />
          <QuickActionColor
            icon="calendar"
            label="Rendez-vous"
            color="#059669"
            bgColor="#D1FAE5"
            onPress={() => navigation.navigate('Appointments')}
          />
          <QuickActionColor
            icon="call"
            label="Urgences"
            color="#DC2626"
            bgColor="#FEE2E2"
            onPress={() => {}}
          />
        </View>

        {/* Section statistiques */}
        <StatsCard />
      </Animated.View>
    </ScrollView>
  );
}

/* —————— Sub-components (simples, réutilisables) —————— */

function InfoCard({ title, onPress }) {
  return (
    <Pressable onPress={onPress} style={[s.card, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
      <View style={s.cardRow}>
        <View style={{ flex: 1, paddingRight: spacing.md }}>
          <Text style={[s.cardTitle, { color: colors.text }]}>{title}</Text>
        </View>
        <View style={[s.illust, { backgroundColor: colors.primaryMuted }]}>
          <Ionicons name="medical" size={28} color={colors.primary} />
        </View>
      </View>
    </Pressable>
  );
}

function FeatureItem({ icon, title, desc }) {
  return (
    <View style={s.featureItem}>
      <View style={[s.featureIconWrap, { backgroundColor: colors.primaryMuted }]}>
        <Ionicons name={icon} size={22} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[s.featureTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[s.featureDesc, { color: colors.textSecondary }]}>{desc}</Text>
      </View>
    </View>
  );
}

function FeatureCard({ icon, title, desc, color, bgColor }) {
  return (
    <View style={[s.featureCard, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
      <View style={s.featureCardContent}>
        <View style={[s.featureCardIcon, { backgroundColor: bgColor }]}>
          <Ionicons name={icon} size={28} color={color} />
        </View>
        <View style={s.featureCardText}>
          <Text style={[s.featureCardTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[s.featureCardDesc, { color: colors.textSecondary }]}>{desc}</Text>
        </View>
      </View>
    </View>
  );
}

function QuickActionColor({ icon, label, color, bgColor, onPress }) {
  return (
    <Pressable onPress={onPress} style={[s.quickItemColor, { backgroundColor: bgColor, shadowColor: colors.shadowLight }]}>
      <Ionicons name={icon} size={24} color={color} />
      <Text style={[s.quickLabelColor, { color: color }]}>{label}</Text>
    </Pressable>
  );
}

function StatsCard() {
  return (
    <View style={[s.statsCard, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
      <Text style={[s.statsTitle, { color: colors.text }]}>Nos chiffres</Text>
      <View style={s.statsGrid}>
        <View style={s.statItem}>
          <Text style={[s.statNumber, { color: '#1E40AF' }]}>500+</Text>
          <Text style={[s.statLabel, { color: colors.textSecondary }]}>Médecins</Text>
        </View>
        <View style={s.statItem}>
          <Text style={[s.statNumber, { color: '#059669' }]}>10K+</Text>
          <Text style={[s.statLabel, { color: colors.textSecondary }]}>Patients</Text>
        </View>
        <View style={s.statItem}>
          <Text style={[s.statNumber, { color: '#DC2626' }]}>98%</Text>
          <Text style={[s.statLabel, { color: colors.textSecondary }]}>Satisfaction</Text>
        </View>
      </View>
    </View>
  );
}

/* —————— Styles —————— */

const s = StyleSheet.create({
  container: { flex: 1 },

  hero: {
    paddingTop: spacing.xxxl, // Beaucoup plus d'espace en haut
    paddingBottom: spacing.xxxl, // Beaucoup plus d'espace en bas
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    minHeight: 200, // Hauteur minimale garantie
  },
  heroTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl, // Plus d'espace
    paddingVertical: spacing.md, // Plus d'espace vertical
  },
  roundBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkLight: { 
    color: colors.textInverse,
    fontSize: 16,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },

  heroTitle: {
    ...textStyles.bold,
    fontSize: 28,
    lineHeight: 34,
    textAlign: 'center',
    marginBottom: spacing.md,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  searchPill: {
    alignSelf: 'center',
    minWidth: width * 0.5,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    // Pas d'ombre pour un look plus clean
  },
  searchPillText: {
    ...textStyles.semibold,
    fontSize: 13,
    letterSpacing: 0.5,
  },

  card: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: 16,
    padding: spacing.md,
    // ombre légère
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: { 
    ...textStyles.semibold, 
    fontSize: 16, 
    lineHeight: 22,
    fontWeight: '600',
  },
  illust: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },

  ctaDark: {
    alignSelf: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 10,
    marginBottom: spacing.xl,
  },
  ctaDarkText: { color: colors.textInverse },

  sectionTitle: {
    ...textStyles.bold,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: spacing.lg,
    letterSpacing: 0.5,
  },

  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  featureIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: { 
    ...textStyles.semibold, 
    fontSize: 17, 
    fontWeight: '600',
    marginBottom: spacing.xs,
    letterSpacing: 0.3,
  },
  featureDesc: { 
    fontSize: 14, 
    lineHeight: 20,
    fontWeight: '400',
  },

  quickRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  quickItem: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: 16,
    minWidth: 92,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  quickLabel: { 
    ...textStyles.medium, 
    fontSize: 13, 
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 0.2,
  },

  // Styles pour les nouveaux composants colorés
  heroTitleAccent: {
    color: '#FFD700',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    fontWeight: '800',
  },

  featuresContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  featureCard: {
    marginBottom: spacing.md,
    borderRadius: 16,
    padding: spacing.lg,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  featureCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureCardIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  featureCardText: {
    flex: 1,
  },
  featureCardTitle: {
    ...textStyles.semibold,
    fontSize: 17,
    fontWeight: '600',
    marginBottom: spacing.xs,
    letterSpacing: 0.3,
  },
  featureCardDesc: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },

  quickItemColor: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: 16,
    minWidth: 92,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  quickLabelColor: {
    ...textStyles.medium,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.2,
  },

  statsCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: 16,
    padding: spacing.lg,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  statsTitle: {
    ...textStyles.bold,
    fontSize: 19,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.lg,
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...textStyles.bold,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: spacing.xs,
    letterSpacing: 0.2,
  },

  // Styles pour le logo et le bouton recherche
  logoContainer: {
    alignItems: 'center',
  },
  logoText: {
    fontSize: 22,
    fontWeight: '800',
    color: 'white',
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  searchPill: {
    alignSelf: 'center',
    minWidth: width * 0.5,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'white',
    // Pas d'ombre pour un look plus clean
  },
});
