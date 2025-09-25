import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import colors from '../theme/colors';
import { radius } from '../theme/radius';
import { spacing } from '../theme/spacing';

export default function Card({ 
  children, 
  style, 
  onPress,
  variant = 'default',
  padding = 'medium',
  elevation = 'low'
}) {
  const isPressable = !!onPress;
  const isElevated = elevation === 'high';
  const isFlat = elevation === 'none';
  
  const paddingValue = padding === 'small' ? spacing.sm : 
                      padding === 'large' ? spacing.lg : 
                      spacing.md;

  const cardStyle = [
    s.card,
    variant === 'outlined' && s.outlined,
    variant === 'filled' && s.filled,
    isElevated && s.elevated,
    isFlat && s.flat,
    { padding: paddingValue },
    style
  ];

  if (isPressable) {
    return (
      <Pressable onPress={onPress} style={cardStyle}>
        {children}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.backgroundElevated,
    borderRadius: radius.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  outlined: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  filled: {
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 0,
  },
  elevated: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  flat: {
    shadowOpacity: 0,
    elevation: 0,
    borderWidth: 0,
  },
});
