import { useEffect, useState } from 'react';
import { Alert, Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNav from '../components/BottomNav';

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);

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
      console.log(error);
    }
  };

  const handleWhatsApp = async () => {
    const url = `https://wa.me/919381901949?text=${encodeURIComponent('Hello Red Rose Mart, I need support regarding my order.')}`;
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Error', 'WhatsApp not installed');
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        onPress: async () => {
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('user');
          navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f7f3f3' }}>
      <ScrollView contentContainerStyle={{ paddingTop: 55, paddingHorizontal: 20, paddingBottom: 140 }}>
        <View style={{ alignItems: 'center' }}>
          <View style={{ width: 110, height: 110, borderRadius: 55, backgroundColor: '#A50021', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 44, color: '#ffffff', fontWeight: 'bold' }}>👤</Text>
          </View>
          <Text style={{ fontSize: 28, fontWeight: 'bold', marginTop: 20 }}>{user?.name || 'Welcome Back'}</Text>
          <Text style={{ color: '#666', marginTop: 8 }}>{user?.phone || 'Red Rose Mart Customer'}</Text>
          {user?.email && <Text style={{ color: '#888', marginTop: 6 }}>{user.email}</Text>}
        </View>

        <View style={{ backgroundColor: '#ffffff', borderRadius: 22, padding: 20, marginTop: 34 }}>
          {[
            { label: '✏️ Edit Profile', screen: 'EditProfile', params: undefined },
            { label: '📦 My Orders', screen: 'Orders', params: undefined },
            { label: '❤️ Wishlist', screen: 'Wishlist', params: undefined },
            { label: '📍 Saved Address', screen: 'Address', params: { checkoutData: { cartItems: [], total: 0 } } },
          ].map((item, i, arr) => (
            <TouchableOpacity
              key={item.label}
              onPress={() => navigation.navigate(item.screen, item.params)}
              style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18, borderBottomWidth: i < arr.length - 1 ? 1 : 0, borderBottomColor: '#f3e5e5' }}
            >
              <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{item.label}</Text>
              <Text style={{ fontSize: 18 }}>→</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity onPress={handleWhatsApp} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>☎️ WhatsApp Support</Text>
            <Text style={{ fontSize: 18 }}>→</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleLogout} style={{ backgroundColor: '#A50021', height: 58, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginTop: 34 }}>
          <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold' }}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
      <BottomNav navigation={navigation} />
    </View>
  );
}