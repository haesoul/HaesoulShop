import { useTheme } from '@/hooks/System/useThemedBackground';
import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';


const { width } = Dimensions.get('window');
type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface TabItem {
  id: string;
  icon: IoniconsName;       
  activeIcon: IoniconsName;
  path: string; 
}
const BottomAppBar = () => {
  const router = useRouter()

  const { colors } = useTheme()
  const [activeTab, setActiveTab] = useState('Home');
  const pathname = usePathname();
  const tabs: TabItem[] = [
    { id: 'Home', icon: 'home-outline', activeIcon: 'home', path: '/' },
    { id: 'Favorites', icon: 'heart-outline', activeIcon: 'heart', path: '/store/WishList/WishList' },
    { id: 'Cart', icon: 'cart-outline', activeIcon: 'cart', path: '/store/Cart/Cart' },
    { id: 'Profile', icon: 'person-outline', activeIcon: 'person', path: '/user/Profile' },
  ];
  function changeTab(tab: TabItem) {
    if (pathname === tab.path) return;
    router.replace(tab.path as any);
  }
  const activeTabId = useMemo(() => {
    const currentTab = tabs.find(tab => pathname === tab.path);
    return currentTab ? currentTab.id : 'Home';
  }, [pathname]);
  return (
    <View style={[styles.container, {backgroundColor: colors.inputBorder}]}>
      <View style={styles.navBar}>
        {tabs.map((tab) => {
          const isActive = activeTabId === tab.id;
          
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.navItem, {backgroundColor: colors.inputBorder}]}
              onPress={() => changeTab(tab)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, isActive && styles.activeCircle, {backgroundColor: colors.inputBorder}]}>
                <Ionicons 
                  name={isActive ? tab.activeIcon : tab.icon} 
                  size={26} 
                  color={isActive ? '#6200EE' : '#7D7D7D'} 
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
    height: "7%"
  },
  navBar: {
    flexDirection: 'row',
    height: 65,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  iconContainer: {
    padding: 8,
    borderRadius: 20,
  },
  activeCircle: {
    backgroundColor: '#F3E8FF', // Светлый фон при нажатии
  },
});

export default BottomAppBar;