import { useContext, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartContext } from '../context/CartContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.x.x:5000';

export default function AddressScreen({ route, navigation }) {
  const { checkoutData } = route.params;
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(false);
  const { clearCart } = useContext(CartContext);

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
        body: JSON.stringify({
          deliveryAddress: { street, city, pincode },
        }),
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

  return (
    <View style={{ flex: 1, backgroundColor: '#f7f3f3' }}>
      <ScrollView contentContainerStyle={{ paddingTop: 55, paddingHorizontal: 20, paddingBottom: 80 }}>
        <Text style={{ fontSize: 32, fontWeight: 'bold' }}>Delivery Address 📍</Text>
        <Text style={{ color: '#666', marginTop: 12, lineHeight: 24 }}>Enter your delivery address for fast doorstep delivery</Text>

        <View style={{ backgroundColor: '#ffffff', borderRadius: 20, padding: 18, marginTop: 28 }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Street / House No</Text>
          <TextInput
            placeholder="House no, street, landmark..."
            value={street}
            onChangeText={setStreet}
            multiline
            style={{ minHeight: 80, textAlignVertical: 'top', borderWidth: 1, borderColor: '#eee', borderRadius: 16, padding: 16, fontSize: 16 }}
          />

          <Text style={{ fontWeight: 'bold', marginBottom: 10, marginTop: 18 }}>City</Text>
          <TextInput
            placeholder="City"
            value={city}
            onChangeText={setCity}
            style={{ height: 54, borderWidth: 1, borderColor: '#eee', borderRadius: 16, paddingHorizontal: 16, fontSize: 16 }}
          />

          <Text style={{ fontWeight: 'bold', marginBottom: 10, marginTop: 18 }}>Pincode</Text>
          <TextInput
            placeholder="Pincode"
            value={pincode}
            onChangeText={setPincode}
            keyboardType="number-pad"
            maxLength={6}
            style={{ height: 54, borderWidth: 1, borderColor: '#eee', borderRadius: 16, paddingHorizontal: 16, fontSize: 16 }}
          />
        </View>

        <View style={{ backgroundColor: '#ffffff', borderRadius: 20, padding: 18, marginTop: 22 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 }}>
            <Text style={{ color: '#666', fontSize: 16 }}>Total Amount</Text>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>₹{checkoutData.total}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: '#666', fontSize: 16 }}>Payment Method</Text>
            <Text style={{ fontWeight: 'bold', color: '#A50021' }}>Cash on Delivery</Text>
          </View>
        </View>

        <TouchableOpacity
          disabled={loading}
          onPress={handlePlaceOrder}
          style={{ backgroundColor: loading ? '#d38c9c' : '#A50021', height: 58, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginTop: 30 }}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold' }}>Place Order</Text>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}