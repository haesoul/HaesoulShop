import { API_URL } from '@/CONSTANTS';
import { useTheme } from '@/hooks/System/useThemedBackground'; // Твой хук темы
import { api, logout } from '@/tools/auth';
import { getProfile } from '@/tools/user';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

// Типы данных
interface Address {
  id: number;
  city: string;
  street: string;
  house: string;
  is_default: boolean;
}

interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string | null;
  avatar: string | null;
  addresses: Address[];
}

export default function ProfileScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);


  useEffect(() => {
    async function asyncGetProfile() {
      try {
        const data = await getProfile()

        setUser(data);
        setFirstName(data.first_name || '');
        setLastName(data.last_name || '');
        setPhone(data.phone_number || '');
        setAvatarUri(data.avatar);
        console.log(data)
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    }
    asyncGetProfile()

  }, []);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      console.log("Нет доступа к галерее");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled && result.assets.length > 0) {
      setAvatarUri(result.assets[0].uri)
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    try {
      const token = await SecureStore.getItemAsync('access_token');
      const formData = new FormData();
      formData.append('first_name', firstName);
      formData.append('last_name', lastName);
      formData.append('phone_number', phone);

      if (avatarUri) {
        // @ts-ignore: React Native FormData hack
        formData.append('avatar', {
          uri: avatarUri,
          name: 'avatar.jpg', 
          type: 'image/jpeg',
        });
      }
      const response = await api.patch(`${API_URL}api/auth/profile/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert('Успех', 'Данные профиля обновлены');
      
      setUser(response.data);
      setAvatarUri(null);

    } catch (error: any) {
      console.error('Update error:', error.response?.data);
      const errorMsg = JSON.stringify(error.response?.data) || 'Проверьте данные';
      Alert.alert('Ошибка сохранения', errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    logout();
    router.replace('/auth/Login');
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const displayAvatar = avatarUri 
    ? { uri: avatarUri } 
    : user?.avatar 
      ? { uri: user.avatar } 
      : null; 

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        
        <View style={styles.avatarContainer}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper}>
            {displayAvatar ? (
              <Image source={displayAvatar} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: colors.inputBorder }]}>
                <Text style={{ fontSize: 30, color: colors.text }}>
                  {user?.email[0].toUpperCase()}
                </Text>
              </View>
            )}
            <View style={[styles.editBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.editBadgeText}>✎</Text>
            </View>
          </TouchableOpacity>
          <Text style={[styles.emailText, { color: colors.text }]}>{user?.email}</Text>
        </View>

        {/* Форма */}
        <View style={styles.form}>
          <Text style={[styles.label, { color: colors.text }]}>Имя</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.inputBorder }]}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Введите имя"
            placeholderTextColor="#888"
          />

          <Text style={[styles.label, { color: colors.text }]}>Фамилия</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.inputBorder }]}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Введите фамилию"
            placeholderTextColor="#888"
          />

          <Text style={[styles.label, { color: colors.text }]}>Телефон</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.inputBorder }]}
            value={phone}
            onChangeText={setPhone}
            placeholder="+79990000000"
            placeholderTextColor="#888"
            keyboardType="phone-pad"
          />

          <TouchableOpacity 
            style={[styles.saveButton, { backgroundColor: colors.primary }]} 
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Сохранить изменения</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Секция адресов (только чтение) */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Мои адреса</Text>
          {user?.addresses && user.addresses.length > 0 ? (
            user.addresses.map((addr) => (
              <View key={addr.id} style={[styles.addressCard, { backgroundColor: colors.inputBorder + '30' }]}>
                <Text style={{ color: colors.text, fontWeight: 'bold' }}>
                  {addr.city}, {addr.street}, {addr.house}
                </Text>
                {addr.is_default && (
                  <Text style={{ color: colors.primary, fontSize: 12 }}>Основной адрес</Text>
                )}
              </View>
            ))
          ) : (
            <Text style={{ color: colors.text, opacity: 0.6 }}>Адреса не добавлены</Text>
          )}
        </View>

        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Выйти из аккаунта</Text>
        </TouchableOpacity>

        <View style={{ height: 50 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  editBadgeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emailText: {
    marginTop: 10,
    fontSize: 16,
    opacity: 0.7,
  },
  form: {
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  saveButton: {
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    padding: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  addressCard: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  logoutButton: {
    alignItems: 'center',
    padding: 15,
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 16,
  },
});