import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '../../components/Button';
import Card from '../../components/Card';
import { colors, spacing, radius, textStyles } from '../../theme';

export default function DoctorDetailsScreen({ navigation, route }) {
  const { doctor } = route.params;
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
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

  const handleBookAppointment = () => {
    navigation.navigate('Booking', { doctor });
  };

  return (
    <SafeAreaView style={s.container}>
      <ScrollView style={s.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View style={[
          s.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}>

          {/* Doctor Info Card moderne */}
          <View style={s.doctorCard}>
            <View style={s.doctorHeader}>
              <View style={s.doctorAvatar}>
                <Ionicons name="medical" size={32} color={colors.primary} />
              </View>
              <View style={s.doctorInfo}>
                <Text style={s.doctorName}>{doctor.title} {doctor.lastName}</Text>
                <Text style={s.doctorSpecialty}>{doctor.specialty}</Text>
                <View style={s.doctorRating}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text style={s.ratingText}>4.8</Text>
                  <Text style={s.reviewCount}>(127 avis)</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Info Cards modernes */}
          <View style={s.infoCards}>
            {/* Location Card */}
            <View style={s.infoCard}>
              <View style={s.cardHeader}>
                <View style={s.cardIcon}>
                  <Ionicons name="location" size={20} color={colors.primary} />
                </View>
                <Text style={s.cardTitle}>Localisation</Text>
              </View>
              <Text style={s.cardContent}>{doctor.city}</Text>
            </View>

            {/* Specialties Card */}
            <View style={s.infoCard}>
              <View style={s.cardHeader}>
                <View style={s.cardIcon}>
                  <Ionicons name="medical" size={20} color={colors.primary} />
                </View>
                <Text style={s.cardTitle}>Spécialité</Text>
              </View>
              <View style={s.specialtyTag}>
                <Text style={s.specialtyText}>{doctor.specialty}</Text>
              </View>
            </View>

            {/* Contact Card */}
            <View style={s.infoCard}>
              <View style={s.cardHeader}>
                <View style={s.cardIcon}>
                  <Ionicons name="call" size={20} color={colors.primary} />
                </View>
                <Text style={s.cardTitle}>Contact</Text>
              </View>
              <Text style={s.cardContent}>01 23 45 67 89</Text>
            </View>
          </View>

          {/* Book Appointment Button moderne */}
          <View style={s.bookButtonContainer}>
            <Button
              title="Prendre rendez-vous"
              onPress={handleBookAppointment}
              icon={<Ionicons name="calendar" size={20} color="white" />}
              style={s.bookButton}
            />
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  doctorCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  doctorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.xl,
  },
  doctorAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    ...textStyles.h2,
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  doctorSpecialty: {
    ...textStyles.h3,
    fontSize: 18,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  doctorRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    ...textStyles.body,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: spacing.sm,
  },
  reviewCount: {
    ...textStyles.bodySmall,
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  infoCards: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  cardTitle: {
    ...textStyles.h3,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  cardContent: {
    ...textStyles.body,
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  specialtyTag: {
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  specialtyText: {
    ...textStyles.body,
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  bookButtonContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  bookButton: {
    borderRadius: 16,
    paddingVertical: spacing.lg,
  },
});