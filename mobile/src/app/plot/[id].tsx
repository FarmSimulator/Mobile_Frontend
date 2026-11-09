import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ActuatorState,
  getActuators,
  getCurrentSensorReading,
  SensorReading,
  updateActuator,
} from '../../lib/farm-sim-api';

const MONO_FONT = Platform.OS === 'ios' ? 'Courier' : 'monospace';
const STORAGE_KEY = 'farmsim_user_crops_v1';

interface PlotData {
  name: string;
  zone: string;
  stage: string;
  currentDay: number;
  totalDays: number;
  systemHealth: {
    nutrientSolution: number;
    reservoirA: number;
    filterB: number;
    uvSterilizer: number;
  };
}

interface SavedCrop {
  id: string;
  zoneId?: string;
  name: string;
  stage?: string;
  progress?: number;
  totalDays?: number;
}

function sensorStatus(value: number | undefined, minimum: number, maximum: number) {
  if (value === undefined) return 'WAIT';
  return value < minimum || value > maximum ? 'WARN' : 'OK';
}

export default function PlotDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const plotId = typeof id === 'string' ? id : 'A';
  const [plotData, setPlotData] = useState<PlotData>({
    name: 'Loading crop...',
    zone: '',
    stage: 'VEGE',
    currentDay: 1,
    totalDays: 20,
    systemHealth: { nutrientSolution: 85, reservoirA: 80, filterB: 90, uvSterilizer: 95 },
  });
  const [storageError, setStorageError] = useState<string | null>(null);
  const [hasCrop, setHasCrop] = useState(false);
  const [isDeletingCrop, setIsDeletingCrop] = useState(false);

  const [sensorReading, setSensorReading] = useState<SensorReading | null>(null);
  const [actuators, setActuators] = useState<Record<string, ActuatorState>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [updatingActuator, setUpdatingActuator] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadCrop = async () => {
      try {
        const savedCrops = await AsyncStorage.getItem(STORAGE_KEY);
        const crops: SavedCrop[] = savedCrops ? JSON.parse(savedCrops) : [];
        const found = crops.find((crop) => crop.id === plotId);

        if (!isActive) return;
        if (found) {
          setHasCrop(true);
          setPlotData({
            name: found.name,
            zone: `ZONE ${found.zoneId ?? found.id}`,
            stage: found.stage?.toUpperCase() ?? 'VEGE',
            currentDay: found.progress || 1,
            totalDays: found.totalDays || 20,
            systemHealth: { nutrientSolution: 85, reservoirA: 80, filterB: 90, uvSterilizer: 95 },
          });
          setStorageError(null);
        } else {
          setHasCrop(false);
          setPlotData({
            name: 'Crop not found',
            zone: `ZONE ${plotId}`,
            stage: 'VEGE',
            currentDay: 1,
            totalDays: 20,
            systemHealth: { nutrientSolution: 85, reservoirA: 80, filterB: 90, uvSterilizer: 95 },
          });
        }
      } catch (error) {
        console.error('Error reading saved crop', error);
        if (isActive) setStorageError('Could not read saved crop from this device.');
      }
    };

    void loadCrop();
    return () => {
      isActive = false;
    };
  }, [plotId]);

  const handleDeleteCrop = () => {
    Alert.alert(
      'Delete crop?',
      `Are you sure you want to delete ${plotData.name}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => void deleteCrop() },
      ],
    );
  };

  const deleteCrop = async () => {
    setIsDeletingCrop(true);
    try {
      const savedCrops = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed: unknown = savedCrops ? JSON.parse(savedCrops) : [];
      if (!Array.isArray(parsed)) {
        throw new Error('Saved crop data is not a list.');
      }

      const updated = parsed.filter(
        (crop) =>
          typeof crop !== 'object' ||
          crop === null ||
          !('id' in crop) ||
          crop.id !== plotId,
      );
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setStorageError(null);
      router.replace('/plots');
    } catch (error) {
      console.error('Error deleting saved crop', error);
      setStorageError('Could not delete this crop. Please try again.');
    } finally {
      setIsDeletingCrop(false);
    }
  };

  useEffect(() => {
    let isActive = true;

    const loadDashboard = async () => {
      try {
        const [reading, actuatorStates] = await Promise.all([
          getCurrentSensorReading(),
          getActuators(),
        ]);

        if (!isActive) return;
        setSensorReading(reading);
        setActuators(Object.fromEntries(actuatorStates.map((state) => [state.name, state])));
        setApiError(null);
      } catch (error) {
        if (!isActive) return;
        setApiError(error instanceof Error ? error.message : 'Unable to reach the FarmSim API.');
      }
    };

    void loadDashboard();
    const refreshTimer = setInterval(() => void loadDashboard(), 10_000);

    return () => {
      isActive = false;
      clearInterval(refreshTimer);
    };
  }, []);

  const handleActuatorToggle = async (name: string, isOn: boolean) => {
    setUpdatingActuator(name);
    try {
      const state = await updateActuator(name, isOn);
      setActuators((current) => ({ ...current, [state.name]: state }));
      setApiError(null);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Unable to update actuator.');
    } finally {
      setUpdatingActuator(null);
    }
  };

  const [flowRate, setFlowRate] = useState(2.4);

  const stages = ['GERM', 'SEED', 'VEGE', 'FLOW', 'HARV'];
  const sensorCards = [
    { title: 'PH LEVEL', val: sensorReading?.ph.toFixed(2) ?? '--', unit: 'pH', range: '5.5-6.5', status: sensorStatus(sensorReading?.ph, 5.5, 6.5) },
    { title: 'CONDUCTIVITY', val: sensorReading?.electricalConductivityMsCm.toFixed(2) ?? '--', unit: 'mS/cm', range: '1.8-2.5', status: sensorStatus(sensorReading?.electricalConductivityMsCm, 1.8, 2.5) },
    { title: 'WATER TEMPERATURE', val: sensorReading?.waterTemperatureC.toFixed(1) ?? '--', unit: '°C', range: '20-26', status: sensorStatus(sensorReading?.waterTemperatureC, 20, 26) },
    { title: 'WATER LEVEL', val: sensorReading?.waterLevelPercent.toFixed(0) ?? '--', unit: '%', range: '60-90', status: sensorStatus(sensorReading?.waterLevelPercent, 60, 90) },
    { title: 'HUMIDITY', val: sensorReading?.humidityPercent.toFixed(0) ?? '--', unit: '%RH', range: '55-75', status: sensorStatus(sensorReading?.humidityPercent, 55, 75) },
    { title: 'AIR TEMPERATURE', val: sensorReading?.airTemperatureC.toFixed(1) ?? '--', unit: '°C', range: '22-29', status: sensorStatus(sensorReading?.airTemperatureC, 22, 29) },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Navigation Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#00E639" />
          <Text style={styles.backText}>PLOTS</Text>
        </TouchableOpacity>
        <Text style={styles.zoneHeaderText}>{plotData.zone}</Text>
        <View style={styles.stageBadge}>
          <Text style={styles.stageBadgeText}>{plotData.stage}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {storageError ? <Text style={styles.apiError}>{storageError}</Text> : null}
        {apiError ? <Text style={styles.apiError}>{apiError}</Text> : null}

        {/* Plant Header Info */}
        <View style={styles.plantHeaderSection}>
          <Text style={styles.plantTitle}>{plotData.name}</Text>
          <View style={styles.progressMeta}>
            <Text style={styles.metaLabel}>Stage progress</Text>
            <Text style={styles.metaValue}>Day {plotData.currentDay} of {plotData.totalDays}</Text>
          </View>

          <View style={styles.stepperContainer}>
            {stages.map((stg) => {
              const isCurrent = stg === plotData.stage;
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
            {sensorCards.map((sensor, idx) => (
              <View key={idx} style={styles.sensorCard}>
                <View style={styles.sensorCardHeader}>
                  <Text style={styles.sensorTitle}>{sensor.title}</Text>
                  <View style={[styles.miniCircleGauge, sensor.status === 'WARN' && styles.warnGauge]} />
                </View>
                <Text style={[styles.sensorValue, sensor.status === 'WARN' && styles.warnText]}>
                  {sensor.val} <Text style={styles.sensorUnit}>{sensor.unit}</Text>
                </Text>
                <View style={styles.sparklinePlaceholder} />
                <View style={styles.sensorFooter}>
                  <Text style={styles.optText}>OPT: {sensor.range}</Text>
                  <Text style={sensor.status === 'WARN' ? styles.statusWarn : styles.statusOk}>{sensor.status}</Text>
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
                { label: 'Circulation Pump', actuator: 'water-pump' },
                { label: 'Grow Lights', actuator: 'grow-light' },
                { label: 'Ventilation Fan', actuator: null },
                { label: 'Auto Dosing', actuator: 'nutrient-doser' },
              ].map((ctrl, i) => {
                const state = ctrl.actuator ? actuators[ctrl.actuator] : undefined;
                const status = !ctrl.actuator
                  ? 'Unavailable'
                  : state
                    ? state.isOn ? 'Active' : 'Inactive'
                    : 'Connecting';

                return (
                  <View key={i} style={styles.controlRow}>
                    <View>
                      <Text style={styles.controlLabel}>{ctrl.label}</Text>
                      <Text style={styles.controlSub}>{status}</Text>
                    </View>
                    <Switch
                      trackColor={{ false: '#1e261e', true: '#0c3a14' }}
                      thumbColor={state?.isOn ? '#00E639' : '#455545'}
                      value={state?.isOn ?? false}
                      disabled={!state || updatingActuator === ctrl.actuator}
                      onValueChange={(isOn) => {
                        if (ctrl.actuator) void handleActuatorToggle(ctrl.actuator, isOn);
                      }}
                    />
                  </View>
                );
              })}
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
                { name: 'Nutrient Solution', pct: plotData.systemHealth.nutrientSolution },
                { name: 'Reservoir A', pct: plotData.systemHealth.reservoirA },
                { name: 'Filter B', pct: plotData.systemHealth.filterB, warn: true },
                { name: 'UV Sterilizer', pct: plotData.systemHealth.uvSterilizer },
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

        {hasCrop ? (
          <TouchableOpacity
            style={styles.deleteCropButton}
            onPress={handleDeleteCrop}
            disabled={isDeletingCrop}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="delete-outline" size={16} color="#FF6B6B" />
            <Text style={styles.deleteCropText}>
              {isDeletingCrop ? 'DELETING...' : 'DELETE CROP'}
            </Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111411' },
  apiError: { color: '#FFB700', fontSize: 11, fontFamily: MONO_FONT, padding: 10, borderWidth: 1, borderColor: '#694d00', borderRadius: 4 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#222c22' },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backText: { color: '#00E639', fontSize: 10, fontWeight: 'bold', fontFamily: MONO_FONT },
  zoneHeaderText: { color: '#607060', fontSize: 11, fontWeight: '600', letterSpacing: 1, fontFamily: MONO_FONT },
  stageBadge: { backgroundColor: '#0c3a14', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 4, borderWidth: 1, borderColor: '#00E639' },
  stageBadgeText: { color: '#00E639', fontSize: 10, fontWeight: 'bold', fontFamily: MONO_FONT },
  scrollContent: { padding: 16, gap: 16 },
  plantHeaderSection: { backgroundColor: '#151915', borderRadius: 8, borderWidth: 1, borderColor: '#222c22', padding: 18 },
  plantTitle: { color: '#E0E7E0', fontSize: 18, fontWeight: '500', marginBottom: 8, fontFamily: MONO_FONT },
  progressMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  metaLabel: { color: '#607060', fontSize: 12, fontFamily: MONO_FONT },
  metaValue: { color: '#E0E7E0', fontSize: 12, fontWeight: '600', fontFamily: MONO_FONT },
  stepperContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, paddingHorizontal: 4 },
  deleteCropButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 18, paddingVertical: 10, borderWidth: 1, borderColor: '#7A3030', borderRadius: 4 },
  deleteCropText: { color: '#FF6B6B', fontSize: 11, fontWeight: 'bold', fontFamily: MONO_FONT },
  stepItem: { alignItems: 'center', gap: 6 },
  stepDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#1e261e', borderWidth: 1, borderColor: '#607060' },
  activeStepDot: { backgroundColor: '#00E639', borderColor: '#00E639' },
  stepText: { color: '#607060', fontSize: 10, fontFamily: MONO_FONT },
  activeStepText: { color: '#00E639', fontWeight: 'bold', fontFamily: MONO_FONT },
  dashboardLayout: { flexDirection: Platform.OS === 'web' ? 'row' : 'column', gap: 16 },
  sensorsGrid: { flex: 2, flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  sensorCard: { width: Platform.OS === 'web' ? '31%' : '48%', backgroundColor: '#151915', borderRadius: 8, borderWidth: 1, borderColor: '#222c22', padding: 16, minHeight: 170, justifyContent: 'space-between', flexGrow: 1 },
  sensorCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  sensorTitle: { color: '#607060', fontSize: 11, fontWeight: 'bold', letterSpacing: 0.5, fontFamily: MONO_FONT },
  miniCircleGauge: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#00E639', borderRightColor: 'transparent' },
  warnGauge: { borderColor: '#FFB700', borderTopColor: 'transparent' },
  sensorValue: { color: '#00E639', fontSize: 18, fontWeight: '500', marginVertical: 6, fontFamily: MONO_FONT },
  sensorUnit: { fontSize: 12, fontWeight: 'normal', color: '#809080', fontFamily: MONO_FONT },
  warnText: { color: '#FFB700' },
  sparklinePlaceholder: { height: 28, borderBottomWidth: 1, borderBottomColor: '#00E639', opacity: 0.5, marginVertical: 6 },
  sensorFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  optText: { color: '#607060', fontSize: 10, fontFamily: MONO_FONT },
  statusOk: { color: '#00E639', fontSize: 10, fontWeight: 'bold', fontFamily: MONO_FONT },
  statusWarn: { color: '#FFB700', fontSize: 10, fontWeight: 'bold', fontFamily: MONO_FONT },
  rightSidebar: { flex: 1, gap: 12, minWidth: 260 },
  panelBox: { backgroundColor: '#151915', borderRadius: 8, borderWidth: 1, borderColor: '#222c22', padding: 16, gap: 12 },
  panelTitle: { color: '#607060', fontSize: 12, fontWeight: 'bold', letterSpacing: 1, marginBottom: 2, fontFamily: MONO_FONT },
  controlRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 2 },
  controlLabel: { color: '#E0E7E0', fontSize: 13, fontWeight: '500', fontFamily: MONO_FONT },
  controlSub: { color: '#607060', fontSize: 11, marginTop: 2, fontFamily: MONO_FONT },
  flowRateHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  flowRateValue: { color: '#00E639', fontSize: 13, fontWeight: 'bold', fontFamily: MONO_FONT },
  sliderBar: { height: 6, backgroundColor: '#1e261e', borderRadius: 3, marginVertical: 10, position: 'relative' },
  sliderFill: { height: '100%', backgroundColor: '#00E639', borderRadius: 3 },
  sliderLimits: { flexDirection: 'row', justifyContent: 'space-between' },
  limitText: { color: '#607060', fontSize: 11, fontFamily: MONO_FONT },
  healthMetricRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  healthName: { color: '#E0E7E0', fontSize: 12, fontFamily: MONO_FONT },
  healthPct: { color: '#00E639', fontSize: 12, fontWeight: 'bold', fontFamily: MONO_FONT },
  healthBarBg: { height: 4, backgroundColor: '#1e261e', borderRadius: 2, marginTop: 6, overflow: 'hidden' },
  healthBarFill: { height: '100%', backgroundColor: '#00E639', borderRadius: 2 },
  warnFill: { backgroundColor: '#FFB700' },
  eventItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 4 },
  eventDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#00E639', marginTop: 5 },
  eventTime: { color: '#607060', fontSize: 10, fontFamily: MONO_FONT },
  eventText: { color: '#E0E7E0', fontSize: 12, fontFamily: MONO_FONT },
  dosingSection: { backgroundColor: '#151915', borderRadius: 8, borderWidth: 1, borderColor: '#222c22', padding: 16 },
  dosingCardsRow: { flexDirection: 'row', gap: 12, marginTop: 10, flexWrap: 'wrap' },
  dosingCard: { flex: 1, minWidth: 110, backgroundColor: '#111411', borderWidth: 1, borderColor: '#222c22', borderRadius: 6, padding: 14, gap: 6 },
  dosingName: { color: '#607060', fontSize: 11, fontFamily: MONO_FONT },
  dosingVal: { color: '#E0E7E0', fontSize: 18, fontWeight: 'bold', fontFamily: MONO_FONT },
  dosingUnit: { fontSize: 11, color: '#809080', fontWeight: 'normal', fontFamily: MONO_FONT },
  dosingTime: { color: '#607060', fontSize: 10, marginBottom: 4, fontFamily: MONO_FONT },
  deliveredBadge: { backgroundColor: '#0c3a14', paddingVertical: 4, borderRadius: 3, alignItems: 'center', borderWidth: 1, borderColor: '#00E639' },
  deliveredText: { color: '#00E639', fontSize: 10, fontWeight: 'bold', fontFamily: MONO_FONT },
});