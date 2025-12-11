import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { LockIcon, IdCardIcon, ShieldLockIcon, AlertIcon } from '../../src/components/Icons';
import { colors, shadows, borderRadius } from '../../src/theme/colors';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [documento, setDocumento] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuthStore();

  const formatDocumento = (text: string) => {
    const numbers = text.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
    }
    return numbers
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const handleLogin = async () => {
    if (!documento || !senha) {
      setError('Preencha todos os campos');
      return;
    }

    setError('');
    try {
      await login(documento, senha);
      router.replace('/(app)/home');
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Background gradient - Dark Premium */}
      <LinearGradient
        colors={['#0a0a0a', '#1a1a1a', '#0a0a0a']}
        style={styles.backgroundGradient}
      />

      {/* Grid pattern overlay */}
      <View style={styles.gridPattern} />

      {/* Glow effects */}
      <View style={styles.backgroundElements}>
        <View style={[styles.glowOrb, styles.orbTop]} />
        <View style={[styles.glowOrb, styles.orbBottom]} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo/Brand Section */}
          <View style={styles.brandSection}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={['#ffd75b', '#d4af37', '#b8941f']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logoGradient}
              >
                <Text style={styles.logoText}>🏛️</Text>
              </LinearGradient>
            </View>
            <Text style={styles.brandName}>PORTAL ARRIGHI</Text>
            <Text style={styles.brandTagline}>Portal do Cliente</Text>
          </View>

          {/* Login Card */}
          <View style={styles.cardContainer}>
            <View style={styles.card}>
              {/* Card Header */}
              <View style={styles.cardHeader}>
                <View style={styles.cardIconContainer}>
                  <LinearGradient
                    colors={['rgba(212, 175, 55, 0.25)', 'rgba(212, 175, 55, 0.1)']}
                    style={styles.cardIconGradient}
                  >
                    <View style={styles.shieldIcon}>
                      <View style={styles.shieldOuter}>
                        <LinearGradient
                          colors={['#ffd75b', '#d4af37', '#b8941f']}
                          style={styles.shieldInner}
                        >
                          <View style={styles.keyhole} />
                        </LinearGradient>
                      </View>
                    </View>
                  </LinearGradient>
                </View>
                <Text style={styles.cardTitle}>Fazer Login</Text>
                <Text style={styles.cardSubtitle}>
                  Entre com suas credenciais para acessar o sistema
                </Text>
              </View>

              {/* Error Message */}
              {error ? (
                <View style={styles.errorContainer}>
                  <AlertIcon size={18} color="#f87171" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* Form */}
              <View style={styles.form}>
                <Input
                  label="CPF ou CNPJ"
                  placeholder="Digite seu CPF ou CNPJ"
                  value={documento}
                  onChangeText={(text) => setDocumento(formatDocumento(text))}
                  keyboardType="numeric"
                  icon={<IdCardIcon size={20} color="#d4af37" />}
                />

                <Input
                  label="Senha"
                  placeholder="Digite sua senha"
                  value={senha}
                  onChangeText={setSenha}
                  secureTextEntry
                  icon={<LockIcon size={20} color="#d4af37" />}
                  textContentType="oneTimeCode"
                  passwordRules=""
                />

                <TouchableOpacity style={styles.forgotPassword}>
                  <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
                </TouchableOpacity>

                <Button
                  title="Entrar"
                  onPress={handleLogin}
                  loading={isLoading}
                  variant="primary"
                  size="lg"
                />
              </View>
            </View>
          </View>

          {/* Register Link */}
          <View style={styles.registerSection}>
            <Text style={styles.registerText}>Ainda não tem uma conta?</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <View style={styles.registerLinkContainer}>
                <Text style={styles.registerLinkIcon}>👤</Text>
                <Text style={styles.registerLink}>Criar conta</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.securityBadge}>
              <Text style={styles.securityIcon}>🛡️</Text>
              <Text style={styles.securityText}>Sistema seguro e protegido</Text>
            </View>
            <Text style={styles.copyright}>© 2025 Portal Arrighi. Todos os direitos reservados.</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  gridPattern: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.03,
    // Simula o grid pattern do ArrighiCRM
  },
  backgroundElements: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  glowOrb: {
    position: 'absolute',
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width,
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
  },
  orbTop: {
    top: -width * 0.4,
    left: -width * 0.2,
    opacity: 0.5,
  },
  orbBottom: {
    bottom: -width * 0.5,
    right: -width * 0.3,
    opacity: 0.3,
    backgroundColor: 'rgba(184, 148, 31, 0.06)',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: height * 0.08,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    marginBottom: 16,
    ...shadows.amber,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 36,
  },
  brandName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#d4af37',
    letterSpacing: 1,
    marginBottom: 4,
  },
  brandTagline: {
    fontSize: 14,
    color: colors.text.muted,
    letterSpacing: 0.5,
  },
  cardContainer: {
    marginBottom: 24,
  },
  card: {
    backgroundColor: 'rgba(26, 26, 26, 0.95)',
    borderRadius: borderRadius['3xl'],
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: 24,
    ...shadows.lg,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  cardIconContainer: {
    marginBottom: 16,
  },
  cardIconGradient: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.4)',
  },
  shieldIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldOuter: {
    width: 36,
    height: 42,
    borderRadius: 4,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    overflow: 'hidden',
    ...shadows.amber,
  },
  shieldInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyhole: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0a0a0a',
    marginTop: 4,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.text.muted,
    textAlign: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: borderRadius.xl,
    padding: 12,
    marginBottom: 16,
    gap: 10,
  },
  errorText: {
    flex: 1,
    color: '#f87171',
    fontSize: 14,
    fontWeight: '500',
  },
  form: {
    gap: 4,
  },
  inputIcon: {
    fontSize: 18,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    marginTop: 8,
  },
  forgotPasswordText: {
    color: colors.text.muted,
    fontSize: 14,
  },
  registerSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  registerText: {
    color: colors.text.muted,
    fontSize: 14,
    marginBottom: 12,
  },
  registerLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  registerLinkIcon: {
    fontSize: 16,
  },
  registerLink: {
    color: '#d4af37',
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  securityIcon: {
    fontSize: 14,
    color: '#d4af37',
  },
  securityText: {
    fontSize: 13,
    color: colors.text.muted,
  },
  copyright: {
    fontSize: 11,
    color: colors.text.muted,
    opacity: 0.7,
  },
});
