import { useContext, useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { CartContext } from '../context/CartContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://red-rose-backend.onrender.com/';

export default function AddressScreen({ route, navigation }) {
  const { checkoutData } = route.params;
  const [savedAddress, setSavedAddress] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [detectedAddress, setDetectedAddress] = useState(null);
  const [addressLoading, setAddressLoading] = useState(true);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [loading, setLoading] = useState(false);
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
          const { street, city, pincode, coordinates } = data.user.address;
          const addr = { street, city, pincode, coordinates };
          setSavedAddress(addr);
          setSelectedAddress(addr); // pre-select saved address
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
        Alert.alert('Permission Denied', 'Allow location access to detect your address.');
        return;
      }

      // Get precise GPS coordinates
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = location.coords;

      // Reverse geocode to get human-readable address
      const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });

      if (place) {
        const addr = {
          street: [place.streetNumber, place.street, place.district].filter(Boolean).join(', '),
          city: place.city || place.subregion || '',
          pincode: place.postalCode || '',
          // Save exact GPS pinpoint with the order
          coordinates: { lat: latitude, lng: longitude },
        };
        setDetectedAddress(addr);
        setSelectedAddress(addr);
      }
    } catch (err) {
      Alert.alert('Error', 'Could not detect location. Please try again.');
    } finally {
      setDetectingLocation(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      Alert.alert('No Address', 'Please select or detect a delivery address.');
      return;
    }
    if (!selectedAddress.street || !selectedAddress.city || !selectedAddress.pincode) {
      Alert.alert('Incomplete Address', 'The selected address is incomplete. Please detect location again.');
      return;
    }
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        // selectedAddress includes coordinates: { lat, lng } for pinpoint delivery
        body: JSON.stringify({ deliveryAddress: selectedAddress }),
      });
      const data = await res.json();
      if (!data.success) { Alert.alert('Error', data.message); return; }
      clearCart();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Success', params: { order: data.order } }],
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to place order. Please try again.');
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

  const isSelected = (addr) =>
    addr &&
    selectedAddress &&
    addr.street === selectedAddress.street &&
    addr.city === selectedAddress.city &&
    addr.pincode === selectedAddress.pincode;

  return (
    <SafeAreaView edges={["bottom"]} style={{ flex: 1, backgroundColor: '#f7f3f3' }}>
      <ScrollView contentContainerStyle={{ paddingTop: 55, paddingHorizontal: 20, paddingBottom: 100 }}>

        <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#1a1a1a' }}>Delivery Address 📍</Text>
        <Text style={{ color: '#888', marginTop: 8, fontSize: 14, lineHeight: 22 }}>
          Choose where you'd like your order delivered.
        </Text>

        <Text style={{ fontWeight: '700', fontSize: 15, color: '#333', marginTop: 28, marginBottom: 12 }}>
          Choose Address
        </Text>

        {/* Saved address card */}
        {savedAddress ? (
          <TouchableOpacity
            onPress={() => setSelectedAddress(savedAddress)}
            activeOpacity={0.85}
            style={{
              backgroundColor: '#fff',
              borderRadius: 18,
              padding: 18,
              marginBottom: 12,
              borderWidth: 2,
              borderColor: isSelected(savedAddress) ? '#A50021' : '#eee',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <View style={{
                width: 40, height: 40, borderRadius: 20,
                backgroundColor: isSelected(savedAddress) ? '#ffeef1' : '#f5f5f5',
                justifyContent: 'center', alignItems: 'center',
                marginRight: 14,
              }}>
                <Text style={{ fontSize: 18 }}>🏠</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontWeight: '700', fontSize: 15, color: '#1a1a1a' }}>Saved Address</Text>
                  {isSelected(savedAddress) && (
                    <View style={{ backgroundColor: '#A50021', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 }}>
                      <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>✓ Selected</Text>
                    </View>
                  )}
                </View>
                <Text style={{ color: '#666', fontSize: 13, marginTop: 6, lineHeight: 20 }}>
                  {savedAddress.street}
                </Text>
                <Text style={{ color: '#666', fontSize: 13 }}>
                  {savedAddress.city} - {savedAddress.pincode}
                </Text>
                {/* Show pinpoint indicator if coordinates exist */}
                {savedAddress.coordinates?.lat && (
                  <Text style={{ color: '#aaa', fontSize: 11, marginTop: 4 }}>
                    📌 {savedAddress.coordinates.lat.toFixed(5)}, {savedAddress.coordinates.lng.toFixed(5)}
                  </Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={{ backgroundColor: '#fff', borderRadius: 18, padding: 18, marginBottom: 12, alignItems: 'center' }}>
            <Text style={{ fontSize: 30, marginBottom: 8 }}>🏠</Text>
            <Text style={{ color: '#999', fontSize: 14 }}>No saved address found</Text>
          </View>
        )}

        {/* Detect current location card */}
        <TouchableOpacity
          onPress={handleDetectLocation}
          disabled={detectingLocation}
          activeOpacity={0.85}
          style={{
            backgroundColor: '#fff',
            borderRadius: 18,
            padding: 18,
            marginBottom: 12,
            borderWidth: 2,
            borderColor: detectedAddress && isSelected(detectedAddress) ? '#A50021' : '#eee',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{
              width: 40, height: 40, borderRadius: 20,
              backgroundColor: detectedAddress && isSelected(detectedAddress) ? '#ffeef1' : '#f5f5f5',
              justifyContent: 'center', alignItems: 'center',
              marginRight: 14,
            }}>
              {detectingLocation
                ? <ActivityIndicator size="small" color="#A50021" />
                : <Text style={{ fontSize: 18 }}>📡</Text>
              }
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontWeight: '700', fontSize: 15, color: '#A50021' }}>
                  {detectingLocation ? 'Detecting...' : 'Use Current Location'}
                </Text>
                {detectedAddress && isSelected(detectedAddress) && (
                  <View style={{ backgroundColor: '#A50021', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 }}>
                    <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>✓ Selected</Text>
                  </View>
                )}
              </View>
              {detectedAddress ? (
                <>
                  <Text style={{ color: '#666', fontSize: 13, marginTop: 6, lineHeight: 20 }}>
                    {detectedAddress.street}
                  </Text>
                  <Text style={{ color: '#666', fontSize: 13 }}>
                    {detectedAddress.city} - {detectedAddress.pincode}
                  </Text>
                  {/* Show exact GPS coordinates as pinpoint confirmation */}
                  <Text style={{ color: '#aaa', fontSize: 11, marginTop: 4 }}>
                    📌 {detectedAddress.coordinates.lat.toFixed(5)}, {detectedAddress.coordinates.lng.toFixed(5)}
                  </Text>
                </>
              ) : (
                <Text style={{ color: '#aaa', fontSize: 13, marginTop: 4 }}>
                  Tap to detect your exact location
                </Text>
              )}
            </View>
          </View>
        </TouchableOpacity>

        {/* Order summary */}
        <Text style={{ fontWeight: '700', fontSize: 15, color: '#333', marginTop: 20, marginBottom: 12 }}>
          Order Summary
        </Text>
        <View style={{
          backgroundColor: '#fff',
          borderRadius: 18,
          padding: 18,
          borderWidth: 1,
          borderColor: '#f0e5e5',
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ color: '#666', fontSize: 15 }}>Total Amount</Text>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1a1a1a' }}>₹{checkoutData.total}</Text>
          </View>
          <View style={{ height: 1, backgroundColor: '#f5f5f5', marginBottom: 12 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: '#666', fontSize: 15 }}>Payment</Text>
            <Text style={{ fontWeight: 'bold', color: '#A50021' }}>Cash on Delivery</Text>
          </View>
        </View>

      </ScrollView>

      {/* Sticky place order button */}
      <View style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: '#f7f3f3',
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 28,
        borderTopWidth: 1,
        borderTopColor: '#f0e5e5',
      }}>
        <TouchableOpacity
          disabled={loading || !selectedAddress}
          onPress={handlePlaceOrder}
          style={{
            backgroundColor: !selectedAddress ? '#ccc' : loading ? '#d38c9c' : '#A50021',
            height: 58,
            borderRadius: 18,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>
                {selectedAddress ? 'Place Order' : 'Select an Address'}
              </Text>
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}