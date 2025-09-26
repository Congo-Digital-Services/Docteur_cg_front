import React, { useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from './Card';
import colors from '../theme/colors';
import { spacing } from '../theme/spacing';
import { textStyles } from '../theme/typography';

export default function DoctorCard({ doctor, distanceKm, onPress }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const getSpecialtyIcon = (specialty) => {
    const iconMap = {
      'Médecin généraliste': 'medical',
      'Dermatologue': 'body',
      'Dentiste': 'tooth',
      'Pédiatre': 'people',
      'Cardiologue': 'heart',
      'Gynécologue': 'female',
      'Ophtalmologue': 'eye',
      'ORL': 'ear',
      'Kinésithérapeute': 'fitness',
      'Psychologue': 'brain',
    };
    return iconMap[specialty] || 'medical';
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Card
        onPress={onPress}
        style={s.card}
        elevation="low"
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={s.header}>
          <View style={s.iconContainer}>
            <Ionicons 
              name={getSpecialtyIcon(doctor.specialty)} 
              size={20} 
              color={colors.primary} 
            />
          </View>
          <View style={s.info}>
            <Text style={s.name}>{doctor.title} {doctor.lastName}</Text>
            <Text style={s.specialty}>{doctor.specialty}</Text>
          </View>
          {distanceKm !== null && (
            <View style={s.distanceContainer}>
              <Ionicons name="location" size={14} color={colors.textTertiary} />
              <Text style={s.distance}>{distanceKm.toFixed(1)} km</Text>
            </View>
          )}
        </View>
        
        <View style={s.footer}>
          <View style={s.locationContainer}>
            <Ionicons name="location-outline" size={16} color={colors.textTertiary} />
            <Text style={s.location}>{doctor.district}, {doctor.city}</Text>
          </View>
          <View style={s.ratingContainer}>
            <Ionicons name="star" size={14} color={colors.warning} />
            <Text style={s.rating}>4.8</Text>
          </View>
        </View>
      </Card>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  info: {
    flex: 1,
  },
  name: {
    ...textStyles.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  specialty: {
    ...textStyles.caption,
    color: colors.textSecondary,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  distance: {
    ...textStyles.caption,
    color: colors.textTertiary,
    marginLeft: spacing.xs,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    ...textStyles.caption,
    color: colors.textTertiary,
    marginLeft: spacing.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    ...textStyles.caption,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
    fontWeight: '500',
  },
});
