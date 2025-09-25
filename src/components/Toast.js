import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import colors from '../theme/colors';
import { spacing } from '../theme/spacing';
import { radius } from '../theme/radius';

// Simple event bus
export const toast = {
  show: (msg) => {
    globalThis.__toast && globalThis.__toast(msg);
  }
};

export default function Toast() {
  const y = useRef(new Animated.Value(-80)).current;
  const [msg, setMsg] = useState('');
  useEffect(() => {
    globalThis.__toast = (m) => {
      setMsg(m);
      Animated.sequence([
        Animated.timing(y, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.delay(1600),
        Animated.timing(y, { toValue: -80, duration: 200, useNativeDriver: true })
      ]).start();
    };
    return () => (globalThis.__toast = null);
  }, []);
  return (
    <Animated.View style={[s.wrap, { transform: [{ translateY: y }] }]}>
      <Text style={s.text}>{msg}</Text>
    </Animated.View>
  );
}
const s = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 40,
    alignSelf: 'center',
    backgroundColor: colors.text,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderRadius: radius.pill,
    zIndex: 999
  },
  text: { color: 'white', fontWeight: '600' }
});
