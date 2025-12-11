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
import { LockIcon, LockCheckIcon, IdCardIcon, UserIcon, ShieldLockIcon } from '../../src/components/Icons';
import { colors, shadows, borderRadius } from '../../src/theme/colors';

const { width, height } = Dimensions.get('window');

export default function RegisterScreen() {
  const [documento, setDocumento] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [error, setError] = useState('');
  const { register, isLoading } = useAuthStore();

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

  const getPasswordStrength = () => {
    if (senha.length < 6) return { label: 'Fraca', color: colors.error.main, width: '25%' };
    if (senha.length < 8) return { label: 'Média', color: colors.warning.main, width: '50%' };
    if (senha.length < 12) return { label: 'Boa', color: colors.info.main, width: '75%' };
    return { label: 'Forte', color: colors.success.main, width: '100%' };
  };

  const handleRegister = async () => {
    // Validar documento
    if (!documento) {
      setError('Informe seu CPF ou CNPJ');
      return;
    }
    const numbers = documento.replace(/\D/g, '');
    if (numbers.length !== 11 && numbers.length !== 14) {
      setError('CPF ou CNPJ inválido');
      return;
    }

    // Validar senha
    if (!senha || senha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    if (senha !== confirmarSenha) {
      setError('As senhas não conferem');
      return;
    }

    setError('');
    try {
      // Passa documento como email também (backend vai ignorar ou usar o email do cadastro do cliente)
      await register(documento, '', senha);
      router.replace('/(app)/home');
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta');
    }
  };

  const strength = getPasswordStrength();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Background gradient - Dark Premium */}
      <LinearGradient
        colors={['#0a0a0a', '#1a1a1a', '#0a0a0a']}
        style={styles.backgroundGradient}
      />

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
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
          </View>

          {/* Brand Section */}
          <View style={styles.brandSection}>
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={['rgba(212, 175, 55, 0.2)', 'rgba(212, 175, 55, 0.1)']}
                style={styles.iconGradient}
              >
                <UserIcon size={32} color="#d4af37" />
              </LinearGradient>
            </View>
            <Text style={styles.title}>Criar Conta</Text>
            <Text style={styles.subtitle}>
              Informe seus dados para criar sua conta no portal
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.cardContainer}>
            <View style={styles.card}>
              {/* Error Message */}
              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorIcon}>⚠️</Text>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <View style={styles.form}>
                <Input
                  label="CPF ou CNPJ *"
                  placeholder="000.000.000-00"
                  value={documento}
                  onChangeText={(text) => setDocumento(formatDocumento(text))}
                  keyboardType="numeric"
                  icon={<IdCardIcon size={20} color="#d4af37" />}
                />

                <Input
                  label="Senha *"
                  placeholder="Mínimo 6 caracteres"
                  value={senha}
                  onChangeText={setSenha}
                  secureTextEntry
                  icon={<LockIcon size={20} color="#d4af37" />}
                />

                <Input
                  label="Confirmar Senha *"
                  placeholder="Digite novamente"
                  value={confirmarSenha}
                  onChangeText={setConfirmarSenha}
                  secureTextEntry
                  icon={<LockCheckIcon size={20} color="#d4af37" />}
                />

                {/* Password Strength */}
                {senha.length > 0 && (
                  <View style={styles.strengthContainer}>
                    <Text style={styles.strengthLabel}>Força da senha:</Text>
                    <View style={styles.strengthBar}>
                      <View
                        style={[
                          styles.strengthFill,
                          { width: strength.width as any, backgroundColor: strength.color },
                        ]}
                      />
                    </View>
                    <Text style={[styles.strengthText, { color: strength.color }]}>
                      {strength.label}
                    </Text>
                  </View>
                )}

                {/* Info Box */}
                <View style={styles.infoBox}>
                  <Text style={styles.infoIcon}>💡</Text>
                  <Text style={styles.infoText}>
                    Você precisa ser um cliente cadastrado para criar uma conta.
                    Use o CPF/CNPJ registrado em seu contrato.
                  </Text>
                </View>

                <Button
                  title="Criar Conta"
                  onPress={handleRegister}
                  loading={isLoading}
                  variant="primary"
                  size="lg"
                />
              </View>
            </View>
          </View>

          {/* Login Link */}
          <View style={styles.loginSection}>
            <Text style={styles.loginText}>Já tem uma conta?</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <View style={styles.loginLinkContainer}>
                <ShieldLockIcon size={18} color="#d4af37" />
                <Text style={styles.loginLink}>Fazer login</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Terms */}
          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              Ao criar uma conta, você concorda com nossos{' '}
              <Text style={styles.termsLink}>Termos de Uso</Text> e{' '}
              <Text style={styles.termsLink}>Política de Privacidade</Text>
            </Text>
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
  backgroundElements: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  glowOrb: {
    position: 'absolute',
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width,
    backgroundColor: 'rgba(212, 175, 55, 0.06)',
  },
  orbTop: {
    top: -width * 0.5,
    right: -width * 0.3,
    opacity: 0.5,
  },
  orbBottom: {
    bottom: -width * 0.4,
    left: -width * 0.3,
    opacity: 0.3,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.background.tertiary,
    borderWidth: 1,
    borderColor: colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: colors.text.primary,
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    marginBottom: 16,
  },
  iconGradient: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  brandIcon: {
    fontSize: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: colors.text.muted,
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: 20,
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
  errorIcon: {
    fontSize: 18,
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
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  strengthLabel: {
    fontSize: 12,
    color: colors.text.muted,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: colors.background.tertiary,
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 45,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    borderRadius: borderRadius.lg,
    padding: 12,
    marginVertical: 16,
    gap: 10,
    alignItems: 'flex-start',
  },
  infoIcon: {
    fontSize: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  loginSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  loginText: {
    color: colors.text.muted,
    fontSize: 14,
    marginBottom: 12,
  },
  loginLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loginLinkIcon: {
    fontSize: 16,
  },
  loginLink: {
    color: '#d4af37',
    fontSize: 15,
    fontWeight: '600',
  },
  termsContainer: {
    paddingHorizontal: 16,
  },
  termsText: {
    fontSize: 12,
    color: colors.text.muted,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: '#d4af37',
    fontWeight: '500',
  },
});
