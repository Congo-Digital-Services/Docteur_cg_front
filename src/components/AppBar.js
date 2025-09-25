import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function AppBar({ title, left, right }) {
  return (
    <LinearGradient colors={['#182E7D', '#0859A1']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <View style={s.container}>
        <View style={{ width: 48 }}>{left}</View>
        <Text style={s.title}>{title}</Text>
        <View style={{ width: 48, alignItems: 'flex-end' }}>{right}</View>
      </View>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  container: { paddingTop: 52, paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' },
  title: { color: '#fff', fontWeight: '700', fontSize: 18, textAlign: 'center', flex: 1 }
});
