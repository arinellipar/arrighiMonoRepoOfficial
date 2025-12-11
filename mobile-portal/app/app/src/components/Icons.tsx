import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface IconProps {
  size?: number;
  color?: string;
}

// Ícone de Cadeado Moderno (para campos de senha)
export function LockIcon({ size = 20, color = '#d4af37' }: IconProps) {
  const scale = size / 20;

  return (
    <View style={[styles.lockContainer, { width: size, height: size }]}>
      {/* Arco do cadeado */}
      <View
        style={[
          styles.lockShackle,
          {
            width: 10 * scale,
            height: 8 * scale,
            borderWidth: 2.5 * scale,
            borderColor: color,
            borderTopLeftRadius: 6 * scale,
            borderTopRightRadius: 6 * scale,
            top: 2 * scale,
          },
        ]}
      />
      {/* Corpo do cadeado */}
      <View
        style={[
          styles.lockBody,
          {
            width: 14 * scale,
            height: 10 * scale,
            backgroundColor: color,
            borderRadius: 2.5 * scale,
            bottom: 2 * scale,
          },
        ]}
      >
        {/* Buraco da chave */}
        <View
          style={[
            styles.keyhole,
            {
              width: 3 * scale,
              height: 3 * scale,
              borderRadius: 1.5 * scale,
              backgroundColor: '#0a0a0a',
              top: 2.5 * scale,
            },
          ]}
        />
      </View>
    </View>
  );
}

// Ícone de Cadeado com Confirmação (para confirmar senha)
export function LockCheckIcon({ size = 20, color = '#d4af37' }: IconProps) {
  const scale = size / 20;

  return (
    <View style={[styles.lockContainer, { width: size * 1.2, height: size }]}>
      {/* Arco do cadeado */}
      <View
        style={[
          styles.lockShackle,
          {
            width: 10 * scale,
            height: 8 * scale,
            borderWidth: 2.5 * scale,
            borderColor: color,
            borderTopLeftRadius: 6 * scale,
            borderTopRightRadius: 6 * scale,
            top: 2 * scale,
            left: 0,
          },
        ]}
      />
      {/* Corpo do cadeado */}
      <View
        style={[
          styles.lockBody,
          {
            width: 14 * scale,
            height: 10 * scale,
            backgroundColor: color,
            borderRadius: 2.5 * scale,
            bottom: 2 * scale,
            left: 0,
          },
        ]}
      >
        {/* Check mark */}
        <View style={[styles.checkContainer, { top: 2 * scale }]}>
          <View
            style={[
              styles.checkShort,
              {
                width: 3 * scale,
                height: 1.5 * scale,
                backgroundColor: '#0a0a0a',
                transform: [{ rotate: '45deg' }],
              },
            ]}
          />
          <View
            style={[
              styles.checkLong,
              {
                width: 5 * scale,
                height: 1.5 * scale,
                backgroundColor: '#0a0a0a',
                transform: [{ rotate: '-45deg' }],
                marginLeft: -1 * scale,
              },
            ]}
          />
        </View>
      </View>
      {/* Badge de check */}
      <View
        style={[
          styles.checkBadge,
          {
            width: 8 * scale,
            height: 8 * scale,
            borderRadius: 4 * scale,
            backgroundColor: '#22c55e',
            right: -2 * scale,
            bottom: 0,
          },
        ]}
      >
        <View
          style={[
            styles.miniCheck,
            {
              width: 4 * scale,
              height: 2 * scale,
              borderBottomWidth: 1.5 * scale,
              borderLeftWidth: 1.5 * scale,
              borderColor: '#fff',
              transform: [{ rotate: '-45deg' }],
            },
          ]}
        />
      </View>
    </View>
  );
}

// Ícone de Usuário Moderno
export function UserIcon({ size = 20, color = '#d4af37' }: IconProps) {
  const scale = size / 20;

  return (
    <View style={[styles.userContainer, { width: size, height: size }]}>
      {/* Cabeça */}
      <View
        style={[
          styles.userHead,
          {
            width: 8 * scale,
            height: 8 * scale,
            borderRadius: 4 * scale,
            backgroundColor: color,
            top: 1 * scale,
          },
        ]}
      />
      {/* Corpo */}
      <View
        style={[
          styles.userBody,
          {
            width: 14 * scale,
            height: 8 * scale,
            backgroundColor: color,
            borderTopLeftRadius: 7 * scale,
            borderTopRightRadius: 7 * scale,
            bottom: 1 * scale,
          },
        ]}
      />
    </View>
  );
}

