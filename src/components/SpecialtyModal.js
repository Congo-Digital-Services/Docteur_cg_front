import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Pressable, 
  KeyboardAvoidingView, 
  Platform // Importer Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing, radius, textStyles } from '../theme';
import Input from './Input';

const SpecialtyModal = ({ 
  visible, 
  skills, 
  selectedSpecialtyId, 
  onSelect, 
  onClose 
}) => {
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [filteredSkills, setFilteredSkills] = useState(skills);

  useEffect(() => {
    // Filtrer les compétences localement en fonction de la recherche
    if (modalSearchQuery.trim() === '') {
      setFilteredSkills(skills);
    } else {
      const lowercasedQuery = modalSearchQuery.toLowerCase();
      const filtered = skills.filter(skill =>
        skill.name.toLowerCase().includes(lowercasedQuery)
      );
      setFilteredSkills(filtered);
    }
  }, [modalSearchQuery, skills]);

  // Ajout d'un élément "Toutes" au début de la liste
  const dataWithAllOption = [
    { id: 'all-specialties', name: 'Toutes' },
    ...filteredSkills
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      {/* Le KeyboardAvoidingView ajuste le layout quand le clavier apparaît */}
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable style={s.modalOverlay} onPress={onClose}>
          {/* Le contenu du modal doit pouvoir "respirer" et s'adapter */}
          <Pressable style={s.modalContent} onStartShouldSetResponder={() => true}>
            {/* Header */}
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Choisir une spécialité</Text>
              <TouchableOpacity onPress={onClose} style={s.closeButton}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={s.searchContainer}>
              <Input
                placeholder="Rechercher une spécialité..."
                value={modalSearchQuery}
                onChangeText={setModalSearchQuery}
                icon={<Ionicons name="search" size={20} color={colors.textSecondary} />}
              />
            </View>

            {/* Grid List */}
            <FlatList
              data={dataWithAllOption}
              keyExtractor={(item, index) => `specialty-${item.id}-${index}`}
              renderItem={({ item }) => {
                const isSelected = item.id === selectedSpecialtyId || (item.id === 'all-specialties' && !selectedSpecialtyId);
                return (
                  <TouchableOpacity
                    style={[s.gridItem, isSelected && s.gridItemSelected]}
                    onPress={() => onSelect(item.id === 'all-specialties' ? '' : item.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={[s.gridItemText, isSelected && s.gridItemTextSelected]}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                );
              }}
              numColumns={2}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={s.gridList}
              // Le style ci-dessous permet à la FlatList d'occuper tout l'espace restant
              style={s.listContainer}
              ListEmptyComponent={
                <View style={s.emptyContainer}>
                  <Ionicons name="search-outline" size={48} color={colors.textTertiary} />
                  <Text style={s.emptyText}>Aucune spécialité trouvée</Text>
                </View>
              }
            />
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const s = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    // 'flex: 1' permet au contenu de s'adapter à l'espace disponible
    flex: 1,
    // 'maxHeight' est conservé pour limiter la taille sur de grands écrans
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  modalTitle: {
    ...textStyles.h2,
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
  },
  closeButton: {
    padding: spacing.sm,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  // Conteneur de la FlatList pour qu'elle prenne la place restante
  listContainer: {
    flex: 1,
  },
  // Style pour le contenu à l'intérieur de la FlatList
  gridList: {
    paddingHorizontal: spacing.lg,
  },
  gridItem: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    margin: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
    flex: 1,
  },
  gridItemSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  gridItemText: {
    ...textStyles.body,
    fontSize: 15,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '500',
  },
  gridItemTextSelected: {
    color: 'white',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    ...textStyles.body,
    color: colors.textTertiary,
    marginTop: spacing.md,
  },
});

export default SpecialtyModal;