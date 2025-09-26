import React, { useEffect, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, Animated, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import useBookingStore from '../../stores/booking.store';
import useAuthStore from '../../stores/auth.store';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { colors, spacing, radius, textStyles } from '../../theme';

export default function AppointmentsScreen({ navigation }) {
  const { appointments, loadMine, cancel } = useBookingStore();
  const { user, token } = useAuthStore();
  const insets = useSafeAreaInsets();
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (token) {
      loadMine();
    }
    
    // Animation d'entrée
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [token]);

  const handleLoginPress = () => {
    navigation.navigate('Auth', { screen: 'Login' });
  };

  const handleCancelAppointment = (appointmentId) => {
    cancel(appointmentId);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return '#F59E0B';
      case 'CONFIRMED': return '#10B981';
      case 'DECLINED': return '#EF4444';
      default: return colors.textSecondary;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING': return 'En attente';
      case 'CONFIRMED': return 'Confirmé';
      case 'DECLINED': return 'Annulé';
      default: return status;
    }
  };

  const renderAppointmentItem = ({ item }) => (
    <Card style={s.appointmentCard} elevation="low">
      <View style={s.appointmentContent}>
        <View style={s.appointmentHeader}>
          <View style={s.appointmentIcon}>
            <Ionicons name="calendar" size={20} color={colors.primary} />
          </View>
          <View style={s.appointmentInfo}>
            <Text style={s.appointmentTitle}>Rendez-vous #{item.id}</Text>
            <Text style={s.appointmentDate}>Slot: {item.slotId}</Text>
          </View>
          <View style={[s.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[s.statusText, { color: getStatusColor(item.status) }]}>
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>
        
        {item.status !== 'DECLINED' && (
          <View style={s.appointmentActions}>
            <Button 
              title="Annuler" 
              variant="secondary" 
              size="small"
              onPress={() => handleCancelAppointment(item.id)} 
            />
          </View>
        )}
      </View>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={s.emptyContainer}>
      <View style={s.emptyIcon}>
        <Ionicons name="calendar-outline" size={64} color={colors.textTertiary} />
      </View>
      <Text style={s.emptyTitle}>Aucun rendez-vous</Text>
      <Text style={s.emptySubtitle}>
        Vous n'avez pas encore de rendez-vous programmés
      </Text>
      <Button 
        title="Prendre un rendez-vous" 
        onPress={() => navigation.navigate('Search')}
        style={s.emptyButton}
      />
    </View>
  );

  const renderGuestState = () => (
    <View style={s.guestContainer}>
      <View style={s.guestIcon}>
        <Ionicons name="person-outline" size={64} color={colors.textTertiary} />
      </View>
      <Text style={s.guestTitle}>Connectez-vous</Text>
      <Text style={s.guestSubtitle}>
        Connectez-vous pour voir vos rendez-vous et gérer votre planning
      </Text>
      <Button 
        title="Se connecter" 
        onPress={handleLoginPress}
        style={s.guestButton}
      />
    </View>
  );

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {/* Header identique aux autres écrans */}
      <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={s.header}>
          <View style={{ width: 24 }} />
          <Text style={s.title}>Mes rendez-vous</Text>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      <Animated.View style={[
        s.content,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}>

        {/* Content */}
        <View style={s.body}>
          {!token ? (
            renderGuestState()
          ) : appointments.length === 0 ? (
            renderEmptyState()
          ) : (
            <FlatList
              data={appointments}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderAppointmentItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={s.listContent}
            />
          )}
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  header: {
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center'
  },
  title: { 
    color: 'white', 
    fontSize: 18, 
    fontWeight: '700', 
    textAlign: 'center', 
    flex: 1 
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  listContent: {
    paddingBottom: spacing.section,
  },
  appointmentCard: {
    marginBottom: spacing.md,
    borderRadius: 16,
    padding: spacing.lg,
  },
  appointmentContent: {
    padding: spacing.md,
  },
  appointmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  appointmentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentTitle: {
    ...textStyles.semibold,
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  appointmentDate: {
    ...textStyles.bodySmall,
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  statusText: {
    ...textStyles.bodySmall,
    fontSize: 12,
    fontWeight: '600',
  },
  appointmentActions: {
    marginTop: spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.section,
  },
  emptyIcon: {
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...textStyles.h2,
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...textStyles.body,
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  emptyButton: {
    marginTop: spacing.md,
  },
  guestContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.section,
  },
  guestIcon: {
    marginBottom: spacing.lg,
  },
  guestTitle: {
    ...textStyles.h2,
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  guestSubtitle: {
    ...textStyles.body,
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  guestButton: {
    marginTop: spacing.md,
  },
});