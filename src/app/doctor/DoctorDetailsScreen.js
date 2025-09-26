import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Pressable, Image, Modal, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '../../components/Button';
import Card from '../../components/Card';
import { colors, spacing, radius, textStyles } from '../../theme';

const { width, height } = Dimensions.get('window');

export default function DoctorDetailsScreen({ navigation, route }) {
  const { doctor } = route.params;
  
  // State pour les modales
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  
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

  const showModal = (content) => {
    setModalContent(content);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setModalContent(null);
  };

  return (
    <View style={s.container}>
      {/* Header avec navigation */}
      <View style={s.header}>
        <View style={s.headerTop}>
          <Pressable onPress={() => navigation.goBack()} style={s.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>
          <Text style={s.headerTitle}>{doctor.title} {doctor.lastName}</Text>
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
              <View style={s.profileImage}>
                <Ionicons name="medical" size={40} color={colors.primary} />
              </View>
            </View>
            <Text style={s.doctorName}>{doctor.title} {doctor.lastName}</Text>
            <Text style={s.doctorSpecialty}>{doctor.specialty}</Text>
            
            <View style={s.bookButtonContainer}>
              <Button
                title="PRENDRE RENDEZ-VOUS"
                onPress={handleBookAppointment}
                icon={<Ionicons name="calendar" size={20} color="white" />}
                style={s.bookButton}
              />
            </View>
          </View>

          {/* Section Adresses */}
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <View style={s.sectionIcon}>
                <Ionicons name="location" size={20} color={colors.primary} />
              </View>
              <Text style={s.sectionTitle}>Adresses</Text>
              <Pressable 
                style={s.seeMoreButton}
                onPress={() => showModal({
                  title: 'Adresses',
                  content: (
                    <View>
                      <View style={s.addressCard}>
                        <Text style={s.addressTitle}>Centre Médical de {doctor.district}</Text>
                        <Text style={s.addressText}>Avenue de l'Indépendance</Text>
                        <Text style={s.addressText}>{doctor.district}, {doctor.city}</Text>
                        <Text style={s.addressText}>République du Congo</Text>
                      </View>
                      <View style={s.addressCard}>
                        <Text style={s.addressTitle}>Cabinet Principal</Text>
                        <Text style={s.addressText}>Quartier {doctor.district}</Text>
                        <Text style={s.addressText}>{doctor.district}, {doctor.city}</Text>
                        <Text style={s.addressText}>République du Congo</Text>
                      </View>
                    </View>
                  )
                })}
              >
                <Text style={s.seeMoreText}>Voir plus</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.primary} />
              </Pressable>
            </View>
            <View style={s.addressCard}>
              <Text style={s.addressTitle}>Centre Médical de {doctor.district}</Text>
              <Text style={s.addressText}>Avenue de l'Indépendance</Text>
              <Text style={s.addressText}>{doctor.district}, {doctor.city}</Text>
              <Text style={s.addressText}>République du Congo</Text>
            </View>
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
                        L'{doctor.specialty.toLowerCase()} est le médecin spécialiste du diagnostic et du traitement des maladies. 
                        Il identifie les causes et propose des solutions adaptées à chaque patient.
                      </Text>
                      <Text style={s.presentationText}>
                        Dr. {doctor.lastName} possède une expérience de plus de 15 ans dans sa spécialité et a suivi de nombreuses formations 
                        pour rester à la pointe de sa discipline.
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
              L'{doctor.specialty.toLowerCase()} est le médecin spécialiste du diagnostic et du traitement des maladies. 
              Il identifie les causes et propose des solutions adaptées à chaque patient.
            </Text>
          </View>

          {/* Section Horaires */}
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <View style={s.sectionIcon}>
                <Ionicons name="time" size={20} color={colors.primary} />
              </View>
              <Text style={s.sectionTitle}>Horaires et coordonnées</Text>
              <Pressable 
                style={s.seeMoreButton}
                onPress={() => showModal({
                  title: 'Horaires et coordonnées',
                  content: (
                    <View>
                      <Text style={s.infoItem}>Lundi - Vendredi : 8h00 - 18h00</Text>
                      <Text style={s.infoItem}>Samedi : 8h00 - 12h00</Text>
                      <Text style={s.infoItem}>Dimanche : Fermé</Text>
                      <Text style={s.infoItem}>Téléphone : +242 05 123 45 67</Text>
                      <Text style={s.infoItem}>Email : contact@docteur-cg.cg</Text>
                    </View>
                  )
                })}
              >
                <Text style={s.seeMoreText}>Voir plus</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.primary} />
              </Pressable>
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
                    Centre Médical de {doctor.district}
                  </Text>
                </View>
                <View style={s.markerContainer}>
                  <Ionicons name="medical" size={24} color="white" />
                </View>
              </View>
              <View style={s.mapOverlay}>
                <View style={s.mapInfo}>
                  <Text style={s.mapTitle}>Centre Médical de {doctor.district}</Text>
                  <Text style={s.mapAddress}>Avenue de l'Indépendance</Text>
                  <Text style={s.mapAddress}>{doctor.district}, {doctor.city}</Text>
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
                      <Text style={s.infoItem}>Numéro RPPS : 12345678901</Text>
                      <Text style={s.infoItem}>Numéro ADELI : 123456789</Text>
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

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  doctorSpecialty: {
    ...textStyles.h3,
    fontSize: 18,
    color: colors.primary,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.xl,
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
  addressCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  addressTitle: {
    ...textStyles.h4,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  addressText: {
    ...textStyles.body,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  presentationText: {
    ...textStyles.body,
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  tagText: {
    ...textStyles.bodySmall,
    fontSize: 12,
    fontWeight: '500',
    color: colors.primary,
  },
  infoList: {
    gap: spacing.sm,
  },
  infoItem: {
    ...textStyles.body,
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
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
});