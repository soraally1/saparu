import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export const setItemAsync = async (key: string, value: string) => {
  try {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  } catch (e) {
    console.warn(`[Storage] Failed to set key "${key}":`, e);
  }
};

export const getItemAsync = async (key: string): Promise<string | null> => {
  try {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    } else {
      return await SecureStore.getItemAsync(key);
    }
  } catch (e) {
    console.warn(`[Storage] Failed to get key "${key}":`, e);
    return null;
  }
};

export const deleteItemAsync = async (key: string) => {
  try {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key).catch(() => {});
    }
  } catch (e) {
    console.warn(`[Storage] Failed to delete key "${key}":`, e);
  }
};
