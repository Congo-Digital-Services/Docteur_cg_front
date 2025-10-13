import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Pressable, Image, Modal, Dimensions, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '../../components/Button';
import Card from '../../components/Card';
import { colors, spacing, radius, textStyles } from '../../theme';
import useDoctorStore from '../../stores/useDoctorStore';
import useBookingStore from '../../stores/booking.store';
import useAuthStore from '../../stores/auth.store';
import { useRoute, useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

export default function DoctorDetailsScreen({ navigation }) {
  const route = useRoute();
  const { doctorId } = route.params;
  
  // Utilisation du store des médecins
  const { 
    selectedDoctor, 
    doctorLoading, 
    doctorError, 
    getDoctorDetails 
  } = useDoctorStore();
  
  // Utilisation du store des rendez-vous
  const { 
    selectDoctor,
    slots,
    slotsLoading,
    slotsError,
    loadSlots
  } = useBookingStore();
  
  // Utilisation du store d'authentification
  const { token } = useAuthStore();
  
  // State pour les modales
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Récupération des détails du médecin
    if (doctorId) {
      getDoctorDetails(doctorId);
    }

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
  }, [doctorId]);

  useEffect(() => {
    // Charger les créneaux disponibles lorsque le médecin est sélectionné
    if (selectedDoctor && selectedDate) {
      loadSlots(selectedDoctor.id, selectedDate.toISOString().split('T')[0]);
    }
  }, [selectedDoctor, selectedDate]);

  const handleBookAppointment = () => {
    if (!token) {
      Alert.alert(
        'Connexion requise',
        'Vous devez vous connecter pour prendre rendez-vous.',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Se connecter', onPress: () => navigation.navigate('Auth', { screen: 'Login' }) },
        ]
      );
      return;
    }
    
    // Sélectionner le médecin et naviguer vers l'écran de réservation
    selectDoctor(selectedDoctor);
    navigation.navigate('Booking', { doctorId });
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const showModal = (content) => {
    setModalContent(content);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setModalContent(null);
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

  // Si aucun médecin n'est trouvé
  if (!selectedDoctor) {
    return (
      <View style={s.errorContainer}>
        <Text style={s.errorText}>Médecin non trouvé</Text>
        <Button title="Retour" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  // Extraction des données du médecin selon la structure du backend
  const { user, doctor } = selectedDoctor;
  const fullName = `${user.firstName} ${user.lastName}`;
  const profilePic = doctor?.profileFilename 
    ? { uri: `${process.env.API_URL}/uploads/${doctor.profileFilename}` }
    : null;
  
  // Extraction des spécialisations
  const specializations = doctor?.specializations?.map(spec => spec.skill?.name) || [];
  
  // Extraction des tarifs
  const pricings = doctor?.pricings || [];
  
  // Extraction des horaires
  const openingHours = doctor?.openingHours || [];
  
  // Extraction de la localisation
  const location = doctor?.map_pin || {};

  const renderSpecialtyItem = ({ item }) => (
    <View style={s.tag}>
      <Text style={s.tagText}>{item}</Text>
    </View>
  );

  const renderPricingItem = ({ item }) => (
    <View style={s.pricingItem}>
      <Text style={s.pricingLabel}>
        {item.baseFee && 'Consultation: '}
        {item.followUpFee && 'Suivi: '}
        {item.teleconsultFee && 'Téléconsultation: '}
        {item.homeVisitFee && 'Visite à domicile: '}
      </Text>
      <Text style={s.pricingValue}>
        {item.baseFee || item.followUpFee || item.teleconsultFee || item.homeVisitFee} {item.currency}
      </Text>
    </View>
  );

  const renderOpeningHourItem = ({ item }) => (
    <View style={s.scheduleItem}>
      <Text style={s.scheduleDay}>{item.day}</Text>
      <Text style={s.scheduleTime}>
        {item.isClosed ? 'Fermé' : `${item.openHour} - ${item.closeHour}`}
      </Text>
    </View>
  );

  const renderSlotItem = ({ item }) => (
    <Pressable 
      style={s.slotItem}
      onPress={() => {
        // Naviguer vers l'écran de réservation avec le créneau sélectionné
        selectDoctor(selectedDoctor);
        navigation.navigate('Booking', { 
          doctorId, 
          selectedSlot: item,
          selectedDate: selectedDate.toISOString().split('T')[0]
        });
      }}
    >
      <Text style={s.slotTime}>
        {new Date(item.startsAt).toLocaleTimeString('fr-FR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}
      </Text>
    </Pressable>
  );

  // Générer les dates pour les 7 prochains jours
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };

  const renderDateItem = ({ item }) => {
    const isSelected = selectedDate.toDateString() === item.toDateString();
    const isToday = item.toDateString() === new Date().toDateString();
    
    return (
      <Pressable
        style={[s.dateItem, isSelected && s.dateItemSelected]}
        onPress={() => handleDateSelect(item)}
      >
        <Text style={[s.dateDay, isSelected && s.dateTextSelected]}>
          {item.toLocaleDateString('fr-FR', { weekday: 'short' }).toUpperCase()}
        </Text>
        <Text style={[s.dateNumber, isSelected && s.dateTextSelected]}>
          {item.getDate()}
        </Text>
        {isToday && (
          <View style={s.todayIndicator} />
        )}
      </Pressable>
    );
  };

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
        <Animated.View style={[
          s.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}>

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
            
            {/* Affichage des spécialisations */}
            {specializations.length > 0 && (
              <View style={s.specialtiesContainer}>
                <FlatList
                  data={specializations}
                  renderItem={renderSpecialtyItem}
                  keyExtractor={(item, index) => index.toString()}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={s.specialtiesList}
                />
              </View>
            )}
            
            <View style={s.bookButtonContainer}>
              <Button
                title="PRENDRE RENDEZ-VOUS"
                onPress={handleBookAppointment}
                icon={<Ionicons name="calendar" size={20} color="white" />}
                style={s.bookButton}
              />
            </View>
          </View>

          {/* Section Créneaux disponibles */}
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <View style={s.sectionIcon}>
                <Ionicons name="calendar" size={20} color={colors.primary} />
              </View>
              <Text style={s.sectionTitle}>Créneaux disponibles</Text>
            </View>
            
            {/* Sélection de la date */}
            <View style={s.dateSelectionContainer}>
              <FlatList
                data={generateDates()}
                renderItem={renderDateItem}
                keyExtractor={(item) => item.toISOString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.dateList}
              />
            </View>
            
            {/* Affichage des créneaux */}
            {slotsLoading ? (
              <View style={s.slotsLoadingContainer}>
                <Text style={s.slotsLoadingText}>Chargement des créneaux...</Text>
              </View>
            ) : slotsError ? (
              <View style={s.slotsErrorContainer}>
                <Text style={s.slotsErrorText}>{slotsError}</Text>
                <Button
                  title="Réessayer"
                  onPress={() => loadSlots(selectedDoctor.id, selectedDate.toISOString().split('T')[0])}
                  variant="outline"
                  size="small"
                />
              </View>
            ) : slots.length > 0 ? (
              <View style={s.slotsContainer}>
                <FlatList
                  data={slots}
                  renderItem={renderSlotItem}
                  keyExtractor={(item) => item.id}
                  numColumns={3}
                  scrollEnabled={false}
                  contentContainerStyle={s.slotsList}
                />
              </View>
            ) : (
              <View style={s.noSlotsContainer}>
                <Ionicons name="calendar-outline" size={48} color={colors.textTertiary} />
                <Text style={s.noSlotsText}>
                  Aucun créneau disponible pour cette date
                </Text>
              </View>
            )}
          </View>

          {/* Section Présentation */}
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <View style={s.sectionIcon}>
                <Ionicons name="person" size={20} color={colors.primary} />
              </View>
              <Text style={s.sectionTitle}>Présentation</Text>
              <Pressable 
                style={s.seeMoreButton}
                onPress={() => showModal({
                  title: 'Présentation',
                  content: (
                    <View>
                      <Text style={s.presentationText}>
                        {doctor?.biography || 'Aucune biographie disponible.'}
                      </Text>
                    </View>
                  )
                })}
              >
                <Text style={s.seeMoreText}>Voir plus</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.primary} />
              </Pressable>
            </View>
            <Text style={s.presentationText}>
              {doctor?.biography ? 
                (doctor.biography.length > 150 ? 
                  `${doctor.biography.substring(0, 150)}...` : 
                  doctor.biography
                ) : 
                'Aucune biographie disponible.'
              }
            </Text>
          </View>

          {/* Section Tarifs */}
          {pricings.length > 0 && (
            <View style={s.section}>
              <View style={s.sectionHeader}>
                <View style={s.sectionIcon}>
                  <Ionicons name="card" size={20} color={colors.primary} />
                </View>
                <Text style={s.sectionTitle}>Tarifs</Text>
                <Pressable 
                  style={s.seeMoreButton}
                  onPress={() => showModal({
                    title: 'Tarifs',
                    content: (
                      <View>
                        <FlatList
                          data={pricings}
                          renderItem={renderPricingItem}
                          keyExtractor={(item) => item.id}
                        />
                      </View>
                    )
                  })}
                >
                  <Text style={s.seeMoreText}>Voir plus</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                </Pressable>
              </View>
              <FlatList
                data={pricings.slice(0, 2)} // Afficher seulement les 2 premiers tarifs
                renderItem={renderPricingItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            </View>
          )}

          {/* Section Horaires */}
          {openingHours.length > 0 && (
            <View style={s.section}>
              <View style={s.sectionHeader}>
                <View style={s.sectionIcon}>
                  <Ionicons name="time" size={20} color={colors.primary} />
                </View>
                <Text style={s.sectionTitle}>Horaires</Text>
                <Pressable 
                  style={s.seeMoreButton}
                  onPress={() => showModal({
                    title: 'Horaires',
                    content: (
                      <View>
                        <FlatList
                          data={openingHours}
                          renderItem={renderOpeningHourItem}
                          keyExtractor={(item) => item.id}
                        />
                      </View>
                    )
                  })}
                >
                  <Text style={s.seeMoreText}>Voir plus</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                </Pressable>
              </View>
              <FlatList
                data={openingHours.slice(0, 3)} // Afficher seulement les 3 premiers horaires
                renderItem={renderOpeningHourItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            </View>
          )}

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
                    {location.address || 'Adresse non spécifiée'}
                  </Text>
                </View>
                <View style={s.markerContainer}>
                  <Ionicons name="medical" size={24} color="white" />
                </View>
              </View>
              <View style={s.mapOverlay}>
                <View style={s.mapInfo}>
                  <Text style={s.mapTitle}>{location.name || 'Cabinet médical'}</Text>
                  <Text style={s.mapAddress}>{location.address || 'Adresse non spécifiée'}</Text>
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
              <Pressable 
                style={s.seeMoreButton}
                onPress={() => showModal({
                  title: 'Informations légales',
                  content: (
                    <View>
                      <Text style={s.infoItem}>Numéro de licence: {doctor?.licenceNumber || 'Non spécifié'}</Text>
                      <Text style={s.infoItem}>Assurance responsabilité civile</Text>
                      <Text style={s.infoItem}>Conseil de l'Ordre des Médecins</Text>
                    </View>
                  )
                })}
              >
                <Text style={s.seeMoreText}>Voir plus</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.primary} />
              </Pressable>
            </View>
          </View>

        </Animated.View>
      </ScrollView>

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>{modalContent?.title}</Text>
              <Pressable onPress={closeModal} style={s.closeButton}>
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>
            <ScrollView style={s.modalBody} showsVerticalScrollIndicator={false}>
              {modalContent?.content}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Ajout des nouveaux styles pour les créneaux et dates
const s = StyleSheet.create({
  // Styles existants...
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
  profileSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  profileImageContainer: {
    marginBottom: spacing.lg,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: 'white',
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  doctorName: {
    ...textStyles.h1,
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  specialtiesContainer: {
    marginBottom: spacing.lg,
  },
  specialtiesList: {
    paddingHorizontal: spacing.lg,
  },
  tag: {
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    marginRight: spacing.sm,
  },
  tagText: {
    ...textStyles.bodySmall,
    fontSize: 12,
    fontWeight: '500',
    color: colors.primary,
  },
  bookButtonContainer: {
    width: '100%',
  },
  bookButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
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
  seeMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeMoreText: {
    ...textStyles.body,
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
    marginRight: spacing.xs,
  },
  presentationText: {
    ...textStyles.body,
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  pricingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  pricingLabel: {
    ...textStyles.body,
    fontSize: 15,
    color: colors.text,
  },
  pricingValue: {
    ...textStyles.body,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  scheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  scheduleDay: {
    ...textStyles.body,
    fontSize: 15,
    color: colors.text,
  },
  scheduleTime: {
    ...textStyles.body,
    fontSize: 15,
    color: colors.textSecondary,
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
    position: 'relative',
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  mapContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPlaceholderText: {
    ...textStyles.h4,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  mapPlaceholderSubtext: {
    ...textStyles.bodySmall,
    fontSize: 14,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: spacing.md,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  mapInfo: {
    flex: 1,
  },
  mapTitle: {
    ...textStyles.h4,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  mapAddress: {
    ...textStyles.bodySmall,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 18,
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
    transform: [{ translateX: -20 }, { translateY: -20 }],
  },
  infoItem: {
    ...textStyles.body,
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    minHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  modalTitle: {
    ...textStyles.h3,
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  closeButton: {
    padding: spacing.sm,
  },
  modalBody: {
    flex: 1,
    padding: spacing.lg,
  },
  
  // Nouveaux styles pour les créneaux et dates
  dateSelectionContainer: {
    marginBottom: spacing.md,
  },
  dateList: {
    paddingRight: spacing.lg,
  },
  dateItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 70,
    borderRadius: radius.md,
    backgroundColor: colors.backgroundSecondary,
    marginRight: spacing.sm,
    position: 'relative',
  },
  dateItemSelected: {
    backgroundColor: colors.primary,
  },
  dateDay: {
    ...textStyles.bodySmall,
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  dateNumber: {
    ...textStyles.h3,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  dateTextSelected: {
    color: 'white',
  },
  todayIndicator: {
    position: 'absolute',
    bottom: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  slotsLoadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  slotsLoadingText: {
    ...textStyles.body,
    color: colors.textSecondary,
  },
  slotsErrorContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  slotsErrorText: {
    ...textStyles.body,
    color: colors.error,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  slotsContainer: {
    marginBottom: spacing.md,
  },
  slotsList: {
    paddingRight: spacing.lg,
  },
  slotItem: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.xs,
    marginVertical: spacing.xs,
    minHeight: 50,
  },
  slotTime: {
    ...textStyles.body,
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  noSlotsContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  noSlotsText: {
    ...textStyles.body,
    color: colors.textTertiary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
});