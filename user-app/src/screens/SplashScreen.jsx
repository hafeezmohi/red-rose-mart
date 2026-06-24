import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator, Text, Image, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale } from '../utils/responsive';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    checkLogin();
  }, []);

  const checkLogin = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        navigation.replace("Welcome");
        return;
      }

      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();

      if (!data.success) {
        await AsyncStorage.multiRemove(["token", "user"]);
        navigation.replace("Welcome");
        return;
      }

      await AsyncStorage.setItem("user", JSON.stringify(data.user));

      setTimeout(() => {
        if (data.user.isProfileComplete) {
          navigation.replace("Home");
        } else {
          navigation.replace("CompleteProfile");
        }
      }, 2500);
    } catch (error) {
      navigation.replace("Welcome");
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#A50021",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
      }}
    >
      <Image
        source={require("../../assets/icon.png")}
        style={{ width: moderateScale(110), height: moderateScale(110), borderRadius: moderateScale(55) }}
      />
      <Text
        style={{
          color: "#ffffff",
          fontSize: moderateScale(28),
          fontWeight: "bold",
          marginTop: 16,
        }}
      >
        Red Rose Online Grocery
      </Text>
      <Text
        style={{
          color: "#ffffffcc",
          marginTop: 10,
          fontSize: 16,
          textAlign: "center",
          lineHeight: 24,
        }}
      >
        Fast Grocery Delivery{"\n"}Delivered in Minutes
      </Text>
      <View style={{ marginTop: 40 }}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    </SafeAreaView>
  );
}
