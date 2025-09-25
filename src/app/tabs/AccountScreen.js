import React from 'react';
import { View, Text } from 'react-native';
import useAuthStore from '../../stores/auth.store';
import Button from '../../components/Button';
import { spacing } from '../../theme/spacing';

export default function AccountScreen() {
  const { user, token, logout } = useAuthStore();
  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: '800' }}>Mon compte</Text>
      <Text style={{ marginTop: 8, color: '#6B7280' }}>
        {token ? `Connecté: ${user?.email}` : 'Invité (lecture seule)'}
      </Text>
      <View style={{ height: spacing.md }} />
      {token ? <Button title="Se déconnecter" variant="secondary" onPress={logout} /> : null}
    </View>
  );
}
