import React, { useRef, useState } from 'react';
import { TextInput, View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import { radius } from '../theme/radius';
import { spacing } from '../theme/spacing';
import { textStyles } from '../theme/typography';
import { accessibilityProps, touchTargetSize } from '../utils/accessibility';

export default function Input({ 
  label,
  error,
  style, 
  containerStyle,
  size = 'medium',
  accessibilityLabel,
  accessibilityHint,
  ...props 
}) {
  const borderAnim = useRef(new Animated.Value(0)).current;
  const labelAnim = useRef(new Animated.Value(props.value ? 1 : 0)).current;
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const focus = () => {
    setIsFocused(true);
    Animated.parallel([
      Animated.timing(borderAnim, { 
        toValue: 1, 
        duration: 200, 
        useNativeDriver: false 
      }),
      Animated.timing(labelAnim, { 
        toValue: 1, 
        duration: 200, 
        useNativeDriver: false 
      })
    ]).start();
  };

  const blur = () => {
    setIsFocused(false);
    Animated.timing(borderAnim, { 
      toValue: props.value ? 1 : 0, 
      duration: 200, 
      useNativeDriver: false 
    }).start();
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [error ? colors.error : colors.border, error ? colors.error : colors.primary]
  });

  const backgroundColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.backgroundSecondary, colors.backgroundElevated]
  });

  const isSmall = size === 'small';
  const isLarge = size === 'large';
  const isPassword = props.secureTextEntry;
  const shouldShowPasswordToggle = isPassword;

  return (
    <View style={[s.container, containerStyle]}>
      {label && (
        <Text style={[
          s.label,
          isFocused && s.labelFocused,
          error && s.labelError
        ]}>
          {label}
        </Text>
      )}
      
      <Animated.View style={[
        s.wrapper, 
        { 
          borderColor, 
          backgroundColor,
          minHeight: isSmall ? 44 : isLarge ? 60 : 52,
          borderRadius: isSmall ? radius.sm : isLarge ? radius.lg : radius.md,
        }, 
        style
      ]}>
        <View style={s.inputContainer}>
          <TextInput
            {...props}
            placeholderTextColor={colors.textMuted}
            onFocus={focus}
            onBlur={blur}
            style={[
              s.input,
              isSmall ? s.inputSmall : isLarge ? s.inputLarge : s.inputMedium,
              shouldShowPasswordToggle && s.inputWithIcon
            ]}
            secureTextEntry={isPassword && !showPassword}
            multiline={false}
            numberOfLines={1}
            {...accessibilityProps.input}
            accessibilityLabel={accessibilityLabel || label}
            accessibilityHint={accessibilityHint || 'Champ de saisie'}
            accessibilityState={{ 
              disabled: props.editable === false,
              invalid: !!error 
            }}
          />
          
          {shouldShowPasswordToggle && (
            <TouchableOpacity
              style={s.passwordToggle}
              onPress={() => setShowPassword(!showPassword)}
              accessibilityLabel={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              accessibilityRole="button"
            >
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
      
      {error && (
        <Text style={s.errorText}>{error}</Text>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...textStyles.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  labelFocused: {
    color: colors.primary,
  },
  labelError: {
    color: colors.error,
  },
  wrapper: {
    borderWidth: 1.5,
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    justifyContent: 'center',
    minHeight: touchTargetSize.minimum,
    shadowColor: colors.shadowLight,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    height: '100%',
  },
  input: {
    ...textStyles.body,
    color: colors.text,
    padding: 0,
    flex: 1,
    textAlignVertical: 'center',
    includeFontPadding: false,
    textAlign: 'left',
    paddingTop: 0,
    paddingBottom: 0,
    height: '100%',
  },
  inputWithIcon: {
    paddingRight: spacing.md,
  },
  passwordToggle: {
    padding: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputSmall: {
    fontSize: 14,
    lineHeight: 20,
  },
  inputMedium: {
    fontSize: 16,
    lineHeight: 22,
  },
  inputLarge: {
    fontSize: 18,
    lineHeight: 24,
  },
  errorText: {
    ...textStyles.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
});
