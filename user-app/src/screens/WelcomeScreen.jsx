import {
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, hp } from '../utils/responsive';
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { registerPushToken } from "../utils/registerPushToken";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "https://red-rose-backend.onrender.com/";

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
});

export default function WelcomeScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);

      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      const idToken = userInfo.data?.idToken || userInfo.idToken;

      if (!idToken) {
        Alert.alert("Error", "Could not get Google token");
        return;
      }

      const res = await fetch(`${API_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      const text = await res.text();

      const data = JSON.parse(text);

      if (!data.success) {
        Alert.alert("Login Failed", data.message);
        return;
      }

      // Save auth data to local storage
      await AsyncStorage.setItem("token", data.token);
      await AsyncStorage.setItem("user", JSON.stringify(data.user));

      // Register push token now that JWT is available in AsyncStorage
      await registerPushToken();

      if (data.isProfileComplete) {
        navigation.replace("Home");
      } else {
        navigation.replace("CompleteProfile");
      }
    } catch (error) {
      console.error("Google Sign In error:", error);
      Alert.alert(
        "Error",
        error.message || "Google Sign In failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      edges={["bottom"]}
      style={{
        flex: 1,
        backgroundColor: "#A50021",
        paddingHorizontal: 28,
        paddingTop: insets.top + 24,
        paddingBottom: 40,
      }}
    >
      <View style={{ alignItems: "center", marginTop: 10 }}>
        <Image
          source={require("../../assets/icon.png")}
          style={{ width: moderateScale(110), height: moderateScale(110), borderRadius: moderateScale(55) }}
        />
        <Text
          style={{
            color: "#ffffff",
            fontSize: moderateScale(34),
            fontWeight: "bold",
            marginTop: 20,
            textAlign: "center",
          }}
        >
          Red Rose Online Grocery
        </Text>
        <Text
          style={{
            color: "#ffffffdd",
            fontSize: moderateScale(16),
            textAlign: "center",
            marginTop: 18,
            lineHeight: 30,
            paddingHorizontal: 10,
          }}
        >
          Premium groceries delivered{"\n"}with crimson speed.
        </Text>
      </View>

      <View style={{ flex: 1 }} />

      <TouchableOpacity
        onPress={handleGoogleSignIn}
        disabled={loading}
        style={{
          backgroundColor: "#ffffff",
          height: moderateScale(60),
          borderRadius: 20,
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "row",
          gap: 12,
        }}
      >
        {loading ? (
          <ActivityIndicator color="#A50021" />
        ) : (
          <>
            <Text
              style={{ color: "#A50021", fontSize: moderateScale(18), fontWeight: "bold" }}
            >
              Continue with Google
            </Text>
          </>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}
