import AsyncStorage from '@react-native-async-storage/async-storage';

// Récupérer le token depuis le stockage local
export async function getAuthToken() {
  return await AsyncStorage.getItem('auth_token');
}
