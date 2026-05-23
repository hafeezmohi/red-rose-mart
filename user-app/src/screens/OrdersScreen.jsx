import { useEffect, useState, useCallback } from 'react';
import { ScrollView, Text, TouchableOpacity, View, ActivityIndicator, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNav from '../components/BottomNav';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.x.x:5000';

const STATUS_CONFIG = {
  placed:           { label: 'Pending', color: '#f59e0b', bg: '#fefce8' },
  out_for_delivery: { label: 'Out for Delivery', color: '#3b82f6', bg: '#eff6ff' },
  delivered:        { label: 'Delivered', color: '#22c55e', bg: '#f0fdf4' },
  cancelled:        { label: 'Cancelled', color: '#ef4444', bg: '#fef2f2' },
};

export default function OrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

        {orders.map(order => {
          const status = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.placed;
          const itemSummary = order.items
            .slice(0, 2)
            .map(i => i.name)
            .join(', ') + (order.items.length > 2 ? ` +${order.items.length - 2} more` : '');

          return (
            <TouchableOpacity
              activeOpacity={0.85}
              key={order._id}
              onPress={() => navigation.navigate('OrderDetail', { order })}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 20,
                padding: 18,
                marginBottom: 14,
              }}
            >
              {/* Header row */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
                  #{order._id.slice(-6).toUpperCase()}
                </Text>
                <View style={{ backgroundColor: status.bg, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 }}>
                  <Text style={{ color: status.color, fontWeight: 'bold', fontSize: 13 }}>
                    {status.emoji} {status.label}
                  </Text>
                </View>
              </View>

              {/* Item preview */}
              <Text
                numberOfLines={1}
                style={{ color: '#555', marginTop: 8, fontSize: 13 }}
              >
                {itemSummary}
              </Text>

              {/* Footer row */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                <View>
                  <Text style={{ fontSize: 17, fontWeight: 'bold', color: '#A50021' }}>₹{order.totalPrice}</Text>
                  <Text style={{ color: '#999', marginTop: 2, fontSize: 12 }}>
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ color: '#A50021', fontWeight: '600', fontSize: 13 }}>View Details</Text>
                  <Text style={{ color: '#A50021', marginLeft: 4 }}>›</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <BottomNav navigation={navigation} />
    </View>
  );
}