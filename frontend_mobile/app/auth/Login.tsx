import { AppButton } from '@/components/Basic/Button/Button';
import { AppInput } from '@/components/Basic/Input/Input';
import { ScreenWrapper } from '@/components/Basic/ScreenWrapper/ScreenWrapper';
import { useTheme } from '@/hooks/System/useThemedBackground';
import { loginUser } from '@/tools/auth';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Text, View } from 'react-native';



export default function LoginScreen() {
  const router = useRouter();
  const { colors } = useTheme(); 

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    loginUser({
      email,
      password,
      setLoading,
      onSuccess: () => router.replace('/'),
    });
  };
  return (
    <ScreenWrapper>
      <View style={{ marginTop: 40, marginBottom: 20 }}>
        <Text style={{ fontSize: 28, fontWeight: 'bold', color: colors.text, textAlign: 'center' }}>
          Вход
        </Text>
      </View>

      <AppInput
        label="Email"
        placeholder="example@mail.com"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <AppInput
        label="Пароль"
        placeholder="Введите пароль"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <AppButton 
        title="Войти" 
        onPress={handleLogin} 
        loading={loading} 
      />

      <AppButton 
        title="Нет аккаунта? Регистрация" 
        variant="outline"
        onPress={() => router.push('/auth/Register')} 
        style={{ marginTop: 20 }}
      />
    </ScreenWrapper>
  );
}