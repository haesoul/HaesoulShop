import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../hooks/System/useThemedBackground';

import ProductList from '@/components/Store/ProductList';
import { useAuth } from '@/context/AuthContext';
import LoginScreen from './auth/Login';

export default function Index() {
  const router = useRouter()
  const { colors, setTheme } = useTheme();
  
  const { isAuth, setIsAuth } = useAuth();
  

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {!isAuth && <LoginScreen />}
      {isAuth && <ProductList/>}
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  input: { height: 50, borderWidth: 1, borderRadius: 10, marginBottom: 15, paddingHorizontal: 15 },
  button: { height: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  themeSwitcher: { marginTop: 50, alignItems: 'center', paddingTop: 20, borderTopWidth: 1, borderTopColor: '#333' },
  themeBtn: { padding: 8, backgroundColor: '#eee', borderRadius: 5 }
});