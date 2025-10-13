import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Pressable, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '../../components/Button';
import Card from '../../components/Card';
import { colors, spacing, radius, textStyles } from '../../theme';
import useBookingStore from '../../stores/booking.store';
import useAuthStore from '../../stores/auth.store';
import useDoctorStore from '../../stores/useDoctorStore';

export default function BookingScreen({ navigation, route }) {
  const { doctorId } = route.params || {};
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [bookingError, setBookingError] = useState(null);
  const { token } = useAuthStore();
  
  // CORRECTION: On lit les données du médecin depuis le bon store
  const { 
    selectedDoctor, 
    doctorLoading, 
    doctorError,
    getDoctorDetails 
  } = useDoctorStore();
  
  // On garde les fonctions de réservation depuis le booking store
  const { 
    selectDoctor,
    bookAppointment
  } = useBookingStore();
  
  // État local pour les créneaux générés
  const [generatedSlots, setGeneratedSlots] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  // CORRECTION: Utiliser useCallback pour stabiliser la fonction et éviter les boucles
  const initializeScreen = useCallback(() => {
    // On n'initialise que si on a un ID et que ce n'est pas déjà fait
    if (!doctorId || isInitialized) return;
    
    console.log("[BookingScreen] Initialisation avec doctorId:", doctorId);
    setIsInitialized(true);
    
    // Animation d'entrée
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
    
    // Charger les détails du médecin
    console.log("[BookingScreen] Chargement des détails du médecin...");
    getDoctorDetails(doctorId);
  }, [doctorId, isInitialized, getDoctorDetails]);

  // 1. useEffect pour déclencher l'initialisation une seule fois
  useEffect(() => {
    initializeScreen();
  }, [initializeScreen]);

  // 2. useEffect pour traiter les données une fois qu'elles sont disponibles
  useEffect(() => {
    if (selectedDoctor) {
      console.log("[BookingScreen] selectedDoctor est maintenant disponible, traitement des données...");
      
      // On place le médecin dans le store de réservation pour le processus
      selectDoctor(selectedDoctor);
      
      const openingHours = selectedDoctor.doctor?.openingHours || [];
      console.log("[BookingScreen] Heures d'ouverture trouvées:", openingHours);
      generateSlotsFromOpeningHours(openingHours);
    }
    // CORRECTION: On ne réinitialise plus les créneaux si selectedDoctor devient undefined
  }, [selectedDoctor, selectDoctor]);

  // Générer les créneaux à partir des heures d'ouverture
  const generateSlotsFromOpeningHours = (openingHours) => {
    console.log("[generateSlots] Début de la génération des créneaux avec:", openingHours);
    
    if (!openingHours || openingHours.length === 0) {
      console.log("[generateSlots] Aucune heure d'ouverture, aucun créneau généré.");
      setGeneratedSlots([]);
      return;
    }

    const daysOfWeek = {
      'MON': 'Lun', 'TUE': 'Mar', 'WED': 'Mer', 'THU': 'Jeu',
      'FRI': 'Ven', 'SAT': 'Sam', 'SUN': 'Dim'
    };

    const today = new Date();
    const slots = [];

    // Générer les créneaux pour les 7 prochains jours
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
      const dayNumber = date.getDate();
      const month = date.toLocaleDateString('fr-FR', { month: 'short' });
      
      // Trouver les heures d'ouverture pour ce jour
      const dayOpeningHours = openingHours.find(oh => oh.day === dayName);
      
      if (dayOpeningHours && !dayOpeningHours.isClosed) {
        console.log(`[generateSlots] Génération pour ${dayName}: ${dayOpeningHours.openHour} - ${dayOpeningHours.closeHour}`);
        
        // CORRECTION: Gérer correctement les heures décimales (ex: 17.5 = 17:30)
        const openHour = Math.floor(dayOpeningHours.openHour);
        const openMinute = (dayOpeningHours.openHour % 1) * 60;
        const closeHour = Math.floor(dayOpeningHours.closeHour);
        const closeMinute = (dayOpeningHours.closeHour % 1) * 60;
        
        // Convertir en minutes pour faciliter les calculs
        const openMinutes = openHour * 60 + openMinute;
        const closeMinutes = closeHour * 60 + closeMinute;
        
        // Générer des créneaux de 30 minutes
        for (let minutes = openMinutes; minutes < closeMinutes; minutes += 30) {
          const hours = Math.floor(minutes / 60);
          const mins = minutes % 60;
          const timeString = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
          
          slots.push({
            id: `${dayOpeningHours.id}-${minutes}`,
            date: date.toISOString().split('T')[0], // Format YYYY-MM-DD
            dayName: daysOfWeek[dayName] || dayName,
            dayNumber: dayNumber,
            month: month,
            time: timeString,
            timeMinutes: minutes,
            available: true
          });
        }
      } else {
        console.log(`[generateSlots] Pas d'heures d'ouverture ou fermé pour ${dayName}`);
      }
    }
    
    console.log("[generateSlots] Total des créneaux générés:", slots.length);
    setGeneratedSlots(slots);
  };

  // Grouper les créneaux par date
  const groupSlotsByDate = useCallback(() => {
    const groupedSlots = {};
    
    // CORRECTION: Vérifier que generatedSlots est bien un tableau
    if (!Array.isArray(generatedSlots) || generatedSlots.length === 0) {
      console.log("[groupSlotsByDate] Aucun créneau à grouper");
      return [];
    }
    
    generatedSlots.forEach(slot => {
      // CORRECTION: Vérifier que slot et slot.date existent pour éviter l'erreur
      if (!slot || !slot.date) {
        console.error("[groupSlotsByDate] Créneau invalide:", slot);
        return;
      }
      
      if (!groupedSlots[slot.date]) {
        groupedSlots[slot.date] = {
          date: slot.date,
          dayName: slot.dayName,
          dayNumber: slot.dayNumber,
          month: slot.month,
          slots: []
        };
      }
      groupedSlots[slot.date].slots.push(slot);
    });
    
    const grouped = Object.values(groupedSlots);
    console.log("[groupSlotsByDate] Créneaux groupés par date:", grouped);
    return grouped;
  }, [generatedSlots]);

  // CORRECTION: Utiliser useMemo pour optimiser le calcul et éviter les rendus inutiles
  const groupedSlots = useMemo(() => groupSlotsByDate(), [groupSlotsByDate]);

  const handleLoginPress = () => {
    navigation.navigate('Auth', { screen: 'Login' });
  };

  // CORRECTION: Corriger la sélection de date pour récupérer l'objet groupé
  const handleDateSelect = (date) => {
    console.log("[handleDateSelect] Date sélectionnée:", date);
    const selectedGroup = groupedSlots.find(g => g.date === date.date);
    setSelectedDate(selectedGroup || date);
    setSelectedTime(null); // Réinitialiser l'heure sélectionnée
  };

  const handleTimeSelect = (slot) => {
    console.log("[handleTimeSelect] Créneau sélectionné:", slot);
    setSelectedTime(slot);
  };

  const handleConfirmBooking = async () => {
    if (!selectedDate || !selectedTime || !selectedDoctor) {
      console.error("[handleConfirmBooking] Sélection incomplète:", { selectedDate, selectedTime, hasDoctor: !!selectedDoctor });
      return;
    }
    
    if (!token) {
      console.log("[handleConfirmBooking] Utilisateur non connecté, affichage de l'alerte.");
      Alert.alert(
        'Connexion requise',
        'Vous devez vous connecter pour confirmer votre rendez-vous.',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Se connecter', onPress: () => navigation.navigate('Auth', { screen: 'Login' }) },
        ]
      );
      return;
    }
    
    try {
      setBookingError(null);
      
      // CORRECTION: Utiliser selectedDate.date pour avoir la chaîne de caractères de la date
      const appointmentData = {
        doctorId: selectedDoctor.doctor?.id || doctorId,
        startsAt: new Date(`${selectedDate.date}T${selectedTime.time}:00`).toISOString(),
        endsAt: new Date(`${selectedDate.date}T${selectedTime.time}:00`).toISOString(), // À ajuster selon la durée du rdv
        status: 'PENDING'
      };
      
      console.log("[handleConfirmBooking] Données du rendez-vous à envoyer:", JSON.stringify(appointmentData, null, 2));
      
      const appointment = await bookAppointment(appointmentData);
      
      console.log("[handleConfirmBooking] Réponse de l'API après réservation:", appointment);
      
      Alert.alert(
        'Rendez-vous confirmé !',
        `Votre rendez-vous avec le Dr ${selectedDoctor.lastName || ''} est confirmé pour le ${selectedDate.dayName} ${selectedDate.dayNumber} ${selectedDate.month} à ${selectedTime.time}.`,
        [
          { 
            text: 'OK', 
            onPress: () => {
              navigation.navigate('AppointmentDetails', { appointmentId: appointment.id });
            }
          }
        ]
      );
    } catch (error) {
      console.error("[handleConfirmBooking] Erreur lors de la réservation:", error);
      setBookingError(error.message || "Une erreur est survenue lors de la réservation");
    }
  };

  // CORRECTION: Ajouter des vérifications dans les fonctions de rendu pour éviter les erreurs
  const renderDateItem = ({ item }) => {
    if (!item || !item.date) return null;
    
    return (
      <Pressable
        key={item.date}
        onPress={() => handleDateSelect(item)}
        style={[
          s.dateItem,
          selectedDate?.date === item.date && s.dateItemSelected,
        ]}
      >
        <Text style={[s.dateDay, selectedDate?.date === item.date && s.dateDaySelected]}>
          {item.dayName}
        </Text>
        <Text style={[s.dateNumber, selectedDate?.date === item.date && s.dateNumberSelected]}>
          {item.dayNumber}
        </Text>
        <Text style={[s.dateMonth, selectedDate?.date === item.date && s.dateMonthSelected]}>
          {item.month}
        </Text>
      </Pressable>
    );
  };

  // CORRECTION: Ajouter des vérifications supplémentaires dans renderTimeSlot
  const renderTimeSlot = ({ item }) => {
    if (!item || !item.id || !item.time) return null;
    
    return (
      <Pressable
        key={item.id}
        onPress={() => handleTimeSelect(item)}
        style={[
          s.timeSlot,
          selectedTime?.id === item.id && s.timeSlotSelected,
        ]}
      >
        <Text style={[s.timeText, selectedTime?.id === item.id && s.timeTextSelected]}>
          {item.time}
        </Text>
      </Pressable>
    );
  };

  // Affichage pendant le chargement
  if (doctorLoading) {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.loadingContainer}>
          <Text style={s.loadingText}>Chargement des détails du médecin...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Affichage en cas d'erreur
  if (doctorError) {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.errorContainer}>
          <Text style={s.errorText}>Erreur: {doctorError}</Text>
          <Button title="Réessayer" onPress={() => getDoctorDetails(doctorId)} />
        </View>
      </SafeAreaView>
    );
  }

  // CORRECTION: Assurez-vous que l'URL de l'API est définie
  const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://votre-api.com';

  return (
    <SafeAreaView style={s.container}>
      {/* Header avec navigation */}
      <View style={s.header}>
        <View style={s.headerTop}>
          <Pressable onPress={() => navigation.goBack()} style={s.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>
          <Text style={s.headerTitle}>Prendre rendez-vous</Text>
          <View style={s.headerActions}>
            <Pressable style={s.headerAction}>
              <Ionicons name="calendar-outline" size={24} color="white" />
            </Pressable>
          </View>
        </View>
      </View>

      <ScrollView style={s.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View style={[
          s.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}>
          {/* Doctor Summary */}
          {selectedDoctor && (
            <View style={s.doctorCard}>
              <View style={s.doctorSummary}>
                <View style={s.doctorAvatar}>
                  {selectedDoctor.doctor?.profileFilename ? (
                    <Image 
                      source={{ uri: `${API_URL}/uploads/${selectedDoctor.doctor.profileFilename}` }} 
                      style={s.doctorAvatarImage} 
                    />
                  ) : (
                    <Ionicons name="medical" size={32} color={colors.primary} />
                  )}
                </View>
                <View style={s.doctorInfo}>
                  <Text style={s.doctorName}>
                    {selectedDoctor.firstName} {selectedDoctor.lastName}
                  </Text>
                  <Text style={s.doctorSpecialty}>
                    {selectedDoctor.doctor?.specializations?.map(spec => spec.skill?.name).join(', ') || 'Médecin'}
                  </Text>
                  <View style={s.doctorLocation}>
                    <Ionicons name="location" size={16} color={colors.textSecondary} />
                    <Text style={s.doctorAddress}>
                      {selectedDoctor.doctor?.map_pin ? 
                        JSON.parse(selectedDoctor.doctor.map_pin).address || 'Adresse non spécifiée'
                        : 'Adresse non spécifiée'
                      }
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Date Selection */}
          <View style={s.dateCard}>
            <View style={s.sectionHeader}>
              <View style={s.sectionIcon}>
                <Ionicons name="calendar" size={20} color={colors.primary} />
              </View>
              <Text style={s.sectionTitle}>Choisir une date</Text>
            </View>
            {/* CORRECTION: Améliorer le rendu conditionnel pour éviter les appels vides */}
            {groupedSlots.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.datesContainer}>
                <View style={s.datesList}>
                  {groupedSlots.map(renderDateItem)}
                </View>
              </ScrollView>
            ) : (
              <View style={s.emptyContainer}>
                <Ionicons name="calendar-outline" size={48} color={colors.textTertiary} />
                <Text style={s.emptyTitle}>Aucun créneau disponible</Text>
                <Text style={s.emptySubtitle}>
                  Ce médecin n'a pas d'heures d'ouverture configurées
                </Text>
              </View>
            )}
          </View>

          {/* Time Selection */}
          {selectedDate && (
            <View style={s.timeCard}>
              <View style={s.sectionHeader}>
                <View style={s.sectionIcon}>
                  <Ionicons name="time" size={20} color={colors.primary} />
                </View>
                <Text style={s.sectionTitle}>Choisir un créneau</Text>
              </View>
              <View style={s.timeSlotsContainer}>
                {/* CORRECTION: Vérifier que selectedDate.slots existe bien avant de mapper */}
                {selectedDate.slots && selectedDate.slots.map(renderTimeSlot)}
              </View>
            </View>
          )}

          {/* Booking Summary */}
          {selectedDate && selectedTime && selectedDoctor && (
            <View style={s.summaryCard}>
              <View style={s.sectionHeader}>
                <View style={s.sectionIcon}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                </View>
                <Text style={s.sectionTitle}>Résumé du rendez-vous</Text>
              </View>
              <View style={s.summaryContent}>
                <View style={s.summaryItem}>
                  <Text style={s.summaryLabel}>Médecin</Text>
                  <Text style={s.summaryValue}>
                    Dr {selectedDoctor.firstName} {selectedDoctor.lastName}
                  </Text>
                </View>
                <View style={s.summaryItem}>
                  <Text style={s.summaryLabel}>Date</Text>
                  <Text style={s.summaryValue}>
                    {selectedDate.dayName} {selectedDate.dayNumber} {selectedDate.month}
                  </Text>
                </View>
                <View style={s.summaryItem}>
                  <Text style={s.summaryLabel}>Heure</Text>
                  <Text style={s.summaryValue}>{selectedTime.time}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Error Message */}
          {bookingError && (
            <View style={s.errorCard}>
              <Text style={s.errorText}>{bookingError}</Text>
            </View>
          )}

          {/* Guest Message */}
          {selectedDate && selectedTime && !token && (
            <View style={s.guestCard}>
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
            </View>
          )}

          {/* Confirm Button */}
          {selectedDate && selectedTime && selectedDoctor && (
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
    </SafeAreaView>
  );
}

// Stylesheet complet
const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...textStyles.body,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  errorText: {
    ...textStyles.body,
    color: colors.error,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  header: {
    backgroundColor: colors.primaryDeep,
    paddingTop: 50,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    ...textStyles.h3,
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: spacing.lg,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAction: {
    padding: spacing.sm,
    marginLeft: spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingBottom: spacing.xl,
  },
  doctorCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 16,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  doctorSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  doctorAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    overflow: 'hidden',
  },
  doctorAvatarImage: {
    width: '100%',
    height: '100%',
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
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 16,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  timeCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 16,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  summaryCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 16,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  errorCard: {
    backgroundColor: colors.errorMuted,
    borderRadius: 16,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.errorMuted,
    padding: spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    ...textStyles.h3,
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    ...textStyles.body,
    fontSize: 15,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: 22,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  sectionTitle: {
    ...textStyles.h3,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
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
    backgroundColor: colors.background,
    minWidth: 70,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  dateItemSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
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
  dateMonth: {
    ...textStyles.caption,
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  dateMonthSelected: {
    color: 'white',
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
    backgroundColor: colors.background,
    minWidth: 80,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  timeSlotSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
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
    backgroundColor: colors.primaryMuted,
    borderRadius: 16,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
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