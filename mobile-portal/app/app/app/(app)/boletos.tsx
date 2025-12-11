import { useState, useMemo } from 'react';
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
  Share,
  Clipboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../src/services/api';
import { BoletoCard } from '../../src/components/BoletoCard';
import { GlassCard } from '../../src/components/GlassCard';
import { Button } from '../../src/components/Button';
import { BoletoIcon, ClockIcon, AlertIcon, CheckCircleIcon } from '../../src/components/Icons';
import { colors, shadows, borderRadius } from '../../src/theme/colors';

const { width } = Dimensions.get('window');

type FilterType = 'todos' | 'abertos' | 'vencidos' | 'pagos';

export default function BoletosScreen() {
  const [filter, setFilter] = useState<FilterType>('todos');
  const [selectedBoleto, setSelectedBoleto] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const {
    data: boletos,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['boletos'],
    queryFn: () => api.getBoletos(),
  });

  const filteredBoletos = useMemo(() => {
    if (!boletos) return [];

    switch (filter) {
      case 'abertos':
        return boletos.filter((b: any) =>
          !b.foiPago && b.status !== 'LIQUIDADO' && new Date(b.dataVencimento) >= new Date()
        );
      case 'vencidos':
        return boletos.filter((b: any) =>
          !b.foiPago && b.status !== 'LIQUIDADO' && new Date(b.dataVencimento) < new Date()
        );
      case 'pagos':
        return boletos.filter((b: any) => b.foiPago || b.status === 'LIQUIDADO');
      default:
        return boletos;
    }
  }, [boletos, filter]);

  const stats = useMemo(() => {
    if (!boletos) return { total: 0, abertos: 0, vencidos: 0, pagos: 0 };

    const now = new Date();
    return {
      total: boletos.length,
      abertos: boletos.filter((b: any) =>
        !b.foiPago && b.status !== 'LIQUIDADO' && new Date(b.dataVencimento) >= now
      ).length,
      vencidos: boletos.filter((b: any) =>
        !b.foiPago && b.status !== 'LIQUIDADO' && new Date(b.dataVencimento) < now
      ).length,
      pagos: boletos.filter((b: any) => b.foiPago || b.status === 'LIQUIDADO').length,
    };
  }, [boletos]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleBoletoPress = (boleto: any) => {
    setSelectedBoleto(boleto);
    setShowModal(true);
  };

  const handleCopyLinhaDigitavel = () => {
    if (selectedBoleto?.linhaDigitavel) {
      Clipboard.setString(selectedBoleto.linhaDigitavel);
      // Toast notification would be nice here
    }
  };

  const handleShare = async () => {
    if (selectedBoleto) {
      try {
        await Share.share({
          message: `Boleto Arrighi\nValor: ${formatCurrency(selectedBoleto.valor)}\nVencimento: ${new Date(selectedBoleto.dataVencimento).toLocaleDateString('pt-BR')}\n\nLinha Digitável:\n${selectedBoleto.linhaDigitavel || 'Não disponível'}`,
        });
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handlePayPix = () => {
    if (selectedBoleto?.qrCodePix) {
      Clipboard.setString(selectedBoleto.qrCodePix);
      alert('Código Pix copiado! Cole no app do seu banco para pagar.');
    } else {
      alert('Código Pix não disponível para este boleto.');
    }
  };

  const FilterButton = ({ type, label, count, icon }: { type: FilterType; label: string; count: number; icon: React.ReactNode }) => {
    const isActive = filter === type;
    return (
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setFilter(type)}
        activeOpacity={0.7}
      >
        {isActive ? (
          <LinearGradient
            colors={['#ffd75b', '#d4af37', '#b8941f']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.filterButtonGradient}
          >
            <View style={styles.filterIconWrapper}>{icon}</View>
            <Text style={styles.filterLabelActive}>{label}</Text>
            <View style={styles.filterCountActive}>
              <Text style={styles.filterCountTextActive}>{count}</Text>
            </View>
          </LinearGradient>
        ) : (
          <View style={styles.filterButtonInactive}>
            <View style={styles.filterIconWrapper}>{icon}</View>
            <Text style={styles.filterLabel}>{label}</Text>
            <View style={styles.filterCount}>
              <Text style={styles.filterCountText}>{count}</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

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
          colors={['rgba(212, 175, 55, 0.08)', 'transparent']}
          style={[styles.glowOrb, styles.orbTop]}
        />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meus Boletos</Text>
        <Text style={styles.headerSubtitle}>{stats.total} boleto(s) no total</Text>
      </View>

      {/* Filters - Grid 2x2 */}
      <View style={styles.filtersContainer}>
        <View style={styles.filtersRow}>
          <FilterButton type="todos" label="Todos" count={stats.total} icon={<BoletoIcon size={16} color={filter === 'todos' ? '#fff' : colors.text.muted} />} />
          <FilterButton type="abertos" label="Aberto" count={stats.abertos} icon={<ClockIcon size={16} color={filter === 'abertos' ? '#fff' : colors.text.muted} />} />
        </View>
        <View style={styles.filtersRow}>
          <FilterButton type="vencidos" label="Vencidos" count={stats.vencidos} icon={<AlertIcon size={16} color={filter === 'vencidos' ? '#fff' : colors.text.muted} />} />
          <FilterButton type="pagos" label="Pagos" count={stats.pagos} icon={<CheckCircleIcon size={16} color={filter === 'pagos' ? '#fff' : colors.text.muted} />} />
        </View>
      </View>

      {/* Boletos List */}
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
        {filteredBoletos.length === 0 ? (
          <GlassCard>
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyTitle}>Nenhum boleto encontrado</Text>
              <Text style={styles.emptySubtitle}>
                {filter === 'todos'
                  ? 'Você não possui boletos registrados'
                  : `Não há boletos ${filter === 'abertos' ? 'em aberto' : filter === 'vencidos' ? 'vencidos' : 'pagos'}`}
              </Text>
            </View>
          </GlassCard>
        ) : (
          filteredBoletos.map((boleto: any) => (
            <BoletoCard
              key={boleto.id}
              boleto={boleto}
              onPress={() => handleBoletoPress(boleto)}
            />
          ))
        )}
      </ScrollView>

      {/* Boleto Detail Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={['#1a1a1a', '#0a0a0a']}
              style={styles.modalGradient}
            >
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <View style={styles.modalHandle} />
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setShowModal(false)}
                >
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              {selectedBoleto && (
                <ScrollView
                  style={styles.modalContent}
                  showsVerticalScrollIndicator={false}
                >
                  {/* Status Badge */}
                  <View style={styles.modalStatusContainer}>
                    <LinearGradient
                      colors={
                        selectedBoleto.foiPago || selectedBoleto.status === 'LIQUIDADO'
                          ? [colors.success.main + '20', colors.success.main + '10']
                          : new Date(selectedBoleto.dataVencimento) < new Date()
                          ? [colors.error.main + '20', colors.error.main + '10']
                          : [colors.info.main + '20', colors.info.main + '10']
                      }
                      style={styles.modalStatusBadge}
                    >
                      <Text style={styles.modalStatusIcon}>
                        {selectedBoleto.foiPago || selectedBoleto.status === 'LIQUIDADO'
                          ? '✓'
                          : new Date(selectedBoleto.dataVencimento) < new Date()
                          ? '!'
                          : '○'}
                      </Text>
                      <Text
                        style={[
                          styles.modalStatusText,
                          {
                            color:
                              selectedBoleto.foiPago || selectedBoleto.status === 'LIQUIDADO'
                                ? colors.success.main
                                : new Date(selectedBoleto.dataVencimento) < new Date()
                                ? colors.error.main
                                : colors.info.main,
                          },
                        ]}
                      >
                        {selectedBoleto.foiPago || selectedBoleto.status === 'LIQUIDADO'
                          ? selectedBoleto.status === 'BAIXADO'
                            ? 'Pago (PIX)'
                            : 'Pago'
                          : new Date(selectedBoleto.dataVencimento) < new Date()
                          ? 'Vencido'
                          : 'Em aberto'}
                      </Text>
                    </LinearGradient>
                  </View>

                  {/* Value */}
                  <View style={styles.modalValueContainer}>
                    <Text style={styles.modalValueLabel}>Valor do boleto</Text>
                    <Text style={styles.modalValue}>
                      {formatCurrency(selectedBoleto.valor)}
                    </Text>
                  </View>

                  {/* Details */}
                  <GlassCard>
                    <View style={styles.modalDetailRow}>
                      <Text style={styles.modalDetailLabel}>Vencimento</Text>
                      <Text style={styles.modalDetailValue}>
                        {new Date(selectedBoleto.dataVencimento).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </Text>
                    </View>
                    <View style={styles.modalDivider} />
                    <View style={styles.modalDetailRow}>
                      <Text style={styles.modalDetailLabel}>Número</Text>
                      <Text style={styles.modalDetailValue}>#{selectedBoleto.id}</Text>
                    </View>
                    {selectedBoleto.paidValue && selectedBoleto.paidValue > 0 && (
                      <>
                        <View style={styles.modalDivider} />
                        <View style={styles.modalDetailRow}>
                          <Text style={styles.modalDetailLabel}>Valor pago</Text>
                          <Text style={[styles.modalDetailValue, { color: colors.success.main }]}>
                            {formatCurrency(selectedBoleto.paidValue)}
                          </Text>
                        </View>
                      </>
                    )}
                  </GlassCard>

                  {/* Linha Digitável */}
                  {selectedBoleto.linhaDigitavel && !selectedBoleto.foiPago && (
                    <View style={styles.linhaDigitavelContainer}>
                      <Text style={styles.linhaDigitavelLabel}>Linha Digitável</Text>
                      <GlassCard variant="neon">
                        <Text style={styles.linhaDigitavelText}>
                          {selectedBoleto.linhaDigitavel}
                        </Text>
                      </GlassCard>
                      <View style={styles.linhaDigitavelActions}>
                        <Button
                          title="Copiar"
                          onPress={handleCopyLinhaDigitavel}
                          variant="outline"
                          size="sm"
                          fullWidth={false}
                          style={{ flex: 1 }}
                        />
                        <Button
                          title="Compartilhar"
                          onPress={handleShare}
                          variant="primary"
                          size="sm"
                          fullWidth={false}
                          style={{ flex: 1 }}
                        />
                      </View>
                    </View>
                  )}

                  {/* PIX QR Code */}
                  {!selectedBoleto.foiPago && selectedBoleto.status !== 'LIQUIDADO' && selectedBoleto.qrCodePix && (
                    <View style={styles.pixContainer}>
                      <Text style={styles.pixLabel}>Código Pix Copia e Cola</Text>
                      <GlassCard variant="neon">
                        <Text style={styles.pixCode} numberOfLines={3} ellipsizeMode="middle">
                          {selectedBoleto.qrCodePix}
                        </Text>
                      </GlassCard>
                    </View>
                  )}

                  {/* Actions */}
                  {!selectedBoleto.foiPago && selectedBoleto.status !== 'LIQUIDADO' && (
                    <View style={styles.modalActions}>
                      <Button
                        title={selectedBoleto.qrCodePix ? "Copiar Código PIX" : "PIX não disponível"}
                        onPress={handlePayPix}
                        variant="neon"
                        size="lg"
                        disabled={!selectedBoleto.qrCodePix}
                      />
                    </View>
                  )}
                </ScrollView>
              )}
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
    top: -width * 0.9,
    left: -width * 0.3,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.text.muted,
    marginTop: 4,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 12,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    height: 42,
  },
  filterButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    height: '100%',
    borderRadius: borderRadius.lg,
    gap: 6,
    ...shadows.neonPurple,
  },
  filterButtonInactive: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    height: '100%',
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.border.default,
    gap: 6,
  },
  filterIconWrapper: {
    marginRight: 2,
  },
  filterLabel: {
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  filterLabelActive: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '700',
  },
  filterCount: {
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    marginLeft: 4,
  },
  filterCountActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    marginLeft: 4,
  },
  filterCountText: {
    fontSize: 11,
    color: colors.text.muted,
    fontWeight: '700',
  },
  filterCountTextActive: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.text.muted,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    maxHeight: '90%',
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
  modalContent: {
    paddingHorizontal: 20,
  },
  modalStatusContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    gap: 6,
  },
  modalStatusIcon: {
    fontSize: 14,
    fontWeight: '700',
  },
  modalStatusText: {
    fontSize: 14,
    fontWeight: '700',
  },
  modalValueContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalValueLabel: {
    fontSize: 14,
    color: colors.text.muted,
    marginBottom: 4,
  },
  modalValue: {
    fontSize: 40,
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: -1,
  },
  modalDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalDetailLabel: {
    fontSize: 14,
    color: colors.text.muted,
  },
  modalDetailValue: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '600',
  },
  modalDivider: {
    height: 1,
    backgroundColor: colors.border.default,
    marginVertical: 12,
  },
  linhaDigitavelContainer: {
    marginTop: 20,
  },
  linhaDigitavelLabel: {
    fontSize: 14,
    color: colors.text.muted,
    marginBottom: 8,
  },
  linhaDigitavelText: {
    fontSize: 13,
    color: colors.info.main,
    fontFamily: 'monospace',
    letterSpacing: 0.5,
    lineHeight: 20,
  },
  linhaDigitavelActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  pixContainer: {
    marginTop: 20,
  },
  pixLabel: {
    fontSize: 14,
    color: colors.text.muted,
    marginBottom: 8,
  },
  pixCode: {
    fontSize: 11,
    color: '#22c55e',
    fontFamily: 'monospace',
    letterSpacing: 0.3,
    lineHeight: 16,
  },
  modalActions: {
    marginTop: 24,
  },
});
