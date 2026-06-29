import { useState } from "react";
import { Image } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from '../utils/responsive';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { useLocation } from "../hooks/useLocation";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "https://red-rose-backend.onrender.com/";

export default function CompleteProfileScreen({ navigation }) {
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [coordinates, setCoordinates] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locationVerified, setLocationVerified] = useState(false);
  const insets = useSafeAreaInsets();

  const {
    loading: locationLoading,
    detectLocation,
    isKagaznagarAddress
  } = useLocation();

  const handleDetectLocation = async () => {
    const result = await detectLocation();
    if (result) {
      setCoordinates({ lat: result.lat, lng: result.lng });
      setAddress(result.formatted);
      setLocationVerified(true);
    } else {
      setCoordinates(null);
      setAddress("");
      setLocationVerified(false);
    }
  };

  const handleContinue = async () => {
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      Alert.alert("Invalid Phone", "Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (!address.trim()) {
      Alert.alert("Missing Address", "Please add your delivery address.");
      return;
    }

    if (!isKagaznagarAddress(address)) {
      Alert.alert(
        "Not Deliverable",
        "Sorry, we deliver only in Kagaznagar, Telangana.",
      );
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");

      const res = await fetch(`${API_URL}/api/auth/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          phone,
          address: {
            street: address,
            city: "Kagaznagar",
            pincode: address.match(/\d{6}/)?.[0] || "",
            coordinates: coordinates || undefined,
          },
        }),
      });

      const data = await res.json();

      if (!data.success) {
        Alert.alert("Error", data.message || "Something went wrong");
        return;
      }

      const updatedUser = { ...data.user, isProfileComplete: true };
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

      navigation.replace("Home");
    } catch (error) {
      Alert.alert("Error", "Failed to complete profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView edges={["bottom"]} style={{ flex: 1, backgroundColor: "#A50021" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 28,
          paddingTop: insets.top + 24,
          paddingBottom: 60,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={{ alignItems: "center" }}>
          <Image
            source={require("../../assets/icon.png")}
            style={{ width: moderateScale(110), height: moderateScale(110), borderRadius: moderateScale(55) }}
          />
          <Text
            style={{
              color: "#ffffff",
              fontSize: moderateScale(30),
              fontWeight: "bold",
              marginTop: 18,
            }}
          >
            Complete Profile
          </Text>
          <Text
            style={{
              color: "#ffffffcc",
              fontSize: 17,
              textAlign: "center",
              marginTop: 16,
              lineHeight: 28,
            }}
          >
            Almost there! Add your details{"\n"}to start shopping.
          </Text>
        </View>

        {/* Card */}
        <View
          style={{
            marginTop: 40,
            backgroundColor: "#ffffff",
            borderRadius: 28,
            padding: 24,
          }}
        >
          {/* Phone */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <Ionicons
              name="phone-portrait-outline"
              size={20}
              color="#A50021"
              style={{ marginRight: 8 }}
            />

            <Text
              style={{
                color: "#A50021",
                fontSize: 16,
                fontWeight: "700",
              }}
            >
              Phone Number
            </Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#d9d9d9", borderRadius: 16, backgroundColor: "#fafafa", height: moderateScale(54) }}>
            <View style={{ paddingHorizontal: 16, borderRightWidth: 1, borderRightColor: "#d9d9d9", height: "100%", justifyContent: "center" }}>
              <Text style={{ fontSize: 16, color: "#1a1a1a", fontWeight: "600" }}>+91</Text>
            </View>
            <TextInput
              placeholder="9876543210"
              placeholderTextColor="#bcbcbc"
              keyboardType="phone-pad"
              maxLength={10}
              value={phone}
              onChangeText={setPhone}
              style={{
                flex: 1,
                color: "#1a1a1a",
                height: "100%",
                paddingHorizontal: 16,
                fontSize: 16,
              }}
            />
          </View>

          {/* Location */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 24,
              marginBottom: 10,
            }}
          >
            <MaterialCommunityIcons
              name="map-marker-outline"
              size={22}
              color="#A50021"
              style={{ marginRight: 8 }}
            />

            <Text
              style={{
                color: "#A50021",
                fontSize: 16,
                fontWeight: "700",
              }}
            >
              Delivery Address
            </Text>
          </View>

          {/* Auto detect button */}
          <TouchableOpacity
            onPress={handleDetectLocation}
            disabled={locationLoading || locationVerified}
            style={{
              backgroundColor: locationVerified ? "#E8F5E9" : "#fff5f5",
              borderColor: locationVerified ? "#2E7D32" : "#A50021",
              borderWidth: 1,
              borderRadius: 14,
              height: moderateScale(48),
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: 8,
              marginBottom: 14,
            }}
          >
            {locationLoading ? (
              <ActivityIndicator color="#A50021" />
            ) : (
              <Text
                style={{
                  color: locationVerified ? "#2E7D32" : "#A50021",
                  fontWeight: "bold",
                  fontSize: 15,
                }}
              >
                {locationVerified
                  ? "✓ Location Verified"
                  : "Use Current Location"}
              </Text>
            )}
          </TouchableOpacity>

          {/* Continue button */}
          <TouchableOpacity
            onPress={handleContinue}
            disabled={loading || !locationVerified || !phone.trim()}
            style={{
              backgroundColor:
                loading || !locationVerified || !phone.trim() ? "#C8C8C8" : "#A50021",
              height: moderateScale(58),
              borderRadius: 18,
              justifyContent: "center",
              alignItems: "center",
              marginTop: 25,
            }}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text
                style={{
                  color: "#ffffff",
                  fontSize: 20,
                  fontWeight: "bold",
                }}
              >
                Continue →
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text
          style={{
            color: "#ffffff99",
            textAlign: "center",
            fontSize: 13,
            marginTop: 24,
          }}
        >
          Your information is securely encrypted
        </Text>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
