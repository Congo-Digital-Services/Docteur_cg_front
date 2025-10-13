import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Animated, Pressable, ScrollView, Alert, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, radius, textStyles } from '../../theme';
import Input from '../../components/Input';
import Card from '../../components/Card';
import Button from '../../components/Button';
import HeaderGradient from '../../navigation/HeaderGradient';
import useAuthStore from '../../stores/auth.store';
import useDoctorStore from '../../stores/useDoctorStore';
import useSkillStore from '../../stores/useSkillStore';
import { getCurrentPosition } from '../../services/doctors';
import SpecialtyModal from '../../components/SpecialtyModal';

export default function SearchScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilters, setSearchFilters] = useState({ specialty: '', city: '' });
  const [userLocation, setUserLocation] = useState(null);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  const [isSpecialtyModalVisible, setIsSpecialtyModalVisible] = useState(false);
  
  // Utilisation du store des médecins
  const { 
    searchResults, 
    searchLoading, 
    searchError, 
    searchDoctors, 
    loadMoreDoctors,
    hasMore,
    clearSearchResults,
    initializeLocation,
    setUserLocation: setStoreUserLocation
  } = useDoctorStore();
  
  // Utilisation du store des spécialités
  const { 
    skills, 
    skillsLoading, 
    skillsError, 
    fetchSkills 
  } = useSkillStore();
  
  const { token } = useAuthStore();
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
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
    
    // Initialisation de la localisation et des spécialités au chargement du composant
    initializeLocationAndSearch();
    fetchSkills();
  }, []);

  const initializeLocationAndSearch = async () => {
    try {
      const location = await initializeLocation();
      if (location) {
        setUserLocation(location);
        setLocationPermissionGranted(true);
        searchDoctors({ lat: location.latitude, lon: location.longitude });
      }
    } catch (error) {
      searchDoctors({ lat: -4.2636, lon: 15.2429 });
    }
  };

  // Recherche en temps réel avec debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchQuery.length > 0 || searchFilters.specialty || searchFilters.city) {
        searchDoctors({ 
          name: searchQuery,
          specialty: searchFilters.specialty,
          city: searchFilters.city,
          lat: userLocation?.latitude,
          lon: userLocation?.longitude
        });
      } else if (userLocation) {
        searchDoctors({ lat: userLocation.latitude, lon: userLocation.longitude });
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery, searchFilters, userLocation]);

  const handleDoctorPress = (doctor) => {
    if (!token) {
      Alert.alert(
        'Connexion requise',
        'Vous devez vous connecter pour voir les détails du médecin et prendre rendez-vous.',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Se connecter', onPress: () => navigation.navigate('Auth', { screen: 'Login' }) },
        ]
      );
      return;
    }
    
    navigation.navigate('BookingStack', { 
      screen: 'DoctorDetails', 
      params: { doctorId: doctor.id } 
    });
  };

  const handleLoadMore = () => {
    if (hasMore && !searchLoading) {
      loadMoreDoctors({ 
        name: searchQuery,
        specialty: searchFilters.specialty,
        city: searchFilters.city,
        lat: userLocation?.latitude,
        lon: userLocation?.longitude
      });
    }
  };

  const handleRefreshLocation = async () => {
    try {
      const location = await getCurrentPosition();
      setUserLocation(location);
      setStoreUserLocation(location);
      searchDoctors({ 
        name: searchQuery,
        specialty: searchFilters.specialty,
        city: searchFilters.city,
        lat: location.latitude,
        lon: location.longitude
      });
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'obtenir votre position actuelle');
    }
  };

  const handleOpenSpecialtyModal = () => setIsSpecialtyModalVisible(true);
  const handleCloseSpecialtyModal = () => setIsSpecialtyModalVisible(false);
  const handleSpecialtySelect = (specialtyId) => {
    setSearchFilters(prev => ({ 
      ...prev, 
      specialty: prev.specialty === specialtyId ? '' : specialtyId 
    }));
    handleCloseSpecialtyModal();
  };

  const renderFooter = () => {
    if (!searchLoading) return null;
    return (
      <View style={s.footerLoader}>
        <Text style={s.loadingText}>Chargement...</Text>
      </View>
    );
  };

  const getSecureImageUrl = (filename) => {
    if (!filename) return null;
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '');
    return `${process.env.API_URL}/uploads/${sanitizedFilename}`;
  };

  const renderDoctorItem = ({ item, index }) => {
    // Utilisation d'une clé unique en combinant l'ID et l'index
    const itemKey = `doctor-${item.id}-${index}`;
    
    const fullName = `${item.user?.firstName || ''} ${item.user?.lastName || ''}`;
    const specialty = item.specializations && item.specializations.length > 0 
      ? item.specializations[0].skill?.name || 'Médecin' 
      : 'Médecin';
    
    const location = item.map_pin?.address || 'Adresse non spécifiée';
    const distance = item.distanceKm !== null && item.distanceKm !== undefined 
      ? `${item.distanceKm.toFixed(1)} km` 
      : null;
    
    const biography = item.biography || '';
    const licenceNumber = item.licenceNumber || '';
    const isAvailable = item.isAvailable || false;
    const isVerified = item.user?.is_verified || false;
    const profileImageUrl = getSecureImageUrl(item.profileFilename);
    
    const specializations = item.specializations || [];
    const specializationsText = specializations.length > 1 
      ? `${specialty} +${specializations.length - 1}` 
      : specialty;
    
    const openingHours = item.openingHours || [];
    const hasOpeningHours = openingHours.length > 0;
    
    return (
      <Pressable key={itemKey} onPress={() => handleDoctorPress(item)} style={s.doctorItem}>
        <View style={s.doctorCard}>
          <View style={s.doctorContent}>
            <View style={s.doctorAvatar}>
              {profileImageUrl ? (
                <Image 
                  source={{ uri: profileImageUrl }} 
                  style={s.avatarImage} 
                />
              ) : (
                <Ionicons name="medical" size={24} color={colors.primary} />
              )}
            </View>
            <View style={s.doctorInfo}>
              <View style={s.doctorNameRow}>
                <Text style={s.doctorName}>{fullName}</Text>
                {isVerified && (
                  <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                )}
              </View>
              <Text style={s.doctorSpecialty}>{specializationsText}</Text>
              
              {biography && (
                <Text style={s.doctorBiography} numberOfLines={2}>
                  {biography}
                </Text>
              )}
              
              <View style={s.doctorLocation}>
                <Ionicons name="location" size={14} color={colors.textSecondary} />
                <Text style={s.doctorAddress}>{location}</Text>
              </View>
              
              {distance && (
                <View style={s.doctorDistance}>
                  <Ionicons name="navigate" size={14} color={colors.primary} />
                  <Text style={s.distanceText}>{distance}</Text>
                </View>
              )}
              
              <View style={s.doctorStatusRow}>
                <View style={[s.availabilityBadge, { backgroundColor: isAvailable ? colors.success : colors.textTertiary }]}>
                  <Text style={s.availabilityText}>
                    {isAvailable ? 'Disponible' : 'Indisponible'}
                  </Text>
                </View>
                
                {hasOpeningHours && (
                  <View style={s.openingHoursBadge}>
                    <Ionicons name="time" size={12} color={colors.textSecondary} />
                    <Text style={s.openingHoursText}>Horaires disponibles</Text>
                  </View>
                )}
              </View>
              
              {licenceNumber && (
                <View style={s.doctorLicence}>
                  <Ionicons name="card" size={14} color={colors.textSecondary} />
                  <Text style={s.licenceText}>N°{licenceNumber}</Text>
                </View>
              )}
            </View>
            <View style={s.doctorActions}>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  const getSelectedSpecialtyName = () => {
    if (!searchFilters.specialty) return 'Toutes les spécialités';
    const specialty = skills.find(skill => skill.id === searchFilters.specialty);
    return specialty ? specialty.name : 'Toutes les spécialités';
  };

  return (
    <View style={s.container}>
      <HeaderGradient navigation={navigation} options={{ title: 'Rechercher un médecin' }} />
      
      <View style={s.searchContainer}>
        <Input 
          placeholder="Nom, spécialité ou établissement..." 
          value={searchQuery} 
          onChangeText={setSearchQuery}
          icon={<Ionicons name="search" size={20} color={colors.textSecondary} />}
        />
        
        <TouchableOpacity 
          style={s.filterButton}
          onPress={handleOpenSpecialtyModal}
        >
          <Ionicons name="filter" size={16} color={colors.primary} />
          <Text style={s.filterButtonText}>{getSelectedSpecialtyName()}</Text>
          <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
        
        <View style={s.locationContainer}>
          <Button
            title={locationPermissionGranted ? "Mettre à jour ma position" : "Activer la localisation"}
            onPress={handleRefreshLocation}
            variant="outline"
            size="small"
            icon={<Ionicons name="location" size={16} color={colors.primary} />}
          />
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
          <View style={s.resultsSection}>
            <View style={s.resultsHeader}>
              <Text style={s.resultsTitle}>
                {searchLoading ? 'Recherche...' : `Médecins à proximité (${searchResults.length})`}
              </Text>
              {userLocation && (
                <Text style={s.locationText}>
                  Position: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
                </Text>
              )}
            </View>

            <FlatList
              data={searchResults}
              keyExtractor={(item, index) => `doctor-${item.id}-${index}`}
              renderItem={renderDoctorItem}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.5}
              ListFooterComponent={renderFooter}
              ListEmptyComponent={
                !searchLoading && (
                  <Card style={s.emptyCard} variant="filled">
                    <View style={s.emptyContent}>
                      <Ionicons name="search" size={48} color={colors.textTertiary} />
                      <Text style={s.emptyTitle}>Aucun médecin trouvé</Text>
                      <Text style={s.emptySubtitle}>
                        Essayez avec d'autres mots-clés ou activez la localisation
                      </Text>
                    </View>
                  </Card>
                )
              }
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              contentContainerStyle={s.listContent}
            />
          </View>

          {searchQuery.length === 0 && searchResults.length === 0 && (
            <View style={s.helpSection}>
              <Text style={s.helpTitle}>Comment rechercher ?</Text>
              <Text style={s.helpSubtitle}>
                Vous pouvez rechercher par nom de médecin, spécialité ou établissement
              </Text>
              <Text style={s.helpSubtitle}>
                Activez la localisation pour trouver les médecins les plus proches de vous
              </Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      <SpecialtyModal
        visible={isSpecialtyModalVisible}
        skills={skills}
        selectedSpecialtyId={searchFilters.specialty}
        onSelect={handleSpecialtySelect}
        onClose={handleCloseSpecialtyModal}
      />
    </View>
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
  searchContainer: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
  },
  filterButtonText: {
    ...textStyles.body,
    fontSize: 16,
    color: colors.text,
    flex: 1,
    marginLeft: spacing.sm,
  },
  locationContainer: {
    marginTop: spacing.sm,
  },
  resultsSection: {
    paddingHorizontal: spacing.lg,
  },
  resultsHeader: {
    marginBottom: spacing.md,
  },
  resultsTitle: {
    ...textStyles.h3,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: 0.3,
  },
  locationText: {
    ...textStyles.bodySmall,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  listContent: {
    paddingBottom: spacing.section,
  },
  doctorItem: {
    marginBottom: spacing.md,
  },
  doctorCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  doctorContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.lg,
  },
  doctorAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  doctorInfo: {
    flex: 1,
  },
  doctorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  doctorName: {
    ...textStyles.h3,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginRight: spacing.xs,
  },
  doctorSpecialty: {
    ...textStyles.body,
    fontSize: 15,
    color: colors.primary,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  doctorBiography: {
    ...textStyles.bodySmall,
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    lineHeight: 18,
  },
  doctorLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  doctorAddress: {
    ...textStyles.bodySmall,
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  doctorDistance: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  distanceText: {
    ...textStyles.bodySmall,
    fontSize: 14,
    color: colors.primary,
    marginLeft: spacing.sm,
    fontWeight: '500',
  },
  doctorStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  availabilityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: radius.sm,
    marginRight: spacing.sm,
  },
  availabilityText: {
    ...textStyles.bodySmall,
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  openingHoursBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  openingHoursText: {
    ...textStyles.bodySmall,
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: spacing.xs / 2,
  },
  doctorLicence: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  licenceText: {
    ...textStyles.bodySmall,
    fontSize: 12,
    color: colors.textTertiary,
    marginLeft: spacing.sm,
  },
  doctorActions: {
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing.section,
    borderRadius: 16,
    backgroundColor: colors.backgroundSecondary,
  },
  emptyContent: {
    alignItems: 'center',
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
    ...textStyles.bodySmall,
    fontSize: 14,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
  helpSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    paddingBottom: spacing.section,
  },
  helpTitle: {
    ...textStyles.h3,
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  helpSubtitle: {
    ...textStyles.body,
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  footerLoader: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  loadingText: {
    ...textStyles.body,
    color: colors.textSecondary,
  },
});