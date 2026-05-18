import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://192.168.x.x:5000';

export default function CompleteProfileScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!phone.trim()) {
      Alert.alert('Missing Phone Number', 'Please enter your phone number.');
      return;
    }

    try {
      setLoading(true);

      const token = await AsyncStorage.getItem('token');

      const res = await fetch(`${API_URL}/api/auth/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          phone,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        Alert.alert('Error', data.message || 'Something went wrong');
        return;
      }

      await AsyncStorage.setItem('user', JSON.stringify(data.user));

      navigation.replace('Home');
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Failed to complete profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{
        flex: 1,
        backgroundColor: '#A50021',
      }}
    >
      <View
        style={{
          flex: 1,
          paddingHorizontal: 28,
          paddingTop: 90,
          paddingBottom: 40,
        }}
      >
        {/* Header */}
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 70 }}>🌹</Text>

          <Text
            style={{
              color: '#ffffff',
              fontSize: 34,
              fontWeight: 'bold',
              marginTop: 18,
            }}
          >
            Complete Profile
          </Text>

          <Text
            style={{
              color: '#ffffffcc',
              fontSize: 17,
              textAlign: 'center',
              marginTop: 16,
              lineHeight: 28,
              paddingHorizontal: 10,
            }}
          >
            Add your phone number{"\n"}to continue shopping.
          </Text>
        </View>

        {/* Card */}
        <View
          style={{
            marginTop: 55,
            backgroundColor: '#ffffff',
            borderRadius: 28,
            padding: 24,
          }}
        >
          <Text
            style={{
              color: '#A50021',
              fontSize: 16,
              fontWeight: '600',
              marginBottom: 12,
            }}
          >
            Phone Number
          </Text>

          <TextInput
            placeholder="+91 9876543210"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            style={{
              height: 62,
              borderWidth: 1,
              borderColor: '#eee',
              borderRadius: 18,
              paddingHorizontal: 18,
              fontSize: 18,
              color: '#111',
              backgroundColor: '#fafafa',
            }}
          />

          <TouchableOpacity
            onPress={handleContinue}
            disabled={loading}
            style={{
              backgroundColor: '#A50021',
              height: 62,
              borderRadius: 18,
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 26,
            }}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text
                style={{
                  color: '#ffffff',
                  fontSize: 20,
                  fontWeight: 'bold',
                }}
              >
                Continue
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Text
            style={{
              color: '#ffffff99',
              textAlign: 'center',
              fontSize: 14,
            }}
          >
            Your information is securely encrypted 🔒
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}