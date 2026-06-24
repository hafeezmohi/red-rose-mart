import { useEffect, useState } from 'react';
import { Alert, Linking, ScrollView, Text, TouchableOpacity, View, StatusBar, Modal, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editPhone, setEditPhone] = useState('');
  const [isUpdatingPhone, setIsUpdatingPhone] = useState(false);
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

  const handleUpdatePhone = async () => {
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(editPhone)) {
      Alert.alert("Invalid Phone", "Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    try {
      setIsUpdatingPhone(true);
      const token = await AsyncStorage.getItem('token');
      const API_URL = process.env.EXPO_PUBLIC_API_URL || "https://red-rose-backend.onrender.com/";
      
      const res = await fetch(`${API_URL}/api/auth/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ phone: editPhone }),
      });

      const data = await res.json();
      if (!data.success) {
        Alert.alert("Error", data.message || "Failed to update phone number");
        return;
      }

      const updatedUser = { ...user, phone: editPhone, isProfileComplete: true };
      setUser(updatedUser);
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      setEditModalVisible(false);
      Alert.alert("Success", "Phone number updated successfully");
    } catch (error) {
      Alert.alert("Error", "Something went wrong while updating");
    } finally {
      setIsUpdatingPhone(false);
    }
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
          <TouchableOpacity 
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4 }} 
            onPress={() => {
              setEditPhone(user?.phone || '');
              setEditModalVisible(true);
            }}
          >
            <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>
              {user?.phone || 'Add Phone'}
            </Text>
            <Ionicons name="pencil" size={12} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
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

      {/* Edit Phone Modal */}
      <Modal visible={isEditModalVisible} animationType="fade" transparent={true} onRequestClose={() => setEditModalVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 16 }}>Edit Phone Number</Text>
            
            <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#d9d9d9", borderRadius: 16, backgroundColor: "#fafafa", height: moderateScale(54), marginBottom: 24 }}>
              <View style={{ paddingHorizontal: 16, borderRightWidth: 1, borderRightColor: "#d9d9d9", height: "100%", justifyContent: "center" }}>
                <Text style={{ fontSize: 16, color: "#1a1a1a", fontWeight: "600" }}>+91</Text>
              </View>
              <TextInput
                placeholder="9876543210"
                placeholderTextColor="#bcbcbc"
                keyboardType="phone-pad"
                maxLength={10}
                value={editPhone}
                onChangeText={setEditPhone}
                style={{
                  flex: 1,
                  color: "#1a1a1a",
                  height: "100%",
                  paddingHorizontal: 16,
                  fontSize: 16,
                }}
              />
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#f5f5f5', alignItems: 'center' }}
                onPress={() => setEditModalVisible(false)}
                disabled={isUpdatingPhone}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#666' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#A50021', alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}
                onPress={handleUpdatePhone}
                disabled={isUpdatingPhone}
              >
                {isUpdatingPhone ? <ActivityIndicator size="small" color="#fff" /> : <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>Save</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}