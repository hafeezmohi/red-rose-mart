import { Text, TouchableOpacity, View } from 'react-native';

export default function SuccessScreen({ route, navigation }) {
  const order = route.params?.order;

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
      <View style={{ width: 130, height: 130, borderRadius: 40, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 70 }}>✅</Text>
      </View>

      <Text style={{ fontSize: 34, fontWeight: 'bold', marginTop: 35, textAlign: 'center' }}>Order Placed!</Text>
      <Text style={{ color: '#666', fontSize: 18, textAlign: 'center', lineHeight: 30, marginTop: 18 }}>
        Your order has been placed successfully and is now being prepared for delivery.
      </Text>

      <View style={{ backgroundColor: '#ffffff', borderRadius: 30, padding: 24, width: '100%', marginTop: 35 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 }}>
          <Text style={{ color: '#777', fontSize: 16 }}>Order ID</Text>
          <Text style={{ fontWeight: 'bold', fontSize: 16 }}>#{order?._id?.slice(-6).toUpperCase() || 'RRM001'}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 }}>
          <Text style={{ color: '#777', fontSize: 16 }}>Total</Text>
          <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#A50021' }}>₹{order?.totalPrice || 0}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 }}>
          <Text style={{ color: '#777', fontSize: 16 }}>Estimated Delivery</Text>
          <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#A50021' }}>10 Minutes ⚡</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: '#777', fontSize: 16 }}>Payment</Text>
          <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#2E7D32' }}>Cash on Delivery</Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => navigation.navigate('Orders')}
        style={{ backgroundColor: '#A50021', width: '100%', padding: 20, borderRadius: 24, alignItems: 'center', marginTop: 35 }}
      >
        <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold' }}>Track Order</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Home' }] })}
        style={{ width: '100%', padding: 20, borderRadius: 24, alignItems: 'center', marginTop: 16, backgroundColor: '#ffffff' }}
      >
        <Text style={{ color: '#A50021', fontSize: 18, fontWeight: 'bold' }}>Continue Shopping</Text>
      </TouchableOpacity>
    </View>
  );
}