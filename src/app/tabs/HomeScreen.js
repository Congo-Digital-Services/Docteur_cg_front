// src/app/tabs/HomeScreen.jsx
import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Dimensions, Pressable, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { useThemeMode } from '../../theme/ThemeContext';
import { spacing } from '../../theme/spacing';
import colors from '../../theme/colors';   // ← palette centrale (aucune couleur en dur)
import { textStyles } from '../../theme/typography';
import useAuthStore from '../../stores/auth.store';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const { toggle, mode } = useThemeMode();
  const { token, simulateLogin, logout } = useAuthStore();

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(16)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const waveAnimation = useRef(new Animated.Value(0)).current;
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

  // Animation de couleur
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnimation, { toValue: 1, duration: 3000, useNativeDriver: false }),
        Animated.timing(waveAnimation, { toValue: 0, duration: 3000, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  // Animations pour le header collapsant
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [350, 60],
    extrapolate: 'clamp',
  });

  const heroContentOpacity = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const heroContentScale = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  const headerTopBarOpacity = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const gradientOpacity = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });


  return (
    <View style={s.container}>
      {/* HEADER FIXE COLLAPSANT */}
      <Animated.View style={[
        s.fixedHeader,
        { height: headerHeight }
      ]}>
        <View style={[
          s.hero,
          { backgroundColor: colors.primary }
        ]}>
          <Animated.View style={[
            StyleSheet.absoluteFillObject,
            { opacity: gradientOpacity }
          ]}>
            <LinearGradient
              colors={[colors.gradientStart, colors.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
          </Animated.View>
          <Animated.View style={[
            s.heroTopBar,
            { opacity: headerTopBarOpacity }
          ]}>
            {/* Ligne du haut : Logo + Titre + Bouton */}
            <View style={s.headerTopRow}>
              <View style={s.logoAndTitleContainer}>
                
                <Text style={s.headerTitle}>Docteur CG</Text>
              </View>
              {!token && (
                <Pressable onPress={() => navigation.navigate('Login')} style={s.connectButton}>
                  <Text style={s.connectButtonText}>Se connecter</Text>
                </Pressable>
              )}
            </View>
            
           
          </Animated.View>

          <Animated.View style={[
            s.heroContent,
            {
              opacity: heroContentOpacity,
              transform: [{ scale: heroContentScale }]
            }
          ]}>
            <View style={s.heroTextContainer}>
              <Text style={[s.heroTitle, { color: colors.textInverse }]}>
                Votre santé,{'\n'}notre <Text style={s.heroTitleAccent}>priorité</Text>
              </Text>
              <Text style={s.heroSubtitle}>
                Trouvez rapidement le professionnel de santé qu'il vous faut
              </Text>
            </View>
            
            <View style={s.heroImageContainer}>
              <View style={s.medicalIcon}>
                <Image 
                  source={require('../../../assets/Logo/Fichier 4.png')} 
                  style={s.heroLogoImage}
                  resizeMode="contain"
                />
              </View>
            </View>
          </Animated.View>
        </View>
        
        {/* Courbe avec opacité */}
        <View style={[s.wave, { opacity: 1 }]}>
          <Svg viewBox="0 0 375 80" preserveAspectRatio="none">
            <Path
              d="M0,80 L0,0 Q187.5,70 375,0 L375,80 Z"
              fill={colors.primary}
            />
          </Svg>
        </View>
      </Animated.View>

      <ScrollView
        style={[s.scrollView, { backgroundColor: colors.background }]}
        contentContainerStyle={{ 
          paddingBottom: spacing.section,
          paddingTop: 350 // Espace pour le header fixe
        }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        bounces={true}
        nestedScrollEnabled={true}
        removeClippedSubviews={false}
      >

      <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>
        {/* CARTE PRINCIPALE MODERNE */}
        <View style={s.mainContentContainer}>
          <ModernInfoCard
            title="Trouvez le professionnel de santé qu'il vous faut"
            subtitle="Plus de 500 médecins disponibles dans toute la République du Congo"
            onPress={() => navigation.navigate('Search')}
          />

          {/* SECTION AVANTAGES MODERNE */}
          <View style={s.advantagesSection}>
            <Text style={s.sectionTitle}>Pourquoi choisir Docteur CG ?</Text>
            <View style={s.advantagesGrid}>
              <AdvantageCard
                icon="shield-checkmark"
                title="Sécurisé"
                desc="Vos données sont protégées"
                color={colors.primary}
                bgColor={colors.primaryMuted}
              />
              <AdvantageCard
                icon="time"
                title="Rapide"
                desc="Réservation en quelques clics"
                color={colors.primary}
                bgColor={colors.primaryMuted}
              />
              <AdvantageCard
                icon="location"
                title="Partout"
                desc="Dans tout le Congo"
                color={colors.primary}
                bgColor={colors.primaryMuted}
              />
            </View>
          </View>
        </View>


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
              icon="location"
              title="Partout au Congo"
              desc="Trouvez des médecins dans toutes les régions de la République du Congo."
              color="#7C3AED"
              bgColor="#F3E8FF"
            />
          </Animated.View>
        </View>


      </Animated.View>
      </ScrollView>
    </View>
  );
}

/* —————— Nouveaux composants modernes —————— */

function ModernInfoCard({ title, subtitle, onPress }) {
  return (
    <Pressable onPress={onPress} style={s.modernInfoCard}>
      <View style={s.modernInfoContent}>
        <View style={s.modernInfoText}>
          <Text style={s.modernInfoTitle}>{title}</Text>
          <Text style={s.modernInfoSubtitle}>{subtitle}</Text>
        </View>
        <View style={s.modernInfoIcon}>
          <Ionicons name="arrow-forward" size={24} color={colors.primary} />
        </View>
      </View>
    </Pressable>
  );
}

function AdvantageCard({ icon, title, desc, color, bgColor }) {
  return (
    <View style={s.advantageCard}>
      <View style={[s.advantageIcon, { backgroundColor: bgColor }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={s.advantageTitle}>{title}</Text>
      <Text style={s.advantageDesc}>{desc}</Text>
    </View>
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

  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  // Hero section moderne
  heroContainer: {
    position: 'relative',
  },
  hero: {
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xxxl,
    paddingHorizontal: spacing.lg,
    height: '100%',
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  heroTextContainer: {
    flex: 1,
    paddingRight: spacing.md,
  },
  heroImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  medicalIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  heroLogoImage: {
    width: 50,
    height: 50,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    lineHeight: 22,
    marginTop: spacing.sm,
    fontWeight: '400',
  },
  
  wave: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 80,
  },
  mainContentContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  advantagesSection: {
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  advantagesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  heroTopBar: {
    marginBottom: spacing.lg,
    paddingTop: spacing.xl,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  headerBottomRow: {
    alignItems: 'center',
  },
  logoAndTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerLogo: {
    width: 32,
    height: 32,
    marginRight: spacing.sm,
  },
  connectButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  connectButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
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
    minWidth: width * 0.6,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 25,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'white',
  },
  searchPillText: {
    ...textStyles.semibold,
    fontSize: 16,
    letterSpacing: 0.5,
  },

  // Carte info moderne
  modernInfoCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: 20,
    padding: spacing.lg,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  modernInfoContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modernInfoText: {
    flex: 1,
    paddingRight: spacing.md,
  },
  modernInfoTitle: {
    ...textStyles.bold,
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
    lineHeight: 24,
  },
  modernInfoSubtitle: {
    ...textStyles.body,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  modernInfoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Animation de couleur
  colorAnimationSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  colorAnimationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  colorBar: {
    width: 60,
    height: 4,
    borderRadius: 2,
  },

  // Section avantages
  advantagesSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  advantagesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  advantageCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  advantageIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  advantageTitle: {
    ...textStyles.semibold,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  advantageDesc: {
    ...textStyles.body,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },

  sectionTitle: {
    ...textStyles.bold,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: spacing.lg,
    letterSpacing: 0.5,
    color: colors.text,
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


  // Styles pour le logo et le bouton recherche
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 0.3,
    textAlign: 'center',
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
