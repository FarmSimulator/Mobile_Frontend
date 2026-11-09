import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface AlertItem {
  id: string;
  code: string;
  severity: 'CRITICAL' | 'WARNING' | 'RESOLVED';
  component: string;
  message: string;
  timestamp: string;
}

export default function AlertsScreen() {
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE'>('ALL');

  const [alerts, setAlerts] = useState<AlertItem[]>([
    { id: '1', code: 'ERR_PH_LOW', severity: 'CRITICAL', component: 'Reservoir Tank Alpha', message: 'pH level dropped to 4.8. High acidic threat detected to root matrix.', timestamp: '14:32:10' },
    { id: '2', code: 'WARN_TEMP_HIGH', severity: 'WARNING', component: 'Plot B Enclosure', message: 'Ambient temperature reached 31°C. Approaching crop stress threshold.', timestamp: '13:05:44' },
    { id: '3', code: 'WARN_N_DEPLETED', severity: 'WARNING', component: 'Nutrient Feed Block', message: 'Nitrogen (N) solution levels fell below 15% backup capacity.', timestamp: '10:14:02' },
    { id: '4', code: 'SYS_RECAL_OK', severity: 'RESOLVED', component: 'CO2 Solenoid Valve', message: 'Pressure variance fixed. Flow rates calibrated back to nominal parameters.', timestamp: '08:12:55' },
  ]);

  const getSeverityStyle = (severity: AlertItem['severity']) => {
    switch (severity) {
      case 'CRITICAL': return { color: '#FF3B30', borderColor: '#FF3B30', bg: '#2b1212' };
      case 'WARNING': return { color: '#FFB300', borderColor: '#FFB300', bg: '#2b2312' };
      case 'RESOLVED': return { color: '#00E639', borderColor: '#222c22', bg: '#121612' };
    }
  };

  const clearAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, severity: 'RESOLVED' as const } : a));
  };

  const filteredAlerts = activeTab === 'ACTIVE' 
    ? alerts.filter(a => a.severity !== 'RESOLVED') 
    : alerts;

  const renderAlertCard = ({ item }: { item: AlertItem }) => {
    const themeStyles = getSeverityStyle(item.severity);
    const isResolved = item.severity === 'RESOLVED';

    return (
      <View style={[styles.card, { borderColor: themeStyles.borderColor, backgroundColor: themeStyles.bg }]}>
        <View style={styles.cardHeader}>
          <View style={styles.codeGroup}>
            <MaterialCommunityIcons 
              name={isResolved ? "check-circle-outline" : "alert-rhombus-outline"} 
              size={16} 
              color={themeStyles.color} 
            />
            <Text style={[styles.codeText, { color: themeStyles.color }]}>{item.code}</Text>
          </View>
          <Text style={styles.timeText}>{item.timestamp}</Text>
        </View>

        <Text style={styles.componentText}>COMPONENT // {item.component.toUpperCase()}</Text>
        <Text style={[styles.messageText, isResolved && styles.textMuted]}>{item.message}</Text>

        {!isResolved && (
          <TouchableOpacity 
            style={[styles.actionBtn, { borderColor: themeStyles.color }]} 
            onPress={() => clearAlert(item.id)}
          >
            <Text style={[styles.actionBtnText, { color: themeStyles.color }]}>ACKNOWLEDGE FAULT</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.subHeader}>DIAGNOSTIC PROTOCOLS</Text>
      <Text style={styles.mainTitle}>System Alerts</Text>

      {/* Filter Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'ALL' && styles.tabBtnActive]} 
          onPress={() => setActiveTab('ALL')}
        >
          <Text style={[styles.tabText, activeTab === 'ALL' && styles.tabTextActive]}>LOG HISTORY</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabBtn, activeTab === 'ACTIVE' && styles.tabBtnActive]} 
          onPress={() => setActiveTab('ACTIVE')}
        >
          <Text style={[styles.tabText, activeTab === 'ACTIVE' && styles.tabTextActive]}>
            ACTIVE THREATS ({alerts.filter(a => a.severity !== 'RESOLVED').length})
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredAlerts}
        renderItem={renderAlertCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>// NO CRITICAL SYSTEM FAULTS DETECTED</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111411', paddingHorizontal: 16, paddingTop: 24 },
  subHeader: { color: '#455545', fontSize: 11, fontWeight: '600', letterSpacing: 1 },
  mainTitle: { color: '#E0E7E0', fontSize: 26, fontWeight: 'bold', marginTop: 4, marginBottom: 20 },
  tabRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  tabBtn: { flex: 1, borderWidth: 1, borderColor: '#222c22', paddingVertical: 8, alignItems: 'center', borderRadius: 4, backgroundColor: '#141814' },
  tabBtnActive: { borderColor: '#00E639', backgroundColor: '#1a271a' },
  tabText: { color: '#455545', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  tabTextActive: { color: '#00E639' },
  listContainer: { gap: 16, paddingBottom: 24 },
  card: { borderRadius: 8, borderWidth: 1, padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  codeGroup: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  codeText: { fontSize: 12, fontWeight: '700', fontFamily: 'monospace' },
  timeText: { color: '#455545', fontSize: 11, fontFamily: 'monospace' },
  componentText: { color: '#8F9F8F', fontSize: 11, fontWeight: '600', letterSpacing: 0.5, marginBottom: 6 },
  messageText: { color: '#E0E7E0', fontSize: 13, lineHeight: 18, marginBottom: 12 },
  textMuted: { color: '#455545' },
  actionBtn: { borderWidth: 1, borderStyle: 'dashed', paddingVertical: 6, alignItems: 'center', borderRadius: 4, marginTop: 4 },
  actionBtnText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  emptyContainer: { padding: 32, alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#1F291F', borderRadius: 8, marginTop: 12 },
  emptyText: { color: '#455545', fontSize: 12, fontFamily: 'monospace' }
});
