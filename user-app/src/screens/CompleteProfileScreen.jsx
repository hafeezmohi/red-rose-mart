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
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000";

export default function CompleteProfileScreen({ navigation }) {
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [coordinates, setCoordinates] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const isKagaznagarAddress = (text = "") => {
    const value = text.toLowerCase();

    return (
      value.includes("kagaznagar") ||
      value.includes("kaghaznagar") ||
      value.includes("asifabad") ||
      value.includes("komaram bheem") ||
      value.includes("adilabad")
    );
  };

  const detectLocation = async () => {
    try {
      setLocationLoading(true);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Please allow location access to continue.",
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;
      setCoordinates({ lat: latitude, lng: longitude });

      const geocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (geocode.length > 0) {
        const place = geocode[0];

        const formatted = [
          place.name,
          place.street,
          place.district,
          place.city,
          place.region,
          place.postalCode,
        ]
          .filter(Boolean)
          .join(", ");

        const city = (place.city || "").toLowerCase();
        const district = (place.district || "").toLowerCase();
        const region = (place.region || "").toLowerCase();
        const formattedLower = formatted.toLowerCase();

        const isKagaznagar =
          city.includes("kagaznagar") ||
          district.includes("kagaznagar") ||
          formattedLower.includes("kagaznagar");

        if (!isKagaznagar) {
          setAddress("");
          setCoordinates(null);

          Alert.alert(
            "Not Deliverable",
            "Sorry, we deliver only in Kagaznagar, Telangana.",
          );
          return;
        }

        setAddress(formatted);
        Alert.alert(
          "Location Found",
          "Your location is within our delivery area.",
        );
      } else {
        Alert.alert(
          "Not Deliverable",
          "Unable to verify location. Please enter a Kagaznagar address manually.",
        );
      }
    } catch (error) {
      Alert.alert("Error", "Failed to get location. Please enter manually.");
      console.error(error);
    } finally {
      setLocationLoading(false);
    }
  };

  const handleContinue = async () => {
    if (!phone.trim()) {
      Alert.alert("Missing Phone", "Please enter your phone number.");
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
      console.log(error);
      Alert.alert("Error", "Failed to complete profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: "#A50021" }}
    >
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 28,
          paddingTop: 90,
          paddingBottom: 60,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={{ alignItems: "center" }}>
          <Image
            source={require("../../assets/logo.png")}
            style={{ width: 120, height: 120, borderRadius: 60 }}
          />
          <Text
            style={{
              color: "#ffffff",
              fontSize: 34,
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

          <TextInput
            placeholder="+91 9876543210"
            placeholderTextColor="#bcbcbc"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            style={{
              color: "#1a1a1a",
              height: 58,
              borderWidth: 1,
              borderColor: "#d9d9d9",
              borderRadius: 16,
              paddingHorizontal: 18,
              fontSize: 16,
              backgroundColor: "#fafafa",
            }}
          />

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
            onPress={detectLocation}
            disabled={locationLoading}
            style={{
              backgroundColor: "#fff5f5",
              borderWidth: 1,
              borderColor: "#A50021",
              borderRadius: 14,
              height: 50,
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
                  color: "#A50021",
                  fontWeight: "bold",
                  fontSize: 15,
                }}
              >
                Use Current Location
              </Text>
            )}
          </TouchableOpacity>

          {/* Continue button */}
          <TouchableOpacity
            onPress={handleContinue}
            disabled={loading}
            style={{
              backgroundColor: "#A50021",
              height: 62,
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
  );
}
