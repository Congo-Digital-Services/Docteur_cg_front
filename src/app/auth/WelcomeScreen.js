import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, StatusBar, Dimensions, Animated, Platform, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/Button';
import { t } from '../../i18n';
import { spacing } from '../../theme/spacing';
import colors from '../../theme/colors';
import { radius } from '../../theme/radius';
import { textStyles } from '../../theme/typography';

const { height, width } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }) {
  // Animations fluides et progressives
  const headerFadeAnim = useRef(new Animated.Value(0)).current;
  const headerSlideAnim = useRef(new Animated.Value(-30)).current;
  const logoScaleAnim = useRef(new Animated.Value(0.7)).current;
  const titleFadeAnim = useRef(new Animated.Value(0)).current;
  const titleSlideAnim = useRef(new Animated.Value(20)).current;
  const subtitleFadeAnim = useRef(new Animated.Value(0)).current;
  const featuresFadeAnim = useRef(new Animated.Value(0)).current;
  const featuresSlideAnim = useRef(new Animated.Value(30)).current;
  const buttonsFadeAnim = useRef(new Animated.Value(0)).current;
  const buttonsSlideAnim = useRef(new Animated.Value(40)).current;

  // Loading states
  const [loginLoading, setLoginLoading] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);

  useEffect(() => {
    // Séquence d'animations fluides et progressives
    const animationSequence = Animated.sequence([
      // 1. Header et logo (0-600ms)
      Animated.parallel([
        Animated.timing(headerFadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(headerSlideAnim, {
          toValue: 0,
          tension: 80,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(logoScaleAnim, {
          toValue: 1,
          tension: 60,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      
      // 2. Titre et sous-titre (600-1000ms)
      Animated.parallel([
        Animated.timing(titleFadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(titleSlideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(subtitleFadeAnim, {
          toValue: 1,
          duration: 500,
          delay: 100,
          useNativeDriver: true,
        }),
      ]),
      
      // 3. Features (1000-1300ms)
      Animated.parallel([
        Animated.timing(featuresFadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(featuresSlideAnim, {
          toValue: 0,
          tension: 80,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      
      // 4. Boutons (1300-1600ms)
      Animated.parallel([
        Animated.timing(buttonsFadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(buttonsSlideAnim, {
          toValue: 0,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]);

    animationSequence.start();
  }, []);

  const handleLogin = async () => {
    setLoginLoading(true);
    // Simuler un délai de navigation
    setTimeout(() => {
      setLoginLoading(false);
      navigation.navigate('Login');
    }, 500);
  };

  const handleSignup = async () => {
    setSignupLoading(true);
    // Simuler un délai de navigation
    setTimeout(() => {
      setSignupLoading(false);
      navigation.navigate('Signup');
    }, 500);
  };

  const handleGuest = async () => {
    setGuestLoading(true);
    // Simuler un délai de navigation
    setTimeout(() => {
      setGuestLoading(false);
      navigation.replace('MainTabs');
    }, 500);
  };

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />
      
      {/* Section principale avec gradient - tout en un */}
      <LinearGradient
        colors={[colors.primaryDark, colors.primary, colors.primaryLight]}
        style={s.mainGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header Section - Positionné en haut dès le début */}
        <Animated.View 
          style={[
            s.headerSection,
            {
              opacity: headerFadeAnim,
              transform: [{ translateY: headerSlideAnim }]
            }
          ]}
        >
          {/* Logo avec animation de rotation subtile */}
          <Animated.View 
            style={[
              s.logoContainer,
              { 
                transform: [
                  { scale: logoScaleAnim }
                ]
              }
            ]}
          >
            <View style={s.logoIconContainer}>
              <Image 
                source={require('../../../assets/Logo/Fichier 4.png')} 
                style={s.logoImage}
                resizeMode="contain"
              />
            </View>
          </Animated.View>
          
          {/* Titre principal avec animation séparée */}
          <Animated.View 
            style={[
              s.titleContainer,
              {
                opacity: titleFadeAnim,
                transform: [{ translateY: titleSlideAnim }]
              }
            ]}
          >
            <Text style={s.mainTitle}>Bienvenue</Text>
            <Text style={s.subTitle}>Votre santé, simplifiée</Text>
          </Animated.View>
          
          {/* Sous-titre avec délai */}
          <Animated.View 
            style={[
              s.subtitleContainer,
              {
                opacity: subtitleFadeAnim,
              }
            ]}
          >
            <Text style={s.descriptionText}>
              Trouvez des médecins près de vous et prenez rendez-vous en quelques clics
            </Text>
          </Animated.View>
        </Animated.View>

        {/* Features Section - collé au header */}
        <Animated.View 
          style={[
            s.featuresSection,
            {
              opacity: featuresFadeAnim,
              transform: [{ translateY: featuresSlideAnim }]
            }
          ]}
        >
          <View style={s.featuresContainer}>
            <View style={s.featureItem}>
              <View style={s.featureIconContainer}>
                <Ionicons name="calendar" size={20} color="white" />
              </View>
              <Text style={s.featureText}>Prenez rendez-vous facilement</Text>
            </View>
            <View style={s.featureItem}>
              <View style={s.featureIconContainer}>
                <Ionicons name="location" size={20} color="white" />
              </View>
              <Text style={s.featureText}>Trouvez des médecins près de vous</Text>
            </View>
            <View style={s.featureItem}>
              <View style={s.featureIconContainer}>
                <Ionicons name="shield-checkmark" size={20} color="white" />
              </View>
              <Text style={s.featureText}>Sécurisé et fiable</Text>
            </View>
          </View>
        </Animated.View>
      </LinearGradient>

      {/* Bottom Section avec boutons - séparé pour être visible */}
      <Animated.View 
        style={[
          s.bottomSection,
          {
            opacity: buttonsFadeAnim,
            transform: [{ translateY: buttonsSlideAnim }]
          }
        ]}
      >
        <View style={s.buttonContainer}>
          <Button 
            title="Se connecter" 
            onPress={handleLogin}
            loading={loginLoading}
            disabled={loginLoading || signupLoading || guestLoading}
            size="large"
            fullWidth
            style={s.primaryButton}
            //icon={<Ionicons name="arrow-forward" size={20} color={colors.white} />}
          />
          <Button 
            title="S'inscrire" 
            variant="secondary" 
            onPress={handleSignup}
            loading={signupLoading}
            disabled={loginLoading || signupLoading || guestLoading}
            fullWidth
            style={s.secondaryButton}
            icon={<Ionicons name="log-in" size={20} color={colors.primary} />}
          />
          <Button 
            title="Explorer sans compte" 
            variant="tertiary"
            onPress={handleGuest}
            loading={guestLoading}
            disabled={loginLoading || signupLoading || guestLoading}
            fullWidth
            style={s.tertiaryButton}
            //icon={<Ionicons name="eye" size={20} color={colors.textSecondary} />}
          />
        </View>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  // Section principale avec gradient
  mainGradient: {
    flex: 3, // TRÈS grand
    justifyContent: 'flex-start', // Commence en haut
    height: '80%', // Force la hauteur à 80% de l'écran
  },
  
  // Header Section - Positionné en haut dès le début
  headerSection: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30, // Safe area pour iOS
    paddingHorizontal: 0, // Supprimé pour maximiser la largeur
    paddingBottom: spacing.xxxl, // Beaucoup plus d'espace en bas
    alignItems: 'center',
    width: '100%', // Prend toute la largeur
    height: '70%', // Force la hauteur à 70% de l'écran
    justifyContent: 'center', // Centre le contenu verticalement
  },
  
  // Logo avec icône
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl, // Plus d'espace
  },
  logoIconContainer: {
    width: 100, // Plus grand
    height: 100, // Plus grand
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg, // Plus d'espace
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoImage: {
    width: 60,
    height: 60,
  },
  logoText: {
    ...textStyles.hero,
    color: 'white',
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  logoAccent: {
    width: 50,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 2,
    marginTop: spacing.sm,
  },
  
  // Titre principal
  titleContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  mainTitle: {
    ...textStyles.h1,
    color: 'white',
    textAlign: 'center',
    marginBottom: spacing.xs,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subTitle: {
    ...textStyles.h2,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    fontWeight: '300',
  },
  
  // Description
  subtitleContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  descriptionText: {
    ...textStyles.body,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  
  // Features Section - collé au header, dans le gradient
  featuresSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  featuresContainer: {
    alignItems: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  featureText: {
    ...textStyles.body,
    color: 'white',
    flex: 1,
    fontWeight: '500',
  },
  
  // Bottom Section - séparé pour être visible
  bottomSection: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 40 : spacing.lg, // Safe area bottom
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonContainer: {
    gap: spacing.lg, // Plus d'espace entre les boutons
    paddingHorizontal: 0, // Supprimé pour maximiser la largeur
    width: '100%', // Prend toute la largeur disponible
  },
  primaryButton: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    paddingVertical: spacing.lg, // Plus de hauteur
    borderRadius: 16, // Coins plus arrondis
  },
  secondaryButton: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderWidth: 2,
    paddingVertical: spacing.lg, // Plus de hauteur
    borderRadius: 16, // Coins plus arrondis
  },
  tertiaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
});
