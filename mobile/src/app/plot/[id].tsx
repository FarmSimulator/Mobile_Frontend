import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const PLOT_DETAILS: Record<string, any> = {
  A: {
    name: 'Basil (Genovese)',
    zone: 'ZONE A - ACTIVE',
    stage: 'VEGETATIVE',
    currentDay: 11,
    totalDays: 28,
    ph: { value: '5.05', status: 'OK', range: '5.5-6.5' },
    conductivity: { value: '1.37', unit: 'mS/cm', status: 'WARN', range: '1.8-2.5' },
    temperature: { value: '21.8', unit: '°C', status: 'OK', range: '20-26' },
    waterLevel: { value: '32', unit: '%', status: 'WARN', range: '60-90' },
    humidity: { value: '63', unit: '%RH', status: 'OK', range: '55-75' },
    lightIntensity: { value: '28.3', unit: 'klux', status: 'OK', range: '20-55k' },
    systemHealth: { nutrientSolution: 48, reservoirA: 32, filterB: 48, uvSterilizer: 91 },
  },
  B: {
    name: 'Cabbage (vege)',
    zone: 'ZONE B - ACTIVE',
    stage: 'VEGETATIVE',
    currentDay: 11,
    totalDays: 21,
    ph: { value: '5.93', status: 'OK', range: '5.5-6.5' },
    conductivity: { value: '1.90', unit: 'mS/cm', status: 'OK', range: '1.8-2.5' },
    temperature: { value: '21.8', unit: '°C', status: 'OK', range: '20-26' },
    waterLevel: { value: '49', unit: '%', status: 'WARN', range: '60-90' },
    humidity: { value: '67', unit: '%RH', status: 'OK', range: '55-75' },
    lightIntensity: { value: '27.9', unit: 'klux', status: 'OK', range: '20-55k' },
    systemHealth: { nutrientSolution: 67, reservoirA: 49, filterB: 48, uvSterilizer: 91 },
  },
  C: {
    name: 'Cabbage (Kimchi)',
    zone: 'ZONE C - ACTIVE',
    stage: 'VEGETATIVE',
    currentDay: 11,
    totalDays: 21,
    ph: { value: '6.10', status: 'OK', range: '5.5-6.5' },
    conductivity: { value: '2.10', unit: 'mS/cm', status: 'OK', range: '1.8-2.5' },
    temperature: { value: '22.1', unit: '°C', status: 'OK', range: '20-26' },
    waterLevel: { value: '75', unit: '%', status: 'OK', range: '60-90' },
    humidity: { value: '70', unit: '%RH', status: 'OK', range: '55-75' },
    lightIntensity: { value: '30.0', unit: 'klux', status: 'OK', range: '20-55k' },
    systemHealth: { nutrientSolution: 80, reservoirA: 60, filterB: 90, uvSterilizer: 95 },
  },
  D: {
    name: 'Cabbage (Kimchi)',
    zone: 'ZONE D - ACTIVE',
    stage: 'VEGETATIVE',
    currentDay: 11,
    totalDays: 21,
    ph: { value: '5.80', status: 'OK', range: '5.5-6.5' },
    conductivity: { value: '1.65', unit: 'mS/cm', status: 'OK', range: '1.8-2.5' },
    temperature: { value: '21.5', unit: '°C', status: 'OK', range: '20-26' },
    waterLevel: { value: '85', unit: '%', status: 'OK', range: '60-90' },
    humidity: { value: '65', unit: '%RH', status: 'OK', range: '55-75' },
    lightIntensity: { value: '29.1', unit: 'klux', status: 'OK', range: '20-55k' },
    systemHealth: { nutrientSolution: 90, reservoirA: 85, filterB: 80, uvSterilizer: 98 },
  },
};

