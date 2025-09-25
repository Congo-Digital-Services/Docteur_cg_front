import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import colors from '../theme/colors';
import { radius } from '../theme/radius';
import { spacing } from '../theme/spacing';

export default function SlotItem({ slot, onPress, disabled }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || slot.taken}
      style={[
        s.item,
        (disabled || slot.taken) && { opacity: 0.5, borderStyle: 'dashed' }
      ]}
    >
      <Text style={s.text}>{slot.time}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  item: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: 10,
    paddingHorizontal: spacing.lg,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    backgroundColor: '#fff'
  },
  text: { color: colors.primary, fontWeight: '600' }
});
