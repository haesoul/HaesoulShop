import { registerUser } from '@/tools/auth';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../hooks/System/useThemedBackground';

export default function RegisterScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const [form, setForm] = useState({
    email: '',
    username: '',
    phone_number: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = () => {
    registerUser({
      form,
      setLoading,
      onSuccess: (email) => {
        router.push({
          pathname: "/auth/Verify",
          params: { email } 
        });
      }
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1, justifyContent: 'center'}}>
        <ScrollView contentContainerStyle={{flexGrow: 1, justifyContent: 'center'}} showsVerticalScrollIndicator={false}>
          
          <Text style={[styles.header, { color: colors.text }]}>Создание аккаунта</Text>

          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.inputBorder || '#ccc' }]}
            placeholder="Email"
            placeholderTextColor="#888"
            value={form.email}
            onChangeText={(t) => setForm({ ...form, email: t })}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.inputBorder || '#ccc' }]}
            placeholder="Имя пользователя"
            placeholderTextColor="#888"
            value={form.username}
            onChangeText={(t) => setForm({ ...form, username: t })}
          />
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.inputBorder || '#ccc' }]}
            placeholder="Телефон"
            placeholderTextColor="#888"
            value={form.phone_number}
            onChangeText={(t) => setForm({ ...form, phone_number: t })}
            keyboardType="phone-pad"
          />
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.inputBorder || '#ccc' }]}
            placeholder="Пароль"
            placeholderTextColor="#888"
            value={form.password}
            onChangeText={(t) => setForm({ ...form, password: t })}
            secureTextEntry
          />

          <TouchableOpacity 
            style={[styles.btn, { backgroundColor: colors.primary || '#007AFF' }]} 
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Далее</Text>}
          </TouchableOpacity>

          {/* Кнопка назад к логину */}
          <TouchableOpacity onPress={() => router.back()} style={{marginTop: 20}}>
             <Text style={{color: colors.primary || '#007AFF', textAlign: 'center'}}>Уже есть аккаунт? Войти</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 26, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  input: { height: 50, borderWidth: 1, borderRadius: 10, marginBottom: 15, paddingHorizontal: 15, fontSize: 16 },
  btn: { height: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 }
});