import { Tabs } from 'expo-router'

// Dolna nawigacja: 🏠 Polisy | 🧮 Kalkulator | 📋 Wniosek | 💬 Czat | 👤 Profil
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1e3a8a',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#e5e7eb' },
        headerStyle: { backgroundColor: '#1e3a8a' },
        headerTintColor: '#fff',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Polisy', tabBarLabel: '🏠 Polisy', headerTitle: 'Moje polisy' }}
      />
      <Tabs.Screen
        name="kalkulator"
        options={{ title: 'Kalkulator', tabBarLabel: '🧮 Kalkulator' }}
      />
      <Tabs.Screen
        name="wniosek"
        options={{ title: 'Wniosek', tabBarLabel: '📋 Wniosek' }}
      />
      <Tabs.Screen
        name="czat"
        options={{ title: 'Czat', tabBarLabel: '💬 Czat' }}
      />
      <Tabs.Screen
        name="profil"
        options={{ title: 'Profil', tabBarLabel: '👤 Profil' }}
      />
    </Tabs>
  )
}
