import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, usePathname, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function RootLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('00h:00m:00s');
  const router = useRouter();
  const pathname = usePathname();
  const isLoginScreen = pathname === '/login';

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hrs = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      const secs = String(now.getSeconds()).padStart(2, '0');
      setCurrentTime(`${hrs}h:${mins}m:${secs}s`);
    };

    updateTime();
    const timeInterval = setInterval(updateTime, 1000);
    return () => clearInterval(timeInterval);
  }, []);

  const sidebarIcons = [
    { name: 'apps', label: 'Dashboard', route: '/plots' }, 
    { name: 'target', label: 'Simulation', route: '/targets' },
    { name: 'leaf', label: 'Plant Management', route: '/nutrients' },
    { name: 'chart-timeline-variant', label: 'Analytics', route: '/analytics' },
    { name: 'play-circle-outline', label: 'Automation', route: '/automation' },
    { name: 'alert-outline', label: 'Alerts', route: '/alerts' },
    { name: 'cog-outline', label: 'Settings', route: '/settings' },
  ];

  return (
    <View style={styles.appContainer}>
      <StatusBar hidden={true} />

      {!isLoginScreen && (
        <View style={styles.customAppBar}>
          <TouchableOpacity onPress={toggleSidebar} activeOpacity={0.7} style={styles.headerLeftStack}>
            <Text style={styles.brandTitleText}>FarmSim</Text>
            <MaterialCommunityIcons
              name="sprout"
              size={35}
              color="#00E639"
              style={styles.brandIcon}
            />
          </TouchableOpacity>

          <View style={styles.headerRightColumn}>
            <Text style={styles.timeHighlight}>{currentTime}</Text>
            <Text style={styles.metaDataText}>date 28/09/26</Text>
            <Text style={styles.metaDataText}>system online 00d:00h:00m</Text>
          </View>
        </View>
      )}

      {/* Main Screen Navigation Stack */}
      <Stack screenOptions={{ headerShown: false, animation: 'none' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="plots" />
        <Stack.Screen name="targets" />
        <Stack.Screen name="nutrients" />
        <Stack.Screen name="analytics" />
        <Stack.Screen name="automation" />
        <Stack.Screen name="alerts" />
        <Stack.Screen name="settings" />
      </Stack>

      {!isLoginScreen && (
        <>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={toggleSidebar}
            style={[styles.pullTab, isSidebarOpen && styles.pullTabOpen]}
          >
            <MaterialCommunityIcons
              name={isSidebarOpen ? 'chevron-left' : 'chevron-right'}
              size={18}
              color="#00E639"
            />
          </TouchableOpacity>

          {isSidebarOpen && (
            <View style={styles.sidebarOverlay}>
              <TouchableOpacity style={styles.closeArea} onPress={toggleSidebar} />

              <View style={styles.drawerColumn}>
                {sidebarIcons.map((icon, index) => {
                  const isActive = pathname === icon.route;

                  return (
                    <TouchableOpacity
                      key={index}
                      style={styles.iconWrapper}
                      onPress={() => {
                        toggleSidebar();
                        router.push(icon.route as any);
                      }}
                    >
                      <MaterialCommunityIcons
                        name={icon.name as any}
                        size={26}
                        color={isActive ? '#00E639' : '#455545'}
                      />
                      <Text style={[styles.iconLabel, isActive && styles.activeText]}>
                        {icon.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  appContainer: { 
    flex: 1, 
    backgroundColor: '#111411', 
  },
  customAppBar: {
    height: 90, 
    backgroundColor: '#111411',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1A221A', 
  },
  headerLeftStack: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  brandTitleText: {
    color: '#E0E7E0', 
    fontSize: 22, 
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  brandIcon: {
    marginTop: 4, 
  },
  headerRightColumn: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    backgroundColor: '#111411',
    borderWidth: 0,
  },
  timeHighlight: {
    color: '#00E639',
    fontSize: 13,
    fontWeight: '700',
    backgroundColor: 'transparent',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  metaDataText: {
    color: '#455545',
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 12,
    backgroundColor: 'transparent',
    textTransform: 'lowercase',
  },
  /* Persistent Pull Handle Tab Styles */
  pullTab: {
    position: 'absolute',
    top: '48%',
    left: 0,
    width: 20,
    height: 50,
    backgroundColor: '#151915',
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
    borderWidth: 1,
    borderLeftWidth: 0,
    borderColor: '#222c22',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10000,
    shadowColor: '#00E639',
    shadowOffset: { width: 1, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  pullTabOpen: {
    left: 120, // Moves right and sticks right beside the 120px wide drawer when opened
  },
  sidebarOverlay: { 
    position: 'absolute', 
    top: 0, 
    bottom: 0, 
    left: 0, 
    right: 0, 
    flexDirection: 'row', 
    backgroundColor: 'rgba(17, 20, 17, 0.4)', 
    zIndex: 9999 
  },
  closeArea: { 
    position: 'absolute', 
    top: 0, 
    bottom: 0, 
    left: 120, 
    right: 0 
  },
  drawerColumn: { 
    width: 120, 
    height: '100%', 
    backgroundColor: '#111411', 
    borderRightWidth: 1, 
    borderRightColor: '#1A221A', 
    alignItems: 'center', 
    paddingTop: 60, 
    gap: 25 
  },
  iconWrapper: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    width: '100%', 
    paddingVertical: 8 
  },
  iconLabel: { 
    fontSize: 10, 
    color: '#455545', 
    marginTop: 4, 
    fontWeight: '500' 
  },
  activeText: { 
    color: '#00E639' 
  },
});