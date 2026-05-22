import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const STATUS_CONFIG = {
  placed:           { label: 'Pending',          emoji: '🕐', color: '#f59e0b', bg: '#fefce8' },
  confirmed:        { label: 'Pending',          emoji: '🕐', color: '#f59e0b', bg: '#fefce8' },
  preparing:        { label: 'Pending',          emoji: '🕐', color: '#f59e0b', bg: '#fefce8' },
  out_for_delivery: { label: 'Out for Delivery', emoji: '🛵', color: '#3b82f6', bg: '#eff6ff' },
  delivered:        { label: 'Delivered',        emoji: '✅', color: '#22c55e', bg: '#f0fdf4' },
  cancelled:        { label: 'Cancelled',        emoji: '❌', color: '#ef4444', bg: '#fef2f2' },
};

const TRACKING_STEPS = [
  { key: 'pending',          label: 'Order Placed',     emoji: '📋' },
  { key: 'out_for_delivery', label: 'Out for Delivery', emoji: '🛵' },
  { key: 'delivered',        label: 'Delivered',        emoji: '🎉' },
];

const getStepIndex = (status) => {
  if (['placed', 'confirmed', 'preparing'].includes(status)) return 0;
  if (status === 'out_for_delivery') return 1;
  if (status === 'delivered') return 2;
  return 0;
};

export default function OrderDetailScreen({ route, navigation }) {
  const { order } = route.params;
  const status = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.placed;
  const currentStep = getStepIndex(order.orderStatus);
  const isCancelled = order.orderStatus === 'cancelled';

  return (
    <View style={{ flex: 1, backgroundColor: '#f7f3f3' }}>
      {/* Header */}
      <View style={{
        backgroundColor: '#ffffff',
        paddingTop: 55,
        paddingBottom: 16,
        paddingHorizontal: 18,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#f0e5e5',
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 14 }}>
          <Text style={{ fontSize: 24, color: '#A50021' }}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
            Order #{order._id.slice(-6).toUpperCase()}
          </Text>
          <Text style={{ color: '#999', fontSize: 12, marginTop: 2 }}>
            {new Date(order.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })}
          </Text>
        </View>
        <View style={{ backgroundColor: status.bg, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 }}>
          <Text style={{ color: status.color, fontWeight: 'bold', fontSize: 13 }}>
            {status.emoji} {status.label}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 20, paddingBottom: 60 }}>

        {/* Tracking — hide if cancelled */}
        {!isCancelled && (
          <View style={{ backgroundColor: '#ffffff', borderRadius: 20, padding: 18, marginBottom: 16 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 18, color: '#333' }}>
              Order Tracking
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              {TRACKING_STEPS.map((step, i) => {
                const isDone = i <= currentStep;
                const isActive = i === currentStep;
                return (
                  <View key={step.key} style={{ flex: 1, alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                      {i > 0 && (
                        <View style={{
                          flex: 1, height: 3,
                          backgroundColor: i <= currentStep ? '#A50021' : '#e0e0e0',
                          marginBottom: 8,
                        }} />
                      )}
                      <View style={{
                        width: 40, height: 40, borderRadius: 20,
                        backgroundColor: isDone ? '#A50021' : '#e0e0e0',
                        justifyContent: 'center', alignItems: 'center',
                        borderWidth: isActive ? 3 : 0,
                        borderColor: '#ff6b6b',
                      }}>
                        <Text style={{ fontSize: 17 }}>{step.emoji}</Text>
                      </View>
                      {i < TRACKING_STEPS.length - 1 && (
                        <View style={{
                          flex: 1, height: 3,
                          backgroundColor: i < currentStep ? '#A50021' : '#e0e0e0',
                          marginBottom: 8,
                        }} />
                      )}
                    </View>
                    <Text style={{
                      fontSize: 11, marginTop: 6, textAlign: 'center',
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

        {/* Cancelled banner */}
        {isCancelled && (
          <View style={{ backgroundColor: '#fef2f2', borderRadius: 16, padding: 16, marginBottom: 16 }}>
            <Text style={{ color: '#ef4444', fontWeight: 'bold', fontSize: 15 }}>❌ Order Cancelled</Text>
            {order.cancellationReason && (
              <Text style={{ color: '#666', marginTop: 6, fontSize: 13 }}>{order.cancellationReason}</Text>
            )}
          </View>
        )}

        {/* Items */}
        <View style={{ backgroundColor: '#ffffff', borderRadius: 20, padding: 18, marginBottom: 16 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 14, color: '#333' }}>
            Items ({order.items.length})
          </Text>
          {order.items.map((item, i) => (
            <View
              key={i}
              style={{
                flexDirection: 'row', alignItems: 'center',
                paddingVertical: 10,
                borderBottomWidth: i < order.items.length - 1 ? 1 : 0,
                borderBottomColor: '#f5f5f5',
              }}
            >
              {item.image ? (
                <Image source={{ uri: item.image }} style={{ width: 56, height: 56, borderRadius: 12 }} />
              ) : (
                <View style={{
                  width: 56, height: 56, borderRadius: 12,
                  backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center',
                }}>
                  <Text style={{ fontSize: 24 }}>🛍️</Text>
                </View>
              )}
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text numberOfLines={1} style={{ fontWeight: 'bold', fontSize: 14 }}>{item.name}</Text>
                <Text style={{ color: '#888', fontSize: 13, marginTop: 3 }}>Qty: {item.quantity}</Text>
              </View>
              <Text style={{ fontWeight: 'bold', color: '#A50021', fontSize: 14 }}>
                ₹{item.price * item.quantity}
              </Text>
            </View>
          ))}
        </View>

        {/* Bill Summary */}
        <View style={{ backgroundColor: '#ffffff', borderRadius: 20, padding: 18, marginBottom: 16 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 14, color: '#333' }}>Bill Summary</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
            <Text style={{ color: '#666' }}>Items Total</Text>
            <Text>₹{order.itemsPrice}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
            <Text style={{ color: '#666' }}>Delivery Fee</Text>
            <Text>₹{order.deliveryFee}</Text>
          </View>
          <View style={{ height: 1, backgroundColor: '#f0e5e5', marginVertical: 8 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontWeight: 'bold', fontSize: 15 }}>Total</Text>
            <Text style={{ fontWeight: 'bold', color: '#A50021', fontSize: 15 }}>₹{order.totalPrice}</Text>
          </View>
        </View>

        {/* Delivery & Payment */}
        <View style={{ backgroundColor: '#ffffff', borderRadius: 20, padding: 18 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 14, color: '#333' }}>
            Delivery Details
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 }}>
            <Text style={{ fontSize: 16, marginRight: 10 }}>📍</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#444', fontWeight: '600', marginBottom: 2 }}>Delivery Address</Text>
              <Text style={{ color: '#666', fontSize: 13, lineHeight: 20 }}>
                {order.deliveryAddress?.street}, {order.deliveryAddress?.city} - {order.deliveryAddress?.pincode}
              </Text>
            </View>
          </View>

          <View style={{ height: 1, backgroundColor: '#f0e5e5', marginBottom: 14 }} />

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 16, marginRight: 8 }}>💳</Text>
              <Text style={{ color: '#444', fontWeight: '600' }}>Payment</Text>
            </View>
            <Text style={{
              fontWeight: 'bold',
              color: order.paymentStatus === 'paid' ? '#22c55e' : '#f59e0b',
            }}>
              {order.paymentStatus === 'paid' ? '✅ Paid' : '💵 Cash on Delivery'}
            </Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}