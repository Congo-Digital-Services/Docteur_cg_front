import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Button from '../../components/Button';
import { useThemeMode } from '../../theme/ThemeContext';
import { spacing } from '../../theme/spacing';

export default function HomeScreen({ navigation }) {
  const { toggle } = useThemeMode();
  return (
    <View style={s.root}>
      <Text style={s.h}>Bienvenue 👋</Text>
      <Text style={s.p}>Recherchez un médecin par spécialité, ville ou nom.</Text>
      <View style={{ height: spacing.lg }} />
      <Button title="Chercher un médecin" onPress={() => navigation.navigate('Search')} />
      <View style={{ height: spacing.sm }} />
      <Button title="Basculer Light/Dark" variant="secondary" onPress={toggle} />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, padding: 20 },
  h: { fontSize: 22, fontWeight: '800' },
  p: { color: '#6B7280', marginTop: 6 }
});
