import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  // Connection and Hardware states
  const [serverIp, setServerIp] = useState('192.168.1.105');
  const [isCloudSync, setIsCloudSync] = useState(true);
  const [isAutoCalibration, setIsAutoCalibration] = useState(false);
  const [isEmergencyShutdown, setIsEmergencyShutdown] = useState(true);

  const handleSaveConfig = () => {
    Alert.alert("SYSTEM NOTICE", "Configuration protocols successfully updated and deployed to core matrix.");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.subHeader}>SYSTEM OVERRIDES</Text>
      <Text style={styles.mainTitle}>Farm Settings</Text>

      {/* Network Configuration Panel */}
      <View style={styles.panel}>
        <View style={styles.panelHeaderRow}>
          <Text style={styles.panelTitle}>NETWORK CONFIGURATION</Text>
          <MaterialCommunityIcons name="lan" size={14} color="#455545" />
        </View>

        <Text style={styles.inputLabel}>CORE NODE IP ADDRESS</Text>
        <TextInput
          style={styles.terminalInput}
          value={serverIp}
          onChangeText={setServerIp}
          placeholder="0.0.0.0"
          placeholderTextColor="#333e33"
          keyboardType="numeric"
        />

        <View style={styles.settingRow}>
          <View style={styles.textColumn}>
            <Text style={styles.settingLabel}>Telemetry Cloud Sync</Text>
            <Text style={styles.settingDesc}>Stream crop data continuously to cloud architecture.</Text>
          </View>
          <Switch
            value={isCloudSync}
            onValueChange={setIsCloudSync}
            trackColor={{ false: '#1A221A', true: '#0c3a14' }}
            thumbColor={isCloudSync ? '#00E639' : '#455545'}
            ios_backgroundColor="#1A221A"
          />
        </View>
      </View>

      {/* Hardware Calibration Panel */}
      <View style={styles.panel}>
        <View style={styles.panelHeaderRow}>
          <Text style={styles.panelTitle}>HARDWARE & BIOMETRICS</Text>
          <MaterialCommunityIcons name="cog-refresh-outline" size={14} color="#455545" />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.textColumn}>
            <Text style={styles.settingLabel}>Auto-Calibration Mode</Text>
            <Text style={styles.settingDesc}>Inject buffers automatically when reservoir pH drifts.</Text>
          </View>
          <Switch
            value={isAutoCalibration}
            onValueChange={setIsAutoCalibration}
            trackColor={{ false: '#1A221A', true: '#0c3a14' }}
            thumbColor={isAutoCalibration ? '#00E639' : '#455545'}
            ios_backgroundColor="#1A221A"
          />
        </View>

        <View style={styles.metaDivider} />

        <View style={styles.settingRow}>
          <View style={styles.textColumn}>
            <Text style={styles.settingLabel}>Thermal Safety Grid</Text>
            <Text style={styles.settingDesc}>Trigger extraction fans automatically above 32°C.</Text>
          </View>
          <Switch
            value={isEmergencyShutdown}
            onValueChange={setIsEmergencyShutdown}
            trackColor={{ false: '#1A221A', true: '#0c3a14' }}
            thumbColor={isEmergencyShutdown ? '#00E639' : '#455545'}
            ios_backgroundColor="#1A221A"
          />
        </View>
      </View>

      {/* Save Action Button */}
      <TouchableOpacity style={styles.saveBtn} activeOpacity={0.8} onPress={handleSaveConfig}>
        <Text style={styles.saveBtnText}>COMMIT CONFIGURATION</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111411', paddingHorizontal: 16 },
  contentContainer: { paddingTop: 24, paddingBottom: 40 },
  subHeader: { color: '#455545', fontSize: 11, fontWeight: '600', letterSpacing: 1 },
  mainTitle: { color: '#E0E7E0', fontSize: 26, fontWeight: 'bold', marginTop: 4, marginBottom: 20 },
  panel: { backgroundColor: '#151915', borderWidth: 1, borderColor: '#222c22', borderRadius: 8, padding: 16, marginBottom: 20 },
  panelHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  panelTitle: { color: '#455545', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  inputLabel: { color: '#607060', fontSize: 10, fontWeight: '600', letterSpacing: 0.5, marginBottom: 6 },
  terminalInput: { backgroundColor: '#111411', borderWidth: 1, borderColor: '#1F291F', borderRadius: 4, color: '#00E639', paddingVertical: 10, paddingHorizontal: 12, fontSize: 15, fontFamily: 'monospace', marginBottom: 16 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  textColumn: { flex: 1 },
  settingLabel: { color: '#E0E7E0', fontSize: 15, fontWeight: '600' },
  settingDesc: { color: '#607060', fontSize: 12, marginTop: 2, lineHeight: 16 },
  metaDivider: { height: 1, backgroundColor: '#1A221A', marginVertical: 14 },
  saveBtn: { borderWidth: 1, borderColor: '#00E639', paddingVertical: 12, alignItems: 'center', borderRadius: 4, marginTop: 8 },
  saveBtnText: { color: '#00E639', fontSize: 13, fontWeight: '700', letterSpacing: 1 },
});
