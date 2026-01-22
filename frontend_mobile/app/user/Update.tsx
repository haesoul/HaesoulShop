import { getStyles } from '@/BASE_STYLES';
import { useTheme } from '@/hooks/System/useThemedBackground';
import { updateUserInfo } from '@/tools/user';
import { UserProfile } from '@/types/user';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function EditProfileScreen() {
  const { colors } = useTheme();
  const baseStyles = getStyles(colors);
  const router = useRouter();
  const params = useLocalSearchParams(); 

  const userData: UserProfile | null = params.userString 
    ? JSON.parse(params.userString as string) 
    : null;
  const [firstName, setFirstName] = useState((userData?.first_name as string) || '');
  const [lastName, setLastName] = useState((userData?.last_name as string) || '');
  const [phone, setPhone] = useState((userData?.phone_number as string) || '');
  
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    setSaving(true);
    try {
      await updateUserInfo({
        first_name: firstName,
        last_name: lastName,
        phone_number: phone,
      });

      Alert.alert('Успех', 'Данные обновлены', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      const errorMsg = JSON.stringify(error.response?.data) || 'Проверьте данные';
      Alert.alert('Ошибка сохранения', errorMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.form}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Личные данные</Text>
          <Text style={[styles.subTitle, { color: colors.text }]}>
             Измените информацию о себе, чтобы курьеры могли быстрее с вами связаться.
          </Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Имя</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.inputBorder, backgroundColor: colors.inputBorder + '10' }]}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Ваше имя"
              placeholderTextColor="#888"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Фамилия</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.inputBorder, backgroundColor: colors.inputBorder + '10' }]}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Ваша фамилия"
              placeholderTextColor="#888"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Телефон</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.inputBorder, backgroundColor: colors.inputBorder + '10' }]}
              value={phone}
              onChangeText={setPhone}
              placeholder="+7..."
              placeholderTextColor="#888"
              keyboardType="phone-pad"
            />
          </View>

          <TouchableOpacity 
            style={[styles.saveButton, { backgroundColor: colors.primary, opacity: saving ? 0.7 : 1 }]} 
            onPress={onSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Сохранить изменения</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={() => router.back()}
            disabled={saving}
          >
             <Text style={{ color: colors.text, opacity: 0.6 }}>Отмена</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  form: { padding: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  subTitle: { fontSize: 14, opacity: 0.6, marginBottom: 30, lineHeight: 20 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, opacity: 0.8 },
  input: { height: 50, borderWidth: 1, borderRadius: 12, paddingHorizontal: 15, fontSize: 16 },
  saveButton: { height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3.84, elevation: 5 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  cancelButton: { alignItems: 'center', marginTop: 20, padding: 10 }
});