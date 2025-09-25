import React from 'react';
import { View } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import Input from '../../components/Input';
import Button from '../../components/Button';
import useAuthStore from '../../stores/auth.store';
import { toast } from '../../components/Toast';
import { spacing } from '../../theme/spacing';

export default function LoginScreen({ navigation }) {
  const { control, handleSubmit } = useForm({ defaultValues: { email: '', password: '' } });
  const login = useAuthStore((s) => s.login);

  const onSubmit = async ({ email, password }) => {
    try {
      await login(email, password);
      toast.show('Connecté ✅');
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
      <Button title="Se connecter" onPress={handleSubmit(onSubmit)} />
    </View>
  );
}
