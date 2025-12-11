import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Alert,
  Modal,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { api } from '../../src/services/api';
import { GlassCard } from '../../src/components/GlassCard';
import {
  BoletoIcon,
  FolderIcon,
  DownloadIcon,
  CalendarIcon,
  ClockIcon,
  UploadIcon,
  FileIcon,
  TrashIcon
} from '../../src/components/Icons';
import { colors, shadows, borderRadius } from '../../src/theme/colors';

const { width } = Dimensions.get('window');

// Limite de 30MB
const MAX_FILE_SIZE = 30 * 1024 * 1024;

type TabType = 'contratos' | 'meus_arquivos';

interface CloudDocument {
  id: number;
  nomeOriginal: string;
  nomeArquivo: string;
  tipoMime: string;
  tamanho: number;
  tamanhoFormatado: string;
  blobUrl: string;
  dataUpload: string;
  descricao?: string;
}

export default function DocumentsScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('contratos');
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<CloudDocument | null>(null);
  const [showDocModal, setShowDocModal] = useState(false);

  const queryClient = useQueryClient();

  // Contratos do servidor
  const {
    data: documents,
    isLoading: loadingContratos,
    refetch: refetchContratos,
  } = useQuery({
    queryKey: ['documents'],
    queryFn: () => api.getDocuments(),
  });

  // Documentos na nuvem (Azure Blob Storage)
  const {
    data: cloudDocuments,
    isLoading: loadingCloud,
    refetch: refetchCloud,
  } = useQuery({
    queryKey: ['meus-arquivos'],
    queryFn: () => api.getMeusArquivos(),
  });

  // Mutation para upload
  const uploadMutation = useMutation({
    mutationFn: (data: {
      base64: string;
      fileName: string;
      mimeType: string;
      size: number;
    }) => api.uploadDocumento(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meus-arquivos'] });
      Alert.alert('Sucesso', 'Documento enviado para a nuvem com sucesso!');
    },
    onError: (error: any) => {
      Alert.alert('Erro', error.response?.data?.message || 'Não foi possível enviar o documento');
    },
  });

  // Mutation para deletar
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteMeuArquivo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meus-arquivos'] });
      setShowDocModal(false);
      setSelectedDoc(null);
      Alert.alert('Sucesso', 'Documento excluído com sucesso!');
    },
    onError: (error: any) => {
      Alert.alert('Erro', error.response?.data?.message || 'Não foi possível excluir o documento');
    },
  });

  const isLoading = loadingContratos || loadingCloud;

  const handleRefresh = () => {
    refetchContratos();
    refetchCloud();
  };

  const handleDownloadContrato = async (contratoId: number) => {
    setDownloadingId(contratoId);
    try {
      const result = await api.downloadContrato(contratoId);
      if (result.url) {
        await Linking.openURL(result.url);
      }
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.message || 'Não foi possível baixar o documento');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleUploadDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'image/*',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];

      // Verifica o tamanho
      if (file.size && file.size > MAX_FILE_SIZE) {
        Alert.alert(
          'Arquivo muito grande',
          `O arquivo selecionado tem ${formatFileSize(file.size)}. O limite máximo é de 30MB.`
        );
        return;
      }

      setIsUploading(true);

      // Lê o arquivo como Base64
      const base64 = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Envia para a API
      await uploadMutation.mutateAsync({
        base64,
        fileName: file.name,
        mimeType: file.mimeType || 'application/octet-stream',
        size: file.size || 0,
      });
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível anexar o documento');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadCloudDocument = async (doc: CloudDocument) => {
    try {
      const result = await api.downloadMeuArquivo(doc.id);
      if (result.url) {
        await Linking.openURL(result.url);
      }
    } catch (error: any) {
      Alert.alert('Erro', error.response?.data?.message || 'Não foi possível baixar o documento');
    }
  };

  const handleDeleteDocument = (doc: CloudDocument) => {
    Alert.alert(
      'Excluir documento',
      `Deseja excluir "${doc.nomeOriginal}" da nuvem? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(doc.id),
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeIcon = (mimeType: string) => {
    if (mimeType?.includes('pdf')) return '📄';
    if (mimeType?.includes('image')) return '🖼️';
    if (mimeType?.includes('word') || mimeType?.includes('document')) return '📝';
    if (mimeType?.includes('excel') || mimeType?.includes('sheet')) return '📊';
    return '📎';
  };

  // Card de contrato do servidor
  const ContractCard = ({ document }: { document: any }) => {
    const isDownloading = downloadingId === document.id;
    const hasDocument = document.temAnexo;

    return (
      <TouchableOpacity
        style={styles.documentCard}
        onPress={() => hasDocument && handleDownloadContrato(document.id)}
        disabled={!hasDocument || isDownloading}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.documentGradient}
        >
          <View
            style={[
              styles.documentIcon,
              { backgroundColor: hasDocument ? 'rgba(212, 175, 55, 0.2)' : colors.neutral[700] + '50' },
            ]}
          >
            {hasDocument ? (
              <BoletoIcon size={26} color="#d4af37" />
            ) : (
              <FolderIcon size={26} color={colors.neutral[500]} />
            )}
          </View>

          <View style={styles.documentContent}>
            <Text style={styles.documentTitle}>Contrato #{document.id}</Text>
            <Text style={styles.documentSubtitle}>{document.situacao}</Text>
            <View style={styles.documentMeta}>
              <View style={styles.documentMetaItem}>
                <CalendarIcon size={14} color={colors.text.muted} />
                <Text style={styles.documentMetaText}>{formatDate(document.dataCadastro)}</Text>
              </View>
              {document.numeroParcelas && (
                <View style={styles.documentMetaItem}>
                  <ClockIcon size={14} color={colors.text.muted} />
                  <Text style={styles.documentMetaText}>{document.numeroParcelas}x</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.documentAction}>
            {hasDocument ? (
              <LinearGradient
                colors={
                  isDownloading
                    ? [colors.neutral[600], colors.neutral[700]]
                    : ['#ffd75b', '#d4af37', '#b8941f']
                }
                style={styles.downloadButton}
              >
                {isDownloading ? (
                  <ActivityIndicator size="small" color="#0a0a0a" />
                ) : (
                  <DownloadIcon size={20} color="#0a0a0a" />
                )}
              </LinearGradient>
            ) : (
              <View style={styles.noDocumentBadge}>
                <Text style={styles.noDocumentText}>Sem anexo</Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  // Card de documento na nuvem
  const CloudDocumentCard = ({ doc }: { doc: CloudDocument }) => {
    return (
      <TouchableOpacity
        style={styles.documentCard}
        onPress={() => {
          setSelectedDoc(doc);
          setShowDocModal(true);
        }}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['rgba(212, 175, 55, 0.08)', 'rgba(212, 175, 55, 0.02)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.documentGradient}
        >
          <View style={[styles.documentIcon, { backgroundColor: 'rgba(212, 175, 55, 0.2)' }]}>
            <FileIcon size={26} color="#d4af37" />
          </View>

          <View style={styles.documentContent}>
            <Text style={styles.documentTitle} numberOfLines={1}>
              {doc.nomeOriginal}
            </Text>
            <Text style={styles.documentSubtitle}>{doc.tamanhoFormatado}</Text>
            <View style={styles.documentMeta}>
              <View style={styles.documentMetaItem}>
                <CalendarIcon size={14} color={colors.text.muted} />
                <Text style={styles.documentMetaText}>{formatDate(doc.dataUpload)}</Text>
              </View>
              <View style={styles.documentMetaItem}>
                <Text style={styles.fileTypeEmoji}>{getFileTypeIcon(doc.tipoMime)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.documentAction}>
            <View style={styles.cloudBadge}>
              <Text style={styles.cloudBadgeIcon}>☁️</Text>
              <Text style={styles.cloudBadgeText}>Nuvem</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const totalStorageUsed = cloudDocuments?.reduce((sum: number, doc: CloudDocument) => sum + doc.tamanho, 0) || 0;

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
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Documentos</Text>
            <Text style={styles.headerSubtitle}>Seus contratos e arquivos na nuvem</Text>
          </View>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handleUploadDocument}
            disabled={isUploading || uploadMutation.isPending}
          >
            <LinearGradient
              colors={['#ffd75b', '#d4af37', '#b8941f']}
              style={styles.uploadButtonGradient}
            >
              {isUploading || uploadMutation.isPending ? (
                <ActivityIndicator size="small" color="#0a0a0a" />
              ) : (
                <UploadIcon size={22} color="#0a0a0a" />
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'contratos' && styles.tabActive]}
            onPress={() => setActiveTab('contratos')}
          >
            <Text style={[styles.tabText, activeTab === 'contratos' && styles.tabTextActive]}>
              Contratos
            </Text>
            {documents?.length > 0 && (
              <View style={[styles.tabBadge, activeTab === 'contratos' && styles.tabBadgeActive]}>
                <Text style={[styles.tabBadgeText, activeTab === 'contratos' && styles.tabBadgeTextActive]}>
                  {documents.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'meus_arquivos' && styles.tabActive]}
            onPress={() => setActiveTab('meus_arquivos')}
          >
            <Text style={[styles.tabText, activeTab === 'meus_arquivos' && styles.tabTextActive]}>
              Meus Arquivos
            </Text>
            {cloudDocuments?.length > 0 && (
              <View style={[styles.tabBadge, activeTab === 'meus_arquivos' && styles.tabBadgeActive]}>
                <Text style={[styles.tabBadgeText, activeTab === 'meus_arquivos' && styles.tabBadgeTextActive]}>
                  {cloudDocuments.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Documents List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor="#d4af37"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'contratos' ? (
          <>
            {/* Info Card */}
            <GlassCard variant="neon" style={styles.infoCard}>
              <View style={styles.infoContent}>
                <View style={[styles.infoIconContainer, { backgroundColor: 'rgba(212, 175, 55, 0.2)' }]}>
                  <FolderIcon size={20} color="#d4af37" />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoTitle, { color: '#d4af37' }]}>Contratos</Text>
                  <Text style={styles.infoText}>
                    Toque em um contrato para baixar o documento anexado.
                  </Text>
                </View>
              </View>
            </GlassCard>

            {/* Contracts */}
            {documents?.length === 0 ? (
              <GlassCard>
                <View style={styles.emptyState}>
                  <View style={styles.emptyIconContainer}>
                    <LinearGradient
                      colors={['rgba(212, 175, 55, 0.2)', 'rgba(212, 175, 55, 0.1)']}
                      style={styles.emptyIconGradient}
                    >
                      <FolderIcon size={40} color="#d4af37" />
                    </LinearGradient>
                  </View>
                  <Text style={styles.emptyTitle}>Nenhum contrato</Text>
                  <Text style={styles.emptySubtitle}>
                    Você ainda não possui contratos cadastrados
                  </Text>
                </View>
              </GlassCard>
            ) : (
              <View style={styles.documentsList}>
                {documents?.map((doc: any) => (
                  <ContractCard key={doc.id} document={doc} />
                ))}
              </View>
            )}

            {/* Stats */}
            {documents?.length > 0 && (
              <View style={styles.statsContainer}>
                <GlassCard>
                  <View style={styles.statsContent}>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{documents.length}</Text>
                      <Text style={styles.statLabel}>Total</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Text style={[styles.statValue, { color: colors.success.main }]}>
                        {documents.filter((d: any) => d.temAnexo).length}
                      </Text>
                      <Text style={styles.statLabel}>Com anexo</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Text style={[styles.statValue, { color: colors.warning.main }]}>
                        {documents.filter((d: any) => !d.temAnexo).length}
                      </Text>
                      <Text style={styles.statLabel}>Sem anexo</Text>
                    </View>
                  </View>
                </GlassCard>
              </View>
            )}
          </>
        ) : (
          <>
            {/* Info Card - Meus Arquivos */}
            <GlassCard variant="neon" style={styles.infoCard}>
              <View style={styles.infoContent}>
                <View style={[styles.infoIconContainer, { backgroundColor: 'rgba(212, 175, 55, 0.2)' }]}>
                  <UploadIcon size={20} color="#d4af37" />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoTitle, { color: '#d4af37' }]}>Armazenamento na Nuvem</Text>
                  <Text style={styles.infoText}>
                    Anexe documentos de até 30MB. Arquivos são armazenados com segurança no Azure.
                  </Text>
                </View>
              </View>
            </GlassCard>

            {/* Storage Info */}
            {cloudDocuments?.length > 0 && (
              <View style={styles.storageInfo}>
                <Text style={styles.storageText}>
                  ☁️ Armazenamento usado: <Text style={styles.storageValue}>{formatFileSize(totalStorageUsed)}</Text>
                </Text>
              </View>
            )}

            {/* Cloud Documents */}
            {cloudDocuments?.length === 0 ? (
              <GlassCard>
                <View style={styles.emptyState}>
                  <View style={styles.emptyIconContainer}>
                    <LinearGradient
                      colors={['rgba(212, 175, 55, 0.2)', 'rgba(212, 175, 55, 0.1)']}
                      style={styles.emptyIconGradient}
                    >
                      <UploadIcon size={40} color="#d4af37" />
                    </LinearGradient>
                  </View>
                  <Text style={styles.emptyTitle}>Nenhum arquivo</Text>
                  <Text style={styles.emptySubtitle}>
                    Toque no botão + para enviar documentos para a nuvem
                  </Text>
                  <TouchableOpacity
                    style={styles.emptyUploadButton}
                    onPress={handleUploadDocument}
                    disabled={isUploading}
                  >
                    <LinearGradient
                      colors={['#ffd75b', '#d4af37', '#b8941f']}
                      style={styles.emptyUploadGradient}
                    >
                      <UploadIcon size={20} color="#0a0a0a" />
                      <Text style={styles.emptyUploadText}>Enviar Documento</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </GlassCard>
            ) : (
              <View style={styles.documentsList}>
                {cloudDocuments?.map((doc: CloudDocument) => (
                  <CloudDocumentCard key={doc.id} doc={doc} />
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Modal de documento na nuvem */}
      <Modal
        visible={showDocModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowDocModal(false)}
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
                  onPress={() => setShowDocModal(false)}
                >
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              {selectedDoc && (
                <View style={styles.modalContent}>
                  {/* Icon */}
                  <View style={styles.modalIconContainer}>
                    <LinearGradient
                      colors={['rgba(212, 175, 55, 0.3)', 'rgba(212, 175, 55, 0.1)']}
                      style={styles.modalIconGradient}
                    >
                      <FileIcon size={48} color="#d4af37" />
                    </LinearGradient>
                  </View>

                  {/* Cloud Badge */}
                  <View style={styles.modalCloudBadge}>
                    <Text style={styles.modalCloudBadgeText}>☁️ Armazenado na Nuvem</Text>
                  </View>

                  {/* Info */}
                  <Text style={styles.modalTitle} numberOfLines={2}>
                    {selectedDoc.nomeOriginal}
                  </Text>

                  <View style={styles.modalDetails}>
                    <View style={styles.modalDetailRow}>
                      <Text style={styles.modalDetailLabel}>Tamanho</Text>
                      <Text style={styles.modalDetailValue}>{selectedDoc.tamanhoFormatado}</Text>
                    </View>
                    <View style={styles.modalDivider} />
                    <View style={styles.modalDetailRow}>
                      <Text style={styles.modalDetailLabel}>Tipo</Text>
                      <Text style={styles.modalDetailValue}>
                        {selectedDoc.tipoMime?.split('/').pop()?.toUpperCase() || 'Arquivo'}
                      </Text>
                    </View>
                    <View style={styles.modalDivider} />
                    <View style={styles.modalDetailRow}>
                      <Text style={styles.modalDetailLabel}>Enviado em</Text>
                      <Text style={styles.modalDetailValue}>
                        {formatDate(selectedDoc.dataUpload)}
                      </Text>
                    </View>
                  </View>

                  {/* Actions */}
                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={styles.modalActionButton}
                      onPress={() => handleDownloadCloudDocument(selectedDoc)}
                    >
                      <LinearGradient
                        colors={['#ffd75b', '#d4af37', '#b8941f']}
                        style={styles.modalActionGradient}
                      >
                        <DownloadIcon size={20} color="#0a0a0a" />
                        <Text style={styles.modalActionText}>Baixar</Text>
                      </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.modalActionButton}
                      onPress={() => handleDeleteDocument(selectedDoc)}
                      disabled={deleteMutation.isPending}
                    >
                      <View style={styles.modalDeleteButton}>
                        {deleteMutation.isPending ? (
                          <ActivityIndicator size="small" color={colors.error.main} />
                        ) : (
                          <TrashIcon size={20} color={colors.error.main} />
                        )}
                        <Text style={[styles.modalActionText, { color: colors.error.main }]}>
                          Excluir
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
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
    right: -width * 0.4,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
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
  uploadButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  uploadButtonGradient: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.tertiary,
    gap: 8,
  },
  tabActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.muted,
  },
  tabTextActive: {
    color: '#d4af37',
  },
  tabBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: colors.neutral[700],
  },
  tabBadgeActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.3)',
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text.muted,
  },
  tabBadgeTextActive: {
    color: '#d4af37',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  infoCard: {
    marginBottom: 20,
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  storageInfo: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  storageText: {
    fontSize: 13,
    color: colors.text.muted,
  },
  storageValue: {
    color: '#d4af37',
    fontWeight: '600',
  },
  documentsList: {
    gap: 12,
  },
  documentCard: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border.default,
    ...shadows.glass,
  },
  documentGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  documentIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentContent: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 2,
  },
  documentSubtitle: {
    fontSize: 13,
    color: colors.text.muted,
    marginBottom: 8,
  },
  documentMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  documentMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  documentMetaText: {
    fontSize: 12,
    color: colors.text.muted,
  },
  fileTypeEmoji: {
    fontSize: 14,
  },
  documentAction: {},
  downloadButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDocumentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: colors.neutral[800],
    borderRadius: borderRadius.md,
  },
  noDocumentText: {
    fontSize: 11,
    color: colors.text.muted,
    fontWeight: '500',
  },
  cloudBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    gap: 4,
  },
  cloudBadgeIcon: {
    fontSize: 12,
  },
  cloudBadgeText: {
    fontSize: 11,
    color: colors.info.main,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIconContainer: {
    marginBottom: 16,
  },
  emptyIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: 20,
  },
  emptyUploadButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  emptyUploadGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 10,
  },
  emptyUploadText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0a0a0a',
  },
  statsContainer: {
    marginTop: 24,
  },
  statsContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.muted,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border.default,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
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
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    color: colors.text.muted,
  },
  modalContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  modalIconContainer: {
    marginBottom: 16,
  },
  modalIconGradient: {
    width: 100,
    height: 100,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloudBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderRadius: borderRadius.full,
    marginBottom: 12,
  },
  modalCloudBadgeText: {
    fontSize: 12,
    color: colors.info.main,
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  modalDetails: {
    width: '100%',
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.xl,
    padding: 16,
    marginBottom: 24,
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
  modalActions: {
    width: '100%',
    gap: 12,
  },
  modalActionButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  modalActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  modalDeleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.error.main + '30',
  },
  modalActionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0a0a0a',
  },
});
