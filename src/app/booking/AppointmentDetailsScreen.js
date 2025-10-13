import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Button from '../../components/Button';
import { colors, spacing, textStyles } from '../../theme';
import useBookingStore from '../../stores/booking.store';

export default function AppointmentDetailsScreen({ navigation, route }) {
  const appointment = route.params?.appointment;
  const { cancelAppointment: cancel } = useBookingStore();
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (!appointment) {
      console.error("[AppointmentDetailsScreen] Aucun rendez-vous fourni dans les paramètres de navigation.");
      Alert.alert(
        "Erreur",
        "Impossible de charger les détails du rendez-vous.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
      return;
    }

    console.log('[AppointmentDetailsScreen] Rendez-vous chargé:', appointment.id, 'Statut:', appointment.status);
    
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
  }, [appointment, navigation]);

  const handleCancelAppointment = () => {
    if (!appointment) return;

    console.log('[AppointmentDetailsScreen] Tentative d\'annulation du rendez-vous:', appointment.id);
    
    Alert.alert(
      'Annuler le rendez-vous',
      'Êtes-vous sûr de vouloir annuler ce rendez-vous ?',
      [
        { 
          text: 'Non', 
          style: 'cancel',
          onPress: () => console.log('[AppointmentDetailsScreen] Annulation de l\'action')
        },
        { 
          text: 'Oui, annuler', 
          style: 'destructive',
          onPress: () => {
            console.log('[AppointmentDetailsScreen] Confirmation de l\'annulation du rendez-vous:', appointment.id);
            cancel(appointment.id).then(() => {
              console.log('[AppointmentDetailsScreen] Rendez-vous annulé avec succès');
              navigation.goBack();
            }).catch(error => {
              console.error('[AppointmentDetailsScreen] Erreur lors de l\'annulation du rendez-vous:', error);
              Alert.alert(
                'Erreur',
                'Une erreur est survenue lors de l\'annulation. Veuillez réessayer.',
                [{ text: 'OK' }]
              );
            });
          }
        },
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED': return colors.success;
      case 'PENDING': return colors.warning;
      case 'CANCELED':
      case 'CANCELLED': 
      case 'DECLINED': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'Confirmé';
      case 'PENDING': return 'En attente';
      case 'CANCELED':
      case 'CANCELLED': return 'Annulé';
      case 'DECLINED': return 'Refusé';
      default: return status;
    }
  };
  
  const handleShareAppointment = () => {
    console.log('[AppointmentDetailsScreen] Partage du rendez-vous:', appointment?.id);
    Alert.alert(
      'Partager le rendez-vous',
      'Cette fonctionnalité sera bientôt disponible.',
      [{ text: 'OK' }]
    );
  };
  
  if (!appointment) {
    return null; 
  }

  const formatAppointmentDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Date non disponible';
      }
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      console.error("[AppointmentDetailsScreen] Erreur de formatage de date:", error);
      return 'Date non disponible';
    }
  };

  return (
    <View style={s.container}>
      {/* Header avec navigation */}
      <View style={s.header}>
        <View style={s.headerTop}>
          <Pressable 
            onPress={() => navigation.goBack()} 
            style={s.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>
          <Text style={s.headerTitle}>Détails du rendez-vous</Text>
          <View style={s.headerActions}>
            <Pressable style={s.headerAction} onPress={handleShareAppointment}>
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
          {/* Statut du rendez-vous */}
          <View style={s.statusSection}>
            <View style={[s.statusBadge, { backgroundColor: getStatusColor(appointment.status) }]}>
              <Text style={s.statusText}>
                {getStatusText(appointment.status)}
              </Text>
            </View>
          </View>

          {/* Informations du médecin */}
          <View style={s.doctorSection}>
            <View style={s.doctorCard}>
              <View style={s.doctorAvatar}>
                <Ionicons name="medical" size={32} color={colors.primary} />
              </View>
              <View style={s.doctorInfo}>
                <Text style={s.doctorName}>
                  {appointment.doctor?.title || 'Dr'} {appointment.doctor?.lastName || 'Nom non disponible'}
                </Text>
                <Text style={s.doctorSpecialty}>
                  {appointment.doctor?.specialty || 'Spécialité non disponible'}
                </Text>
                <View style={s.doctorLocation}>
                  <Ionicons name="location" size={16} color={colors.textSecondary} />
                  <Text style={s.doctorAddress}>
                    {appointment.doctor?.district || 'Quartier'}, {appointment.doctor?.city || 'Brazzaville'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Détails du rendez-vous */}
          <View style={s.detailsSection}>
            <View style={s.sectionHeader}>
              <View style={s.sectionIcon}>
                <Ionicons name="calendar" size={20} color={colors.primary} />
              </View>
              <Text style={s.sectionTitle}>Détails du rendez-vous</Text>
            </View>

            <View style={s.detailCard}>
              <View style={s.detailRow}>
                <View style={s.detailIcon}>
                  <Ionicons name="calendar-outline" size={20} color={colors.primaryLight} />
                </View>
                <View style={s.detailContent}>
                  <Text style={s.detailLabel}>Date</Text>
                  <Text style={s.detailValue}>
                    {formatAppointmentDate(appointment.date)}
                  </Text>
                </View>
              </View>

              <View style={s.detailRow}>
                <View style={s.detailIcon}>
                  <Ionicons name="time-outline" size={20} color={colors.primaryLight} />
                </View>
                <View style={s.detailContent}>
                  <Text style={s.detailLabel}>Heure</Text>
                  <Text style={s.detailValue}>{appointment.time || 'Heure non disponible'}</Text>
                </View>
              </View>

              <View style={s.detailRow}>
                <View style={s.detailIcon}>
                  <Ionicons name="location-outline" size={20} color={colors.primaryLight} />
                </View>
                <View style={s.detailContent}>
                  <Text style={s.detailLabel}>Lieu</Text>
                  <Text style={s.detailValue}>
                    Centre Médical de {appointment.doctor?.district || 'Brazzaville'}
                  </Text>
                  <Text style={s.detailSubtext}>
                    Avenue de l'Indépendance, {appointment.doctor?.district || 'Brazzaville'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View style={s.actionsSection}>
            {(appointment.status === 'CONFIRMED' || appointment.status === 'PENDING') && (
              <Button
                title={appointment.status === 'CONFIRMED' ? "Annuler le rendez-vous" : "Annuler la demande"}
                onPress={handleCancelAppointment}
                icon={<Ionicons name="close-circle" size={20} color="white" />}
                style={[s.actionButton, s.cancelButton]}
              />
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.gradientStart,
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
  statusSection: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  statusBadge: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  statusText: {
    ...textStyles.body,
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  doctorSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  doctorCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
  },
  doctorAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
  detailsSection: {
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
  detailCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    ...textStyles.body,
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  detailValue: {
    ...textStyles.h4,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  detailSubtext: {
    ...textStyles.bodySmall,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  actionsSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  actionButton: {
    borderRadius: 12,
    paddingVertical: spacing.lg,
  },
  cancelButton: {
    backgroundColor: colors.error,
  },
});