import React, { useRef, useState } from 'react';
import { Pressable, Text, Animated, StyleSheet, ActivityIndicator } from 'react-native';
import colors from '../theme/colors';
import { radius } from '../theme/radius';
import { spacing } from '../theme/spacing';
import { textStyles } from '../theme/typography';
import { accessibilityProps, getAccessibilityHint, touchTargetSize } from '../utils/accessibility';

export default function Button({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'medium',
  style, 
  disabled, 
  loading = false,
  icon,
  fullWidth = false,
  accessibilityLabel,
  accessibilityHint
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const [isPressed, setIsPressed] = useState(false);

  const pressIn = () => {
    setIsPressed(true);
    Animated.parallel([
      Animated.spring(scale, { 
        toValue: 0.96, 
        useNativeDriver: true,
        tension: 300,
        friction: 10
      }),
      Animated.timing(opacity, { 
        toValue: 0.8, 
        duration: 100, 
        useNativeDriver: true 
      })
    ]).start();
  };
  
  const pressOut = () => {
    setIsPressed(false);
    Animated.parallel([
      Animated.spring(scale, { 
        toValue: 1, 
        useNativeDriver: true,
        tension: 300,
        friction: 10
      }),
      Animated.timing(opacity, { 
        toValue: 1, 
        duration: 100, 
        useNativeDriver: true 
      })
    ]).start();
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
  const isSecondary = variant === 'secondary';
  const isTertiary = variant === 'tertiary';
  const isDanger = variant === 'danger';
  const isDisabled = disabled || loading;
  
  // Tailles
  const isSmall = size === 'small';
  const isLarge = size === 'large';
  
  return (
    <Animated.View style={{ 
      transform: [{ scale }],
      opacity,
      width: fullWidth ? '100%' : undefined
    }}>
      <Pressable
        onPress={handlePress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        disabled={isDisabled}
        style={[
          s.base,
          isSmall ? s.small : isLarge ? s.large : s.medium,
          isPrimary ? s.primary : 
          isSecondary ? s.secondary : 
          isTertiary ? s.tertiary : 
          isDanger ? s.danger : s.primary,
          isDisabled && s.disabled,
          isPressed && s.pressed,
          style
        ]}
        {...accessibilityProps.button}
        accessibilityLabel={accessibilityLabel || title}
        accessibilityHint={accessibilityHint || getAccessibilityHint('submit')}
        accessibilityState={{ disabled: isDisabled }}
      >
        {loading ? (
          <ActivityIndicator 
            size="small" 
            color={isPrimary || isDanger ? colors.white : colors.primary} 
          />
        ) : (
          <>
            {icon && <>{icon}</>}
            <Text style={[
              s.text, 
              isSmall ? s.textSmall : isLarge ? s.textLarge : s.textMedium,
              isPrimary || isDanger ? s.textPrimary : 
              isSecondary ? s.textSecondary : 
              s.textTertiary
            ]}>
              {title}
            </Text>
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  small: {
    minHeight: Math.max(36, touchTargetSize.minimum),
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
  },
  medium: {
    minHeight: Math.max(48, touchTargetSize.comfortable),
    paddingHorizontal: spacing.lg,
  },
  large: {
    minHeight: Math.max(56, touchTargetSize.large),
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
  },
  primary: { 
    backgroundColor: colors.primary, 
    borderColor: colors.primary,
  },
  secondary: { 
    backgroundColor: colors.white, 
    borderColor: colors.border,
  },
  tertiary: { 
    backgroundColor: 'transparent', 
    borderColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  danger: {
    backgroundColor: colors.error,
    borderColor: colors.error,
  },
  disabled: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  pressed: {
    shadowOpacity: 0.2,
    elevation: 4,
  },
  text: {
    ...textStyles.button,
    textAlign: 'center',
  },
  textSmall: {
    fontSize: 14,
    fontWeight: '600',
  },
  textMedium: {
    fontSize: 16,
    fontWeight: '600',
  },
  textLarge: {
    fontSize: 18,
    fontWeight: '600',
  },
  textPrimary: { 
    color: colors.white 
  },
  textSecondary: { 
    color: colors.text 
  },
  textTertiary: { 
    color: colors.textSecondary 
  },
});
