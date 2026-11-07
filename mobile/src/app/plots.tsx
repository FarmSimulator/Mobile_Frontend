import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const MONO_FONT = Platform.OS === 'ios' ? 'Courier' : 'monospace';

interface ZoneItem {
  id: string;
  zone: string;
  name: string;
  stage: string;
  progress: number;
  totalDays: number;
  health: string;
  color: string;
  badgeBg: string;
}

const ZONE_DATA: ZoneItem[] = [
  {
    id: 'A',
    zone: 'ZONE A',
    name: 'Basil (Genovese)',
    stage: 'VEGE',
    progress: 11,
    totalDays: 28,
    health: '77%',
    color: '#00E639', // Neon Green
    badgeBg: 'rgba(0, 230, 57, 0.15)',
  },
  {
    id: 'B',
    zone: 'ZONE B',
    name: 'Lettuce (Butterhead)',
    stage: 'FLOW',
    progress: 8,
    totalDays: 21,
    health: '88%',
    color: '#2196F3', // Electric Blue
    badgeBg: 'rgba(33, 150, 243, 0.15)',
  },
  {
    id: 'C',
    zone: 'ZONE C',
    name: 'Spinach (Savoy)',
    stage: 'SEED',
    progress: 5,
    totalDays: 14,
    health: '97%',
    color: '#A0B0B0', // Silver Gray
    badgeBg: 'rgba(160, 176, 176, 0.15)',
  },
  {
    id: 'D',
    zone: 'ZONE D',
    name: 'Cherry Tomato',
    stage: 'GERM',
    progress: 3,
    totalDays: 7,
    health: '92%',
    color: '#B388FF', // Purple
    badgeBg: 'rgba(179, 136, 255, 0.15)',
  },
];

export default function PlotsScreen() {
  const router = useRouter();
  const [selectedZone, setSelectedZone] = useState<string>('A');

  return (
    <ScrollView 
    style={styles.scrollViewBase}
    contentContainerStyle={styles.container} 
    showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionHeader}>GROW ZONES</Text>

      {ZONE_DATA.map((item) => {
        const isSelected = item.id === selectedZone;
        const progressPercent = (item.progress / item.totalDays) * 100;

        return (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.8}
            onPress={() => {
              setSelectedZone(item.id);
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
      })}

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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollViewBase: {
    flex: 1,
    backgroundColor: '#111411', // Forces the canvas background to be dark instantly
  },
  container: {
    flexGrow: 1,
    backgroundColor: '#111411',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  sectionHeader: {
    color: '#455545',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    fontFamily: MONO_FONT,
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#151915',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#222c22',
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  plotLabel: {
    color: '#455545',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    fontFamily: MONO_FONT,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: MONO_FONT,
  },
  cropName: {
    color: '#E0E7E0',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: MONO_FONT,
    marginBottom: 12,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: '#1e261e',
    borderRadius: 2,
    marginBottom: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerTextMuted: {
    color: '#455545',
    fontSize: 11,
    fontFamily: MONO_FONT,
  },
  healthText: {
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: MONO_FONT,
  },
});