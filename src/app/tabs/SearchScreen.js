import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Animated, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, spacing, radius, textStyles } from '../../theme';
import Input from '../../components/Input';
import Card from '../../components/Card';
import doctors from '../../mocks/doctors.json';
import specialties from '../../mocks/specialties.json';

export default function SearchScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const insets = useSafeAreaInsets();
  const [isSearching, setIsSearching] = useState(false);
  
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
  }, []);

  // Recherche en temps réel
  useEffect(() => {
    if (searchQuery.length === 0) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    // Simulation d'un délai de recherche
    const timeout = setTimeout(() => {
      const results = doctors.filter(doctor => {
        const query = searchQuery.toLowerCase();
        const fullName = `${doctor.title} ${doctor.lastName}`.toLowerCase();
        return (
          fullName.includes(query) ||
          (doctor.specialty && doctor.specialty.toLowerCase().includes(query)) ||
          (doctor.city && doctor.city.toLowerCase().includes(query))
        );
      });
      
      setSearchResults(results);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const handleDoctorPress = (doctor) => {
    navigation.navigate('BookingStack', { 
      screen: 'DoctorDetails', 
      params: { doctor } 
    });
  };

  const renderDoctorItem = ({ item }) => (
    <Pressable onPress={() => handleDoctorPress(item)} style={s.doctorItem}>
      <View style={s.doctorCard}>
        <View style={s.doctorContent}>
          <View style={s.doctorAvatar}>
            <Ionicons name="medical" size={24} color={colors.primary} />
          </View>
          <View style={s.doctorInfo}>
            <Text style={s.doctorName}>{item.title} {item.lastName}</Text>
            <Text style={s.doctorSpecialty}>{item.specialty}</Text>
            <View style={s.doctorLocation}>
              <Ionicons name="location" size={14} color={colors.textSecondary} />
              <Text style={s.doctorAddress}>{item.city}</Text>
            </View>
          </View>
          <View style={s.doctorActions}>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </View>
        </View>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {/* Header exactement comme l'écran de détails */}
      <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={s.header}>
          <View style={{ width: 24 }} />
          <Text style={s.title}>Rechercher un médecin</Text>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      {/* Search Input fixe */}
      <View style={s.searchContainer}>
        <Input 
          placeholder="Nom, spécialité ou établissement..." 
          value={searchQuery} 
          onChangeText={setSearchQuery}
          icon={<Ionicons name="search" size={20} color={colors.textSecondary} />}
        />
      </View>

      <ScrollView style={s.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View style={[
          s.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}>

          {/* Search Results */}
          {searchQuery.length > 0 && (
            <View style={s.resultsSection}>
              <View style={s.resultsHeader}>
                <Text style={s.resultsTitle}>
                  {isSearching ? 'Recherche...' : `Résultats (${searchResults.length})`}
                </Text>
              </View>

              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderDoctorItem}
                ListEmptyComponent={
                  !isSearching && (
                    <Card style={s.emptyCard} variant="filled">
                      <View style={s.emptyContent}>
                        <Ionicons name="search" size={48} color={colors.textTertiary} />
                        <Text style={s.emptyTitle}>Aucun médecin trouvé</Text>
                        <Text style={s.emptySubtitle}>
                          Essayez avec d'autres mots-clés
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
          )}

          {/* Help Section */}
          {searchQuery.length === 0 && (
            <View style={s.helpSection}>
              <Text style={s.helpTitle}>Spécialités disponibles</Text>
              <View style={s.specialtiesContainer}>
                {specialties.slice(0, 8).map((specialty, index) => (
                  <View key={index} style={s.specialtyTag}>
                    <Text style={s.specialtyText}>{specialty}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
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
  header: {
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center'
  },
  title: { 
    color: 'white', 
    fontSize: 18, 
    fontWeight: '700', 
    textAlign: 'center', 
    flex: 1 
  },
  searchContainer: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
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
  },
  doctorContent: {
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    ...textStyles.h3,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  doctorSpecialty: {
    ...textStyles.body,
    fontSize: 15,
    color: colors.primary,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  doctorLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  doctorAddress: {
    ...textStyles.bodySmall,
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  doctorActions: {
    marginLeft: spacing.md,
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
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
    letterSpacing: 0.3,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  specialtyTag: {
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  specialtyText: {
    ...textStyles.bodySmall,
    fontSize: 13,
    fontWeight: '500',
    color: colors.primary,
  },
});