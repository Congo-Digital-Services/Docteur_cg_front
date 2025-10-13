import React, { useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Animated, Pressable, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, G, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

import useBookingStore from '../../stores/booking.store';
import useAuthStore from '../../stores/auth.store';
import Button from '../../components/Button';
import Card from '../../components/Card';
import HeaderGradient from '../../navigation/HeaderGradient';
import { colors, spacing, radius, textStyles } from '../../theme';

export default function AppointmentsScreen({ navigation }) {
  // CORRECTION : On utilise des alias pour faire correspondre les noms des fonctions du store
  const { appointments, loadMyAppointments: loadMine, cancelAppointment: cancel } = useBookingStore();
  const { user, token } = useAuthStore();
  
  // États pour la pagination et suppression
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAppointments, setSelectedAppointments] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  
  const ITEMS_PER_PAGE = 10;
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    console.log('[AppointmentsScreen] useEffect - Token:', token ? 'Présent' : 'Absent');
    if (token) {
      console.log('[AppointmentsScreen] Chargement des rendez-vous...');
      loadMine().then(response => {
        console.log('[AppointmentsScreen] Rendez-vous chargés:', response);
        console.log('[AppointmentsScreen] Nombre de rendez-vous:', appointments.length);
      }).catch(error => {
        console.error('[AppointmentsScreen] Erreur lors du chargement des rendez-vous:', error);
      });
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
  }, [token]);

  const handleLoginPress = () => {
    console.log('[AppointmentsScreen] Navigation vers la page de connexion');
    navigation.navigate('Auth', { screen: 'Login' });
  };

  // Calcul de la pagination
  const totalPages = Math.ceil(appointments.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedAppointments = appointments.slice(startIndex, endIndex);
  
  console.log('[AppointmentsScreen] Pagination - Page actuelle:', currentPage, 'Total pages:', totalPages);
  console.log('[AppointmentsScreen] Rendez-vous affichés:', paginatedAppointments.length, 'sur', appointments.length);

  // Fonctions de gestion
  const handlePageChange = (page) => {
    console.log('[AppointmentsScreen] Changement de page vers:', page);
    setCurrentPage(page);
  };

  const handleLongPress = (appointment) => {
    console.log('[AppointmentsScreen] Appui long sur le rendez-vous:', appointment.id);
    setIsSelectionMode(true);
    toggleSelection(appointment.id);
  };

  const confirmDelete = () => {
    if (appointmentToDelete) {
      console.log('[AppointmentsScreen] Confirmation de suppression du rendez-vous:', appointmentToDelete.id);
      cancel(appointmentToDelete.id).then(() => {
        console.log('[AppointmentsScreen] Rendez-vous supprimé avec succès');
        setDeleteModalVisible(false);
        setAppointmentToDelete(null);
      }).catch(error => {
        console.error('[AppointmentsScreen] Erreur lors de la suppression du rendez-vous:', error);
      });
    }
  };

  const toggleSelection = (appointmentId) => {
    console.log('[AppointmentsScreen] Basculement de la sélection pour le rendez-vous:', appointmentId);
    setSelectedAppointments(prev => {
      const newSelection = prev.includes(appointmentId) 
        ? prev.filter(id => id !== appointmentId)
        : [...prev, appointmentId];
      console.log('[AppointmentsScreen] Nouvelle sélection:', newSelection);
      return newSelection;
    });
  };

  const handleBulkDelete = () => {
    if (selectedAppointments.length > 0) {
      console.log('[AppointmentsScreen] Suppression en masse de', selectedAppointments.length, 'rendez-vous');
      setDeleteModalVisible(true);
    }
  };

  const confirmBulkDelete = () => {
    console.log('[AppointmentsScreen] Confirmation de suppression en masse');
    selectedAppointments.forEach(id => {
      console.log('[AppointmentsScreen] Suppression du rendez-vous:', id);
      cancel(id).catch(error => {
        console.error('[AppointmentsScreen] Erreur lors de la suppression du rendez-vous', id, ':', error);
      });
    });
    setSelectedAppointments([]);
    setIsSelectionMode(false);
    setDeleteModalVisible(false);
  };

  const exitSelectionMode = () => {
    console.log('[AppointmentsScreen] Sortie du mode de sélection');
    setIsSelectionMode(false);
    setSelectedAppointments([]);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return '#F59E0B';
      case 'CONFIRMED': return '#10B981';
      case 'DECLINED': return '#EF4444';
      default: return colors.textSecondary;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING': return 'En attente';
      case 'CONFIRMED': return 'Confirmé';
      case 'DECLINED': return 'Annulé';
      default: return status;
    }
  };

  const renderAppointmentItem = ({ item }) => {
    const isSelected = selectedAppointments.includes(item.id);
    console.log('[AppointmentsScreen] Rendu du rendez-vous:', item.id, 'Sélectionné:', isSelected);

    const handleCardPress = () => {
      if (isSelectionMode) {
        toggleSelection(item.id);
      } else {
        console.log('[AppointmentsScreen] Navigation vers les détails du rendez-vous:', item.id);
        navigation.navigate('BookingStack', {
          screen: 'AppointmentDetails',
          params: { appointment: item }
        });
      }
    };

    return (
      <Pressable
        onLongPress={() => handleLongPress(item)}
        onPress={handleCardPress}
        style={[
          s.appointmentCard,
          isSelected && s.selectedCard
        ]}
      >
        <View style={s.card}>
          <View style={s.cardHeader}>
            <View style={s.doctorInfo}>
              <View style={s.doctorAvatar}>
                <Text style={s.doctorInitial}>
                  {(item.doctor?.lastName || 'D').charAt(0)}
                </Text>
              </View>
              <View style={s.doctorDetails}>
                <Text style={s.doctorName}>
                  {item.doctor?.title || 'Dr'} {item.doctor?.lastName || 'Nom non disponible'}
                </Text>
                <Text style={s.doctorSpecialty}>
                  {item.doctor?.specialty || 'Spécialité non disponible'}
                </Text>
              </View>
            </View>
            
            {isSelectionMode && (
              <View style={s.selectionIndicator}>
                <View style={[s.checkbox, isSelected && s.checkboxSelected]}>
                  {isSelected && <Ionicons name="checkmark" size={16} color="white" />}
                </View>
              </View>
            )}
          </View>

          <View style={s.appointmentDetails}>
            <View style={s.detailRow}>
              <View style={s.detailIcon}>
                <Ionicons name="calendar-outline" size={16} color={colors.primary} />
              </View>
              <Text style={s.detailText}>
                {new Date(item.date).toLocaleDateString('fr-FR', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short'
                })}
              </Text>
            </View>
            
            <View style={s.detailRow}>
              <View style={s.detailIcon}>
                <Ionicons name="time-outline" size={16} color={colors.primary} />
              </View>
              <Text style={s.detailText}>{item.time}</Text>
            </View>
          </View>

          <View style={s.cardFooter}>
            <View style={[s.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={s.statusText}>
                {getStatusText(item.status)}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <View style={s.paginationContainer}>
        <Pressable
          style={[s.paginationButton, currentPage === 1 && s.paginationButtonDisabled]}
          onPress={() => currentPage > 1 && handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <Ionicons name="chevron-back" size={20} color={currentPage === 1 ? colors.textTertiary : colors.primary} />
        </Pressable>

        <View style={s.paginationInfo}>
          <Text style={s.paginationText}>
            Page {currentPage} sur {totalPages}
          </Text>
        </View>

        <Pressable
          style={[s.paginationButton, currentPage === totalPages && s.paginationButtonDisabled]}
          onPress={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <Ionicons name="chevron-forward" size={20} color={currentPage === totalPages ? colors.textTertiary : colors.primary} />
        </Pressable>
      </View>
    );
  };

  const renderSelectionToolbar = () => {
    if (!isSelectionMode) return null;

    return (
      <View style={s.selectionToolbar}>
        <Pressable style={s.toolbarButton} onPress={exitSelectionMode}>
          <Ionicons name="close" size={20} color={colors.textSecondary} />
        </Pressable>

        <Text style={s.selectionCount}>
          {selectedAppointments.length} sélectionné{selectedAppointments.length > 1 ? 's' : ''}
        </Text>

        <Pressable 
          style={[s.toolbarButton, selectedAppointments.length === 0 && s.toolbarButtonDisabled]} 
          onPress={handleBulkDelete}
          disabled={selectedAppointments.length === 0}
        >
          <Ionicons name="trash-outline" size={20} color={selectedAppointments.length === 0 ? colors.textTertiary : colors.error} />
        </Pressable>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={s.emptyContainer}>
      <View style={s.emptyIcon}>
        <Ionicons name="calendar-outline" size={64} color={colors.textTertiary} />
      </View>
      <Text style={s.emptyTitle}>Aucun rendez-vous</Text>
      <Text style={s.emptySubtitle}>
        Vous n'avez pas encore de rendez-vous programmés
      </Text>
      <Button 
        title="Prendre un rendez-vous" 
        onPress={() => {
          console.log('[AppointmentsScreen] Navigation vers la recherche de médecins');
          navigation.navigate('Search');
        }}
        style={s.emptyButton}
      />
    </View>
  );

  const renderGuestState = () => (
    <View style={s.guestContainer}>
      <View style={s.calendarIconContainer}>
        <Svg width="80" height="80" viewBox="0 0 128 128" fill="none">
          {/* Calendrier arrière (plus bas + un peu à droite) */}
          <Rect x="48" y="48" width="72" height="76" rx="4" fill="#1976D2"/>
          <Rect x="48" y="48" width="72" height="20" fill="#0D47A1"/>
          <Rect x="60" y="36" width="12" height="16" rx="2" fill="#0D47A1"/>
          <Rect x="88" y="36" width="12" height="16" rx="2" fill="#0D47A1"/>
          
          {/* Calendrier avant */}
          <Rect x="20" y="28" width="72" height="76" rx="4" fill="#29B6F6"/>
          <Rect x="20" y="28" width="72" height="20" fill="#1976D2"/>
          <Rect x="32" y="16" width="12" height="16" rx="2" fill="#1976D2"/>
          <Rect x="68" y="16" width="12" height="16" rx="2" fill="#1976D2"/>
          
          {/* Jours */}
          <Rect x="32" y="56" width="12" height="12" rx="2" fill="#1565C0"/>
          <Rect x="52" y="56" width="12" height="12" rx="2" fill="#ffffff"/>
          <Rect x="32" y="76" width="12" height="12" rx="2" fill="#ffffff"/>
          <Rect x="52" y="76" width="12" height="12" rx="2" fill="#1565C0"/>
          <Rect x="72" y="76" width="12" height="12" rx="2" fill="#FBC02D"/>
        </Svg>
      </View>

      <Text style={s.guestTitle}>Planifiez vos rendez-vous</Text>
      <Text style={s.guestSubtitle}>
        Trouvez un professionnel de la santé et prenez rendez-vous en ligne à tout moment.
      </Text>

      <Pressable style={s.connectButton} onPress={handleLoginPress}>
        <Text style={s.connectButtonText}>SE CONNECTER</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={s.container}>
      <HeaderGradient navigation={navigation} options={{ title: 'Mes rendez-vous' }} />

      <Animated.View style={[
        s.content,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}>

        {/* Content */}
        <View style={s.body}>
          {!token ? (
            renderGuestState()
          ) : appointments.length === 0 ? (
            renderEmptyState()
          ) : (
            <>
              {renderSelectionToolbar()}
              <FlatList
                data={paginatedAppointments}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderAppointmentItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={s.listContent}
                onEndReached={() => {
                  // Implémentation du chargement infini si nécessaire
                  console.log('[AppointmentsScreen] Fin de la liste atteinte');
                }}
                onEndReachedThreshold={0.5}
              />
              {renderPagination()}
            </>
          )}
        </View>
      </Animated.View>

      {/* Modal de confirmation de suppression */}
      <Modal
        visible={deleteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <Ionicons name="warning" size={32} color={colors.warning} />
              <Text style={s.modalTitle}>Supprimer les rendez-vous</Text>
            </View>
            
            <Text style={s.modalMessage}>
              Êtes-vous sûr de vouloir supprimer {selectedAppointments.length} rendez-vous ? Cette action est irréversible.
            </Text>
            
            <View style={s.modalActions}>
              <Pressable 
                style={s.modalButtonSecondary} 
                onPress={() => {
                  console.log('[AppointmentsScreen] Annulation de la suppression');
                  setDeleteModalVisible(false);
                }}
              >
                <Text style={s.modalButtonSecondaryText}>Annuler</Text>
              </Pressable>
              
              <Pressable 
                style={s.modalButtonPrimary} 
                onPress={confirmBulkDelete}
              >
                <Text style={s.modalButtonPrimaryText}>Supprimer</Text>
              </Pressable>
            </View>
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
  content: {
    flex: 1,
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  listContent: {
    paddingBottom: spacing.section,
  },
  // Styles pour les cartes de rendez-vous
  appointmentCard: {
    marginBottom: spacing.sm,
  },
  selectedCard: {
    transform: [{ scale: 0.98 }],
    opacity: 0.8,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  doctorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  doctorInitial: {
    ...textStyles.h4,
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  doctorDetails: {
    flex: 1,
  },
  doctorName: {
    ...textStyles.h4,
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 1,
  },
  doctorSpecialty: {
    ...textStyles.body,
    fontSize: 13,
    color: colors.textSecondary,
  },
  selectionIndicator: {
    marginLeft: spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  appointmentDetails: {
    marginBottom: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  detailIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  detailText: {
    ...textStyles.body,
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 16,
  },
  statusText: {
    ...textStyles.caption,
    fontSize: 11,
    fontWeight: '600',
    color: 'white',
  },

  // Styles pour la pagination
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  paginationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  paginationButtonDisabled: {
    backgroundColor: colors.borderLight,
    shadowOpacity: 0,
    elevation: 0,
  },
  paginationInfo: {
    marginHorizontal: spacing.lg,
  },
  paginationText: {
    ...textStyles.body,
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },

  // Styles pour la barre de sélection
  selectionToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  toolbarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolbarButtonDisabled: {
    opacity: 0.5,
  },
  selectionCount: {
    ...textStyles.body,
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '600',
  },

  // Styles pour le modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    ...textStyles.h3,
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  modalMessage: {
    ...textStyles.body,
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  modalButtonSecondary: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
  },
  modalButtonSecondaryText: {
    ...textStyles.button,
    fontSize: 16,
    color: colors.textSecondary,
  },
  modalButtonPrimary: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    backgroundColor: colors.error,
    alignItems: 'center',
  },
  modalButtonPrimaryText: {
    ...textStyles.button,
    fontSize: 16,
    color: 'white',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.section,
  },
  emptyIcon: {
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...textStyles.h2,
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...textStyles.body,
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  emptyButton: {
    marginTop: spacing.md,
  },
  guestContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.section,
    paddingHorizontal: spacing.xl,
  },
  calendarIconContainer: {
    position: 'relative',
    marginBottom: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestTitle: {
    ...textStyles.h2,
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  guestSubtitle: {
    ...textStyles.body,
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  connectButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 8,
    minWidth: 200,
  },
  connectButtonText: {
    ...textStyles.button,
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});