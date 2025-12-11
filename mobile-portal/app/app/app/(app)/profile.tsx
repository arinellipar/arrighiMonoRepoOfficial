import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { api } from '../../src/services/api';
import { useAuthStore } from '../../src/stores/authStore';
import { GlassCard } from '../../src/components/GlassCard';
import { Button } from '../../src/components/Button';
import { LockIcon, UserIcon, IdCardIcon, BellIcon, CalendarIcon, BoletoIcon } from '../../src/components/Icons';
import { colors, shadows, borderRadius } from '../../src/theme/colors';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  const { data: profile, isLoading, refetch } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.getProfile(),
  });

  const handleLogout = () => {
    Alert.alert(
      'Sair da conta',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const formatDocument = (doc: string, tipo: 'PF' | 'PJ') => {
    if (!doc) return '';
    const numbers = doc.replace(/\D/g, '');
    if (tipo === 'PF') {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return numbers.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      '$1.$2.$3/$4-$5'
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const MenuItem = ({
    icon,
    title,
    subtitle,
    onPress,
    color = colors.accent[500],
    showArrow = true,
  }: {
    icon: string | React.ReactNode;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    color?: string;
    showArrow?: boolean;
  }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.menuIconContainer, { backgroundColor: color + '20' }]}>
        {typeof icon === 'string' ? (
          <Text style={styles.menuIcon}>{icon}</Text>
        ) : (
          icon
        )}
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      {onPress && showArrow && (
        <Text style={styles.menuArrow}>›</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Background - Dark Premium */}
      <LinearGradient
        colors={['#0a0a0a', '#1a1a1a', '#0a0a0a']}
        style={styles.backgroundGradient}
      />

      <View style={styles.backgroundElements}>
        <LinearGradient
          colors={['rgba(212, 175, 55, 0.1)', 'transparent']}
          style={[styles.glowOrb, styles.orbTop]}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor={colors.accent[500]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={[colors.accent[500], colors.primary[500]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>
                {profile?.nome?.charAt(0).toUpperCase() || user?.nome?.charAt(0) || '?'}
              </Text>
            </LinearGradient>
            <View style={styles.avatarBadge}>
              <Text style={styles.avatarBadgeText}>✓</Text>
            </View>
          </View>

          <Text style={styles.userName}>{profile?.nome || user?.nome}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>

          <View style={styles.tipoBadge}>
            <LinearGradient
              colors={
                profile?.tipoPessoa === 'PF'
                  ? [colors.info.main + '30', colors.info.main + '10']
                  : [colors.accent[500] + '30', colors.accent[500] + '10']
              }
              style={styles.tipoBadgeGradient}
            >
              <Text
                style={[
                  styles.tipoBadgeText,
                  { color: profile?.tipoPessoa === 'PF' ? colors.info.main : colors.accent[500] },
                ]}
              >
                {profile?.tipoPessoa === 'PF' ? '👤 Pessoa Física' : '🏢 Pessoa Jurídica'}
              </Text>
            </LinearGradient>
          </View>
        </View>

        {/* Personal Data Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados Cadastrais</Text>
          <GlassCard>
            <MenuItem
              icon="🪪"
              title={profile?.tipoPessoa === 'PF' ? 'CPF' : 'CNPJ'}
              subtitle={formatDocument(
                profile?.documento || user?.documento || '',
                profile?.tipoPessoa || 'PF'
              )}
              color={colors.info.main}
              showArrow={false}
            />

            {profile?.email && (
              <>
                <View style={styles.menuDivider} />
                <MenuItem
                  icon="📧"
                  title="Email"
                  subtitle={profile.email}
                  color={colors.accent[500]}
                  showArrow={false}
                />
              </>
            )}

            {profile?.telefone && (
              <>
                <View style={styles.menuDivider} />
                <MenuItem
                  icon="📞"
                  title="Telefone"
                  subtitle={profile.telefone}
                  color={colors.success.main}
                  showArrow={false}
                />
              </>
            )}

            {profile?.celular && (
              <>
                <View style={styles.menuDivider} />
                <MenuItem
                  icon="📱"
                  title="Celular"
                  subtitle={profile.celular}
                  color={colors.warning.main}
                  showArrow={false}
                />
              </>
            )}

            {profile?.nomeFantasia && (
              <>
                <View style={styles.menuDivider} />
                <MenuItem
                  icon="🏢"
                  title="Nome Fantasia"
                  subtitle={profile.nomeFantasia}
                  color={colors.primary[500]}
                  showArrow={false}
                />
              </>
            )}

            <View style={styles.menuDivider} />
            <MenuItem
              icon="📅"
              title="Cliente desde"
              subtitle={formatDate(profile?.dataCadastro)}
              color={colors.info.main}
              showArrow={false}
            />
          </GlassCard>
        </View>

        {/* Contracts Section */}
        {profile?.contratos?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Seus Contratos</Text>
            <GlassCard variant="accent">
              {profile.contratos.map((contrato: any, index: number) => (
                <View key={contrato.id}>
                  {index > 0 && <View style={styles.menuDivider} />}
                  <MenuItem
                    icon="📝"
                    title={`Contrato #${contrato.id}`}
                    subtitle={`${contrato.situacao} • ${contrato.numeroParcelas || 0} parcelas`}
                    color={colors.accent[500]}
                    showArrow={false}
                  />
                </View>
              ))}
            </GlassCard>
          </View>
        )}

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configurações</Text>
          <GlassCard>
            <MenuItem
              icon="🔔"
              title="Notificações"
              subtitle="Gerenciar alertas"
              color={colors.warning.main}
              onPress={() => {}}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon={<LockIcon size={20} color={colors.error.main} />}
              title="Segurança"
              subtitle="Alterar senha"
              color={colors.error.main}
              onPress={() => {}}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon="❓"
              title="Ajuda"
              subtitle="Central de suporte"
              color={colors.info.main}
              onPress={() => {}}
            />
          </GlassCard>
        </View>

        {/* Logout Section */}
        <View style={styles.section}>
          <Button
            title="Sair da conta"
            onPress={handleLogout}
            variant="danger"
            size="lg"
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <LinearGradient
            colors={['rgba(255,255,255,0.05)', 'transparent']}
            style={styles.footerGradient}
          >
            <View style={styles.footerLogo}>
              <LinearGradient
                colors={[colors.accent[500], colors.primary[500]]}
                style={styles.footerLogoGradient}
              >
                <Text style={styles.footerLogoText}>A</Text>
              </LinearGradient>
            </View>
            <Text style={styles.footerAppName}>Portal do Cliente</Text>
            <Text style={styles.footerVersion}>Versão 1.0.0</Text>
            <Text style={styles.footerCopyright}>© 2025 Arrighi</Text>
          </LinearGradient>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
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
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width,
  },
  orbTop: {
    top: -width * 0.7,
    right: -width * 0.5,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.neonPurple,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '800',
    color: '#fff',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.success.main,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.background.primary,
  },
  avatarBadgeText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '700',
  },
  userName: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: colors.text.muted,
    marginBottom: 16,
  },
  tipoBadge: {},
  tipoBadgeGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
  },
  tipoBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuIcon: {
    fontSize: 18,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  menuSubtitle: {
    fontSize: 13,
    color: colors.text.muted,
    marginTop: 2,
  },
  menuArrow: {
    fontSize: 24,
    color: colors.text.muted,
    fontWeight: '300',
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.border.default,
    marginVertical: 12,
    marginLeft: 52,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  footerGradient: {
    alignItems: 'center',
    paddingVertical: 32,
    borderRadius: borderRadius['2xl'],
  },
  footerLogo: {
    marginBottom: 12,
  },
  footerLogoGradient: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerLogoText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
  },
  footerAppName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  footerVersion: {
    fontSize: 12,
    color: colors.text.muted,
    marginBottom: 2,
  },
  footerCopyright: {
    fontSize: 12,
    color: colors.text.muted,
  },
});
