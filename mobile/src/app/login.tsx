import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { login as authenticate } from '../lib/farm-sim-api';

const MONO_FONT = Platform.OS === 'ios' ? 'Courier' : 'monospace';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setMessage('Enter your email and password to continue.');
      return;
    }

    setIsSubmitting(true);
    setMessage(null);
    try {
      await authenticate(email.trim(), password);
      router.replace('/plots');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to sign in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.loginCard}>
          <View style={styles.brandMark}>
            <MaterialCommunityIcons name="sprout" size={34} color="#00E639" />
          </View>
          <Text style={styles.brand}>FarmSim</Text>
          <Text style={styles.eyebrow}>GROW SYSTEM ACCESS</Text>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to manage your farm.</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>EMAIL ADDRESS</Text>
            <View style={styles.inputWrap}>
              <MaterialCommunityIcons name="email-outline" size={18} color="#607060" />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={(value) => {
                  setEmail(value);
                  setMessage(null);
                }}
                placeholder="you@example.com"
                placeholderTextColor="#455545"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="next"
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>PASSWORD</Text>
            <View style={styles.inputWrap}>
              <MaterialCommunityIcons name="lock-outline" size={18} color="#607060" />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={(value) => {
                  setPassword(value);
                  setMessage(null);
                }}
                placeholder="Enter your password"
                placeholderTextColor="#455545"
                secureTextEntry={!isPasswordVisible}
                autoComplete="current-password"
                textContentType="password"
                returnKeyType="done"
                onSubmitEditing={() => void handleLogin()}
              />
              <TouchableOpacity
                onPress={() => setIsPasswordVisible((visible) => !visible)}
                accessibilityRole="button"
                accessibilityLabel={isPasswordVisible ? 'Hide password' : 'Show password'}
              >
                <MaterialCommunityIcons
                  name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                  size={19}
                  color="#607060"
                />
              </TouchableOpacity>
            </View>
          </View>

          {message ? (
            <Text accessibilityRole="alert" style={styles.message}>
              {message}
            </Text>
          ) : null}

          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => void handleLogin()}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            <Text style={styles.loginButtonText}>{isSubmitting ? 'SIGNING IN...' : 'SIGN IN'}</Text>
            {!isSubmitting ? <MaterialCommunityIcons name="arrow-right" size={18} color="#111411" /> : null}
          </TouchableOpacity>

          <View style={styles.footer}>
            <View style={styles.footerLine} />
            <Text style={styles.footerText}>CONTROLLED GROWING, SIMPLIFIED</Text>
            <View style={styles.footerLine} />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111411' },
  content: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loginCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#151915',
    borderWidth: 1,
    borderColor: '#222c22',
    borderRadius: 10,
    padding: 28,
  },
  brandMark: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0c3a14',
    borderWidth: 1,
    borderColor: '#00E639',
    borderRadius: 12,
    marginBottom: 14,
  },
  brand: { color: '#E0E7E0', fontSize: 23, fontWeight: '700', letterSpacing: 0.4 },
  eyebrow: { color: '#00E639', fontSize: 10, fontFamily: MONO_FONT, letterSpacing: 1.4, marginTop: 6 },
  title: { color: '#E0E7E0', fontSize: 25, fontWeight: '700', marginTop: 30 },
  subtitle: { color: '#809080', fontSize: 14, marginTop: 7, marginBottom: 26 },
  fieldGroup: { marginBottom: 18 },
  label: { color: '#607060', fontSize: 10, fontWeight: '700', letterSpacing: 0.9, marginBottom: 8, fontFamily: MONO_FONT },
  inputWrap: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 13,
    backgroundColor: '#111411',
    borderWidth: 1,
    borderColor: '#293329',
    borderRadius: 5,
  },
  input: { flex: 1, color: '#E0E7E0', fontSize: 14, paddingVertical: 12 },
  message: {
    color: '#FFB700',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 16,
  },
  loginButton: {
    minHeight: 48,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#00E639',
    borderRadius: 5,
    marginTop: 4,
    opacity: 0.9,
  },
  loginButtonText: { color: '#111411', fontSize: 12, fontWeight: '800', letterSpacing: 1, fontFamily: MONO_FONT },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 28 },
  footerLine: { flex: 1, height: 1, backgroundColor: '#222c22' },
  footerText: { color: '#455545', fontSize: 8, letterSpacing: 0.7, fontFamily: MONO_FONT },
});
