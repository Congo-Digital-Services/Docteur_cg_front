import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Pressable, Image, Alert, Dimensions, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

// Importer la bibliothèque de gestion de dates
import { format, addMinutes, parseISO } from 'date-fns';
// import { utcToZonedTime } from 'date-fns-tz';

import Button from '../../components/Button';
import { colors, spacing, radius, textStyles } from '../../theme';
import useDoctorStore from '../../stores/useDoctorStore';
import useBookingStore from '../../stores/booking.store';
import useAuthStore from '../../stores/auth.store';
import { useRoute, useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

export default function DoctorDetailsScreen({ navigation }) {
  const route = useRoute();
  const { doctorId } = route.params;

  // États pour la réservation
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [bookingError, setBookingError] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // État local pour les créneaux générés
  const [generatedSlots, setGeneratedSlots] = useState([]);

  // Authentification
  const { token } = useAuthStore();

  // Utilisation du store des médecins
  const {
    selectedDoctor,
    doctorLoading,
    doctorError,
    getDoctorDetails
  } = useDoctorStore();

  // Utilisation du store de réservation
  const {
    selectDoctor,
    bookAppointment
  } = useBookingStore();

  // Animations pour la page principale
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  // Initialisation de l'écran
  const initializeScreen = useCallback(() => {
    if (!doctorId || isInitialized) return;

    console.log("[DoctorDetailsScreen] Initialisation avec doctorId:", doctorId);
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
    getDoctorDetails(doctorId);
  }, [doctorId, isInitialized, getDoctorDetails]);

  useEffect(() => {
    initializeScreen();
  }, [initializeScreen]);

  useEffect(() => {
    if (selectedDoctor) {
      selectDoctor(selectedDoctor);
      const openingHours = selectedDoctor.doctor?.openingHours || [];
      generateSlotsFromOpeningHours(openingHours);
    }
  }, [selectedDoctor, selectDoctor]);

  // Générer les créneaux à partir des heures d'ouverture
  const generateSlotsFromOpeningHours = (openingHours) => {
    if (!openingHours || openingHours.length === 0) {
      setGeneratedSlots([]);
      return;
    }

    const daysOfWeek = { 'MON': 'Lun', 'TUE': 'Mar', 'WED': 'Mer', 'THU': 'Jeu', 'FRI': 'Ven', 'SAT': 'Sam', 'SUN': 'Dim' };
    const today = new Date();
    const slots = [];

    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
      const dayNumber = date.getDate();
      const month = date.toLocaleDateString('fr-FR', { month: 'short' });

      const dayOpeningHours = openingHours.find(oh => oh.day === dayName);

      if (dayOpeningHours && !dayOpeningHours.isClosed) {
        const openHour = Math.floor(dayOpeningHours.openHour);
        const openMinute = (dayOpeningHours.openHour % 1) * 60;
        const closeHour = Math.floor(dayOpeningHours.closeHour);
        const closeMinute = (dayOpeningHours.closeHour % 1) * 60;

        const openMinutes = openHour * 60 + openMinute;
        const closeMinutes = closeHour * 60 + closeMinute;

        for (let minutes = openMinutes; minutes < closeMinutes; minutes += 30) {
          const hours = Math.floor(minutes / 60);
          const mins = minutes % 60;
          const timeString = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;

          slots.push({
            id: `${dayOpeningHours.id}-${minutes}`,
            date: date.toISOString().split('T')[0],
            dayName: daysOfWeek[dayName] || dayName,
            dayNumber: dayNumber,
            month: month,
            time: timeString,
            timeMinutes: minutes,
            available: true
          });
        }
      }
    }

    setGeneratedSlots(slots);
  };

  // Grouper les créneaux par date
  const groupSlotsByDate = useCallback(() => {
    const groupedSlots = {};
    if (!Array.isArray(generatedSlots) || generatedSlots.length === 0) {
      return [];
    }

    generatedSlots.forEach(slot => {
      if (!slot || !slot.date) return;
      if (!groupedSlots[slot.date]) {
        groupedSlots[slot.date] = { date: slot.date, dayName: slot.dayName, dayNumber: slot.dayNumber, month: slot.month, slots: [] };
      }
      groupedSlots[slot.date].slots.push(slot);
    });

    return Object.values(groupedSlots);
  }, [generatedSlots]);

  const groupedSlots = useMemo(() => groupSlotsByDate(), [groupSlotsByDate]);

  const handleBookAppointment = () => {
    setShowBookingModal(true);
  };

  const handleDateSelect = (date) => {
    const selectedGroup = groupedSlots.find(g => g.date === date.date);
    setSelectedDate(selectedGroup || date);
    setSelectedTime(null);
  };

  const handleTimeSelect = (slot) => {
    setSelectedTime(slot);
  };

  const handleConfirmBooking = async () => {
    if (!selectedDate || !selectedTime || !selectedDoctor) {
      Alert.alert(
        'Information manquante',
        'Veuillez sélectionner une date et une heure pour votre rendez-vous.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!token) {
      Alert.alert(
        'Connexion requise',
        'Vous devez vous connecter pour confirmer votre rendez-vous.',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Se connecter', onPress: () => { setShowBookingModal(false); navigation.navigate('Auth', { screen: 'Login' }); } },
        ]
      );
      return;
    }

    try {
      setBookingError(null);
      selectDoctor(selectedDoctor); // Synchronisation du store

      // Création de la date de début en utilisant date-fns pour une meilleure gestion
      const [hours, minutes] = selectedTime.time.split(':').map(Number);
      const dateParts = selectedDate.date.split('-');
      const year = parseInt(dateParts[0]);
      const month = parseInt(dateParts[1]) - 1; // Les mois en JavaScript sont de 0 à 11
      const day = parseInt(dateParts[2]);

      // Créer la date en UTC pour éviter les problèmes de fuseau horaire
      const startsAtDate = new Date(Date.UTC(year, month, day, hours, minutes, 0));

      // Ajouter 30 minutes pour la date de fin
      const endsAtDate = addMinutes(startsAtDate, 30);

      // Formater en ISO 8601 en s'assurant que c'est bien en UTC
      const startsAt = startsAtDate.toISOString();
      const endsAt = endsAtDate.toISOString();


      console.log("Date de début formatée:", startsAt);
      console.log("Date de fin formatée:", endsAt);

      const appointmentData = {
        doctorId: selectedDoctor.doctor?.id || doctorId,
        startsAt: startsAt,
        endsAt: endsAt,
        status: 'PENDING'
      };

      console.log("[handleConfirmBooking] Données du rendez-vous à envoyer:", JSON.stringify(appointmentData, null, 2));
console.log("🧾 Payload final envoyé:", JSON.stringify(appointmentData, null, 2));
console.log("startsAt typeof:", typeof appointmentData.startsAt, appointmentData.startsAt);
console.log("endsAt typeof:", typeof appointmentData.endsAt, appointmentData.endsAt);

      const appointment = await bookAppointment(appointmentData);

      Alert.alert(
        'Rendez-vous confirmé !',
        `Votre rendez-vous avec le Dr ${selectedDoctor.lastName || ''} est confirmé pour le ${selectedDate.dayName} ${selectedDate.dayNumber} ${selectedDate.month} à ${selectedTime.time}.`,
        [
          {
            text: 'OK',
            onPress: () => {
              setShowBookingModal(false);
              navigation.navigate('AppointmentDetails', { appointmentId: appointment.id });
            }
          }
        ]
      );
    } catch (error) {
      console.error("Erreur lors de la réservation:", error);
      setBookingError(error.message || "Une erreur est survenue lors de la réservation");

      Alert.alert(
        'Erreur de réservation',
        error.message || "Une erreur est survenue lors de la réservation",
        [{ text: 'OK' }]
      );
    }
  };

  // Affichage pendant le chargement
  if (doctorLoading) {
    return (
      <View style={s.loadingContainer}>
        <Text style={s.loadingText}>Chargement des détails...</Text>
      </View>
    );
  }

  // Affichage en cas d'erreur
  if (doctorError) {
    return (
      <View style={s.errorContainer}>
        <Text style={s.errorText}>Erreur: {doctorError}</Text>
        <Button title="Réessayer" onPress={() => getDoctorDetails(doctorId)} />
      </View>
    );
  }

  if (!selectedDoctor) {
    return (
      <View style={s.errorContainer}>
        <Text style={s.errorText}>Médecin non trouvé</Text>
        <Button title="Retour" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const fullName = `${selectedDoctor?.firstName || ''} ${selectedDoctor?.lastName || ''}`.trim();
  const profilePic = selectedDoctor?.doctor?.profileFilename
    ? { uri: `${process.env.EXPO_PUBLIC_API_URL}/uploads/${selectedDoctor.doctor.profileFilename}` }
    : null;
  const specializations = selectedDoctor?.doctor?.specializations?.map(spec => spec.skill?.name) || [];
  const openingHours = selectedDoctor?.doctor?.openingHours || [];
  let location = {};
  try {
    if (selectedDoctor?.doctor?.map_pin) {
      location = typeof selectedDoctor.doctor.map_pin === 'string'
        ? JSON.parse(selectedDoctor.doctor.map_pin)
        : selectedDoctor.doctor.map_pin;
    }
  } catch (e) {
    console.error("Erreur lors du parsing de map_pin:", e);
    location = {};
  }

  return (
    <View style={s.container}>
      {/* Header avec navigation */}
      <View style={s.header}>
        <View style={s.headerTop}>
          <Pressable onPress={() => navigation.goBack()} style={s.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>
          <Text style={s.headerTitle}>{fullName}</Text>
          <View style={s.headerActions}>
            <Pressable style={s.headerAction}>
              <Ionicons name="star-outline" size={24} color="white" />
            </Pressable>
            <Pressable style={s.headerAction}>
              <Ionicons name="share-outline" size={24} color="white" />
            </Pressable>
          </View>
        </View>
      </View>

      <ScrollView style={s.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View style={[s.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          {/* Profil du médecin */}
          <View style={s.profileSection}>
            <View style={s.profileImageContainer}>
              {profilePic ? (
                <Image source={profilePic} style={s.profileImage} />
              ) : (
                <View style={s.profileImagePlaceholder}>
                  <Ionicons name="medical" size={40} color={colors.primary} />
                </View>
              )}
            </View>
            <Text style={s.doctorName}>{fullName}</Text>
            {specializations.length > 0 && (
              <View style={s.specialtiesContainer}>
                {specializations.map((item, index) => (
                  <View key={index} style={s.tag}>
                    <Text style={s.tagText}>{item}</Text>
                  </View>
                ))}
              </View>
            )}
            <View style={s.availabilityContainer}>
              <View style={[s.availabilityBadge, { backgroundColor: selectedDoctor?.doctor?.isAvailable ? colors.success : colors.textTertiary }]}>
                <Text style={s.availabilityText}>{selectedDoctor?.doctor?.isAvailable ? 'Disponible' : 'Indisponible'}</Text>
              </View>
              {selectedDoctor?.is_verified && (
                <View style={s.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                  <Text style={s.verifiedText}>Vérifié</Text>
                </View>
              )}
            </View>
            <View style={s.bookButtonContainer}>
              <Button
                title="PRENDRE RENDEZ-VOUS"
                onPress={handleBookAppointment}
                icon={<Ionicons name="calendar" size={20} color="white" />}
                style={s.bookButton}
              />
            </View>
          </View>

          {/* Section Présentation */}
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <View style={s.sectionIcon}>
                <Ionicons name="person" size={20} color={colors.primary} />
              </View>
              <Text style={s.sectionTitle}>Présentation</Text>
            </View>
            <Text style={s.presentationText}>
              {selectedDoctor?.doctor?.biography || 'Aucune biographie disponible.'}
            </Text>
          </View>

          {/* Section Horaires */}
          {openingHours.length > 0 && (
            <View style={s.section}>
              <View style={s.sectionHeader}>
                <View style={s.sectionIcon}>
                  <Ionicons name="time" size={20} color={colors.primary} />
                </View>
                <Text style={s.sectionTitle}>Horaires d'ouverture</Text>
              </View>
              {openingHours.slice(0, 5).map((item) => {
                const formatTime = (minutes) => {
                  const hours = Math.floor(minutes);
                  const mins = Math.floor((minutes - hours) * 60);
                  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
                };
                const daysOfWeek = { 'MON': 'Lundi', 'TUE': 'Mardi', 'WED': 'Mercredi', 'THU': 'Jeudi', 'FRI': 'Vendredi', 'SAT': 'Samedi', 'SUN': 'Dimanche' };
                const dayName = daysOfWeek[item.day] || 'Jour inconnu';
                return (
                  <View key={item.id} style={s.scheduleItem}>
                    <Text style={s.scheduleDay}>{dayName}</Text>
                    <Text style={s.scheduleTime}>{item.isClosed ? 'Fermé' : `${formatTime(item.openHour)} - ${formatTime(item.closeHour)}`}</Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* Section Contact */}
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <View style={s.sectionIcon}>
                <Ionicons name="call" size={20} color={colors.primary} />
              </View>
              <Text style={s.sectionTitle}>Contact</Text>
            </View>
            <View style={s.contactContainer}>
              {selectedDoctor?.phone && (
                <View style={s.contactItem}>
                  <Ionicons name="call" size={16} color={colors.textSecondary} />
                  <Text style={s.contactText}>{selectedDoctor.phone}</Text>
                </View>
              )}
              {selectedDoctor?.email && (
                <View style={s.contactItem}>
                  <Ionicons name="mail" size={16} color={colors.textSecondary} />
                  <Text style={s.contactText}>{selectedDoctor.email}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Section Localisation */}
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <View style={s.sectionIcon}>
                <Ionicons name="map" size={20} color={colors.primary} />
              </View>
              <Text style={s.sectionTitle}>Localisation</Text>
            </View>
            <View style={s.mapContainer}>
              <View style={s.mapPlaceholder}>
                <View style={s.mapContent}>
                  <Ionicons name="map" size={48} color={colors.primaryMuted} />
                  <Text style={s.mapPlaceholderText}>Carte de localisation</Text>
                  <Text style={s.mapPlaceholderSubtext}>
                    {location.lat && location.lon ? `Coordonnées: ${location.lat.toFixed(4)}, ${location.lon.toFixed(4)}` : 'Coordonnées non spécifiées'}
                  </Text>
                </View>
                <View style={s.markerContainer}>
                  <Ionicons name="medical" size={24} color="white" />
                </View>
              </View>
            </View>
          </View>

          {/* Section Informations légales */}
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <View style={s.sectionIcon}>
                <Ionicons name="information-circle" size={20} color={colors.primary} />
              </View>
              <Text style={s.sectionTitle}>Informations légales</Text>
            </View>
            <View style={s.legalInfoContainer}>
              <Text style={s.infoItem}>Numéro de licence: {selectedDoctor?.doctor?.licenceNumber || 'Non spécifié'}</Text>
              {selectedDoctor?.doctor?.medicalIdFilename && (
                <View style={s.documentItem}>
                  <Ionicons name="document-text" size={16} color={colors.textSecondary} />
                  <Text style={s.documentText}>Document médical vérifié</Text>
                </View>
              )}
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* MODAL DE RESERVATION */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showBookingModal}
        onRequestClose={() => setShowBookingModal(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalContainer}>
            {/* Header de la modal */}
            <View style={s.modalHeader}>
              <Pressable onPress={() => setShowBookingModal(false)} style={s.modalCloseButton}>
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
              <Text style={s.modalTitle}>Prendre rendez-vous</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView style={s.modalScrollView} showsVerticalScrollIndicator={false}>
              {/* Résumé du médecin dans la modal */}
              <View style={s.modalDoctorSummary}>
                <View style={s.modalDoctorAvatar}>
                  {profilePic ? (
                    <Image source={profilePic} style={s.modalDoctorAvatarImage} />
                  ) : (
                    <Ionicons name="medical" size={24} color={colors.primary} />
                  )}
                </View>
                <View style={s.modalDoctorInfo}>
                  <Text style={s.modalDoctorName}>{fullName}</Text>
                  <Text style={s.modalDoctorSpecialty}>{specializations.join(', ')}</Text>
                </View>
              </View>

              {/* Sélection de la date */}
              <View style={s.modalSection}>
                <Text style={s.modalSectionTitle}>Choisir une date</Text>
                {groupedSlots.length > 0 ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={s.datesList}>
                      {groupedSlots.map((item) => (
                        <Pressable
                          key={item.date}
                          onPress={() => handleDateSelect(item)}
                          style={[s.dateItem, selectedDate?.date === item.date && s.dateItemSelected]}
                        >
                          <Text style={[s.dateDay, selectedDate?.date === item.date && s.dateDaySelected]}>{item.dayName}</Text>
                          <Text style={[s.dateNumber, selectedDate?.date === item.date && s.dateNumberSelected]}>{item.dayNumber}</Text>
                          <Text style={[s.dateMonth, selectedDate?.date === item.date && s.dateMonthSelected]}>{item.month}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </ScrollView>
                ) : (
                  <Text style={s.emptyText}>Aucun créneau disponible</Text>
                )}
              </View>

              {/* Sélection de l'heure */}
              {selectedDate && (
                <View style={s.modalSection}>
                  <Text style={s.modalSectionTitle}>Choisir un créneau</Text>
                  <View style={s.timeSlotsContainer}>
                    {selectedDate.slots && selectedDate.slots.map((slot) => (
                      <Pressable
                        key={slot.id}
                        onPress={() => handleTimeSelect(slot)}
                        style={[s.timeSlot, selectedTime?.id === slot.id && s.timeSlotSelected]}
                      >
                        <Text style={[s.timeText, selectedTime?.id === slot.id && s.timeTextSelected]}>{slot.time}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}

              {/* Résumé et confirmation */}
              {selectedDate && selectedTime && (
                <View style={s.modalSection}>
                  <Text style={s.modalSectionTitle}>Résumé</Text>
                  <View style={s.summaryContent}>
                    <View style={s.summaryItem}>
                      <Text style={s.summaryLabel}>Date</Text>
                      <Text style={s.summaryValue}>{selectedDate.dayName} {selectedDate.dayNumber} {selectedDate.month}</Text>
                    </View>
                    <View style={s.summaryItem}>
                      <Text style={s.summaryLabel}>Heure</Text>
                      <Text style={s.summaryValue}>{selectedTime.time}</Text>
                    </View>
                  </View>
                  {bookingError && (
                    <View style={s.errorContainer}>
                      <Text style={s.errorText}>{bookingError}</Text>
                    </View>
                  )}
                  {!token && (
                    <View style={s.guestMessage}>
                      <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
                      <Text style={s.guestText}>Connectez-vous pour confirmer</Text>
                    </View>
                  )}
                  <View style={s.confirmButtonContainer}>
                    <Button
                      title={token ? "Confirmer le rendez-vous" : "Se connecter et confirmer"}
                      onPress={handleConfirmBooking}
                      style={s.confirmButton}
                    />
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Styles
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { ...textStyles.body, color: colors.textSecondary },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg
  },
  errorText: {
    ...textStyles.body,
    color: colors.error,
    marginBottom: spacing.md,
    textAlign: 'center'
  },
  header: {
    backgroundColor: colors.primaryDeep,
    paddingTop: 50,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  backButton: { padding: spacing.sm },
  headerTitle: {
    ...textStyles.h3,
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: spacing.lg
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerAction: {
    padding: spacing.sm,
    marginLeft: spacing.sm
  },
  scrollView: { flex: 1 },
  content: {
    flex: 1,
    paddingBottom: spacing.xl
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg
  },
  profileImageContainer: { marginBottom: spacing.lg },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: 'white'
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'white'
  },
  doctorName: {
    ...textStyles.h1,
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: spacing.lg
  },
  tag: {
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    marginRight: spacing.sm,
    marginBottom: spacing.sm
  },
  tagText: {
    ...textStyles.bodySmall,
    fontSize: 12,
    fontWeight: '500',
    color: colors.primary
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg
  },
  availabilityBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    marginRight: spacing.sm
  },
  availabilityText: {
    ...textStyles.bodySmall,
    fontSize: 12,
    color: 'white',
    fontWeight: '500'
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.success + '20'
  },
  verifiedText: {
    ...textStyles.bodySmall,
    fontSize: 12,
    color: colors.success,
    marginLeft: spacing.xs,
    fontWeight: '500'
  },
  bookButtonContainer: {
    width: '100%'
  },
  bookButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md
  },
  sectionTitle: {
    ...textStyles.h3,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    flex: 1
  },
  presentationText: {
    ...textStyles.body,
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22
  },
  scheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight
  },
  scheduleDay: {
    ...textStyles.body,
    fontSize: 15,
    color: colors.text,
    fontWeight: '500'
  },
  scheduleTime: {
    ...textStyles.body,
    fontSize: 15,
    color: colors.textSecondary
  },
  contactContainer: {
    marginBottom: spacing.lg
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm
  },
  contactText: {
    ...textStyles.body,
    fontSize: 15,
    color: colors.text,
    marginLeft: spacing.sm
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
    position: 'relative'
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  mapContent: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  mapPlaceholderText: {
    ...textStyles.h4,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: spacing.sm,
    marginBottom: spacing.xs
  },
  mapPlaceholderSubtext: {
    ...textStyles.bodySmall,
    fontSize: 14,
    color: colors.textTertiary,
    textAlign: 'center'
  },
  markerContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'white',
    transform: [{ translateX: -20 }, { translateY: -20 }]
  },
  legalInfoContainer: {
    marginBottom: spacing.lg
  },
  infoItem: {
    ...textStyles.body,
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.sm
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm
  },
  documentText: {
    ...textStyles.body,
    fontSize: 15,
    color: colors.text,
    marginLeft: spacing.sm
  },

  // Styles pour la MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  modalCloseButton: {
    padding: spacing.sm,
  },
  modalTitle: {
    ...textStyles.h3,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  modalScrollView: {
    flex: 1,
  },
  modalDoctorSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  modalDoctorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    overflow: 'hidden'
  },
  modalDoctorAvatarImage: {
    width: '100%',
    height: '100%',
  },
  modalDoctorInfo: {
    flex: 1,
  },
  modalDoctorName: {
    ...textStyles.h3,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  modalDoctorSpecialty: {
    ...textStyles.body,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  modalSection: {
    padding: spacing.lg,
  },
  modalSectionTitle: {
    ...textStyles.h3,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
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
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
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
  guestMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryMuted,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  guestText: {
    ...textStyles.body,
    fontSize: 14,
    color: colors.primary,
    marginLeft: spacing.sm,
  },
  confirmButtonContainer: {
    marginTop: spacing.lg,
  },
  confirmButton: {
    borderRadius: 12,
  },
  emptyText: {
    ...textStyles.body,
    color: colors.textTertiary,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  }
});