// Ícone de Escudo com Cadeado (para login)
export function ShieldLockIcon({ size = 28, color = '#d4af37' }: IconProps) {
  const scale = size / 28;

  return (
    <View style={[styles.shieldContainer, { width: size, height: size * 1.15 }]}>
      <LinearGradient
        colors={['#ffd75b', color, '#b8941f']}
        style={[
          styles.shieldBody,
          {
            width: size,
            height: size * 1.15,
            borderRadius: 4 * scale,
            borderBottomLeftRadius: size * 0.4,
            borderBottomRightRadius: size * 0.4,
          },
        ]}
      >
        {/* Mini cadeado dentro do escudo */}
        <View style={styles.shieldLockInner}>
          <View
            style={[
              styles.miniLockShackle,
              {
                width: 6 * scale,
                height: 5 * scale,
                borderWidth: 1.5 * scale,
                borderColor: '#0a0a0a',
                borderTopLeftRadius: 4 * scale,
                borderTopRightRadius: 4 * scale,
              },
            ]}
          />
          <View
            style={[
              styles.miniLockBody,
              {
                width: 8 * scale,
                height: 6 * scale,
                backgroundColor: '#0a0a0a',
                borderRadius: 1.5 * scale,
              },
            ]}
          >
            <View
              style={[
                styles.miniKeyhole,
                {
                  width: 2 * scale,
                  height: 2 * scale,
                  borderRadius: scale,
                  backgroundColor: color,
                },
              ]}
            />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

// Ícone de Documento/ID
export function IdCardIcon({ size = 20, color = '#d4af37' }: IconProps) {
  const scale = size / 20;

  return (
    <View style={[styles.idContainer, { width: size * 1.2, height: size }]}>
      {/* Card */}
      <View
        style={[
          styles.idCard,
          {
            width: size * 1.2,
            height: size * 0.85,
            borderWidth: 2 * scale,
            borderColor: color,
            borderRadius: 3 * scale,
          },
        ]}
      >
        {/* Avatar */}
        <View
          style={[
            styles.idAvatar,
            {
              width: 5 * scale,
              height: 5 * scale,
              borderRadius: 2.5 * scale,
              backgroundColor: color,
              left: 3 * scale,
            },
          ]}
        />
        {/* Linhas */}
        <View style={[styles.idLines, { right: 3 * scale }]}>
          <View
            style={[
              styles.idLine,
              {
                width: 8 * scale,
                height: 1.5 * scale,
                backgroundColor: color,
                borderRadius: scale,
                marginBottom: 2 * scale,
              },
            ]}
          />
          <View
            style={[
              styles.idLine,
              {
                width: 6 * scale,
                height: 1.5 * scale,
                backgroundColor: color,
                borderRadius: scale,
                opacity: 0.6,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

// Ícone de Casa/Home
export function HomeIcon({ size = 24, color = '#d4af37' }: IconProps) {
  const scale = size / 24;

  return (
    <View style={[styles.homeContainer, { width: size, height: size }]}>
      {/* Telhado */}
      <View
        style={[
          styles.homeRoof,
          {
            width: 0,
            height: 0,
            borderLeftWidth: 10 * scale,
            borderRightWidth: 10 * scale,
            borderBottomWidth: 8 * scale,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderBottomColor: color,
            top: 2 * scale,
          },
        ]}
      />
      {/* Corpo da casa */}
      <View
        style={[
          styles.homeBody,
          {
            width: 16 * scale,
            height: 10 * scale,
            backgroundColor: color,
            borderBottomLeftRadius: 2 * scale,
            borderBottomRightRadius: 2 * scale,
            bottom: 2 * scale,
          },
        ]}
      >
        {/* Porta */}
        <View
          style={[
            styles.homeDoor,
            {
              width: 5 * scale,
              height: 6 * scale,
              backgroundColor: '#0a0a0a',
              borderTopLeftRadius: 2.5 * scale,
              borderTopRightRadius: 2.5 * scale,
              bottom: 0,
            },
          ]}
        />
      </View>
    </View>
  );
}

// Ícone de Boleto/Documento
export function BoletoIcon({ size = 24, color = '#d4af37' }: IconProps) {
  const scale = size / 24;

  return (
    <View style={[styles.boletoContainer, { width: size, height: size }]}>
      {/* Documento */}
      <View
        style={[
          styles.boletoDoc,
          {
            width: 16 * scale,
            height: 20 * scale,
            backgroundColor: color,
            borderRadius: 2 * scale,
          },
        ]}
      >
        {/* Linhas do código de barras */}
        <View style={[styles.boletoLines, { top: 4 * scale }]}>
          {[0, 1, 2, 3, 4].map((i) => (
            <View
              key={i}
              style={[
                styles.boletoLine,
                {
                  width: i % 2 === 0 ? 10 * scale : 6 * scale,
                  height: 1.5 * scale,
                  backgroundColor: '#0a0a0a',
                  marginBottom: 1.5 * scale,
                  borderRadius: scale,
                },
              ]}
            />
          ))}
        </View>
        {/* Barcode */}
        <View style={[styles.barcode, { bottom: 3 * scale }]}>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <View
              key={i}
              style={{
                width: i % 2 === 0 ? 1.5 * scale : 1 * scale,
                height: 4 * scale,
                backgroundColor: '#0a0a0a',
                marginHorizontal: 0.3 * scale,
              }}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

// Ícone de Pasta/Documentos
export function FolderIcon({ size = 24, color = '#d4af37' }: IconProps) {
  const scale = size / 24;

  return (
    <View style={[styles.folderContainer, { width: size, height: size }]}>
      {/* Aba da pasta */}
      <View
        style={[
          styles.folderTab,
          {
            width: 8 * scale,
            height: 4 * scale,
            backgroundColor: color,
            borderTopLeftRadius: 2 * scale,
            borderTopRightRadius: 2 * scale,
            top: 4 * scale,
            left: 2 * scale,
          },
        ]}
      />
      {/* Corpo da pasta */}
      <View
        style={[
          styles.folderBody,
          {
            width: 20 * scale,
            height: 14 * scale,
            backgroundColor: color,
            borderRadius: 2 * scale,
            bottom: 2 * scale,
          },
        ]}
      >
        {/* Linha decorativa */}
        <View
          style={[
            styles.folderLine,
            {
              width: 14 * scale,
              height: 1.5 * scale,
              backgroundColor: '#0a0a0a',
              opacity: 0.3,
              top: 3 * scale,
            },
          ]}
        />
      </View>
    </View>
  );
}

// Ícone de Sino/Notificação
export function BellIcon({ size = 24, color = '#d4af37' }: IconProps) {
  const scale = size / 24;

  return (
    <View style={[styles.bellContainer, { width: size, height: size }]}>
      {/* Corpo do sino */}
      <View
        style={[
          styles.bellBody,
          {
            width: 14 * scale,
            height: 14 * scale,
            backgroundColor: color,
            borderTopLeftRadius: 7 * scale,
            borderTopRightRadius: 7 * scale,
            borderBottomLeftRadius: 2 * scale,
            borderBottomRightRadius: 2 * scale,
            top: 2 * scale,
          },
        ]}
      />
      {/* Badalo */}
      <View
        style={[
          styles.bellClapper,
          {
            width: 4 * scale,
            height: 4 * scale,
            backgroundColor: color,
            borderRadius: 2 * scale,
            bottom: 2 * scale,
          },
        ]}
      />
      {/* Alça */}
      <View
        style={[
          styles.bellHandle,
          {
            width: 4 * scale,
            height: 3 * scale,
            borderWidth: 1.5 * scale,
            borderColor: color,
            borderRadius: 2 * scale,
            top: 0,
          },
        ]}
      />
    </View>
  );
}

// Ícone de Gráfico/Estatísticas
export function ChartIcon({ size = 24, color = '#d4af37' }: IconProps) {
  const scale = size / 24;

  return (
    <View style={[styles.chartContainer, { width: size, height: size }]}>
      {/* Barras */}
      <View style={styles.chartBars}>
        <View
          style={[
            styles.chartBar,
            {
              width: 4 * scale,
              height: 8 * scale,
              backgroundColor: color,
              opacity: 0.5,
              borderRadius: scale,
            },
          ]}
        />
        <View
          style={[
            styles.chartBar,
            {
              width: 4 * scale,
              height: 14 * scale,
              backgroundColor: color,
              borderRadius: scale,
              marginHorizontal: 2 * scale,
            },
          ]}
        />
        <View
          style={[
            styles.chartBar,
            {
              width: 4 * scale,
              height: 10 * scale,
              backgroundColor: color,
              opacity: 0.7,
              borderRadius: scale,
            },
          ]}
        />
      </View>
    </View>
  );
}

// Ícone de Calendário
export function CalendarIcon({ size = 24, color = '#d4af37' }: IconProps) {
  const scale = size / 24;

  return (
    <View style={[styles.calendarContainer, { width: size, height: size }]}>
      {/* Corpo */}
      <View
        style={[
          styles.calendarBody,
          {
            width: 18 * scale,
            height: 16 * scale,
            backgroundColor: color,
            borderRadius: 3 * scale,
            bottom: 1 * scale,
          },
        ]}
      >
        {/* Cabeçalho */}
        <View
          style={[
            styles.calendarHeader,
            {
              width: '100%',
              height: 5 * scale,
              backgroundColor: '#0a0a0a',
              opacity: 0.3,
              borderTopLeftRadius: 3 * scale,
              borderTopRightRadius: 3 * scale,
            },
          ]}
        />
        {/* Grid de dias */}
        <View style={[styles.calendarGrid, { marginTop: 2 * scale }]}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <View
              key={i}
              style={{
                width: 2 * scale,
                height: 2 * scale,
                backgroundColor: '#0a0a0a',
                borderRadius: scale,
                margin: 1 * scale,
              }}
            />
          ))}
        </View>
      </View>
      {/* Alças */}
      <View
        style={[
          styles.calendarRings,
          { top: 1 * scale },
        ]}
      >
        <View
          style={{
            width: 2 * scale,
            height: 4 * scale,
            backgroundColor: color,
            borderRadius: scale,
            marginHorizontal: 3 * scale,
          }}
        />
        <View
          style={{
            width: 2 * scale,
            height: 4 * scale,
            backgroundColor: color,
            borderRadius: scale,
            marginHorizontal: 3 * scale,
          }}
        />
      </View>
    </View>
  );
}

// Ícone de Check/Sucesso
export function CheckCircleIcon({ size = 24, color = '#22c55e' }: IconProps) {
  const scale = size / 24;

  return (
    <View style={[styles.checkCircleContainer, { width: size, height: size }]}>
      <View
        style={[
          styles.checkCircleOuter,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
          },
        ]}
      >
        <View
          style={[
            styles.checkMark,
            {
              width: 10 * scale,
              height: 6 * scale,
              borderBottomWidth: 2.5 * scale,
              borderLeftWidth: 2.5 * scale,
              borderColor: '#fff',
              transform: [{ rotate: '-45deg' }],
              marginTop: -2 * scale,
            },
          ]}
        />
      </View>
    </View>
  );
}

// Ícone de Alerta/Warning
export function AlertIcon({ size = 24, color = '#f59e0b' }: IconProps) {
  const scale = size / 24;

  return (
    <View style={[styles.alertContainer, { width: size, height: size }]}>
      <View
        style={[
          styles.alertTriangle,
          {
            width: 0,
            height: 0,
            borderLeftWidth: 10 * scale,
            borderRightWidth: 10 * scale,
            borderBottomWidth: 18 * scale,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderBottomColor: color,
          },
        ]}
      />
      <View
        style={[
          styles.alertExclamation,
          {
            width: 2.5 * scale,
            height: 7 * scale,
            backgroundColor: '#0a0a0a',
            borderRadius: scale,
            top: 8 * scale,
          },
        ]}
      />
      <View
        style={[
          styles.alertDot,
          {
            width: 2.5 * scale,
            height: 2.5 * scale,
            backgroundColor: '#0a0a0a',
            borderRadius: 1.25 * scale,
            bottom: 4 * scale,
          },
        ]}
      />
    </View>
  );
}

// Ícone de Download
export function DownloadIcon({ size = 24, color = '#d4af37' }: IconProps) {
  const scale = size / 24;

  return (
    <View style={[styles.downloadContainer, { width: size, height: size }]}>
      {/* Seta */}
      <View
        style={[
          styles.downloadArrow,
          {
            width: 3 * scale,
            height: 10 * scale,
            backgroundColor: color,
            top: 2 * scale,
          },
        ]}
      />
      <View
        style={[
          styles.downloadArrowHead,
          {
            width: 0,
            height: 0,
            borderLeftWidth: 6 * scale,
            borderRightWidth: 6 * scale,
            borderTopWidth: 6 * scale,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderTopColor: color,
            top: 10 * scale,
          },
        ]}
      />
      {/* Base */}
      <View
        style={[
          styles.downloadBase,
          {
            width: 16 * scale,
            height: 3 * scale,
            borderBottomWidth: 2.5 * scale,
            borderLeftWidth: 2.5 * scale,
            borderRightWidth: 2.5 * scale,
            borderColor: color,
            borderBottomLeftRadius: 2 * scale,
            borderBottomRightRadius: 2 * scale,
            bottom: 2 * scale,
          },
        ]}
      />
    </View>
  );
}

// Ícone de Dinheiro/Pagamento
export function MoneyIcon({ size = 24, color = '#22c55e' }: IconProps) {
  const scale = size / 24;

  return (
    <View style={[styles.moneyContainer, { width: size, height: size }]}>
      <View
        style={[
          styles.moneyCircle,
          {
            width: size * 0.9,
            height: size * 0.9,
            borderRadius: size * 0.45,
            borderWidth: 2.5 * scale,
            borderColor: color,
          },
        ]}
      >
        <View
          style={[
            styles.moneySymbol,
            {
              width: 2.5 * scale,
              height: 12 * scale,
              backgroundColor: color,
              borderRadius: scale,
            },
          ]}
        />
        <View
          style={[
            styles.moneyLineTop,
            {
              width: 6 * scale,
              height: 2 * scale,
              backgroundColor: color,
              borderRadius: scale,
              position: 'absolute',
              top: 4 * scale,
            },
          ]}
        />
        <View
          style={[
            styles.moneyLineBottom,
            {
              width: 6 * scale,
              height: 2 * scale,
              backgroundColor: color,
              borderRadius: scale,
              position: 'absolute',
              bottom: 4 * scale,
            },
          ]}
        />
      </View>
    </View>
  );
}

// Ícone de Upload
export function UploadIcon({ size = 24, color = '#d4af37' }: IconProps) {
  const scale = size / 24;

  return (
    <View style={[styles.uploadContainer, { width: size, height: size }]}>
      {/* Seta para cima */}
      <View
        style={[
          styles.uploadArrowHead,
          {
            width: 0,
            height: 0,
            borderLeftWidth: 6 * scale,
            borderRightWidth: 6 * scale,
            borderBottomWidth: 6 * scale,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderBottomColor: color,
            top: 2 * scale,
          },
        ]}
      />
      <View
        style={[
          styles.uploadArrow,
          {
            width: 3 * scale,
            height: 10 * scale,
            backgroundColor: color,
            top: 6 * scale,
          },
        ]}
      />
      {/* Base */}
      <View
        style={[
          styles.uploadBase,
          {
            width: 16 * scale,
            height: 3 * scale,
            borderBottomWidth: 2.5 * scale,
            borderLeftWidth: 2.5 * scale,
            borderRightWidth: 2.5 * scale,
            borderColor: color,
            borderBottomLeftRadius: 2 * scale,
            borderBottomRightRadius: 2 * scale,
            bottom: 2 * scale,
          },
        ]}
      />
    </View>
  );
}

// Ícone de Arquivo/Documento
export function FileIcon({ size = 24, color = '#d4af37' }: IconProps) {
  const scale = size / 24;

  return (
    <View style={[styles.fileContainer, { width: size, height: size }]}>
      <View
        style={[
          styles.fileBody,
          {
            width: 16 * scale,
            height: 20 * scale,
            backgroundColor: color,
            borderRadius: 2 * scale,
          },
        ]}
      >
        {/* Canto dobrado */}
        <View
          style={[
            styles.fileFold,
            {
              width: 5 * scale,
              height: 5 * scale,
              backgroundColor: '#0a0a0a',
              position: 'absolute',
              top: 0,
              right: 0,
              borderBottomLeftRadius: 2 * scale,
            },
          ]}
        />
        {/* Linhas */}
        <View style={[styles.fileLines, { top: 8 * scale, left: 3 * scale }]}>
          <View
            style={{
              width: 8 * scale,
              height: 1.5 * scale,
              backgroundColor: '#0a0a0a',
              opacity: 0.4,
              borderRadius: scale,
              marginBottom: 2 * scale,
            }}
          />
          <View
            style={{
              width: 6 * scale,
              height: 1.5 * scale,
              backgroundColor: '#0a0a0a',
              opacity: 0.4,
              borderRadius: scale,
            }}
          />
        </View>
      </View>
    </View>
  );
}

// Ícone de Lixeira/Delete
export function TrashIcon({ size = 24, color = '#ef4444' }: IconProps) {
  const scale = size / 24;

  return (
    <View style={[styles.trashContainer, { width: size, height: size }]}>
      {/* Tampa */}
      <View
        style={[
          styles.trashLid,
          {
            width: 14 * scale,
            height: 2 * scale,
            backgroundColor: color,
            borderRadius: scale,
            top: 3 * scale,
          },
        ]}
      />
      <View
        style={[
          styles.trashHandle,
          {
            width: 6 * scale,
            height: 2 * scale,
            borderWidth: 1.5 * scale,
            borderColor: color,
            borderBottomWidth: 0,
            borderTopLeftRadius: 3 * scale,
            borderTopRightRadius: 3 * scale,
            top: 1 * scale,
          },
        ]}
      />
      {/* Corpo */}
      <View
        style={[
          styles.trashBody,
          {
            width: 12 * scale,
            height: 14 * scale,
            backgroundColor: color,
            borderBottomLeftRadius: 2 * scale,
            borderBottomRightRadius: 2 * scale,
            bottom: 2 * scale,
          },
        ]}
      >
        {/* Linhas */}
        <View style={styles.trashLines}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={{
                width: 1.5 * scale,
                height: 8 * scale,
                backgroundColor: '#0a0a0a',
                opacity: 0.4,
                marginHorizontal: 1.5 * scale,
              }}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

// Ícone de Lâmpada/Dica
export function LightbulbIcon({ size = 24, color = '#d4af37' }: IconProps) {
  const scale = size / 24;

  return (
    <View style={[styles.lightbulbContainer, { width: size, height: size }]}>
      {/* Bulbo */}
      <View
        style={[
          styles.lightbulbBulb,
          {
            width: 14 * scale,
            height: 14 * scale,
            borderRadius: 7 * scale,
            backgroundColor: color,
            top: 1 * scale,
          },
        ]}
      />
      {/* Brilho */}
      <View
        style={[
          styles.lightbulbGlow,
          {
            width: 4 * scale,
            height: 4 * scale,
            borderRadius: 2 * scale,
            backgroundColor: '#fff',
            opacity: 0.5,
            top: 4 * scale,
            left: 7 * scale,
          },
        ]}
      />
      {/* Base */}
      <View
        style={[
          styles.lightbulbBase,
          {
            width: 8 * scale,
            height: 6 * scale,
            backgroundColor: color,
            opacity: 0.8,
            borderBottomLeftRadius: 2 * scale,
            borderBottomRightRadius: 2 * scale,
            bottom: 2 * scale,
          },
        ]}
      >
        {/* Linhas da base */}
        <View
          style={{
            width: 6 * scale,
            height: 1 * scale,
            backgroundColor: '#0a0a0a',
            opacity: 0.3,
            marginTop: 1 * scale,
          }}
        />
        <View
          style={{
            width: 6 * scale,
            height: 1 * scale,
            backgroundColor: '#0a0a0a',
            opacity: 0.3,
            marginTop: 1 * scale,
          }}
        />
      </View>
    </View>
  );
}

// Ícone de Relógio/Pendente
export function ClockIcon({ size = 24, color = '#3b82f6' }: IconProps) {
  const scale = size / 24;

  return (
    <View style={[styles.clockContainer, { width: size, height: size }]}>
      <View
        style={[
          styles.clockFace,
          {
            width: size * 0.9,
            height: size * 0.9,
            borderRadius: size * 0.45,
            borderWidth: 2.5 * scale,
            borderColor: color,
          },
        ]}
      >
        {/* Ponteiro das horas */}
        <View
          style={[
            styles.clockHand,
            {
              width: 2 * scale,
              height: 6 * scale,
              backgroundColor: color,
              borderRadius: scale,
              position: 'absolute',
              top: 4 * scale,
              transform: [{ rotate: '30deg' }],
            },
          ]}
        />
        {/* Ponteiro dos minutos */}
        <View
          style={[
            styles.clockHand,
            {
              width: 2 * scale,
              height: 8 * scale,
              backgroundColor: color,
              borderRadius: scale,
              position: 'absolute',
              right: 4 * scale,
              transform: [{ rotate: '90deg' }],
            },
          ]}
        />
        {/* Centro */}
        <View
          style={{
            width: 3 * scale,
            height: 3 * scale,
            backgroundColor: color,
            borderRadius: 1.5 * scale,
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Lock Icon
  lockContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  lockShackle: {
    position: 'absolute',
    borderBottomWidth: 0,
  },
  lockBody: {
    position: 'absolute',
    alignItems: 'center',
  },
  keyhole: {
    position: 'absolute',
  },

  // Lock Check Icon
  checkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
  },
  checkShort: {},
  checkLong: {},
  checkBadge: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniCheck: {
    marginTop: -1,
  },

  // User Icon
  userContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  userHead: {
    position: 'absolute',
  },
  userBody: {
    position: 'absolute',
  },

  // Shield Lock Icon
  shieldContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldBody: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldLockInner: {
    alignItems: 'center',
  },
  miniLockShackle: {
    borderBottomWidth: 0,
    marginBottom: -1,
  },
  miniLockBody: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniKeyhole: {},

  // ID Card Icon
  idContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  idCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  idAvatar: {
    position: 'absolute',
  },
  idLines: {
    position: 'absolute',
  },
  idLine: {},

  // Home Icon
  homeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeRoof: {
    position: 'absolute',
  },
  homeBody: {
    position: 'absolute',
    alignItems: 'center',
  },
  homeDoor: {
    position: 'absolute',
  },

  // Boleto Icon
  boletoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  boletoDoc: {
    alignItems: 'center',
  },
  boletoLines: {
    position: 'absolute',
    alignItems: 'flex-start',
    left: 3,
  },
  boletoLine: {},
  barcode: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'flex-end',
  },

  // Folder Icon
  folderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  folderTab: {
    position: 'absolute',
  },
  folderBody: {
    position: 'absolute',
    alignItems: 'center',
  },
  folderLine: {
    position: 'absolute',
  },

  // Bell Icon
  bellContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBody: {
    position: 'absolute',
  },
  bellClapper: {
    position: 'absolute',
  },
  bellHandle: {
    position: 'absolute',
  },

  // Chart Icon
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  chartBar: {},

  // Calendar Icon
  calendarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarBody: {
    position: 'absolute',
    overflow: 'hidden',
  },
  calendarHeader: {},
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  calendarRings: {
    position: 'absolute',
    flexDirection: 'row',
  },

  // Check Circle Icon
  checkCircleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleOuter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {},

  // Alert Icon
  alertContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  alertTriangle: {},
  alertExclamation: {
    position: 'absolute',
  },
  alertDot: {
    position: 'absolute',
  },

  // Download Icon
  downloadContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadArrow: {
    position: 'absolute',
  },
  downloadArrowHead: {
    position: 'absolute',
  },
  downloadBase: {
    position: 'absolute',
  },

  // Money Icon
  moneyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  moneyCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  moneySymbol: {},
  moneyLineTop: {},
  moneyLineBottom: {},

  // Clock Icon
  clockContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  clockFace: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  clockHand: {},

  // Upload Icon
  uploadContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadArrow: {
    position: 'absolute',
  },
  uploadArrowHead: {
    position: 'absolute',
  },
  uploadBase: {
    position: 'absolute',
  },

  // File Icon
  fileContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileBody: {
    overflow: 'hidden',
  },
  fileFold: {},
  fileLines: {
    position: 'absolute',
  },

  // Trash Icon
  trashContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  trashLid: {
    position: 'absolute',
  },
  trashHandle: {
    position: 'absolute',
  },
  trashBody: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trashLines: {
    flexDirection: 'row',
    marginTop: 2,
  },

  // Lightbulb Icon
  lightbulbContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  lightbulbBulb: {
    position: 'absolute',
  },
  lightbulbGlow: {
    position: 'absolute',
  },
  lightbulbBase: {
    position: 'absolute',
    alignItems: 'center',
  },
});

