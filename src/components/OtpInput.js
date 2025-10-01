// src/components/OtpInput.js
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { spacing } from '../theme/spacing';
import colors from '../theme/colors';
import { textStyles } from '../theme/typography';

export default function OtpInput({ 
  length = 6, 
  value = '', 
  onChangeText, 
  onComplete,
  autoFocus = true,
  style,
  ...props 
}) {
  const [otp, setOtp] = useState(Array(length).fill(''));
  const inputRefs = useRef([]);

  useEffect(() => {
    if (value) {
      const newOtp = value.split('').slice(0, length);
      const paddedOtp = [...newOtp, ...Array(length - newOtp.length).fill('')];
      setOtp(paddedOtp);
    }
  }, [value, length]);

  const handleChange = (text, index) => {
    if (text.length > 1) return; // Un seul caractère par champ
    
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    
    const otpString = newOtp.join('');
    onChangeText?.(otpString);

    // Auto-focus sur le champ suivant
    if (text && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Appeler onComplete si le code est complet
    if (otpString.length === length && onComplete) {
      onComplete(otpString);
    }
  };

  const handleKeyPress = (key, index) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleFocus = (index) => {
    // Sélectionner le texte si le champ a déjà une valeur
    if (otp[index]) {
      inputRefs.current[index]?.setSelection(0, 1);
    }
  };

  return (
    <View style={[styles.container, style]}>
      {otp.map((digit, index) => (
        <View key={index} style={styles.inputContainer}>
          <TextInput
            ref={(ref) => (inputRefs.current[index] = ref)}
            style={[
              styles.input,
              digit ? styles.inputFilled : styles.inputEmpty
            ]}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
            onFocus={() => handleFocus(index)}
            keyboardType="numeric"
            maxLength={1}
            selectTextOnFocus
            autoFocus={autoFocus && index === 0}
            {...props}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputContainer: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  input: {
    height: 60,
    borderRadius: 12,
    borderWidth: 2,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    ...textStyles.h2,
  },
  inputEmpty: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderColor: 'rgba(255,255,255,0.3)',
    color: colors.text,
  },
  inputFilled: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    color: 'white',
  },
});
