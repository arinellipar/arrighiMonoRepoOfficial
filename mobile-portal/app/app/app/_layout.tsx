import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '../src/stores/authStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
    },
  },
});

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const loadStoredAuth = useAuthStore((state) => state.loadStoredAuth);

  useEffect(() => {
    async function prepare() {
      try {
        await loadStoredAuth();
      } catch (e) {
        console.warn('Erro ao carregar auth:', e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  if (!appIsReady) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" />
        <Text style={styles.logo}>ARRIGHI</Text>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
      </Stack>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  logo: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 4,
    marginBottom: 24,
  },
  loadingText: {
    marginTop: 16,
    color: '#a0a0b0',
    fontSize: 14,
  },
});
