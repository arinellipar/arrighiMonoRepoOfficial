import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { HomeIcon, BoletoIcon, FolderIcon, UserIcon } from '../../src/components/Icons';

// Cores do tema Dark Premium ArrighiCRM
const COLORS = {
  background: '#0a0a0a',
  card: '#1a1a1a',
  gold: '#d4af37',
  goldLight: '#ffd75b',
  border: 'rgba(212, 175, 55, 0.15)',
  text: '#f5f5f5',
  textMuted: '#6b6b6b',
};

function TabBarIcon({
  icon: Icon,
  focused,
}: {
  icon: typeof HomeIcon;
  focused: boolean;
}) {
  return (
    <View style={styles.iconContainer}>
      {focused ? (
        <LinearGradient
          colors={['rgba(212, 175, 55, 0.25)', 'rgba(212, 175, 55, 0.1)']}
          style={styles.iconWrapperActive}
        >
          <Icon size={22} color={COLORS.gold} />
        </LinearGradient>
      ) : (
        <View style={styles.iconWrapper}>
          <Icon size={22} color={COLORS.textMuted} />
        </View>
      )}
    </View>
  );
}

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.gold,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarShowLabel: true,
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Início',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon icon={HomeIcon} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="boletos"
        options={{
          title: 'Boletos',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon icon={BoletoIcon} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="documents"
        options={{
          title: 'Documentos',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon icon={FolderIcon} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon icon={UserIcon} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 85 : 65,
    paddingBottom: Platform.OS === 'ios' ? 25 : 8,
    paddingTop: 8,
    backgroundColor: 'rgba(10, 10, 10, 0.98)',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    elevation: 0,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  tabBarItem: {
    paddingTop: 4,
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 0,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapperActive: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
});
