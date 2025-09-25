import React, { useRef, useState } from 'react';
import { Pressable, Text, Animated, StyleSheet, ActivityIndicator } from 'react-native';
import colors from '../theme/colors';
import { radius } from '../theme/radius';
import { spacing } from '../theme/spacing';

export default function Button({ title, onPress, variant = 'primary', style, disabled, loading = false }) {
  const scale = useRef(new Animated.Value(1)).current;
  const [isPressed, setIsPressed] = useState(false);

  const pressIn = () => {
    setIsPressed(true);
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
  };
  
  const pressOut = () => {
    setIsPressed(false);
    Animated.spring(scale, { toValue: 1, friction: 3, useNativeDriver: true }).start();
  };

  const handlePress = async () => {
    if (loading || disabled) return;
    
    try {
      await onPress();
    } catch (error) {
      console.error('Button press error:', error);
    }
  };

  const isPrimary = variant === 'primary';
  const isTertiary = variant === 'tertiary';
  const isDisabled = disabled || loading;
  
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={handlePress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        disabled={isDisabled}
        style={[
          s.base,
          isPrimary ? s.primary : isTertiary ? s.tertiary : s.secondary,
          isDisabled && { opacity: 0.6 },
          isPressed && s.pressed,
          style
        ]}
      >
        {loading ? (
          <ActivityIndicator 
            size="small" 
            color={isPrimary ? colors.white : colors.primary} 
          />
        ) : (
          <Text style={[
            s.text, 
            isPrimary ? s.textPrimary : isTertiary ? s.textTertiary : s.textSecondary
          ]}>
            {title}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: 16,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1
  },
  primary: { backgroundColor: colors.primary, borderColor: colors.primary },
  secondary: { backgroundColor: 'transparent', borderColor: colors.primary },
  tertiary: { backgroundColor: 'transparent', borderColor: 'transparent' },
  pressed: {
    shadowOpacity: 0.2,
    elevation: 2,
  },
  text: { fontSize: 16, fontWeight: '600' },
  textPrimary: { color: colors.white },
  textSecondary: { color: colors.primary },
  textTertiary: { color: colors.textSecondary }
});
