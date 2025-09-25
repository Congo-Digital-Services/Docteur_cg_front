import React from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import Button from './Button';
import colors from '../theme/colors';
import { spacing } from '../theme/spacing';
import { radius } from '../theme/radius';

export default function LoginRequiredModal({ visible, onClose, onLogin }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={s.overlay}>
        <View style={s.card}>
          <Text style={s.title}>Connexion requise</Text>
          <Text style={s.sub}>Veuillez vous connecter pour prendre un rendez-vous.</Text>
          <View style={{ height: spacing.md }} />
          <Button title="Se connecter" onPress={onLogin} />
          <View style={{ height: spacing.sm }} />
          <Button title="Fermer" variant="secondary" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.overlay, alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: '#fff', padding: spacing.lg, borderRadius: radius.lg, width: '84%' },
  title: { fontSize: 18, fontWeight: '700' },
  sub: { color: colors.textMuted, marginTop: 6 }
});
