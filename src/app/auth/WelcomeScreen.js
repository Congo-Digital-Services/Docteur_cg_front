import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, StatusBar, Dimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Button from '../../components/Button';
import { t } from '../../i18n';
import { spacing } from '../../theme/spacing';
import colors from '../../theme/colors';
import { radius } from '../../theme/radius';
import { fontSizes, fontWeights } from '../../theme/typography';

const { height, width } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }) {
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;
  const logoScaleAnim = useRef(new Animated.Value(0.8)).current;
  const cardsAnim = useRef(new Animated.Value(0)).current;

  // Loading states
  const [loginLoading, setLoginLoading] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);

  useEffect(() => {
    // Animation d'entrée
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(logoScaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(cardsAnim, {
        toValue: 1,
        duration: 1000,
        delay: 400,
        useNativeDriver: true,
      }),
    ]).start();
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
      <StatusBar barStyle="light-content" backgroundColor="#1E40AF" />
      
      {/* Hero Section with Gradient */}
      <LinearGradient
        colors={['#1E40AF', '#3B82F6', '#60A5FA']}
        style={s.heroSection}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View 
          style={[
            s.heroContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideUpAnim }]
            }
          ]}
        >
          <Animated.View 
            style={[
              s.logoContainer,
              { transform: [{ scale: logoScaleAnim }] }
            ]}
          >
            <Text style={s.logoText}>DOKOTA</Text>
            <View style={s.logoAccent} />
          </Animated.View>
          
          <View style={s.heroText}>
            <Text style={s.heroTitle}>Votre santé,</Text>
            <Text style={s.heroTitleAccent}>simplifiée</Text>
          </View>
          
          <Text style={s.heroSubtitle}>
            Trouvez des médecins près de vous en quelques clics
          </Text>
        </Animated.View>
        
        {/* Simple Feature Points */}
        <Animated.View 
          style={[
            s.featuresContainer,
            {
              opacity: cardsAnim,
              transform: [{ translateY: Animated.multiply(cardsAnim, 20) }]
            }
          ]}
        >
          <View style={s.featureRow}>
            <View style={s.featureDot} />
            <Text style={s.featureText}>Prenez rendez-vous en quelques clics</Text>
          </View>
          <View style={s.featureRow}>
            <View style={s.featureDot} />
            <Text style={s.featureText}>Trouvez des médecins près de vous</Text>
          </View>
        </Animated.View>
      </LinearGradient>

      {/* Bottom Section */}
      <Animated.View 
        style={[
          s.bottomSection,
          {
            opacity: fadeAnim,
            transform: [{ translateY: Animated.multiply(slideUpAnim, -1) }]
          }
        ]}
      >
        <View style={s.buttonContainer}>
          <Button 
            title="Commencer maintenant" 
            onPress={handleLogin}
            loading={loginLoading}
            disabled={loginLoading || signupLoading || guestLoading}
            style={s.primaryButton}
          />
          <Button 
            title="J'ai déjà un compte" 
            variant="secondary" 
            onPress={handleSignup}
            loading={signupLoading}
            disabled={loginLoading || signupLoading || guestLoading}
            style={s.secondaryButton}
          />
          <Button 
            title="Explorer sans compte" 
            variant="tertiary"
            onPress={handleGuest}
            loading={guestLoading}
            disabled={loginLoading || signupLoading || guestLoading}
            style={s.tertiaryButton}
          />
        </View>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E40AF',
  },
  heroSection: {
    flex: 0.7,
    paddingTop: spacing.xl * 2,
    paddingHorizontal: spacing.xl,
    justifyContent: 'space-between',
  },
  heroContent: {
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl * 2,
    position: 'relative',
  },
  logoText: {
    fontSize: 36,
    fontWeight: '800',
    color: 'white',
    letterSpacing: 3,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  logoAccent: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 2,
    marginTop: spacing.sm,
  },
  heroText: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    lineHeight: 34,
  },
  heroTitleAccent: {
    fontSize: 28,
    fontWeight: '300',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
    fontWeight: '400',
  },
  featuresContainer: {
    alignItems: 'center',
    paddingBottom: spacing.xl,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.8)',
    marginRight: spacing.md,
  },
  featureText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '400',
  },
  bottomSection: {
    flex: 0.3,
    backgroundColor: 'white',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  primaryButton: {
    marginBottom: spacing.md,
    backgroundColor: '#1E40AF',
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    minHeight: 56,
  },
  secondaryButton: {
    marginBottom: spacing.md,
    backgroundColor: 'white',
    borderColor: '#E2E8F0',
    borderWidth: 2,
    minHeight: 56,
  },
  tertiaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    minHeight: 48,
  },
});
