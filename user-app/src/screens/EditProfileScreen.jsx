import { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.x.x:5000';

export default function EditProfileScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userStr = await AsyncStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setPhone(user.phone || '');
    }
  };

  const handleSave = async () => {
    if (!phone.trim()) {
      Alert.alert('Enter Phone', 'Please enter your phone number');
      return;
    }
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/auth/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!data.success) { Alert.alert('Error', data.message); return; }
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      Alert.alert('Profile Updated 🎉');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f7f3f3' }}>
      <ScrollView contentContainerStyle={{ paddingTop: 55, paddingHorizontal: 20, paddingBottom: 80 }}>
        <Text style={{ fontSize: 32, fontWeight: 'bold' }}>Edit Profile 👤</Text>
        <Text style={{ color: '#666', marginTop: 10 }}>Update your account details</Text>

        <View style={{ backgroundColor: '#ffffff', borderRadius: 22, padding: 20, marginTop: 30 }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Phone Number</Text>
          <TextInput
            placeholder="Enter phone number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            style={{ borderWidth: 1, borderColor: '#eee', borderRadius: 14, paddingHorizontal: 16, height: 54 }}
          />
        </View>

        <TouchableOpacity
          disabled={loading}
          onPress={handleSave}
          style={{ backgroundColor: loading ? '#d38c9c' : '#A50021', height: 58, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginTop: 34 }}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold' }}>Save Changes</Text>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}