export default function PlotDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const plotId = typeof id === 'string' ? id.toUpperCase() : 'A';
  const plot = PLOT_DETAILS[plotId] || PLOT_DETAILS['A'];

  const [circulationPump, setCirculationPump] = useState(false);
  const [growLights, setGrowLights] = useState(false);
  const [ventilationFan, setVentilationFan] = useState(false);
  const [autoDosing, setAutoDosing] = useState(true);
  const [flowRate, setFlowRate] = useState(2.4);

  const stages = ['GERM', 'SEED', 'VEGE', 'FLOW', 'HARV'];

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Navigation Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#00E639" />
          <Text style={styles.backText}>PLOTS</Text>
        </TouchableOpacity>
        <Text style={styles.zoneHeaderText}>{plot.zone}</Text>
        <View style={styles.stageBadge}>
          <Text style={styles.stageBadgeText}>{plot.stage}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Plant Header Info matching plots.tsx card aesthetic */}
        <View style={styles.plantHeaderSection}>
          <Text style={styles.plantTitle}>{plot.name}</Text>
          <View style={styles.progressMeta}>
            <Text style={styles.metaLabel}>Stage progress</Text>
            <Text style={styles.metaValue}>Day {plot.currentDay} of {plot.totalDays}</Text>
          </View>

          <View style={styles.stepperContainer}>
            {stages.map((stg) => {
              const isCurrent = stg === plot.stage;
              return (
                <View key={stg} style={styles.stepItem}>
                  <View style={[styles.stepDot, isCurrent && styles.activeStepDot]} />
                  <Text style={[styles.stepText, isCurrent && styles.activeStepText]}>{stg}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Dashboard Grid */}
        <View style={styles.dashboardLayout}>
          
          {/* Sensors Grid */}
          <View style={styles.sensorsGrid}>
            {[
              { title: 'PH LEVEL', val: plot.ph.value, unit: 'pH', range: plot.ph.range, status: plot.ph.status },
              { title: 'CONDUCTIVITY', val: plot.conductivity.value, unit: 'mS/cm', range: plot.conductivity.range, status: plot.conductivity.status, warn: plot.conductivity.status === 'WARN' },
              { title: 'TEMPERATURE', val: plot.temperature.value, unit: '°C', range: plot.temperature.range, status: plot.temperature.status },
              { title: 'WATER LEVEL', val: plot.waterLevel.value, unit: '%', range: plot.waterLevel.range, status: plot.waterLevel.status, warn: true },
              { title: 'HUMIDITY', val: plot.humidity.value, unit: '%RH', range: plot.humidity.range, status: plot.humidity.status },
              { title: 'LIGHT INTENSITY', val: plot.lightIntensity.value, unit: 'klux', range: plot.lightIntensity.range, status: plot.lightIntensity.status },
            ].map((sensor, idx) => (
              <View key={idx} style={styles.sensorCard}>
                <View style={styles.sensorCardHeader}>
                  <Text style={styles.sensorTitle}>{sensor.title}</Text>
                  <View style={[styles.miniCircleGauge, sensor.warn && styles.warnGauge]} />
                </View>
                <Text style={[styles.sensorValue, sensor.warn && styles.warnText]}>
                  {sensor.val} <Text style={styles.sensorUnit}>{sensor.unit}</Text>
                </Text>
                <View style={styles.sparklinePlaceholder} />
                <View style={styles.sensorFooter}>
                  <Text style={styles.optText}>OPT: {sensor.range}</Text>
                  <Text style={sensor.warn ? styles.statusWarn : styles.statusOk}>{sensor.status}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Right Controls & System Health Panel */}
          <View style={styles.rightSidebar}>
            
            {/* System Controls */}
            <View style={styles.panelBox}>
              <Text style={styles.panelTitle}>SYSTEM CONTROLS</Text>
              
              {[
                { label: 'Circulation Pump', val: circulationPump, set: setCirculationPump, status: circulationPump ? 'Active' : 'Inactive' },
                { label: 'Grow Lights', val: growLights, set: setGrowLights, status: growLights ? 'On' : 'Off' },
                { label: 'Ventilation Fan', val: ventilationFan, set: setVentilationFan, status: ventilationFan ? 'On' : 'Off' },
                { label: 'Auto Dosing', val: autoDosing, set: setAutoDosing, status: 'Active' },
              ].map((ctrl, i) => (
                <View key={i} style={styles.controlRow}>
                  <View>
                    <Text style={styles.controlLabel}>{ctrl.label}</Text>
                    <Text style={styles.controlSub}>{ctrl.status}</Text>
                  </View>
                  <Switch
                    trackColor={{ false: '#1e261e', true: '#0c3a14' }}
                    thumbColor={ctrl.val ? '#00E639' : '#455545'}
                    value={ctrl.val}
                    onValueChange={ctrl.set}
                  />
                </View>
              ))}
            </View>

            {/* Flow Rate */}
            <View style={styles.panelBox}>
              <View style={styles.flowRateHeader}>
                <Text style={styles.controlLabel}>Flow Rate</Text>
                <Text style={styles.flowRateValue}>{flowRate.toFixed(1)} L/min</Text>
              </View>
              <View style={styles.sliderBar}>
                <View style={[styles.sliderFill, { width: `${(flowRate / 5.0) * 100}%` }]} />
              </View>
              <View style={styles.sliderLimits}>
                <Text style={styles.limitText}>0.0</Text>
                <Text style={styles.limitText}>5.0</Text>
              </View>
            </View>

            {/* System Health */}
            <View style={styles.panelBox}>
              <Text style={styles.panelTitle}>SYSTEM HEALTH</Text>
              
              {[
                { name: 'Nutrient Solution', pct: plot.systemHealth.nutrientSolution },
                { name: 'Reservoir A', pct: plot.systemHealth.reservoirA },
                { name: 'Filter B', pct: plot.systemHealth.filterB, warn: true },
                { name: 'UV Sterilizer', pct: plot.systemHealth.uvSterilizer },
              ].map((hp, idx) => (
                <View key={idx}>
                  <View style={styles.healthMetricRow}>
                    <Text style={styles.healthName}>{hp.name}</Text>
                    <Text style={[styles.healthPct, hp.warn && styles.statusWarn]}>{hp.pct}%</Text>
                  </View>
                  <View style={styles.healthBarBg}>
                    <View style={[styles.healthBarFill, hp.warn && styles.warnFill, { width: `${hp.pct}%` }]} />
                  </View>
                </View>
              ))}
            </View>

            {/* Recent Events */}
            <View style={styles.panelBox}>
              <Text style={styles.panelTitle}>RECENT EVENTS</Text>
              <View style={styles.eventItem}>
                <View style={styles.eventDot} />
                <View>
                  <Text style={styles.eventTime}>6:21 PM</Text>
                  <Text style={styles.eventText}>Water level low — Water Pump activated</Text>
                </View>
              </View>
            </View>

          </View>

        </View>

        {/* Nutrient Dosing */}
        <View style={styles.dosingSection}>
          <Text style={styles.panelTitle}>NUTRIENT DOSING — TODAY</Text>
          <View style={styles.dosingCardsRow}>
            {[
              { name: 'Nitrogen...', val: '0.5', time: '@ 06:00' },
              { name: 'Phosphorus...', val: '3.2', time: '@ 06:00' },
              { name: 'Potassium...', val: '1.6', time: '@ 12:00' },
            ].map((dose, idx) => (
              <View key={idx} style={styles.dosingCard}>
                <Text style={styles.dosingName}>{dose.name}</Text>
                <Text style={styles.dosingVal}>{dose.val} <Text style={styles.dosingUnit}>mL/L</Text></Text>
                <Text style={styles.dosingTime}>{dose.time}</Text>
                <View style={styles.deliveredBadge}>
                  <Text style={styles.deliveredText}>DELIVERED</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111411' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#222c22' },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backText: { color: '#00E639', fontSize: 10, fontWeight: 'bold' },
  zoneHeaderText: { color: '#607060', fontSize: 11, fontWeight: '600', letterSpacing: 1 },
  stageBadge: { backgroundColor: '#0c3a14', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 4, borderWidth: 1, borderColor: '#00E639' },
  stageBadgeText: { color: '#00E639', fontSize: 10, fontWeight: 'bold' },
  
  scrollContent: { padding: 16, gap: 16 },
  
  plantHeaderSection: { backgroundColor: '#151915', borderRadius: 8, borderWidth: 1, borderColor: '#222c22', padding: 18 },
  plantTitle: { color: '#E0E7E0', fontSize: 18, fontWeight: '500', marginBottom: 8 },
  progressMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  metaLabel: { color: '#607060', fontSize: 12 },
  metaValue: { color: '#E0E7E0', fontSize: 12, fontWeight: '600' },
  
  stepperContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, paddingHorizontal: 4 },
  stepItem: { alignItems: 'center', gap: 6 },
  stepDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#1e261e', borderWidth: 1, borderColor: '#607060' },
  activeStepDot: { backgroundColor: '#00E639', borderColor: '#00E639' },
  stepText: { color: '#607060', fontSize: 10 },
  activeStepText: { color: '#00E639', fontWeight: 'bold' },

  dashboardLayout: { flexDirection: Platform.OS === 'web' ? 'row' : 'column', gap: 16 },
  
  sensorsGrid: { flex: 2, flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  sensorCard: { width: Platform.OS === 'web' ? '31%' : '48%', backgroundColor: '#151915', borderRadius: 8, borderWidth: 1, borderColor: '#222c22', padding: 16, minHeight: 170, justifyContent: 'space-between', flexGrow: 1 },
  sensorCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  sensorTitle: { color: '#607060', fontSize: 11, fontWeight: 'bold', letterSpacing: 0.5 },
  miniCircleGauge: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#00E639', borderRightColor: 'transparent' },
  warnGauge: { borderColor: '#FFB700', borderTopColor: 'transparent' },
  sensorValue: { color: '#00E639', fontSize: 18, fontWeight: '500', marginVertical: 6 },
  sensorUnit: { fontSize: 12, fontWeight: 'normal', color: '#809080' },
  warnText: { color: '#FFB700' },
  sparklinePlaceholder: { height: 28, borderBottomWidth: 1, borderBottomColor: '#00E639', opacity: 0.5, marginVertical: 6 },
  sensorFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  optText: { color: '#607060', fontSize: 10 },
  statusOk: { color: '#00E639', fontSize: 10, fontWeight: 'bold' },
  statusWarn: { color: '#FFB700', fontSize: 10, fontWeight: 'bold' },

  rightSidebar: { flex: 1, gap: 12, minWidth: 260 },
  panelBox: { backgroundColor: '#151915', borderRadius: 8, borderWidth: 1, borderColor: '#222c22', padding: 16, gap: 12 },
  panelTitle: { color: '#607060', fontSize: 12, fontWeight: 'bold', letterSpacing: 1, marginBottom: 2 },
  
  controlRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 2 },
  controlLabel: { color: '#E0E7E0', fontSize: 13, fontWeight: '500' },
  controlSub: { color: '#607060', fontSize: 11, marginTop: 2 },
  
  flowRateHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  flowRateValue: { color: '#00E639', fontSize: 13, fontWeight: 'bold' },
  sliderBar: { height: 6, backgroundColor: '#1e261e', borderRadius: 3, marginVertical: 10, position: 'relative' },
  sliderFill: { height: '100%', backgroundColor: '#00E639', borderRadius: 3 },
  sliderLimits: { flexDirection: 'row', justifyContent: 'space-between' },
  limitText: { color: '#607060', fontSize: 11 },

  healthMetricRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  healthName: { color: '#E0E7E0', fontSize: 12 },
  healthPct: { color: '#00E639', fontSize: 12, fontWeight: 'bold' },
  healthBarBg: { height: 4, backgroundColor: '#1e261e', borderRadius: 2, marginTop: 6, overflow: 'hidden' },
  healthBarFill: { height: '100%', backgroundColor: '#00E639', borderRadius: 2 },
  warnFill: { backgroundColor: '#FFB700' },

  eventItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 4 },
  eventDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#00E639', marginTop: 5 },
  eventTime: { color: '#607060', fontSize: 10 },
  eventText: { color: '#E0E7E0', fontSize: 12 },

  dosingSection: { backgroundColor: '#151915', borderRadius: 8, borderWidth: 1, borderColor: '#222c22', padding: 16 },
  dosingCardsRow: { flexDirection: 'row', gap: 12, marginTop: 10, flexWrap: 'wrap' },
  dosingCard: { flex: 1, minWidth: 110, backgroundColor: '#111411', borderWidth: 1, borderColor: '#222c22', borderRadius: 6, padding: 14, gap: 6 },
  dosingName: { color: '#607060', fontSize: 11 },
  dosingVal: { color: '#E0E7E0', fontSize: 18, fontWeight: 'bold' },
  dosingUnit: { fontSize: 11, color: '#809080', fontWeight: 'normal' },
  dosingTime: { color: '#607060', fontSize: 10, marginBottom: 4 },
  deliveredBadge: { backgroundColor: '#0c3a14', paddingVertical: 4, borderRadius: 3, alignItems: 'center', borderWidth: 1, borderColor: '#00E639' },
  deliveredText: { color: '#00E639', fontSize: 10, fontWeight: 'bold' },
});