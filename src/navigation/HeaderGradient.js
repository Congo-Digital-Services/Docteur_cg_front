import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../theme/colors';

export default function HeaderGradient({ navigation, options, back }) {
  return (
    <SafeAreaView edges={['top']} style={s.safeArea}>
      <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={s.container}>
          {back ? (
            <Ionicons name="chevron-back" size={24} color="#fff" onPress={navigation.goBack} />
          ) : (
            <View style={{ width: 24 }} />
          )}
          <Text style={s.title}>{options.title || ''}</Text>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.gradientStart,
  },
  container: {
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center'
  },
  title: { color: 'white', fontSize: 18, fontWeight: '700', textAlign: 'center', flex: 1 }
});
