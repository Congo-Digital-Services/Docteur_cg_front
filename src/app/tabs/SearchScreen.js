import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, Animated, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Card from '../../components/Card';
import DoctoCard from '../../components/DoctoCard';
import useSearchStore from '../../stores/search.store';
import specialties from '../../mocks/specialties.json';
import cities from '../../mocks/cities.json';
import * as Location from 'expo-location';
import { haversineKm } from '../../utils/distance';
import { spacing } from '../../theme/spacing';
import colors from '../../theme/colors';
import { textStyles } from '../../theme/typography';

export default function SearchScreen({ navigation }) {
  const { filters, setFilters, results, run, location, setLocation } = useSearchStore();
  const [distances, setDistances] = useState({});
  const [locDenied, setLocDenied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => { 
    run();
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

  const askLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setLocDenied(true);
      setLocation(null);
      return;
    }
    const loc = await Location.getCurrentPositionAsync({});
    const my = { lat: loc.coords.latitude, lng: loc.coords.longitude };
    setLocation(my);
    setLocDenied(false);
  };

  useEffect(() => {
    if (!location) return;
    const map = {};
    for (const d of results) {
      map[d.id] = haversineKm(location, { lat: d.lat, lng: d.lng });
    }
    setDistances(map);
  }, [location, results]);

  const onRefresh = async () => {
    setRefreshing(true);
    await run();
    setRefreshing(false);
  };

  const clearFilters = () => {
    setFilters({ name: '', specialty: null, city: null });
  };

  const hasActiveFilters = filters.name || filters.specialty || filters.city;

  return (
    <View style={s.container}>
      <Animated.View style={[
        s.content,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>Rechercher un médecin</Text>
          <Text style={s.subtitle}>Trouvez le professionnel de santé adapté à vos besoins</Text>
        </View>

        {/* Filters Card */}
        <Card style={s.filtersCard} elevation="low">
          <View style={s.filtersHeader}>
            <Text style={s.filtersTitle}>Filtres de recherche</Text>
            {hasActiveFilters && (
              <Button
                title="Effacer"
                variant="tertiary"
                size="small"
                onPress={clearFilters}
              />
            )}
          </View>
          
          <Input 
            label="Nom du médecin"
            placeholder="Ex: Dr Martin" 
            value={filters.name} 
            onChangeText={(v) => setFilters({ name: v })} 
          />
          
          <Input 
            label="Spécialité"
            placeholder="Ex: Dermatologue" 
            value={filters.specialty || ''} 
            onChangeText={(v) => setFilters({ specialty: v || null })} 
          />
          
          <Input 
            label="Ville"
            placeholder="Ex: Paris" 
            value={filters.city || ''} 
            onChangeText={(v) => setFilters({ city: v || null })} 
          />

          <View style={s.buttonRow}>
            <Button 
              title="Rechercher" 
              onPress={run}
              icon={<Ionicons name="search" size={16} color={colors.white} />}
              style={s.searchButton}
            />
            <Button 
              title="Géolocalisation" 
              variant="secondary"
              onPress={askLocation}
              icon={<Ionicons name="location" size={16} color={colors.primary} />}
              style={s.locationButton}
            />
          </View>

          {locDenied && (
            <View style={s.warningContainer}>
              <Ionicons name="warning" size={16} color={colors.warning} />
              <Text style={s.warningText}>Géolocalisation refusée - Distance masquée</Text>
            </View>
          )}
        </Card>

        {/* Results */}
        <View style={s.resultsSection}>
          <View style={s.resultsHeader}>
            <Text style={s.resultsTitle}>
              Résultats ({results.length})
            </Text>
            {location && (
              <View style={s.locationIndicator}>
                <Ionicons name="location" size={14} color={colors.success} />
                <Text style={s.locationText}>Avec distance</Text>
              </View>
            )}
          </View>

          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <DoctoCard
                doctor={item}
                distanceKm={location ? distances[item.id] : null}
                onPress={() => navigation.navigate('DoctorDetails', { id: item.id })}
              />
            )}
            ListEmptyComponent={
              <Card style={s.emptyCard} variant="filled">
                <View style={s.emptyContent}>
                  <Ionicons name="search" size={48} color={colors.textTertiary} />
                  <Text style={s.emptyTitle}>Aucun médecin trouvé</Text>
                  <Text style={s.emptySubtitle}>
                    Essayez de modifier vos critères de recherche
                  </Text>
                </View>
              </Card>
            }
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={s.listContent}
          />
        </View>

        {/* Help Text */}
        <View style={s.helpSection}>
          <Text style={s.helpTitle}>Spécialités disponibles</Text>
          <Text style={s.helpText}>
            {specialties.slice(0, 5).join(', ')}...
          </Text>
          <Text style={s.helpTitle}>Villes disponibles</Text>
          <Text style={s.helpText}>
            {cities.join(', ')}
          </Text>
        </View>
      </Animated.View>
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
    paddingHorizontal: spacing.lg,
  },
  header: {
    marginBottom: spacing.lg,
    paddingTop: spacing.lg,
  },
  title: {
    ...textStyles.h1,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...textStyles.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  filtersCard: {
    marginBottom: spacing.lg,
  },
  filtersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  filtersTitle: {
    ...textStyles.h3,
    color: colors.text,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  searchButton: {
    flex: 1,
  },
  locationButton: {
    flex: 1,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.warningLight,
    borderRadius: 8,
  },
  warningText: {
    ...textStyles.caption,
    color: colors.warning,
    marginLeft: spacing.xs,
  },
  resultsSection: {
    flex: 1,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  resultsTitle: {
    ...textStyles.h3,
    color: colors.text,
  },
  locationIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    ...textStyles.caption,
    color: colors.success,
    marginLeft: spacing.xs,
  },
  listContent: {
    paddingBottom: spacing.section,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing.section,
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyTitle: {
    ...textStyles.h3,
    color: colors.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    ...textStyles.bodySmall,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  helpSection: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
  },
  helpTitle: {
    ...textStyles.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  helpText: {
    ...textStyles.caption,
    color: colors.textTertiary,
    marginBottom: spacing.sm,
  },
});
