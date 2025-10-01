// src/components/CountdownTimer.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { textStyles } from '../theme/typography';
import colors from '../theme/colors';

export default function CountdownTimer({ 
  duration = 300, // en secondes
  onComplete,
  onTick,
  style,
  textStyle,
  format = 'mm:ss'
}) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const timerRef = useRef(null);

  useEffect(() => {
    if (timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        const newTime = timeLeft - 1;
        setTimeLeft(newTime);
        onTick?.(newTime);
      }, 1000);
    } else {
      onComplete?.();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timeLeft, onComplete, onTick]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    
    switch (format) {
      case 'mm:ss':
        return `${mins}:${secs.toString().padStart(2, '0')}`;
      case 'ss':
        return `${seconds}s`;
      case 'mm':
        return `${mins}min`;
      default:
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
  };

  const isExpired = timeLeft === 0;

  return (
    <View style={[styles.container, style]}>
      <Text style={[
        styles.text,
        isExpired && styles.expiredText,
        textStyle
      ]}>
        {formatTime(timeLeft)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...textStyles.body,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  expiredText: {
    color: colors.error,
  },
});
