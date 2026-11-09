import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const MONO_FONT = Platform.OS === 'ios' ? 'Courier' : 'monospace';
const STORAGE_KEY = 'farmsim_user_crops_v1';

interface ZoneItem {
  id: string;
  zoneId: string;
  zone: string;
  name: string;
  stage: string;
  progress: number;
  totalDays: number;
  health: string;
  color: string;
  badgeBg: string;
}

export default function PlotsScreen() {
  const router = useRouter();
  const [selectedCropId, setSelectedCropId] = useState<string>('');
  const [zones, setZones] = useState<ZoneItem[]>([]);
  const [storageError, setStorageError] = useState<string | null>(null);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newZoneId, setNewZoneId] = useState('');
  const [zoneError, setZoneError] = useState<string | null>(null);
  const [newStage, setNewStage] = useState('VEGE');
  const [newTotalDays, setNewTotalDays] = useState('20');

  const zoneAlreadyTaken = zones.some(
    (crop) => crop.zoneId.toUpperCase() === newZoneId.trim().toUpperCase(),
  );

  useEffect(() => {
    let isActive = true;

    const loadCrops = async () => {
      try {
        const savedCrops = await AsyncStorage.getItem(STORAGE_KEY);
        if (!savedCrops) return;

        const parsed: unknown = JSON.parse(savedCrops);
        if (!Array.isArray(parsed)) {
          throw new Error('Saved crop data is not a list.');
        }

        const savedItems = parsed as Partial<ZoneItem>[];
        const normalized = savedItems.map((item) => {
          const zoneId = item.zoneId ?? item.id ?? 'A';
          return {
            ...item,
            id: item.id ?? `${zoneId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            zoneId,
            zone: item.zone ?? `ZONE ${zoneId}`,
          } as ZoneItem;
        });
        if (!isActive) return;

        setZones(normalized);
        if (normalized.length > 0) {
          setSelectedCropId(normalized[0].id);
        }
        setStorageError(null);
      } catch (error) {
        console.error('Error loading saved crops', error);
        if (isActive) setStorageError('Could not load saved crops from this device.');
      }
    };

    void loadCrops();
    return () => {
      isActive = false;
    };
  }, []);

  const handleAddPlant = async () => {
    if (!newName.trim()) return;

    const stagesMap: Record<string, { color: string; badgeBg: string }> = {
      VEGE: { color: '#00E639', badgeBg: 'rgba(0, 230, 57, 0.15)' },
      FLOW: { color: '#2196F3', badgeBg: 'rgba(33, 150, 243, 0.15)' },
      SEED: { color: '#A0B0B0', badgeBg: 'rgba(160, 176, 176, 0.15)' },
      GERM: { color: '#B388FF', badgeBg: 'rgba(179, 136, 255, 0.15)' },
    };

    const formattedStage = newStage.toUpperCase().trim();
    const stageConfig = stagesMap[formattedStage] || stagesMap['VEGE'];
    const zoneLetter = newZoneId.trim().toUpperCase();
    if (!/^[A-Z]$/.test(zoneLetter)) {
      setZoneError('Enter exactly one letter for the zone.');
      return;
    }
    if (zones.some((crop) => crop.zoneId.toUpperCase() === zoneLetter)) {
      setZoneError(`Zone ${zoneLetter} already has a crop. Choose a different letter.`);
      return;
    }
    setZoneError(null);
    const cropId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const newPlotItem: ZoneItem = {
      id: cropId,
      zoneId: zoneLetter,
      zone: `ZONE ${zoneLetter}`,
      name: newName.trim(),
      stage: formattedStage,
      progress: 1,
      totalDays: parseInt(newTotalDays) || 20,
      health: '94%',
      color: stageConfig.color,
      badgeBg: stageConfig.badgeBg,
    };

    try {
      const updated = [...zones, newPlotItem];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setZones(updated);
      setSelectedCropId(cropId);
      setStorageError(null);
    } catch (error) {
      console.error('Error saving crop', error);
      setStorageError('Could not save this crop. Please try again.');
      return;
    }
    
    // Reset inputs & close modal
    setNewName('');
    setNewZoneId('');
    setModalVisible(false);
  };

  return (
    <ScrollView 
      style={styles.scrollViewBase}
      contentContainerStyle={styles.container} 
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <Text style={styles.sectionHeader}>GROW ZONES</Text>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => {
            setZoneError(null);
            setNewZoneId('');
            setModalVisible(true);
          }}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="plus" size={16} color="#00E639" />
          <Text style={styles.addButtonText}>ADD CROP</Text>
        </TouchableOpacity>
      </View>
      {storageError ? <Text style={styles.emptySubText}>{storageError}</Text> : null}

      {zones.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>NO ACTIVE CROPS REGISTERED</Text>
          <Text style={styles.emptySubText}>Tap "ADD CROP" above to input your first vegetable zone.</Text>
        </View>
      ) : (
        zones.map((item) => {
          const isSelected = item.id === selectedCropId;
          const progressPercent = (item.progress / item.totalDays) * 100;

          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              onPress={() => {
                setSelectedCropId(item.id);
                router.push(`/plot/${item.id}` as any);
              }}
              style={[
                styles.card,
                isSelected && { borderColor: item.color, shadowColor: item.color },
              ]}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.plotLabel}>{item.zone}</Text>
                <View style={[styles.badge, { backgroundColor: item.badgeBg }]}>
                  <Text style={[styles.badgeText, { color: item.color }]}>{item.stage}</Text>
                </View>
              </View>

              <Text style={styles.cropName}>{item.name}</Text>

              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${progressPercent}%`, backgroundColor: item.color },
                  ]}
                />
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.footerTextMuted}>Day {item.progress}/{item.totalDays}</Text>
                <Text style={[styles.healthText, { color: item.color }]}>
                  {item.health} health
                </Text>
              </View>
            </TouchableOpacity>
          );
        })
      )}

      {/* LIGHT SCHEDULE FOOTER CARD */}
      <View style={[styles.card, { marginTop: 8 }]}>
        <View style={styles.cardHeader}>
          <Text style={styles.plotLabel}>LIGHT SCHEDULE</Text>
          <View style={[styles.badge, { backgroundColor: 'rgba(0, 230, 57, 0.15)' }]}>
            <Text style={[styles.badgeText, { color: '#00E639' }]}>PHOTOPERIOD</Text>
          </View>
        </View>

        <Text style={styles.cropName}>18h On / 6h Off</Text>

        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: '75%', backgroundColor: '#00E639' }]} />
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.footerTextMuted}>00:00</Text>
          <Text style={styles.footerTextMuted}>24:00</Text>
        </View>
      </View>

      {/* MODAL */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>INPUT CUSTOM CROP</Text>

            <Text style={styles.inputLabel}>VEGETABLE / CROP NAME</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Heirloom Tomato"
              placeholderTextColor="#455545"
              value={newName}
              onChangeText={setNewName}
            />

            <Text style={styles.inputLabel}>ZONE DESIGNATOR (ONE LETTER, e.g. A)</Text>
            <TextInput
              style={[styles.textInput, zoneAlreadyTaken && styles.invalidZoneInput]}
              placeholder="A"
              placeholderTextColor="#455545"
              value={newZoneId}
              onChangeText={(value) => {
                setNewZoneId(value.replace(/[^a-z]/gi, '').slice(0, 1).toUpperCase());
                setZoneError(null);
              }}
              autoCapitalize="characters"
              maxLength={1}
            />
            {zoneError || (zoneAlreadyTaken && newZoneId)
              ? (
                <Text style={styles.zoneError}>
                  {zoneError ?? `Zone ${newZoneId} already has a crop. Choose a different letter.`}
                </Text>
              )
              : null}

            <Text style={styles.inputLabel}>STAGE (VEGE, FLOW, SEED, GERM)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="VEGE"
              placeholderTextColor="#455545"
              value={newStage}
              onChangeText={setNewStage}
              autoCapitalize="characters"
            />

            <Text style={styles.inputLabel}>TOTAL CYCLE DAYS</Text>
            <TextInput
              style={styles.textInput}
              placeholder="25"
              placeholderTextColor="#455545"
              value={newTotalDays}
              onChangeText={setNewTotalDays}
              keyboardType="numeric"
            />

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setZoneError(null);
                  setNewZoneId('');
                  setModalVisible(false);
                }}
              >
                <Text style={styles.cancelButtonText}>CANCEL</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddPlant}
              >
                <Text style={styles.saveButtonText}>REGISTER CROP</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollViewBase: { flex: 1, backgroundColor: '#111411' },
  container: { flexGrow: 1, backgroundColor: '#111411', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionHeader: { color: '#455545', fontSize: 12, fontWeight: 'bold', letterSpacing: 1, fontFamily: MONO_FONT },
  addButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#151915', borderWidth: 1, borderColor: '#00E639', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 4, gap: 4 },
  addButtonText: { color: '#00E639', fontSize: 10, fontWeight: 'bold', fontFamily: MONO_FONT },
  emptyContainer: { paddingVertical: 40, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#222c22', borderStyle: 'dashed', borderRadius: 8, marginBottom: 12 },
  emptyText: { color: '#607060', fontSize: 12, fontWeight: 'bold', fontFamily: MONO_FONT, marginBottom: 4 },
  emptySubText: { color: '#455545', fontSize: 10, fontFamily: MONO_FONT, textAlign: 'center', paddingHorizontal: 20 },
  card: { backgroundColor: '#151915', borderRadius: 8, borderWidth: 1, borderColor: '#222c22', padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  plotLabel: { color: '#455545', fontSize: 11, fontWeight: 'bold', letterSpacing: 0.5, fontFamily: MONO_FONT },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 },
  badgeText: { fontSize: 10, fontWeight: 'bold', fontFamily: MONO_FONT },
  cropName: { color: '#E0E7E0', fontSize: 18, fontWeight: 'bold', fontFamily: MONO_FONT, marginBottom: 12 },
  progressBarBg: { height: 4, backgroundColor: '#1e261e', borderRadius: 2, marginBottom: 10, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 2 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerTextMuted: { color: '#455545', fontSize: 11, fontFamily: MONO_FONT },
  healthText: { fontSize: 11, fontWeight: 'bold', fontFamily: MONO_FONT },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(17, 20, 17, 0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', maxWidth: 400, backgroundColor: '#151915', borderWidth: 1, borderColor: '#00E639', borderRadius: 8, padding: 20, gap: 10 },
  modalTitle: { color: '#00E639', fontSize: 13, fontWeight: 'bold', fontFamily: MONO_FONT, marginBottom: 8, letterSpacing: 1 },
  inputLabel: { color: '#455545', fontSize: 10, fontWeight: 'bold', fontFamily: MONO_FONT, marginTop: 6 },
  zoneError: { color: '#ff6b6b', fontSize: 11, fontFamily: MONO_FONT },
  invalidZoneInput: { color: '#ff6b6b', borderColor: '#ff6b6b' },
  textInput: { backgroundColor: '#111411', borderWidth: 1, borderColor: '#222c22', borderRadius: 4, color: '#E0E7E0', paddingHorizontal: 12, paddingVertical: 10, fontFamily: MONO_FONT, fontSize: 13 },
  modalButtonsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, gap: 12 },
  modalButton: { flex: 1, paddingVertical: 10, borderRadius: 4, alignItems: 'center', borderWidth: 1 },
  cancelButton: { borderColor: '#455545', backgroundColor: '#111411' },
  cancelButtonText: { color: '#455545', fontFamily: MONO_FONT, fontWeight: 'bold', fontSize: 11 },
  saveButton: { borderColor: '#00E639', backgroundColor: '#0c3a14' },
  saveButtonText: { color: '#00E639', fontFamily: MONO_FONT, fontWeight: 'bold', fontSize: 11 },
});