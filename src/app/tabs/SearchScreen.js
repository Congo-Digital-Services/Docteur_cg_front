import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import Input from '../../components/Input';
import Button from '../../components/Button';
import DoctoCard from '../../components/DoctoCard';
import useSearchStore from '../../stores/search.store';
import specialties from '../../mocks/specialties.json';
import cities from '../../mocks/cities.json';
import * as Location from 'expo-location';
import { haversineKm } from '../../utils/distance';
import { spacing } from '../../theme/spacing';

export default function SearchScreen({ navigation }) {
  const { filters, setFilters, results, run, location, setLocation } = useSearchStore();
  const [distances, setDistances] = useState({});
  const [locDenied, setLocDenied] = useState(false);

  useEffect(() => { run(); }, []);

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

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={s.h}>Filtres</Text>
      <View style={{ height: 8 }} />
      <Input placeholder="Nom (ex: Martin)" value={filters.name} onChangeText={(v) => setFilters({ name: v })} />
      <View style={{ height: 8 }} />
      <Input placeholder="Spécialité (ex: Dermatologue)" value={filters.specialty || ''} onChangeText={(v) => setFilters({ specialty: v || null })} />
      <View style={{ height: 8 }} />
      <Input placeholder="Ville (ex: Lyon)" value={filters.city || ''} onChangeText={(v) => setFilters({ city: v || null })} />
      <View style={{ height: 8 }} />
      <Button title="Appliquer" onPress={run} />
      <View style={{ height: 8 }} />
      <Button title="Activer la géolocalisation" variant="secondary" onPress={askLocation} />
      {locDenied ? <Text style={s.note}>Géoloc refusée → distance masquée.</Text> : null}
      <View style={{ height: spacing.md }} />
      <Text style={s.h}>Résultats</Text>
      <FlatList
        data={results}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <DoctoCard
            doctor={item}
            distanceKm={location ? distances[item.id] : null}
            onPress={() => navigation.navigate('DoctorDetails', { id: item.id })}
          />
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>Aucun médecin</Text>}
      />
      <View style={{ height: spacing.md }} />
      <Text style={s.note}>Spécialités démo: {specialties.slice(0,5).join(', ')}…  •  Villes: {cities.join(', ')}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  h: { fontSize: 18, fontWeight: '700' },
  note: { color: '#6B7280', marginTop: 6, fontSize: 12 }
});
