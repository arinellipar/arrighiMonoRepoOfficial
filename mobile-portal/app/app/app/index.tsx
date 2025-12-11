import { useEffect } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../src/stores/authStore';

export default function Index() {
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    // Aguarda o carregamento inicial terminar
    if (!isLoading) {
      // Pequeno delay para garantir que a navegação está pronta
      const timer = setTimeout(() => {
        if (isAuthenticated) {
          router.replace('/(app)/home');
        } else {
          router.replace('/(auth)/login');
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated]);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>ARRIGHI</Text>
      <ActivityIndicator size="large" color="#8b5cf6" style={styles.loader} />
      <Text style={styles.text}>Portal do Cliente</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  logo: {
    fontSize: 42,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 6,
    marginBottom: 24,
  },
  loader: {
    marginVertical: 20,
  },
  text: {
    color: '#a0a0b0',
    fontSize: 16,
  },
});
