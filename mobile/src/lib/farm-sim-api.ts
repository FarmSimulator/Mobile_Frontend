import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN_KEY = 'farmsim_access_token_v1';

export interface SensorReading {
  id: string;
  recordedAtUtc: string;
  ph: number;
  waterTemperatureC: number;
  airTemperatureC: number;
  humidityPercent: number;
  electricalConductivityMsCm: number;
  waterLevelPercent: number;
}

export interface ActuatorState {
  name: string;
  isOn: boolean;
  powerPercent: number;
  updatedAtUtc: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresAtUtc: string;
}

const expoHostUri = Constants.expoConfig?.hostUri;
const expoHost = expoHostUri
  ? new URL(expoHostUri.includes('://') ? expoHostUri : `http://${expoHostUri}`).hostname
  : undefined;

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '') ??
  (expoHost ? `http://${expoHost}:5000` : 'http://localhost:5000');

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const accessToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw await createApiError(response);
  }

  return response.json() as Promise<T>;
}

async function createApiError(response: Response) {
  const body: unknown = await response.json().catch(() => null);
  if (
    typeof body === 'object' &&
    body !== null &&
    'detail' in body &&
    typeof body.detail === 'string'
  ) {
    return new Error(body.detail);
  }

  return new Error(`API request failed (${response.status})`);
}

export async function login(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw await createApiError(response);
  }

  const session = (await response.json()) as LoginResponse;
  await AsyncStorage.setItem(AUTH_TOKEN_KEY, session.accessToken);
  return session;
}

export function getCurrentSensorReading() {
  return request<SensorReading>('/api/sensors/current');
}

export function getActuators() {
  return request<ActuatorState[]>('/api/actuators');
}

export function updateActuator(name: string, isOn: boolean) {
  return request<ActuatorState>(`/api/actuators/${name}`, {
    method: 'POST',
    body: JSON.stringify({ isOn, powerPercent: 100 }),
  });
}