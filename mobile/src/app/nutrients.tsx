import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface NutrientItem {
  id: string;
  name: string;
  chemicalSymbol: string;
  currentLevel: number;
  maxCapacity: number;
  status: 'OPTIMAL' | 'LOW' | 'CRITICAL';
  unit: string;
}

const NUTRIENT_DATA: NutrientItem[] = [
  { id: 'N', name: 'Nitrogen', chemicalSymbol: 'N', currentLevel: 78, maxCapacity: 100, status: 'OPTIMAL', unit: 'ppm' },
  { id: 'P', name: 'Phosphorus', chemicalSymbol: 'P', currentLevel: 32, maxCapacity: 100, status: 'LOW', unit: 'ppm' },
  { id: 'K', name: 'Potassium', chemicalSymbol: 'K', currentLevel: 85, maxCapacity: 100, status: 'OPTIMAL', unit: 'ppm' },
  { id: 'PH', name: 'Potential Hydrogen', chemicalSymbol: 'pH', currentLevel: 5.8, maxCapacity: 14, status: 'OPTIMAL', unit: '' },
  { id: 'EC', name: 'Electrical Conductivity', chemicalSymbol: 'EC', currentLevel: 1.2, maxCapacity: 3.0, status: 'CRITICAL', unit: 'mS/cm' },
];

export default function NutrientsScreen() {
  const router = useRouter();
  const [selectedNutrient, setSelectedNutrient] = useState<string>('N');

  const getStatusColor = (status: NutrientItem['status']) => {
    switch (status) {
      case 'OPTIMAL': return '#00E639'; // Neon Green
      case 'LOW': return '#FFB300'; // Amber Warning
      case 'CRITICAL': return '#FF3B30'; // Red Alert
      default: return '#455545';
    }
  };

  const getBadgeBgColor = (status: NutrientItem['status'], isSelected: boolean) => {
    if (!isSelected) return '#1a221a';
    switch (status) {
      case 'OPTIMAL': return '#0c3a14';
      case 'LOW': return '#3a2a0c';
      case 'CRITICAL': return '#3a0c0c';
    }
  };

  const renderNutrientCard = ({ item }: { item: NutrientItem }) => {
    const isSelected = item.id === selectedNutrient;
    const fillingPercent = (item.currentLevel / item.maxCapacity) * 100;
    const accentColor = getStatusColor(item.status);

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setSelectedNutrient(item.id)}
        style={[styles.card, isSelected && { borderColor: accentColor }]}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.elementLabel}>CHEM ELEMENT // {item.id}</Text>
          <View style={[styles.badge, { backgroundColor: getBadgeBgColor(item.status, isSelected) }]}>
            <Text style={[styles.badgeText, isSelected && { color: accentColor }]}>
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.nutrientName}>{item.name}</Text>
          <Text style={[styles.symbolText, { color: accentColor }]}>[{item.chemicalSymbol}]</Text>
        </View>

        {/* Level Indicator Bar */}
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${Math.min(fillingPercent, 100)}%`, backgroundColor: accentColor }]} />
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.footerTextMuted}>
            System Level: {item.currentLevel} {item.unit}
          </Text>
          <Text style={[styles.capacityText, { color: accentColor }]}>
            Max {item.maxCapacity} {item.unit}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionHeader}>NUTRIENT DIAGNOSTICS</Text>
        <MaterialCommunityIcons name="flask-outline" size={16} color="#455545" />
      </View>

      <FlatList
        data={NUTRIENT_DATA}
        renderItem={renderNutrientCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111411', paddingHorizontal: 16, paddingTop: 16 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionHeader: { color: '#455545', fontSize: 14, fontWeight: 'bold', letterSpacing: 1 },
  listContainer: { gap: 16, paddingBottom: 24 },
  card: { backgroundColor: '#151915', borderRadius: 8, borderWidth: 1, borderColor: '#222c22', padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  elementLabel: { color: '#455545', fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 },
  badgeText: { color: '#455545', fontSize: 10, fontWeight: 'bold' },
  infoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  nutrientName: { color: '#E0E7E0', fontSize: 18, fontWeight: '500' },
  symbolText: { fontSize: 16, fontWeight: '700', fontFamily: 'monospace' },
  progressBarBg: { height: 3, backgroundColor: '#1e261e', borderRadius: 2, marginBottom: 10, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 2 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerTextMuted: { color: '#455545', fontSize: 12 },
  capacityText: { fontSize: 12, fontWeight: '600' },
});
