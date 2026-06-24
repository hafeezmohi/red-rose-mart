import { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { moderateScale } from "../utils/responsive";
import Skeleton from "../components/Skeleton";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "https://red-rose-backend.onrender.com/";

const STATUS_CONFIG = {
  placed: { label: "Pending", emoji: "🕐", color: "#f59e0b", bg: "#fefce8" },
  confirmed: {
    label: "Confirmed",
    emoji: "✔️",
    color: "#f59e0b",
    bg: "#fefce8",
  },
  preparing: {
    label: "Preparing",
    emoji: "👨‍🍳",
    color: "#f59e0b",
    bg: "#fefce8",
  },
  out_for_delivery: {
    label: "Out for Delivery",
    emoji: "🛵",
    color: "#3b82f6",
    bg: "#eff6ff",
  },
  delivered: {
    label: "Delivered",
    emoji: "✅",
    color: "#22c55e",
    bg: "#f0fdf4",
  },
  cancelled: {
    label: "Cancelled",
    emoji: "❌",
    color: "#ef4444",
    bg: "#fef2f2",
  },
};

const TRACKING_STEPS = [
  { key: "pending", label: "Order Placed", emoji: "📋" },
  { key: "out_for_delivery", label: "Out for Delivery", emoji: "🛵" },
  { key: "delivered", label: "Delivered", emoji: "🎉" },
];

const getStepIndex = (status) => {
  if (["placed", "confirmed", "preparing"].includes(status)) return 0;
  if (status === "out_for_delivery") return 1;
  if (status === "delivered") return 2;
  return 0;
};

export default function OrderDetailScreen({ route, navigation }) {
  const { order: initialOrder } = route.params;
  const [order, setOrder] = useState(initialOrder);
  const [cancelling, setCancelling] = useState(false);
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const status = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.placed;
  const currentStep = getStepIndex(order.orderStatus);
  const isCancelled = order.orderStatus === "cancelled";
  const canCancel = order.orderStatus === "placed";

  const handleCancel = () => {
    // If order can't be cancelled, show info alert
    if (!canCancel) {
      Alert.alert(
        "Cannot Cancel Order",
        "This order can no longer be cancelled as it is already being processed.",
        [{ text: "OK" }],
      );
      return;
    }

    // Confirm before cancelling
    Alert.alert("Cancel Order", "Are you sure you want to cancel this order?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes, Cancel",
        style: "destructive",
        onPress: async () => {
          try {
            setCancelling(true);
            const token = await AsyncStorage.getItem("token");
            const res = await fetch(
              `${API_URL}/api/orders/${order._id}/cancel`,
              {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ reason: "Cancelled by user" }),
              },
            );
            const data = await res.json();
            if (data.success) {
              setOrder(data.order);
            } else {
              Alert.alert("Error", data.message || "Failed to cancel order");
            }
          } catch (err) {
            Alert.alert("Error", "Something went wrong. Please try again.");
          } finally {
            setCancelling(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView edges={["bottom"]} style={{ flex: 1, backgroundColor: '#f7f3f3' }}>
        <View style={{ paddingTop: insets.top + 10, paddingHorizontal: 20 }}>
          <Skeleton width="40%" height={24} style={{ marginBottom: 30 }} />
          <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 20 }}>
            <Skeleton width="60%" height={18} style={{ marginBottom: 12 }} />
            <Skeleton width="40%" height={14} style={{ marginBottom: 24 }} />
            <Skeleton width="100%" height={60} borderRadius={10} />
          </View>
          <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 20 }}>
             <Skeleton width="50%" height={18} style={{ marginBottom: 16 }} />
             {[1,2,3].map(i => (
                <View key={i} style={{ flexDirection: 'row', marginBottom: 16 }}>
                  <Skeleton width={36} height={36} borderRadius={18} />
                  <View style={{ marginLeft: 12, justifyContent: 'center' }}>
                     <Skeleton width={100} height={14} style={{ marginBottom: 6 }} />
                     <Skeleton width={60} height={12} />
                  </View>
                </View>
             ))}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["bottom"]} style={{ flex: 1, backgroundColor: "#f7f3f3" }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: "#ffffff",
          paddingTop: insets.top + 10,
          paddingBottom: 16,
          paddingHorizontal: 18,
          flexDirection: "row",
          alignItems: "center",
          borderBottomWidth: 1,
          borderBottomColor: "#f0e5e5",
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginRight: 14 }}
        >
          <Text style={{ fontSize: moderateScale(44), color: "#A50021" }}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", color: "#1a1a1a" }}>
            Order #{order._id.slice(-6).toUpperCase()}
          </Text>
          <Text style={{ color: "#999", fontSize: 12, marginTop: 2 }}>
            {new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
        <View
          style={{
            backgroundColor: status.bg,
            paddingHorizontal: 12,
            paddingVertical: 5,
            borderRadius: 20,
          }}
        >
          <Text
            style={{ color: status.color, fontWeight: "bold", fontSize: 13 }}
          >
            {status.emoji} {status.label}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 18,
          paddingTop: 20,
          paddingBottom: insets.bottom + 40,
        }}
      >
        {/* Tracking — hide if cancelled */}
        {!isCancelled && (
          <View
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 20,
              padding: 18,
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontWeight: "bold",
                fontSize: 16,
                marginBottom: 18,
                color: "#333",
              }}
            >
              Order Tracking
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {TRACKING_STEPS.map((step, i) => {
                const isDone = i <= currentStep;
                const isActive = i === currentStep;
                return (
                  <View
                    key={step.key}
                    style={{ flex: 1, alignItems: "center" }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      {i > 0 && (
                        <View
                          style={{
                            flex: 1,
                            height: 3,
                            backgroundColor:
                              i <= currentStep ? "#A50021" : "#e0e0e0",
                            marginBottom: 8,
                          }}
                        />
                      )}
                      <View
                        style={{
                          width: moderateScale(36),
                          height: moderateScale(36),
                          borderRadius: moderateScale(18),
                          backgroundColor: isDone ? "#A50021" : "#e0e0e0",
                          justifyContent: "center",
                          alignItems: "center",
                          borderWidth: isActive ? 3 : 0,
                          borderColor: "#ff6b6b",
                        }}
                      >
                        <Text style={{ fontSize: 17 }}>{step.emoji}</Text>
                      </View>
                      {i < TRACKING_STEPS.length - 1 && (
                        <View
                          style={{
                            flex: 1,
                            height: 3,
                            backgroundColor:
                              i < currentStep ? "#A50021" : "#e0e0e0",
                            marginBottom: 8,
                          }}
                        />
                      )}
                    </View>
                    <Text
                      style={{
                        fontSize: 11,
                        marginTop: 6,
                        textAlign: "center",
                        color: isDone ? "#A50021" : "#999",
                        fontWeight: isDone ? "bold" : "normal",
                      }}
                    >
                      {step.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Delivery OTP — shown only when out for delivery */}
        {order.orderStatus === "out_for_delivery" && order.deliveryOtp && (
          <View
            style={{
              backgroundColor: "#eff6ff",
              borderRadius: 20,
              padding: 20,
              marginBottom: 16,
              alignItems: "center",
              borderWidth: 1.5,
              borderColor: "#93c5fd",
            }}
          >
            <Text
              style={{
                fontSize: 13,
                color: "#3b82f6",
                fontWeight: "600",
                marginBottom: 10,
              }}
            >
              🔐 Delivery OTP
            </Text>
            <View style={{ flexDirection: "row", gap: 12 }}>
              {order.deliveryOtp.split("").map((digit, i) => (
                <View
                  key={i}
                  style={{
                    width: moderateScale(48),
                    height: moderateScale(56),
                    backgroundColor: "#fff",
                    borderRadius: 12,
                    borderWidth: 1.5,
                    borderColor: "#3b82f6",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 28,
                      fontWeight: "bold",
                      color: "#1d4ed8",
                    }}
                  >
                    {digit}
                  </Text>
                </View>
              ))}
            </View>
            <Text
              style={{
                fontSize: 12,
                color: "#60a5fa",
                marginTop: 12,
                textAlign: "center",
              }}
            >
              Share this OTP with the delivery person to confirm delivery
            </Text>
          </View>
        )}

        {/* Cancelled banner */}
        {isCancelled && (
          <View
            style={{
              backgroundColor: "#fef2f2",
              borderRadius: 16,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <Text
              style={{ color: "#ef4444", fontWeight: "bold", fontSize: 15 }}
            >
              ❌ Order Cancelled
            </Text>
          </View>
        )}

        {/* Items */}
        <View
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 20,
            padding: 18,
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 16,
              marginBottom: 14,
              color: "#333",
            }}
          >
            Items ({order.items.length})
          </Text>
          {order.items.map((item, i) => (
            <View
              key={i}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 10,
                borderBottomWidth: i < order.items.length - 1 ? 1 : 0,
                borderBottomColor: "#f5f5f5",
              }}
            >
              {item.image ? (
                <Image
                  source={{ uri: item.image }}
                  style={{ width: 56, height: 56, borderRadius: 12 }}
                />
              ) : (
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 12,
                    backgroundColor: "#f5f5f5",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: 24 }}>🛍️</Text>
                </View>
              )}
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text
                  numberOfLines={1}
                  style={{ fontWeight: "bold", fontSize: 14, color: "#1a1a1a" }}
                >
                  {item.name}
                </Text>
                <Text style={{ color: "#888", fontSize: 13, marginTop: 3 }}>
                  Qty: {item.quantity}
                </Text>
              </View>
              <Text
                style={{ fontWeight: "bold", color: "#A50021", fontSize: 14 }}
              >
                ₹{item.price * item.quantity}
              </Text>
            </View>
          ))}
        </View>

        {/* Bill Summary */}
        <View
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 20,
            padding: 18,
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 16,
              marginBottom: 14,
              color: "#333",
            }}
          >
            Bill Summary
          </Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <Text style={{ color: "#666" }}>Items Total</Text>
            <Text style={{ color: "#1a1a1a", fontWeight: "600" }}>
              ₹{order.itemsPrice}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <Text style={{ color: "#666" }}>Delivery Fee</Text>
            <Text style={{ color: "#22c55e", fontWeight: "600" }}>
              {order.deliveryFee === 0 ? "FREE" : `₹${order.deliveryFee}`}
            </Text>
          </View>
          <View
            style={{ height: 1, backgroundColor: "#f0e5e5", marginVertical: 8 }}
          />
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text
              style={{ fontWeight: "bold", fontSize: 15, color: "#1a1a1a" }}
            >
              Total
            </Text>
            <Text
              style={{ fontWeight: "bold", color: "#A50021", fontSize: 15 }}
            >
              ₹{order.totalPrice}
            </Text>
          </View>
        </View>

        {/* Delivery & Payment */}
        <View
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 20,
            padding: 18,
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 16,
              marginBottom: 14,
              color: "#333",
            }}
          >
            Delivery Details
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              marginBottom: 14,
            }}
          >
            <Text style={{ fontSize: 16, marginRight: 10 }}>📍</Text>
            <View style={{ flex: 1 }}>
              <Text
                style={{ color: "#444", fontWeight: "600", marginBottom: 2 }}
              >
                Delivery Address
              </Text>
              <Text style={{ color: "#666", fontSize: 13, lineHeight: 20 }}>
                {order.deliveryAddress?.street}, {order.deliveryAddress?.city} -{" "}
                {order.deliveryAddress?.pincode}
              </Text>
            </View>
          </View>
          <View
            style={{ height: 1, backgroundColor: "#f0e5e5", marginBottom: 14 }}
          />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ fontSize: 16, marginRight: 8 }}>💳</Text>
              <Text style={{ color: "#444", fontWeight: "600" }}>Payment</Text>
            </View>
            <Text
              style={{
                fontWeight: "bold",
                color: order.paymentStatus === "paid" ? "#22c55e" : "#f59e0b",
              }}
            >
              {order.paymentStatus === "paid"
                ? "Paid"
                : "Cash on Delivery"}
            </Text>
          </View>
        </View>
        {/* Cancel button */}
        {!isCancelled && (
          <TouchableOpacity
            onPress={handleCancel}
            disabled={cancelling}
            style={{
              height: 52,
              borderRadius: 16,
              marginTop: 12,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: canCancel ? "#ef4444" : "#e0e0e0",
            }}
          >
            {cancelling ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ fontWeight: "bold", fontSize: 16, color: "#fff" }}>
                {canCancel ? "Cancel Order" : "🚫 Cannot Cancel Order"}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
