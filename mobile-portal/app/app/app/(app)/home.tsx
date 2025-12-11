import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { api } from '../../src/services/api';
import { useAuthStore } from '../../src/stores/authStore';
import { StatCard } from '../../src/components/StatCard';
import { BoletoCard } from '../../src/components/BoletoCard';
import { GlassCard } from '../../src/components/GlassCard';
import {
  BellIcon,
  ChartIcon,
  AlertIcon,
  CheckCircleIcon,
  CalendarIcon,
  BoletoIcon,
  FolderIcon,
  UserIcon,
  ClockIcon,
} from '../../src/components/Icons';
import { colors, shadows, borderRadius } from '../../src/theme/colors';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { user } = useAuthStore();
  const [showNotifications, setShowNotifications] = useState(false);

  const {
    data: resumo,
    isLoading: loadingResumo,
    refetch: refetchResumo,
  } = useQuery({
    queryKey: ['boletos-resumo'],
    queryFn: () => api.getBoletosResumo(),
  });

  const {
    data: boletosAbertos,
    isLoading: loadingBoletos,
    refetch: refetchBoletos,
  } = useQuery({
    queryKey: ['boletos-abertos'],
    queryFn: () => api.getBoletosAbertos(),
  });

  const {
    data: notifications,
    refetch: refetchNotifications,
  } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.getNotifications(),
  });

  const isLoading = loadingResumo || loadingBoletos;

  const onRefresh = () => {
    refetchResumo();
    refetchBoletos();
    refetchNotifications();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const pendingNotifications = notifications?.filter(
    (n: any) => !n.lida && (n.tipo === 'boleto_vencendo' || n.tipo === 'boleto_vencido')
  ).length || 0;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Background - Dark Premium */}
      <LinearGradient
        colors={['#0a0a0a', '#1a1a1a', '#0a0a0a']}
        style={styles.backgroundGradient}
      />

      {/* Background orbs - Dourado */}
      <View style={styles.backgroundElements}>
        <LinearGradient
          colors={['rgba(212, 175, 55, 0.08)', 'transparent']}
          style={[styles.glowOrb, styles.orbTop]}
        />
        <LinearGradient
          colors={['rgba(184, 148, 31, 0.05)', 'transparent']}
          style={[styles.glowOrb, styles.orbBottom]}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            tintColor={colors.accent[500]}
            colors={[colors.accent[500]]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>{user?.nome?.split(' ')[0] || 'Cliente'}</Text>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => setShowNotifications(true)}
          >
            <LinearGradient
              colors={['rgba(212, 175, 55, 0.15)', 'rgba(212, 175, 55, 0.05)']}
              style={styles.notificationGradient}
            >
              <BellIcon size={24} color="#d4af37" />
              {pendingNotifications > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>{pendingNotifications}</Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Em aberto"
            value={formatCurrency(resumo?.totalAberto || 0)}
            subtitle={`${resumo?.quantidadeAbertos || 0} boleto(s)`}
            icon={<ChartIcon size={22} color={colors.info.main} />}
            color="#d4af37"
            variant="gradient"
          />
          <StatCard
            title="Vencido"
            value={formatCurrency(resumo?.totalVencido || 0)}
            subtitle={`${resumo?.quantidadeVencidos || 0} boleto(s)`}
            icon={<AlertIcon size={22} color={colors.error.main} />}
            color="#d4af37"
            variant="gradient"
          />
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            title="Total pago"
            value={formatCurrency(resumo?.totalPago || 0)}
            subtitle={`${resumo?.quantidadePagos || 0} boleto(s)`}
            icon={<CheckCircleIcon size={22} color={colors.success.main} />}
            color="#d4af37"
            variant="neon"
          />
        </View>

        {/* Next Payment Card */}
        {resumo?.proximoVencimento && (
          <View style={styles.nextPaymentContainer}>
            <LinearGradient
              colors={['rgba(212, 175, 55, 0.2)', 'rgba(184, 148, 31, 0.1)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.nextPaymentCard}
            >
              <View style={styles.nextPaymentGlow} />
              <View style={styles.nextPaymentContent}>
                <View style={styles.nextPaymentHeader}>
                  <View style={styles.nextPaymentIconContainer}>
                    <CalendarIcon size={24} color="#d4af37" />
                  </View>
                  <View>
                    <Text style={styles.nextPaymentLabel}>Próximo Vencimento</Text>
                    <Text style={styles.nextPaymentDate}>
                      {new Date(resumo.proximoVencimento.dataVencimento).toLocaleDateString(
                        'pt-BR',
                        { day: '2-digit', month: 'long', year: 'numeric' }
                      )}
                    </Text>
                  </View>
                </View>
                <Text style={styles.nextPaymentValue}>
                  {formatCurrency(resumo.proximoVencimento.valor)}
                </Text>
              </View>
              <TouchableOpacity style={styles.nextPaymentAction}>
                <LinearGradient
                  colors={['#ffd75b', '#d4af37', '#b8941f']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.nextPaymentButton}
                >
                  <Text style={styles.nextPaymentButtonText}>Pagar agora</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        )}

        {/* Boletos Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Boletos em Aberto</Text>
            <TouchableOpacity onPress={() => router.push('/(app)/boletos')}>
              <LinearGradient
                colors={[colors.accent[500] + '30', colors.accent[500] + '10']}
                style={styles.seeAllButton}
              >
                <Text style={styles.seeAllText}>Ver todos</Text>
                <Text style={styles.seeAllArrow}>→</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {boletosAbertos?.length === 0 ? (
            <GlassCard variant="accent">
              <View style={styles.emptyState}>
                <View style={styles.emptyIconContainer}>
                  <LinearGradient
                    colors={[colors.success.main + '30', colors.success.main + '10']}
                    style={styles.emptyIconGradient}
                  >
                    <CheckCircleIcon size={40} color={colors.success.main} />
                  </LinearGradient>
                </View>
                <Text style={styles.emptyTitle}>Parabéns!</Text>
                <Text style={styles.emptySubtitle}>
                  Você está em dia com seus pagamentos
                </Text>
              </View>
            </GlassCard>
          ) : (
            boletosAbertos?.slice(0, 3).map((boleto: any) => (
              <BoletoCard
                key={boleto.id}
                boleto={boleto}
                onPress={() => router.push(`/(app)/boletos?id=${boleto.id}`)}
              />
            ))
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acesso Rápido</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => router.push('/(app)/boletos')}
            >
              <LinearGradient
                colors={['rgba(212, 175, 55, 0.1)', 'rgba(212, 175, 55, 0.02)']}
                style={styles.quickActionGradient}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(212, 175, 55, 0.2)' }]}>
                  <BoletoIcon size={24} color="#d4af37" />
                </View>
                <Text style={styles.quickActionText}>Boletos</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => router.push('/(app)/documents')}
            >
              <LinearGradient
                colors={['rgba(59, 130, 246, 0.1)', 'rgba(59, 130, 246, 0.02)']}
                style={styles.quickActionGradient}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: colors.info.main + '20' }]}>
                  <FolderIcon size={24} color={colors.info.main} />
                </View>
                <Text style={styles.quickActionText}>Documentos</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => router.push('/(app)/profile')}
            >
              <LinearGradient
                colors={['rgba(34, 197, 94, 0.1)', 'rgba(34, 197, 94, 0.02)']}
                style={styles.quickActionGradient}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: colors.success.main + '20' }]}>
                  <UserIcon size={24} color={colors.success.main} />
                </View>
                <Text style={styles.quickActionText}>Perfil</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modal de Notificações */}
      <Modal
        visible={showNotifications}
        animationType="slide"
        transparent
        onRequestClose={() => setShowNotifications(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={['#1a1a1a', '#0a0a0a']}
              style={styles.modalGradient}
            >
              {/* Header */}
              <View style={styles.modalHeader}>
                <View style={styles.modalHandle} />
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setShowNotifications(false)}
                >
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalTitleContainer}>
                <BellIcon size={24} color="#d4af37" />
                <Text style={styles.modalTitle}>Notificações</Text>
                {pendingNotifications > 0 && (
                  <View style={styles.modalBadge}>
                    <Text style={styles.modalBadgeText}>{pendingNotifications} não lida(s)</Text>
                  </View>
                )}
              </View>

              <ScrollView
                style={styles.notificationsList}
                showsVerticalScrollIndicator={false}
              >
                {notifications?.length === 0 ? (
                  <View style={styles.emptyNotifications}>
                    <View style={styles.emptyNotificationsIcon}>
                      <BellIcon size={48} color={colors.text.muted} />
                    </View>
                    <Text style={styles.emptyNotificationsTitle}>Nenhuma notificação</Text>
                    <Text style={styles.emptyNotificationsSubtitle}>
                      Você não possui notificações no momento
                    </Text>
                  </View>
                ) : (
                  notifications?.map((notification: any) => (
                    <TouchableOpacity
                      key={notification.id}
                      style={[
                        styles.notificationItem,
                        !notification.lida && styles.notificationItemUnread,
                      ]}
                      onPress={() => {
                        if (notification.dados?.boletoId) {
                          setShowNotifications(false);
                          router.push(`/(app)/boletos?id=${notification.dados.boletoId}`);
                        }
                      }}
                    >
                      <LinearGradient
                        colors={
                          notification.tipo === 'boleto_vencido'
                            ? [colors.error.main + '20', colors.error.main + '05']
                            : notification.tipo === 'boleto_vencendo'
                            ? [colors.warning.main + '20', colors.warning.main + '05']
                            : notification.tipo === 'pagamento_confirmado'
                            ? [colors.success.main + '20', colors.success.main + '05']
                            : ['rgba(212, 175, 55, 0.1)', 'rgba(212, 175, 55, 0.02)']
                        }
                        style={styles.notificationItemGradient}
                      >
                        <View
                          style={[
                            styles.notificationIcon,
                            {
                              backgroundColor:
                                notification.tipo === 'boleto_vencido'
                                  ? colors.error.main + '30'
                                  : notification.tipo === 'boleto_vencendo'
                                  ? colors.warning.main + '30'
                                  : notification.tipo === 'pagamento_confirmado'
                                  ? colors.success.main + '30'
                                  : 'rgba(212, 175, 55, 0.2)',
                            },
                          ]}
                        >
                          {notification.tipo === 'boleto_vencido' ? (
                            <AlertIcon size={20} color={colors.error.main} />
                          ) : notification.tipo === 'boleto_vencendo' ? (
                            <ClockIcon size={20} color={colors.warning.main} />
                          ) : notification.tipo === 'pagamento_confirmado' ? (
                            <CheckCircleIcon size={20} color={colors.success.main} />
                          ) : (
                            <BellIcon size={20} color="#d4af37" />
                          )}
                        </View>
                        <View style={styles.notificationContent}>
                          <View style={styles.notificationHeader}>
                            <Text style={styles.notificationTitulo}>
                              {notification.titulo}
                            </Text>
                            {!notification.lida && (
                              <View style={styles.unreadDot} />
                            )}
                          </View>
                          <Text style={styles.notificationMensagem}>
                            {notification.mensagem}
                          </Text>
                          <Text style={styles.notificationData}>
                            {new Date(notification.data).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'short',
                            })}
                          </Text>
                        </View>
                        <Text style={styles.notificationArrow}>›</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </LinearGradient>
          </View>
        </View>
      </Modal>
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
    top: -width * 0.8,
    right: -width * 0.3,
  },
  orbBottom: {
    bottom: -width * 0.5,
    left: -width * 0.3,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  headerLeft: {},
  greeting: {
    fontSize: 14,
    color: colors.text.muted,
    marginBottom: 2,
  },
  userName: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  notificationButton: {},
  notificationGradient: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  notificationIcon: {
    fontSize: 22,
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.error.main,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.background.primary,
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  nextPaymentContainer: {
    marginTop: 12,
    marginBottom: 28,
  },
  nextPaymentCard: {
    borderRadius: borderRadius['2xl'],
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    overflow: 'hidden',
    padding: 20,
    position: 'relative',
    ...shadows.gold,
  },
  nextPaymentGlow: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.accent[500] + '20',
  },
  nextPaymentContent: {
    marginBottom: 16,
  },
  nextPaymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  nextPaymentIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.accent[500] + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextPaymentIcon: {
    fontSize: 22,
  },
  nextPaymentLabel: {
    fontSize: 12,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  nextPaymentDate: {
    fontSize: 15,
    color: colors.text.primary,
    fontWeight: '600',
  },
  nextPaymentValue: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: -1,
  },
  nextPaymentAction: {},
  nextPaymentButton: {
    paddingVertical: 14,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  nextPaymentButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    letterSpacing: -0.3,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  seeAllText: {
    fontSize: 13,
    color: colors.accent[500],
    fontWeight: '600',
  },
  seeAllArrow: {
    fontSize: 14,
    color: colors.accent[500],
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyIconContainer: {
    marginBottom: 16,
  },
  emptyIconGradient: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 36,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.text.muted,
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickAction: {
    flex: 1,
  },
  quickActionGradient: {
    alignItems: 'center',
    padding: 16,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionEmoji: {
    fontSize: 22,
  },
  quickActionText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  // Modal de Notificações
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    maxHeight: '85%',
    borderTopLeftRadius: borderRadius['3xl'],
    borderTopRightRadius: borderRadius['3xl'],
    overflow: 'hidden',
  },
  modalGradient: {
    paddingBottom: 40,
  },
  modalHeader: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
    position: 'relative',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.neutral[600],
    borderRadius: 2,
  },
  modalCloseButton: {
    position: 'absolute',
    right: 20,
    top: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    color: colors.text.muted,
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text.primary,
    flex: 1,
  },
  modalBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  modalBadgeText: {
    fontSize: 12,
    color: '#d4af37',
    fontWeight: '600',
  },
  notificationsList: {
    paddingHorizontal: 20,
  },
  emptyNotifications: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyNotificationsIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyNotificationsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  emptyNotificationsSubtitle: {
    fontSize: 14,
    color: colors.text.muted,
    textAlign: 'center',
  },
  notificationItem: {
    marginBottom: 10,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  notificationItemUnread: {
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  notificationItemGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  notificationIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notificationTitulo: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d4af37',
  },
  notificationMensagem: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 2,
  },
  notificationData: {
    fontSize: 11,
    color: colors.text.muted,
    marginTop: 4,
  },
  notificationArrow: {
    fontSize: 24,
    color: colors.text.muted,
    fontWeight: '300',
  },
});
