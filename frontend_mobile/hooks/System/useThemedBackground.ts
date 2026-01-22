import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

type ThemeType = 'light' | 'dark';
type ColorScheme = ThemeType | null; // null = системная

export const useTheme = () => {
  const systemScheme = useColorScheme();
  const [forcedScheme, setForcedScheme] = useState<ColorScheme>(null);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const saved = await AsyncStorage.getItem('user_theme');
      if (saved === 'light' || saved === 'dark') {
        setForcedScheme(saved as ThemeType);
      }
    } catch (e) {
      console.error('Failed to load theme', e);
    }
  };

  const saveTheme = async (scheme: ColorScheme) => {
    try {
      if (scheme === null) {
        await AsyncStorage.removeItem('user_theme');
      } else {
        await AsyncStorage.setItem('user_theme', scheme);
      }
      setForcedScheme(scheme);
    } catch (e) {
      console.error('Failed to save theme', e);
    }
  };

  const activeTheme: ThemeType = forcedScheme ?? (systemScheme === 'dark' ? 'dark' : 'light');

  const colors = {
    background: activeTheme === 'dark' ? '#121212' : '#FFFFFF',
    text: activeTheme === 'dark' ? '#FFFFFF' : '#000000',
    inputBorder: activeTheme === 'dark' ? '#333' : '#ccc',
    primary: '#007AFF',
    color: activeTheme === 'dark' ? '#4c4d4e' : '#a2a5a8',
  };

  return { 
    theme: activeTheme, 
    colors, 
    setTheme: saveTheme, 
    isSystem: forcedScheme === null 
  };
};