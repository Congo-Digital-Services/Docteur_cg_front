import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { useThemeMode } from '../../theme/ThemeContext';
import { spacing } from '../../theme/spacing';
import colors from '../../theme/colors';
import { textStyles } from '../../theme/typography';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const { toggle, mode } = useThemeMode();
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const cardAnimations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0)
  ]).current;

  useEffect(() => {
    // Animation principale
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

    // Animations des cartes avec délai
    cardAnimations.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 500,
        delay: 200 + (index * 100),
        useNativeDriver: true,
      }).start();
    });
  }, []);

  const quickActions = [
    {
      title: 'Rechercher un médecin',
      subtitle: 'Trouvez le professionnel de santé adapté',
      icon: 'search',
      color: colors.primary,
      onPress: () => navigation.navigate('Search'),
    },
    {
      title: 'Mes rendez-vous',
      subtitle: 'Consultez vos prochains RDV',
      icon: 'calendar',
      color: colors.success,
      onPress: () => navigation.navigate('Appointments'),
    },
    {
      title: 'Urgences',
      subtitle: 'Contactez les services d\'urgence',
      icon: 'call',
      color: colors.error,
      onPress: () => {
        // TODO: Implémenter la fonctionnalité d'urgence
        console.log('Urgences');
      },
    },
  ];

  return (
    <ScrollView 
      style={s.container}
      contentContainerStyle={s.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View style={[
        s.content,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}>
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>Bonjour 👋</Text>
            <Text style={s.title}>Comment pouvons-nous vous aider ?</Text>
          </View>
          <Button
            title=""
            variant="tertiary"
            onPress={toggle}
            icon={<Ionicons 
              name={mode === 'dark' ? 'sunny' : 'moon'} 
              size={20} 
              color={colors.textSecondary} 
            />}
            style={s.themeButton}
          />
        </View>

        {/* Quick Actions */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Actions rapides</Text>
          <View style={s.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <Animated.View
                key={action.title}
                style={[
                  s.cardContainer,
                  {
                    opacity: cardAnimations[index],
                    transform: [{
                      translateY: cardAnimations[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      })
                    }]
                  }
                ]}
              >
                <Card
                  onPress={action.onPress}
                  style={s.actionCard}
                  elevation="low"
                >
                  <View style={[s.iconContainer, { backgroundColor: action.color + '20' }]}>
                    <Ionicons name={action.icon} size={24} color={action.color} />
                  </View>
                  <Text style={s.actionTitle}>{action.title}</Text>
                  <Text style={s.actionSubtitle}>{action.subtitle}</Text>
                </Card>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* Stats Card */}
        <Animated.View style={[
          s.statsContainer,
          {
            opacity: cardAnimations[2],
            transform: [{
              translateY: cardAnimations[2].interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              })
            }]
          }
        ]}>
          <Card variant="filled" style={s.statsCard}>
            <View style={s.statsHeader}>
              <Ionicons name="trending-up" size={20} color={colors.success} />
              <Text style={s.statsTitle}>Votre activité</Text>
            </View>
            <View style={s.statsGrid}>
              <View style={s.statItem}>
                <Text style={s.statNumber}>3</Text>
                <Text style={s.statLabel}>RDV ce mois</Text>
              </View>
              <View style={s.statItem}>
                <Text style={s.statNumber}>12</Text>
                <Text style={s.statLabel}>Médecins consultés</Text>
              </View>
              <View style={s.statItem}>
                <Text style={s.statNumber}>98%</Text>
                <Text style={s.statLabel}>Satisfaction</Text>
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* CTA Section */}
        <View style={s.ctaSection}>
          <Card variant="outlined" style={s.ctaCard}>
            <View style={s.ctaContent}>
              <View style={s.ctaIconContainer}>
                <Ionicons name="medical" size={32} color={colors.primary} />
              </View>
              <View style={s.ctaText}>
                <Text style={s.ctaTitle}>Besoin d'aide ?</Text>
                <Text style={s.ctaSubtitle}>
                  Notre équipe est là pour vous accompagner dans vos démarches médicales.
                </Text>
              </View>
            </View>
            <Button
              title="Nous contacter"
              variant="secondary"
              onPress={() => {
                // TODO: Implémenter le contact
                console.log('Contact');
              }}
              style={s.ctaButton}
            />
          </Card>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: spacing.section,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.section,
  },
  greeting: {
    ...textStyles.h2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  title: {
    ...textStyles.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  themeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.backgroundSecondary,
    minHeight: 44,
    paddingHorizontal: 0,
  },
  section: {
    marginBottom: spacing.section,
  },
  sectionTitle: {
    ...textStyles.h3,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardContainer: {
    width: (width - spacing.lg * 2 - spacing.md) / 2,
    marginBottom: spacing.md,
  },
  actionCard: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  actionTitle: {
    ...textStyles.body,
    color: colors.text,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  actionSubtitle: {
    ...textStyles.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  statsContainer: {
    marginBottom: spacing.section,
  },
  statsCard: {
    paddingVertical: spacing.lg,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  statsTitle: {
    ...textStyles.h3,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...textStyles.h2,
    color: colors.primary,
    fontWeight: '700',
  },
  statLabel: {
    ...textStyles.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  ctaSection: {
    marginBottom: spacing.lg,
  },
  ctaCard: {
    paddingVertical: spacing.lg,
  },
  ctaContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  ctaIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  ctaText: {
    flex: 1,
  },
  ctaTitle: {
    ...textStyles.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  ctaSubtitle: {
    ...textStyles.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  ctaButton: {
    marginTop: 0,
  },
});
