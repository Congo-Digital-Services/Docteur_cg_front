import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function HeaderGradient({ navigation, options, back }) {
  return (
    <LinearGradient colors={['#182E7D', '#0859A1']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
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
  );
}

const s = StyleSheet.create({
  container: {
    paddingTop: 52,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center'
  },
  title: { color: 'white', fontSize: 18, fontWeight: '700', textAlign: 'center', flex: 1 }
});
