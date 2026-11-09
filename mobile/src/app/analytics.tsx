import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface MetricRow {
  id: string;
  metric: string;
  variance: string;
  efficiency: number;
}

interface LogEvent {
  id: string;
  timestamp: string;
  event: string;
  status: 'NOMINAL' | 'WARNING';
}

export default function AnalyticsScreen() {
  const [timeframe, setTimeframe] = useState<'24H' | '7D' | '30D'>('24H');

  const analyticMetrics: MetricRow[] = [
    { id: '1', metric: 'Yield Velocity', variance: '+4.2%', efficiency: 88 },
    { id: '2', metric: 'Nutrient Absorption Rate', variance: '-0.8%', efficiency: 94 },
    { id: '3', metric: 'Thermal System Stability', variance: '+1.1%', efficiency: 79 },
    { id: '4', metric: 'Photosynthetic Efficiency', variance: '+0.0%', efficiency: 82 },
  ];

  const operationalLogs: LogEvent[] = [
    { id: 'L1', timestamp: '14:22:05', event: 'Reservoir pH auto-stabilization cycle executed', status: 'NOMINAL' },
    { id: 'L2', timestamp: '13:05:44', event: 'Plot B core temperature threshold variance detected', status: 'WARNING' },
    { id: 'L3', timestamp: '11:14:12', event: 'Nitrogen injection valve calibration verified', status: 'NOMINAL' },
    { id: 'L4', timestamp: '09:00:00', event: 'System diagnostic sequence completed successfully', status: 'NOMINAL' },
  ];

  const renderLogItem = ({ item }: { item: LogEvent }) => (
    <View style={styles.logRow}>
      <Text style={styles.logTime}>{item.timestamp}</Text>
      <Text style={styles.logText} numberOfLines={1}>{item.event}</Text>
      <Text style={[styles.logStatus, item.status === 'WARNING' && styles.statusWarning]}>
        [{item.status}]
      </Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.telemetryLabel}>TELEMETRY ENGINE</Text>
      <Text style={styles.mainTitle}>System Analytics</Text>

      {/* Timeframe Selectors */}
      <View style={styles.tabRow}>
        {(['24H', '7D', '30D'] as const).map((t) => (
          <TouchableOpacity 
            key={t} 
            style={[styles.tabBtn, timeframe === t && styles.tabBtnActive]} 
            onPress={() => setTimeframe(t)}
          >
            <Text style={[styles.tabText, timeframe === t && styles.tabTextActive]}>{t} MATRIX</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Main Graph Placeholder / Telemetry Monitor */}
      <View style={styles.chartPanel}>
        <View style={styles.chartHeader}>
          <Text style={styles.panelTitle}>HISTORICAL YIELD CURVE</Text>
          <MaterialCommunityIcons name="chart-bell-curve-cumulative" size={14} color="#00E639" />
        </View>
        <View style={styles.mockChartArea}>
          <Text style={styles.chartMutedText}>// REAL-TIME GRAPH DATA STREAMS MONITORING...</Text>
          <View style={styles.barGraphRow}>
            <View style={[styles.mockBar, { height: 40 }]} />
            <View style={[styles.mockBar, { height: 75 }]} />
            <View style={[styles.mockBar, { height: 60 }]} />
            <View style={[styles.mockBar, { height: 95 }]} />
            <View style={[styles.mockBar, { height: 50 }]} />
            <View style={[styles.mockBar, { height: 80 }]} />
          </View>
        </View>
      </View>

      {/* Efficiency Metrics Group */}
      <View style={styles.metricsPanel}>
        <Text style={styles.panelTitle}>EFFICIENCY RATING INDEX</Text>
        
        {analyticMetrics.map((item) => (
          <View key={item.id} style={styles.metricGroup}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricLabel}>{item.metric}</Text>
              <Text style={styles.metricValue}>{item.efficiency}% <Text style={styles.varianceText}>({item.variance})</Text></Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${item.efficiency}%` }]} />
            </View>
          </View>
        ))}
      </View>

      {/* Diagnostic Logs */}
      <View style={styles.logsPanel}>
        <Text style={styles.panelTitle}>SYSTEM LOG DIAGNOSTICS</Text>
        <FlatList
          data={operationalLogs}
          renderItem={renderLogItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.logsList}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111411', paddingHorizontal: 16 },
  contentContainer: { paddingTop: 24, paddingBottom: 40 },
  telemetryLabel: { color: '#455545', fontSize: 11, fontWeight: '600', letterSpacing: 1 },
  mainTitle: { color: '#E0E7E0', fontSize: 26, fontWeight: 'bold', marginTop: 4, marginBottom: 20 },
  tabRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  tabBtn: { flex: 1, borderWidth: 1, borderColor: '#222c22', paddingVertical: 8, alignItems: 'center', borderRadius: 4, backgroundColor: '#141814' },
  tabBtnActive: { borderColor: '#00E639', backgroundColor: '#1a271a' },
  tabText: { color: '#455545', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  tabTextActive: { color: '#00E639' },
  chartPanel: { backgroundColor: '#151915', borderWidth: 1, borderColor: '#222c22', borderRadius: 8, padding: 16, marginBottom: 20 },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  panelTitle: { color: '#455545', fontSize: 12, fontWeight: '700', letterSpacing: 0.5, marginBottom: 12 },
  mockChartArea: { height: 130, justifyContent: 'space-between', alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#1F291F', borderRadius: 4, padding: 12 },
  chartMutedText: { color: '#333e33', fontSize: 10, fontFamily: 'monospace' },
  barGraphRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 14, height: 80, width: '100%', justifyContent: 'center' },
  mockBar: { width: 18, backgroundColor: '#1F291F', borderTopLeftRadius: 2, borderTopRightRadius: 2, borderColor: '#00E639', borderTopWidth: 1, borderLeftWidth: 1, borderRightWidth: 1 },
  metricsPanel: { backgroundColor: '#151915', borderWidth: 1, borderColor: '#222c22', borderRadius: 8, padding: 16, marginBottom: 20 },
  metricGroup: { marginBottom: 16 },
  metricHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  metricLabel: { color: '#8F9F8F', fontSize: 14, fontFamily: 'monospace' },
  metricValue: { color: '#00E639', fontSize: 14, fontWeight: '700', fontFamily: 'monospace' },
  varianceText: { color: '#607060', fontSize: 11, fontWeight: 'normal' },
  progressTrack: { height: 2, backgroundColor: '#1e261e', overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#00E639' },
  logsPanel: { backgroundColor: '#151915', borderWidth: 1, borderColor: '#222c22', borderRadius: 8, padding: 16 },
  logsList: { gap: 10, marginTop: 8 },
  logRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  logTime: { color: '#455545', fontSize: 11, fontFamily: 'monospace' },
  logText: { flex: 1, color: '#607060', fontSize: 11, fontFamily: 'monospace' },
  logStatus: { color: '#00E639', fontSize: 11, fontWeight: '700', fontFamily: 'monospace' },
  statusWarning: { color: '#FFB300' },
});
