import React, { useRef } from 'react';
import { TextInput, View, StyleSheet, Animated } from 'react-native';
import colors from '../theme/colors';
import { radius } from '../theme/radius';
import { spacing } from '../theme/spacing';

export default function Input({ style, ...props }) {
  const border = useRef(new Animated.Value(0)).current;
  const focus = () =>
    Animated.timing(border, { toValue: 1, duration: 200, useNativeDriver: false }).start();
  const blur = () =>
    Animated.timing(border, { toValue: 0, duration: 200, useNativeDriver: false }).start();

  const borderColor = border.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.primary]
  });

  return (
    <Animated.View style={[s.wrapper, { borderColor }, style]}>
      <TextInput
        placeholderTextColor={colors.textMuted}
        onFocus={focus}
        onBlur={blur}
        style={s.input}
        {...props}
      />
    </Animated.View>
  );
}

const s = StyleSheet.create({
  wrapper: {
    borderWidth: 1,
    borderRadius: radius.lg,
    backgroundColor: 'white',
    paddingHorizontal: spacing.md,
    height: 48,
    justifyContent: 'center'
  },
  input: { fontSize: 16 }
});
