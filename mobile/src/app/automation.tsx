import React, { useState } from 'react';
import { StyleSheet, Text, View, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface AutomationTask {
  id: string;
  name: string;
  hardware: string;
  schedule: string;
  icon: string;
  isActive: boolean;
}

export default function AutomationScreen() {
  const [tasks, setTasks] = useState<AutomationTask[]>(([
    { id: 'A1', name: 'Hydro-Feed Loop', hardware: 'Relay pump_01', schedule: 'Every 04h:00m', icon: 'water-pump', isActive: true },
    { id: 'A2', name: 'Photosynthetic Array', hardware: 'LED Matrix line_A', schedule: '06:00 - 22:00 Daily', icon: 'led-strip', isActive: true },
    { id: 'A3', name: 'Chemical Injector Shift', hardware: 'Solenoid valve_N-P-K', schedule: 'At 08:00 & 20:00', icon: 'flask-round-bottom-outline', isActive: false },
    { id: 'A4', name: 'Ventilation Extraction', hardware: 'Exhaust fan_02', schedule: 'Continuous (Adaptive)', icon: 'fan', isActive: true },
  ]));

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, isActive: !t.isActive } : t));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.subHeader}>AUTOMATION PROTOCOLS</Text>
      <Text style={styles.mainTitle}>Core Sequencer</Text>

      {/* Overview Card */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>SEQUENCER STATUS // ONLINE</Text>
        <Text style={styles.summaryText}>
          System is managing <Text style={styles.highlightText}>{tasks.filter(t => t.isActive).length}/{tasks.length}</Text> automated microtask operations down the production grid pipeline.
        </Text>
      </View>

      {/* Task Controller List */}
      <View style={styles.taskListContainer}>
        {tasks.map((task) => (
          <View key={task.id} style={[styles.taskCard, !task.isActive && styles.disabledCard]}>
            <View style={styles.cardHeader}>
              <View style={styles.hardwareGroup}>
                <MaterialCommunityIcons 
                  name={task.icon as any} 
                  size={20} 
                  color={task.isActive ? '#00E639' : '#455545'} 
                  style={styles.iconMargin}
                />
                <Text style={[styles.taskName, !task.isActive && styles.textDisabled]}>{task.name}</Text>
              </View>
              <Switch
                value={task.isActive}
                onValueChange={() => toggleTask(task.id)}
                trackColor={{ false: '#1A221A', true: '#0c3a14' }}
                thumbColor={task.isActive ? '#00E639' : '#455545'}
                ios_backgroundColor="#1A221A"
              />
            </View>

            <View style={styles.metaDivider} />

            <View style={styles.footerRow}>
              <View>
                <Text style={styles.metaLabel}>HARDWARE RELAY</Text>
                <Text style={styles.metaValue}>{task.hardware}</Text>
              </View>
              <View style={styles.alignEnd}>
                <Text style={styles.metaLabel}>CYCLE INTERVAL</Text>
                <Text style={[styles.metaValue, task.isActive && styles.scheduleHighlight]}>
                  {task.schedule}
                </Text>
              </View>
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
  subHeader: { color: '#455545', fontSize: 11, fontWeight: '600', letterSpacing: 1 },
  mainTitle: { color: '#E0E7E0', fontSize: 26, fontWeight: 'bold', marginTop: 4, marginBottom: 20 },
  summaryCard: { backgroundColor: '#141A14', borderLeftWidth: 3, borderLeftColor: '#00E639', padding: 16, borderRadius: 4, marginBottom: 24 },
  summaryTitle: { color: '#00E639', fontSize: 12, fontWeight: '700', letterSpacing: 0.5, marginBottom: 6 },
  summaryText: { color: '#8F9F8F', fontSize: 13, lineHeight: 18 },
  highlightText: { color: '#E0E7E0', fontWeight: 'bold' },
  taskListContainer: { gap: 16 },
  taskCard: { backgroundColor: '#151915', borderRadius: 8, borderWidth: 1, borderColor: '#222c22', padding: 16 },
  disabledCard: { borderColor: '#1A221A', backgroundColor: '#121512' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hardwareGroup: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconMargin: { marginRight: 12 },
  taskName: { color: '#E0E7E0', fontSize: 16, fontWeight: '600' },
  textDisabled: { color: '#455545' },
  metaDivider: { height: 1, backgroundColor: '#1A221A', marginVertical: 12 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metaLabel: { color: '#455545', fontSize: 9, fontWeight: '600', letterSpacing: 0.5, marginBottom: 2 },
  metaValue: { color: '#607060', fontSize: 12, fontFamily: 'monospace' },
  alignEnd: { alignItems: 'flex-end' },
  scheduleHighlight: { color: '#00E639' },
});

