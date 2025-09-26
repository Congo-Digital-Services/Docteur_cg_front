import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import Button from '../../components/Button';
import Card from '../../components/Card';
import { colors, spacing, radius, textStyles } from '../../theme';
import useBookingStore from '../../stores/booking.store';
import useAuthStore from '../../stores/auth.store';

export default function BookingScreen({ navigation, route }) {
  const { doctor } = route.params || {};
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const { token } = useAuthStore();
  
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

  // Générer les dates disponibles (7 prochains jours)
  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        date: date,
        day: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
        dayNumber: date.getDate(),
        month: date.toLocaleDateString('fr-FR', { month: 'short' }),
        available: Math.random() > 0.2, // 80% de chance d'être disponible
      });
    }
    return dates;
  };

  // Générer les créneaux horaires
  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 9;
    const endHour = 17;
    
    for (let hour = startHour; hour < endHour; hour++) {
      slots.push({
        time: `${hour.toString().padStart(2, '0')}:00`,
        available: Math.random() > 0.3, // 70% de chance d'être disponible
      });
      slots.push({
        time: `${hour.toString().padStart(2, '0')}:30`,
        available: Math.random() > 0.3,
      });
    }
    return slots;
  };

  const availableDates = generateAvailableDates();
  const timeSlots = generateTimeSlots();

  const handleLoginPress = () => {
    navigation.navigate('Auth', { screen: 'Login' });
  };

  const handleConfirmBooking = () => {
    if (!selectedDate || !selectedTime || !doctor) return;
    
    if (!token) {
      // Rediriger vers la connexion si pas connecté
      navigation.navigate('Auth', { screen: 'Login' });
      return;
    }
    
    // Navigation vers confirmation ou autre écran
    navigation.navigate('BookingConfirmation', {
      doctor,
      date: selectedDate,
      time: selectedTime,
    });
  };

  const renderDateItem = (dateInfo) => (
    <Pressable
      key={dateInfo.dayNumber}
      onPress={() => dateInfo.available && setSelectedDate(dateInfo)}
      style={[
        s.dateItem,
        selectedDate?.dayNumber === dateInfo.dayNumber && s.dateItemSelected,
        !dateInfo.available && s.dateItemDisabled,
      ]}
    >
      <Text style={[
        s.dateDay,
        selectedDate?.dayNumber === dateInfo.dayNumber && s.dateDaySelected,
        !dateInfo.available && s.dateDayDisabled,
      ]}>
        {dateInfo.day}
      </Text>
      <Text style={[
        s.dateNumber,
        selectedDate?.dayNumber === dateInfo.dayNumber && s.dateNumberSelected,
        !dateInfo.available && s.dateNumberDisabled,
      ]}>
        {dateInfo.dayNumber}
      </Text>
      <Text style={[
        s.dateMonth,
        selectedDate?.dayNumber === dateInfo.dayNumber && s.dateMonthSelected,
        !dateInfo.available && s.dateMonthDisabled,
      ]}>
        {dateInfo.month}
      </Text>
    </Pressable>
  );

  const renderTimeSlot = (slot) => (
    <Pressable
      key={slot.time}
      onPress={() => slot.available && setSelectedTime(slot)}
      style={[
        s.timeSlot,
        selectedTime?.time === slot.time && s.timeSlotSelected,
        !slot.available && s.timeSlotDisabled,
      ]}
    >
      <Text style={[
        s.timeText,
        selectedTime?.time === slot.time && s.timeTextSelected,
        !slot.available && s.timeTextDisabled,
      ]}>
        {slot.time}
      </Text>
    </Pressable>
  );

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
      <Animated.View style={[
        s.content,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}>
        {/* Doctor Summary */}
        {doctor && (
          <Card style={s.doctorCard} elevation="low">
            <View style={s.doctorSummary}>
              <View style={s.doctorAvatar}>
                <Ionicons name="medical" size={24} color={colors.primary} />
              </View>
              <View style={s.doctorInfo}>
                <Text style={s.doctorName}>{doctor.title} {doctor.lastName}</Text>
                <Text style={s.doctorSpecialty}>{doctor.specialty}</Text>
                <View style={s.doctorLocation}>
                  <Ionicons name="location" size={14} color={colors.textSecondary} />
                  <Text style={s.doctorAddress}>{doctor.city}</Text>
                </View>
              </View>
            </View>
          </Card>
        )}

        {/* Date Selection */}
        <Card style={s.dateCard} elevation="low">
          <View style={s.sectionHeader}>
            <Ionicons name="calendar" size={20} color={colors.primary} />
            <Text style={s.sectionTitle}>Choisir une date</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.datesContainer}>
            <View style={s.datesList}>
              {availableDates.map(renderDateItem)}
            </View>
          </ScrollView>
        </Card>

        {/* Time Selection */}
        {selectedDate && (
          <Card style={s.timeCard} elevation="low">
            <View style={s.sectionHeader}>
              <Ionicons name="time" size={20} color={colors.primary} />
              <Text style={s.sectionTitle}>Choisir un créneau</Text>
            </View>
            <View style={s.timeSlotsContainer}>
              {timeSlots.map(renderTimeSlot)}
            </View>
          </Card>
        )}

        {/* Booking Summary */}
        {selectedDate && selectedTime && doctor && (
          <Card style={s.summaryCard} elevation="low">
            <View style={s.sectionHeader}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={s.sectionTitle}>Résumé du rendez-vous</Text>
            </View>
            <View style={s.summaryContent}>
              <View style={s.summaryItem}>
                <Text style={s.summaryLabel}>Médecin</Text>
                <Text style={s.summaryValue}>{doctor.title} {doctor.lastName}</Text>
              </View>
              <View style={s.summaryItem}>
                <Text style={s.summaryLabel}>Date</Text>
                <Text style={s.summaryValue}>
                  {selectedDate.day} {selectedDate.dayNumber} {selectedDate.month}
                </Text>
              </View>
              <View style={s.summaryItem}>
                <Text style={s.summaryLabel}>Heure</Text>
                <Text style={s.summaryValue}>{selectedTime.time}</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Guest Message */}
        {selectedDate && selectedTime && !token && (
          <Card style={s.guestCard} elevation="low">
            <View style={s.guestContent}>
              <View style={s.guestIcon}>
                <Ionicons name="person-outline" size={32} color={colors.primary} />
              </View>
              <View style={s.guestInfo}>
                <Text style={s.guestTitle}>Connexion requise</Text>
                <Text style={s.guestSubtitle}>
                  Connectez-vous pour confirmer votre rendez-vous
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Confirm Button */}
        {selectedDate && selectedTime && doctor && (
          <View style={s.confirmButtonContainer}>
            <Button
              title={token ? "Confirmer le rendez-vous" : "Se connecter pour confirmer"}
              onPress={handleConfirmBooking}
              icon={<Ionicons name={token ? "checkmark" : "log-in"} size={20} color="white" />}
              style={s.confirmButton}
            />
          </View>
        )}
      </Animated.View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.section,
  },
  doctorCard: {
    marginBottom: spacing.lg,
    borderRadius: 16,
  },
  doctorSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  doctorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    ...textStyles.h3,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  doctorSpecialty: {
    ...textStyles.body,
    fontSize: 15,
    color: colors.primary,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  doctorLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  doctorAddress: {
    ...textStyles.bodySmall,
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  dateCard: {
    marginBottom: spacing.lg,
    borderRadius: 16,
  },
  timeCard: {
    marginBottom: spacing.lg,
    borderRadius: 16,
  },
  summaryCard: {
    marginBottom: spacing.lg,
    borderRadius: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  sectionTitle: {
    ...textStyles.h3,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginLeft: spacing.sm,
    letterSpacing: 0.3,
  },
  datesContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  datesList: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dateItem: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.backgroundSecondary,
    minWidth: 70,
  },
  dateItemSelected: {
    backgroundColor: colors.primary,
  },
  dateItemDisabled: {
    backgroundColor: colors.backgroundSecondary,
    opacity: 0.5,
  },
  dateDay: {
    ...textStyles.caption,
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  dateDaySelected: {
    color: 'white',
  },
  dateDayDisabled: {
    color: colors.textTertiary,
  },
  dateNumber: {
    ...textStyles.h3,
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  dateNumberSelected: {
    color: 'white',
  },
  dateNumberDisabled: {
    color: colors.textTertiary,
  },
  dateMonth: {
    ...textStyles.caption,
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  dateMonthSelected: {
    color: 'white',
  },
  dateMonthDisabled: {
    color: colors.textTertiary,
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  timeSlot: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.backgroundSecondary,
    minWidth: 80,
    alignItems: 'center',
  },
  timeSlotSelected: {
    backgroundColor: colors.primary,
  },
  timeSlotDisabled: {
    backgroundColor: colors.backgroundSecondary,
    opacity: 0.5,
  },
  timeText: {
    ...textStyles.body,
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  timeTextSelected: {
    color: 'white',
  },
  timeTextDisabled: {
    color: colors.textTertiary,
  },
  summaryContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    ...textStyles.body,
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  summaryValue: {
    ...textStyles.body,
    fontSize: 15,
    color: colors.text,
    fontWeight: '600',
  },
  confirmButtonContainer: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  confirmButton: {
    borderRadius: 16,
  },
  guestCard: {
    marginBottom: spacing.lg,
    borderRadius: 16,
    backgroundColor: colors.primaryMuted,
  },
  guestContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  guestIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  guestInfo: {
    flex: 1,
  },
  guestTitle: {
    ...textStyles.h3,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  guestSubtitle: {
    ...textStyles.bodySmall,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
