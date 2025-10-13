import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Pressable, Image, Modal, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '../../components/Button';
import Card from '../../components/Card';
import { colors, spacing, radius, textStyles } from '../../theme';
import useDoctorStore from '../../stores/useDoctorStore';
import useBookingStore from '../../stores/booking.store';
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
  
  // Utilisation du store de réservation
  const {
    selectDoctor
  } = useBookingStore();
  
  // State pour les modales
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  
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

  const handleBookAppointment = () => {
    if (selectedDoctor) {
      selectDoctor(selectedDoctor);
      navigation.navigate('Booking', { doctorId });
    }
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
  // CORRECTION: Les données sont directement dans l'objet racine, pas dans un objet user
  const fullName = `${selectedDoctor?.firstName || ''} ${selectedDoctor?.lastName || ''}`.trim();
  const profilePic = selectedDoctor?.doctor?.profileFilename 
    ? { uri: `${process.env.API_URL}/uploads/${selectedDoctor.doctor.profileFilename}` }
    : null;
  
  // Extraction des spécialisations
  const specializations = selectedDoctor?.doctor?.specializations?.map(spec => spec.skill?.name) || [];
  
  // Extraction des tarifs
  const pricings = selectedDoctor?.doctor?.pricings || [];
  
  // Extraction des horaires
  const openingHours = selectedDoctor?.doctor?.openingHours || [];
  
  // Extraction de la localisation (map_pin est une chaîne JSON)
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

  // DEBUG: Afficher les données extraites pour vérification
  // console.log("Nom complet:", fullName);
  // console.log("Spécialisations:", specializations);
  // console.log("Biographie:", selectedDoctor?.doctor?.biography);
  // console.log("Horaires:", openingHours);
  // console.log("Tarifs:", pricings);

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
            
            {/* Affichage des spécialisations avec un simple map au lieu de FlatList */}
            {specializations.length > 0 && (
              <View style={s.specialtiesContainer}>
                {specializations.map((item, index) => (
                  <View key={index} style={s.tag}>
                    <Text style={s.tagText}>{item}</Text>
                  </View>
                ))}
              </View>
            )}
            
            {/* Affichage du statut de disponibilité */}
            <View style={s.availabilityContainer}>
              <View style={[s.availabilityBadge, { backgroundColor: selectedDoctor?.doctor?.isAvailable ? colors.success : colors.textTertiary }]}>
                <Text style={s.availabilityText}>
                  {selectedDoctor?.doctor?.isAvailable ? 'Disponible' : 'Indisponible'}
                </Text>
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
                
                const daysOfWeek = {
                  'MON': 'Lundi',
                  'TUE': 'Mardi',
                  'WED': 'Mercredi',
                  'THU': 'Jeudi',
                  'FRI': 'Vendredi',
                  'SAT': 'Samedi',
                  'SUN': 'Dimanche'
                };
                const dayName = daysOfWeek[item.day] || 'Jour inconnu';
                
                return (
                  <View key={item.id} style={s.scheduleItem}>
                    <Text style={s.scheduleDay}>{dayName}</Text>
                    <Text style={s.scheduleTime}>
                      {item.isClosed ? 'Fermé' : `${formatTime(item.openHour)} - ${formatTime(item.closeHour)}`}
                    </Text>
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
                    {location.lat && location.lon 
                      ? `Coordonnées: ${location.lat.toFixed(4)}, ${location.lon.toFixed(4)}`
                      : 'Coordonnées non spécifiées'
                    }
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  tag: {
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  tagText: {
    ...textStyles.bodySmall,
    fontSize: 12,
    fontWeight: '500',
    color: colors.primary,
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  availabilityBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    marginRight: spacing.sm,
  },
  availabilityText: {
    ...textStyles.bodySmall,
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.success + '20',
  },
  verifiedText: {
    ...textStyles.bodySmall,
    fontSize: 12,
    color: colors.success,
    marginLeft: spacing.xs,
    fontWeight: '500',
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
  presentationText: {
    ...textStyles.body,
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
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
    fontWeight: '500',
  },
  scheduleTime: {
    ...textStyles.body,
    fontSize: 15,
    color: colors.textSecondary,
  },
  contactContainer: {
    marginBottom: spacing.lg,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  contactText: {
    ...textStyles.body,
    fontSize: 15,
    color: colors.text,
    marginLeft: spacing.sm,
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
  legalInfoContainer: {
    marginBottom: spacing.lg,
  },
  infoItem: {
    ...textStyles.body,
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  documentText: {
    ...textStyles.body,
    fontSize: 15,
    color: colors.text,
    marginLeft: spacing.sm,
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
});