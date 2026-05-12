import { Text, View, StyleSheet } from 'react-native'

export default function PoliciesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>MojaPolisa</Text>
      <Text style={styles.subtitle}>Ubezpieczenia Online · Finvita</Text>
      <Text style={styles.placeholder}>
        Placeholder ekranu polis. Pełna implementacja: krok 14 w roadmapie (portowanie po web MVP).
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
  },
  placeholder: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
  },
})
