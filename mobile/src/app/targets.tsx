import { MaterialCommunityIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider'; // Run: npx expo install @react-native-community/slider
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ControlParam {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
}

export default function TargetsScreen() {
  const [isPaused, setIsPaused] = useState(false);
  
  // Initial parameters mirroring your dashboard design
  const [params, setParams] = useState<ControlParam[]>([
    { id: '1', label: 'Core Temperature', value: 21, min: 15, max: 35, unit: '°C' },
    { id: '2', label: 'Target Threshold', value: 21, min: 15, max: 35, unit: '°C' },
    { id: '3', label: 'Ambient Matrix', value: 21, min: 15, max: 35, unit: '°C' },
    { id: '4', label: 'Thermal Index', value: 21, min: 15, max: 35, unit: '°C' },
  ]);

  const handleSliderChange = (id: string, newValue: number) => {
    setParams(prev => prev.map(p => p.id === id ? { ...p, value: Math.round(newValue) } : p));
  };

  const handleReset = () => {
    setParams(prev => prev.map(p => ({ ...p, value: 21 })));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.interactiveLabel}>INTERACTIVE</Text>
      <Text style={styles.mainTitle}>Farm Simulation</Text>

      {/* Action Buttons Header */}
      <View style={styles.actionRow}>
        <TouchableOpacity 
          style={[styles.btn, isPaused && styles.btnActive]} 
          onPress={() => setIsPaused(!isPaused)}
        >
          <Text style={[styles.btnText, isPaused && styles.btnTextActive]}>
            {isPaused ? '▶ RESUME' : 'Ⅱ PAUSE'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
          <MaterialCommunityIcons name="refresh" size={14} color="#00E639" style={{ marginRight: 4 }} />
          <Text style={styles.resetBtnText}>RESET</Text>
        </TouchableOpacity>
      </View>

      {/* Environmental Controls Panel */}
      <View style={styles.controlsPanel}>
        <Text style={styles.panelHeader}>ENVIRONMENTAL CONTROLS</Text>

        {params.map((item) => (
          <View key={item.id} style={styles.sliderGroup}>
            <View style={styles.sliderHeader}>
              <Text style={styles.paramLabel}>{item.label}</Text>
              <Text style={styles.paramValue}>{item.value}{item.unit}</Text>
            </View>

            <View style={styles.sliderRow}>
              <Text style={styles.limitText}>{item.min}{item.unit}</Text>
              <Slider
                style={styles.sliderComponent}
                minimumValue={item.min}
                maximumValue={item.max}
                value={item.value}
                onValueChange={(val) => handleSliderChange(item.id, val)}
                minimumTrackTintColor="#00E639"
                maximumTrackTintColor="#1A221A"
                thumbTintColor="#00E639"
              />
              <Text style={styles.limitText}>{item.max}{item.unit}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111411', paddingHorizontal: 16 },
  contentContainer: { paddingTop: 24, paddingBottom: 40 },
  interactiveLabel: { color: '#455545', fontSize: 11, fontWeight: '600', letterSpacing: 1 },
  mainTitle: { color: '#E0E7E0', fontSize: 26, fontWeight: 'bold', marginTop: 4, marginBottom: 20 },
  actionRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  btn: { borderWidth: 1, borderColor: '#D97706', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 4 },
  btnActive: { backgroundColor: '#D97706' },
  btnText: { color: '#D97706', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  btnTextActive: { color: '#111411' },
  resetBtn: { borderWidth: 1, borderColor: '#00E639', borderStyle: 'dashed', flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 4 },
  resetBtnText: { color: '#00E639', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  controlsPanel: { backgroundColor: '#131913', borderWidth: 1, borderColor: '#1F291F', borderRadius: 8, padding: 16 },
  panelHeader: { color: '#455545', fontSize: 12, fontWeight: '700', letterSpacing: 0.5, marginBottom: 20 },
  sliderGroup: { marginBottom: 22 },
  sliderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  paramLabel: { color: '#8F9F8F', fontSize: 15, fontFamily: 'monospace' },
  paramValue: { color: '#00E639', fontSize: 18, fontWeight: '700', fontFamily: 'monospace' },
  sliderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sliderComponent: { flex: 1, marginHorizontal: 8, height: 40 },
  limitText: { color: '#455545', fontSize: 12, width: 35, textAlign: 'center' },
});
