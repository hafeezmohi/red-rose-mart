import { useEffect, useState } from 'react';
import { Alert, Linking, ScrollView, Text, TouchableOpacity, View, StatusBar } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNav from '../components/BottomNav';
import { moderateScale, BOTTOM_NAV_HEIGHT } from '../utils/responsive';

const MenuItem = ({ label, onPress, isLast }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 17,
      borderBottomWidth: isLast ? 0 : 1,
      borderBottomColor: '#F0EAEA',
    }}
  >
    <Text style={{ fontSize: 15, color: '#1A1A1A', fontWeight: '500', letterSpacing: 0.1 }}>
      {label}
    </Text>
    <View style={{
      width: 28,
      height: 28,
      borderRadius: 8,
      backgroundColor: '#F7F0F0',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <Text style={{ color: '#A50021', fontSize: 14, fontWeight: '600' }}>›</Text>
    </View>
  </TouchableOpacity>
);

export default function ProfileScreen({ navigation, route }) {
  const [user, setUser] = useState(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadUser();
    const unsubscribe = navigation.addListener('focus', loadUser);
    return unsubscribe;
  }, [navigation]);

  const loadUser = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) setUser(JSON.parse(userStr));
    } catch (error) {
      // Error loading user
    }
  };

  const handleWhatsApp = async () => {
    const url = `https://wa.me/+918074559488?text=${encodeURIComponent('Hello Red Rose Online Grocery, I need support regarding my order.')}`;
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Error', 'WhatsApp is not installed on this device.');
    }
  };

  const handleLogout = async () => {
    Alert.alert('Confirm Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('user');
          navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
        },
      },
    ]);
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'RR';

  return (
    <SafeAreaView edges={["bottom"]} style={{ flex: 1, backgroundColor: '#F7F3F3' }}>
      <StatusBar barStyle="light-content" backgroundColor="#A50021" />

      {/* Header */}
      <View style={{
        backgroundColor: '#A50021',
        paddingTop: insets.top + 12,
        paddingBottom: 36,
        paddingHorizontal: 24,
        alignItems: 'center',
      }}>
        {/* Avatar */}
        <View style={{
          width: moderateScale(76),
          height: moderateScale(76),
          borderRadius: moderateScale(38),
          backgroundColor: 'rgba(255,255,255,0.18)',
          borderWidth: 2,
          borderColor: 'rgba(255,255,255,0.35)',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 14,
        }}>
          <Text style={{ fontSize: 28, color: '#fff', fontWeight: '700', letterSpacing: 1 }}>
            {initials}
          </Text>
        </View>

        <Text style={{ fontSize: 22, fontWeight: '700', color: '#fff', letterSpacing: 0.3 }}>
          {user?.name || 'Welcome Back'}
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 16 }}>
          {user?.phone && (
            <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>
              {user.phone}
            </Text>
          )}
          {user?.phone && user?.email && (
            <View style={{ width: 3, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.5)' }} />
          )}
          {user?.email && (
            <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>
              {user.email}
            </Text>
          )}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: BOTTOM_NAV_HEIGHT + insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Account Section */}
        <Text style={{
          fontSize: 11,
          fontWeight: '700',
          color: '#A50021',
          letterSpacing: 1.2,
          textTransform: 'uppercase',
          marginBottom: 10,
          marginLeft: 4,
        }}>
          Account
        </Text>

        <View style={{
          backgroundColor: '#fff',
          borderRadius: 16,
          paddingHorizontal: 18,
          marginBottom: 20,
          shadowColor: '#A50021',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 2,
        }}>
          <MenuItem
            label="My Orders"
            onPress={() => navigation.navigate('Orders')}
          />
          <MenuItem
            label="Wishlist"
            onPress={() => navigation.navigate('Wishlist')}
          />
        </View>

        {/* Support Section */}
        <Text style={{
          fontSize: 11,
          fontWeight: '700',
          color: '#A50021',
          letterSpacing: 1.2,
          textTransform: 'uppercase',
          marginBottom: 10,
          marginLeft: 4,
        }}>
          Support
        </Text>

        <View style={{
          backgroundColor: '#fff',
          borderRadius: 16,
          paddingHorizontal: 18,
          marginBottom: 28,
          shadowColor: '#A50021',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 2,
        }}>
          <MenuItem
            label="WhatsApp Support"
            onPress={handleWhatsApp}
            isLast
          />
        </View>

        {/* Logout */}
        <TouchableOpacity
          onPress={handleLogout}
          activeOpacity={0.85}
          style={{
            backgroundColor: '#A50021',
            height: 54,
            borderRadius: 14,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#A50021',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 10,
            elevation: 4,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 }}>
            Log Out
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomNav
  navigation={navigation}
  route={route}
/>
    </SafeAreaView>
  );
}