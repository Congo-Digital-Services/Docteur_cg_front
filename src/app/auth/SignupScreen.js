import React from 'react';
import { View } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import Input from '../../components/Input';
import Button from '../../components/Button';
import useAuthStore from '../../stores/auth.store';
import { toast } from '../../components/Toast';
import { spacing } from '../../theme/spacing';

export default function SignupScreen({ navigation }) {
  const { control, handleSubmit } = useForm({ defaultValues: { email: '', password: '' } });
  const register = useAuthStore((s) => s.register);

  const onSubmit = async ({ email, password }) => {
    try {
      await register(email, password);
      toast.show('Compte créé ✅');
      navigation.replace('MainTabs');
    } catch (e) {
      toast.show(e.message);
    }
  };

  return (
    <View style={{ padding: 20, gap: 12 }}>
      <Controller control={control} name="email" render={({ field: { onChange, value } }) => <Input placeholder="Email" autoCapitalize="none" value={value} onChangeText={onChange} />} />
      <Controller control={control} name="password" render={({ field: { onChange, value } }) => <Input placeholder="Mot de passe" secureTextEntry value={value} onChangeText={onChange} />} />
      <View style={{ height: spacing.sm }} />
      <Button title="S'inscrire" onPress={handleSubmit(onSubmit)} />
    </View>
  );
}
