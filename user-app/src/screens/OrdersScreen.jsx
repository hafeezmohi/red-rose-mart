import { useEffect, useState, useCallback } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View, ActivityIndicator, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNav from '../components/BottomNav';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.x.x:5000';

const STATUS_STEPS = ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];
const STATUS_EMOJI = { placed: '✅', confirmed: '✅', preparing: '📦', out_for_delivery: '🛵', delivered: '🎉' };
const STATUS_LABEL = { placed: 'Order Placed', confirmed: 'Confirmed', preparing: 'Preparing', out_for_delivery: 'Out For Delivery', delivered: 'Delivered' };

export default function OrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/orders/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setOrders(data.orders);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const unsubscribe = navigation.addListener('focus', fetchOrders);
    return unsubscribe;
  }, [navigation]);

  const onRefresh = () => { setRefreshing(true); fetchOrders(); };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f7f3f3' }}>
        <ActivityIndicator size="large" color="#A50021" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f7f3f3' }}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#A50021']} />}
        contentContainerStyle={{ paddingTop: 55, paddingHorizontal: 18, paddingBottom: 140 }}
      >
        <Text style={{ fontSize: 30, fontWeight: 'bold', marginBottom: 24 }}>My Orders 📦</Text>

        {orders.length === 0 && (
          <View style={{ marginTop: 120, alignItems: 'center' }}>
            <Text style={{ fontSize: 70 }}>📦</Text>
            <Text style={{ fontSize: 24, fontWeight: 'bold', marginTop: 20 }}>No Orders Yet</Text>
            <Text style={{ color: '#666', marginTop: 10 }}>Your placed orders will appear here</Text>
          </View>
        )}

        {orders.map(order => (
          <TouchableOpacity
            activeOpacity={0.9}
            key={order._id}
            onPress={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
            style={{ backgroundColor: '#ffffff', borderRadius: 20, padding: 18, marginBottom: 18 }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
                #{order._id.slice(-6).toUpperCase()}
              </Text>
              <Text style={{ color: '#A50021', fontWeight: 'bold', textTransform: 'capitalize' }}>
                {order.orderStatus.replace('_', ' ')}
              </Text>
            </View>

            <Text style={{ color: '#666', marginTop: 10 }}>{order.items.length} items</Text>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 12, color: '#A50021' }}>₹{order.totalPrice}</Text>

            {/* Order Tracking */}
            <View style={{ backgroundColor: '#fff5f5', borderRadius: 14, padding: 16, marginTop: 18 }}>
              <Text style={{ color: '#A50021', fontWeight: 'bold', fontSize: 16, marginBottom: 18 }}>Live Order Tracking</Text>
              {STATUS_STEPS.map((step, i) => {
                const currentIndex = STATUS_STEPS.indexOf(order.orderStatus);
                const isDone = i <= currentIndex;
                return (
                  <View key={step} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                    <Text style={{ fontSize: 18 }}>{STATUS_EMOJI[step]}</Text>
                    <Text style={{ marginLeft: 12, fontWeight: isDone ? 'bold' : 'normal', color: isDone ? '#111' : '#999' }}>
                      {STATUS_LABEL[step]}
                    </Text>
                  </View>
                );
              })}
            </View>

            <Text style={{ color: '#666', marginTop: 14 }}>
              {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </Text>

            <View style={{ marginTop: 18, alignItems: 'center' }}>
              <Text style={{ color: '#A50021', fontWeight: 'bold' }}>
                {expandedOrder === order._id ? 'Hide Details ▲' : 'View Details ▼'}
              </Text>
            </View>

            {expandedOrder === order._id && (
              <View style={{ marginTop: 22, borderTopWidth: 1, borderTopColor: '#f0e5e5', paddingTop: 18 }}>
                {order.items.map((item, i) => (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                    {item.image ? (
                      <Image source={{ uri: item.image }} style={{ width: 58, height: 58, borderRadius: 14 }} />
                    ) : (
                      <View style={{ width: 58, height: 58, borderRadius: 14, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontSize: 24 }}>🛍️</Text>
                      </View>
                    )}
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text numberOfLines={1} style={{ fontWeight: 'bold', fontSize: 15 }}>{item.name}</Text>
                      <Text style={{ color: '#666', marginTop: 6 }}>Qty: {item.quantity}</Text>
                    </View>
                    <Text style={{ fontWeight: 'bold', color: '#A50021', fontSize: 16 }}>₹{item.price * item.quantity}</Text>
                  </View>
                ))}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                  <Text style={{ color: '#666' }}>Delivery Address</Text>
                  <Text style={{ fontWeight: 'bold', flex: 1, textAlign: 'right', marginLeft: 8 }}>
                    {order.deliveryAddress?.street}, {order.deliveryAddress?.city}
                  </Text>
                </View>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
      <BottomNav navigation={navigation} />
    </View>
  );
}