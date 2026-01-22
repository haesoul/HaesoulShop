import { verifyCode } from '@/tools/auth';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../hooks/System/useThemedBackground';

export default function VerifyCodeScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>(); 
  const { colors } = useTheme();

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = () => {
    if (!email) {
      Alert.alert("Ошибка", "Email не найден");
      return;
    }

    verifyCode({
      email,
      code,
      setLoading,
      onSuccess: () => {
        Alert.alert('Успех', 'Почта подтверждена!');
        router.dismissAll();
        router.replace("/");
      }
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.text }]}>Подтверждение почты</Text>
      <Text style={{ color: colors.text, textAlign: 'center', marginBottom: 20 }}>
        Мы отправили код на {email}
      </Text>

      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.inputBorder || '#ccc', textAlign: 'center', letterSpacing: 5, fontSize: 24 }]}
        placeholder="123456"
        placeholderTextColor="#888"
        value={code}
        onChangeText={setCode}
        keyboardType="number-pad"
        maxLength={6}
      />

      <TouchableOpacity 
        style={[styles.btn, { backgroundColor: colors.primary || '#007AFF' }]} 
        onPress={handleVerify}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Подтвердить</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  input: { height: 60, borderWidth: 1, borderRadius: 10, marginBottom: 20, paddingHorizontal: 15 },
  btn: { height: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 }
});