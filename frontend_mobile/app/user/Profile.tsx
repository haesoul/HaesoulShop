import { useTheme } from '@/hooks/System/useThemedBackground';
import { logout } from '@/tools/auth';
import { getProfile, updateUserAvatar } from '@/tools/user';
import { UserProfile } from '@/types/user';

import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function ProfileMainScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  const fetchProfile = async () => {
    try {
      const data = await getProfile();
      setUser(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled && result.assets.length > 0) {
      try {
        setAvatarLoading(true);
        const updatedUser = await updateUserAvatar(result.assets[0].uri);
        setUser(updatedUser); // Обновляем стейт сразу
        Alert.alert('Отлично', 'Фото профиля обновлено');
      } catch (error) {
        Alert.alert('Ошибка', 'Не удалось загрузить фото');
      } finally {
        setAvatarLoading(false);
      }
    }
  };

  const handleLogout = () => {
    logout();
    router.replace('/auth/Login');
  };

  const MenuButton = ({ title, icon, onPress, danger = false }: any) => (
    <TouchableOpacity 
      style={[styles.menuBtn, { backgroundColor: colors.color + '20' }]} 
      onPress={onPress}
    >
      <Text style={{ fontSize: 18 }}>{icon}</Text>
      <Text style={[styles.menuBtnText, { color: danger ? '#FF3B30' : colors.text }]}>{title}</Text>
      {!danger && <Text style={{ color: colors.text, opacity: 0.5 }}>›</Text>}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* Шапка профиля */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleAvatarChange} style={styles.avatarContainer}>
          {avatarLoading ? (
             <ActivityIndicator color={colors.primary} />
          ) : user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.inputBorder }]}>
              <Text style={{ fontSize: 32, color: colors.text }}>
                {user?.email?.[0]?.toUpperCase() ?? '?'}
              </Text>
            </View>
          )}
          <View style={[styles.editBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.editBadgeText}>📷</Text>
          </View>
        </TouchableOpacity>
        
        <Text style={[styles.nameText, { color: colors.text }]}>
          {user?.first_name} {user?.last_name}
        </Text>
        <Text style={[styles.emailText, { color: colors.text }]}>{user?.email}</Text>
      </View>

      <View style={styles.menuContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Аккаунт</Text>
        
        <MenuButton 
          title="Редактировать данные" 
          icon="✏️" 
          onPress={() => router.push({ pathname: '/user/Update', params: { userString: JSON.stringify(user) } })} 
        />
        
        <MenuButton title="Мои заказы" icon="📦" onPress={() => console.log('Orders')} />
        <MenuButton title="Избранное" icon="❤️" onPress={() => console.log('Favorites')} />
        <MenuButton title="Адреса доставки" icon="📍" onPress={() => console.log('Addresses')} />
      </View>

      <View style={styles.menuContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Приложение</Text>
        <MenuButton title="Язык приложения" icon="🌍" onPress={() => console.log('Language')} />
        <MenuButton title="Уведомления" icon="bell" onPress={() => console.log('Notifications')} />
        <MenuButton title="Поддержка" icon="🎧" onPress={() => console.log('Support')} />
        <MenuButton title="Настройки" icon="⚙️" onPress={() => console.log('Settings')} />
      </View>

      <View style={styles.menuContainer}>
        <MenuButton title="Выйти" icon="🚪" danger onPress={handleLogout} />
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { alignItems: 'center', paddingVertical: 30 },
  avatarContainer: { position: 'relative', marginBottom: 15 },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center' },
  editBadge: { position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  editBadgeText: { fontSize: 14 },
  nameText: { fontSize: 22, fontWeight: 'bold', marginBottom: 5 },
  emailText: { fontSize: 14, opacity: 0.6 },
  menuContainer: { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10, marginLeft: 5 },
  menuBtn: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 12, marginBottom: 10 },
  menuBtnText: { flex: 1, marginLeft: 15, fontSize: 16, fontWeight: '500' },
});