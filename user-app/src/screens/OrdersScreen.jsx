import { useEffect, useState, useCallback } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View, ActivityIndicator, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNav from '../components/BottomNav';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.x.x:5000';

const STATUS_CONFIG = {
  placed:           { label: 'Pending',         emoji: '🕐', color: '#f59e0b', bg: '#fefce8' },
  confirmed:        { label: 'Pending',         emoji: '🕐', color: '#f59e0b', bg: '#fefce8' },
  preparing:        { label: 'Pending',         emoji: '🕐', color: '#f59e0b', bg: '#fefce8' },
  out_for_delivery: { label: 'Out for Delivery', emoji: '🛵', color: '#3b82f6', bg: '#eff6ff' },
  delivered:        { label: 'Delivered',        emoji: '✅', color: '#22c55e', bg: '#f0fdf4' },
  cancelled:        { label: 'Cancelled',        emoji: '❌', color: '#ef4444', bg: '#fef2f2' },
};

const TRACKING_STEPS = [
  { key: 'pending',          label: 'Order Placed',      emoji: '📋' },
  { key: 'out_for_delivery', label: 'Out for Delivery',  emoji: '🛵' },
  { key: 'delivered',        label: 'Delivered',         emoji: '🎉' },
];

const getStepIndex = (status) => {
  if (['placed', 'confirmed', 'preparing'].includes(status)) return 0;
  if (status === 'out_for_delivery') return 1;
  if (status === 'delivered') return 2;
  return 0;
};

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

        {orders.map(order => {
          const status = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.placed;
          const currentStep = getStepIndex(order.orderStatus);
          const isExpanded = expandedOrder === order._id;
          const isCancelled = order.orderStatus === 'cancelled';

          return (
            <TouchableOpacity
              activeOpacity={0.9}
              key={order._id}
              onPress={() => setExpandedOrder(isExpanded ? null : order._id)}
              style={{ backgroundColor: '#ffffff', borderRadius: 20, padding: 18, marginBottom: 18 }}
            >
              {/* Order Header */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
                  #{order._id.slice(-6).toUpperCase()}
                </Text>
                <View style={{ backgroundColor: status.bg, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 }}>
                  <Text style={{ color: status.color, fontWeight: 'bold', fontSize: 13 }}>
                    {status.emoji} {status.label}
                  </Text>
                </View>
              </View>

              {/* Order Info */}
              <Text style={{ color: '#666', marginTop: 10 }}>{order.items.length} item{order.items.length > 1 ? 's' : ''}</Text>
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 6, color: '#A50021' }}>₹{order.totalPrice}</Text>
              <Text style={{ color: '#999', marginTop: 4, fontSize: 13 }}>
                {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </Text>

              {/* Tracking Steps — hide if cancelled */}
              {!isCancelled && (
                <View style={{ marginTop: 18, backgroundColor: '#fafafa', borderRadius: 14, padding: 16 }}>
                  <Text style={{ fontWeight: 'bold', marginBottom: 16, color: '#333' }}>Order Tracking</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    {TRACKING_STEPS.map((step, i) => {
                      const isDone = i <= currentStep;
                      const isActive = i === currentStep;
                      return (
                        <View key={step.key} style={{ flex: 1, alignItems: 'center' }}>
                          {/* Line before */}
                          <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                            {i > 0 && (
                              <View style={{
                                flex: 1,
                                height: 3,
                                backgroundColor: i <= currentStep ? '#A50021' : '#e0e0e0',
                                marginBottom: 8,
                              }} />
                            )}
                            <View style={{
                              width: 36,
                              height: 36,
                              borderRadius: 18,
                              backgroundColor: isDone ? '#A50021' : '#e0e0e0',
                              justifyContent: 'center',
                              alignItems: 'center',
                              borderWidth: isActive ? 3 : 0,
                              borderColor: '#ff6b6b',
                            }}>
                              <Text style={{ fontSize: 16 }}>{step.emoji}</Text>
                            </View>
                            {i < TRACKING_STEPS.length - 1 && (
                              <View style={{
                                flex: 1,
                                height: 3,
                                backgroundColor: i < currentStep ? '#A50021' : '#e0e0e0',
                                marginBottom: 8,
                              }} />
                            )}
                          </View>
                          <Text style={{
                            fontSize: 11,
                            marginTop: 6,
                            textAlign: 'center',
                            color: isDone ? '#A50021' : '#999',
                            fontWeight: isDone ? 'bold' : 'normal',
                          }}>
                            {step.label}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Cancelled reason */}
              {isCancelled && (
                <View style={{ marginTop: 14, backgroundColor: '#fef2f2', borderRadius: 12, padding: 12 }}>
                  <Text style={{ color: '#ef4444', fontWeight: 'bold' }}>❌ Order Cancelled</Text>
                  {order.cancellationReason && (
                    <Text style={{ color: '#666', marginTop: 4, fontSize: 13 }}>{order.cancellationReason}</Text>
                  )}
                </View>
              )}

              {/* Expand toggle */}
              <View style={{ marginTop: 14, alignItems: 'center' }}>
                <Text style={{ color: '#A50021', fontWeight: 'bold' }}>
                  {isExpanded ? 'Hide Details ▲' : 'View Details ▼'}
                </Text>
              </View>

              {/* Expanded Details */}
              {isExpanded && (
                <View style={{ marginTop: 16, borderTopWidth: 1, borderTopColor: '#f0e5e5', paddingTop: 16 }}>
                  {order.items.map((item, i) => (
                    <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
                      {item.image ? (
                        <Image source={{ uri: item.image }} style={{ width: 54, height: 54, borderRadius: 12 }} />
                      ) : (
                        <View style={{ width: 54, height: 54, borderRadius: 12, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center' }}>
                          <Text style={{ fontSize: 22 }}>🛍️</Text>
                        </View>
                      )}
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text numberOfLines={1} style={{ fontWeight: 'bold', fontSize: 14 }}>{item.name}</Text>
                        <Text style={{ color: '#666', marginTop: 4, fontSize: 13 }}>Qty: {item.quantity}</Text>
                      </View>
                      <Text style={{ fontWeight: 'bold', color: '#A50021' }}>₹{item.price * item.quantity}</Text>
                    </View>
                  ))}

                  {/* Bill summary */}
                  <View style={{ backgroundColor: '#fafafa', borderRadius: 12, padding: 14, marginTop: 8 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text style={{ color: '#666' }}>Items Total</Text>
                      <Text>₹{order.itemsPrice}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text style={{ color: '#666' }}>Delivery Fee</Text>
                      <Text>₹{order.deliveryFee}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ fontWeight: 'bold' }}>Total</Text>
                      <Text style={{ fontWeight: 'bold', color: '#A50021' }}>₹{order.totalPrice}</Text>
                    </View>
                  </View>

                  {/* Delivery Address */}
                  <View style={{ marginTop: 12, flexDirection: 'row' }}>
                    <Text style={{ color: '#666', marginRight: 8 }}>📍</Text>
                    <Text style={{ color: '#666', flex: 1 }}>
                      {order.deliveryAddress?.street}, {order.deliveryAddress?.city} - {order.deliveryAddress?.pincode}
                    </Text>
                  </View>

                  {/* Payment */}
                  <View style={{ marginTop: 8, flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: '#666' }}>Payment</Text>
                    <Text style={{ fontWeight: 'bold', color: order.paymentStatus === 'paid' ? '#22c55e' : '#f59e0b' }}>
                      {order.paymentStatus === 'paid' ? '✅ Paid' : '💵 Cash on Delivery'}
                    </Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <BottomNav navigation={navigation} />
    </View>
  );
}