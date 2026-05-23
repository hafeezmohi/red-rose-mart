import { useContext, useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { CartContext } from '../context/CartContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.x.x:5000';

const InputField = ({ label, value, onChangeText, placeholder, multiline, keyboardType, maxLength }) => (
  <View style={{ marginBottom: 16 }}>
    <Text style={{ fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 8, marginLeft: 4 }}>
      {label}
    </Text>
    <TextInput
      placeholder={placeholder}
      placeholderTextColor="#bbb"
      value={value}
      onChangeText={onChangeText}
      multiline={multiline}
      keyboardType={keyboardType}
      maxLength={maxLength}
      style={{
        backgroundColor: '#fff',
        borderWidth: 1.5,
        borderColor: '#e8e8e8',
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: multiline ? 14 : 0,
        height: multiline ? 90 : 52,
        fontSize: 15,
        color: '#222',
        textAlignVertical: multiline ? 'top' : 'center',
      }}
    />
  </View>
);

export default function AddressScreen({ route, navigation }) {
  const { checkoutData } = route.params;
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(false);
  const [addressLoading, setAddressLoading] = useState(true);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const { clearCart } = useContext(CartContext);

  useEffect(() => {
    const fetchSavedAddress = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success && data.user?.address) {
          const { street, city, pincode } = data.user.address;
          if (street) setStreet(street);
          if (city) setCity(city);
          if (pincode) setPincode(pincode);
        }
      } catch (err) {
        console.error('Failed to fetch saved address:', err);
      } finally {
        setAddressLoading(false);
      }
    };
    fetchSavedAddress();
  }, []);

  const handleDetectLocation = async () => {
    try {
      setDetectingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Allow location access to auto-fill your address.');
        return;
      }
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = location.coords;
      const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (place) {
        const detectedStreet = [place.streetNumber, place.street, place.district].filter(Boolean).join(', ');
        setStreet(detectedStreet || '');
        setCity(place.city || place.subregion || '');
        setPincode(place.postalCode || '');
      }
    } catch (err) {
      Alert.alert('Error', 'Could not detect location. Please enter manually.');
    } finally {
      setDetectingLocation(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!street.trim() || !city.trim() || !pincode.trim()) {
      Alert.alert('Missing Details', 'Please fill all address fields');
      return;
    }
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ deliveryAddress: { street, city, pincode } }),
      });
      const data = await res.json();
      if (!data.success) { Alert.alert('Error', data.message); return; }
      clearCart();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Success', params: { order: data.order } }],
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (addressLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f7f3f3' }}>
        <ActivityIndicator size="large" color="#A50021" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f7f3f3' }}>
      <ScrollView contentContainerStyle={{ paddingTop: 55, paddingHorizontal: 20, paddingBottom: 80 }}>

        <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#1a1a1a' }}>Delivery Address 📍</Text>
        <Text style={{ color: '#888', marginTop: 8, fontSize: 14, lineHeight: 22 }}>
          We've pre-filled your saved address. Edit or use current location.
        </Text>

        {/* Detect location button */}
        <TouchableOpacity
          onPress={handleDetectLocation}
          disabled={detectingLocation}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fff5f7',
            borderRadius: 14,
            paddingVertical: 14,
            marginTop: 20,
            marginBottom: 8,
            borderWidth: 1.5,
            borderColor: '#A50021',
            gap: 8,
          }}
        >
          {detectingLocation
            ? <ActivityIndicator size="small" color="#A50021" />
            : <Text style={{ fontSize: 16 }}>📡</Text>
          }
          <Text style={{ color: '#A50021', fontWeight: '700', fontSize: 15 }}>
            {detectingLocation ? 'Detecting Location...' : 'Use Current Location'}
          </Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 16 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: '#e5e5e5' }} />
          <Text style={{ color: '#aaa', marginHorizontal: 12, fontSize: 13 }}>or enter manually</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: '#e5e5e5' }} />
        </View>

        {/* Input fields */}
        <InputField
          label="Street / House No"
          placeholder="House no, street, landmark..."
          value={street}
          onChangeText={setStreet}
          multiline
        />
        <InputField
          label="City"
          placeholder="City"
          value={city}
          onChangeText={setCity}
        />
        <InputField
          label="Pincode"
          placeholder="6-digit pincode"
          value={pincode}
          onChangeText={setPincode}
          keyboardType="number-pad"
          maxLength={6}
        />

        {/* Order summary */}
        <View style={{
          backgroundColor: '#ffffff',
          borderRadius: 20,
          padding: 18,
          marginTop: 8,
          borderWidth: 1,
          borderColor: '#f0e5e5',
        }}>
          <Text style={{ fontWeight: 'bold', fontSize: 15, color: '#333', marginBottom: 14 }}>
            Order Summary
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
            <Text style={{ color: '#666', fontSize: 15 }}>Total Amount</Text>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1a1a1a' }}>₹{checkoutData.total}</Text>
          </View>
          <View style={{ height: 1, backgroundColor: '#f5f5f5', marginBottom: 10 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: '#666', fontSize: 15 }}>Payment</Text>
            <Text style={{ fontWeight: 'bold', color: '#A50021' }}>💵 Cash on Delivery</Text>
          </View>
        </View>

        {/* Place order button */}
        <TouchableOpacity
          disabled={loading}
          onPress={handlePlaceOrder}
          style={{
            backgroundColor: loading ? '#d38c9c' : '#A50021',
            height: 58,
            borderRadius: 18,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 24,
          }}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold' }}>Place Order 🛒</Text>
          }
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}