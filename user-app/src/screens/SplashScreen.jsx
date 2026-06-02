import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator, Text, Image, View } from "react-native";

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    checkLogin();
  }, []);

  const checkLogin = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const userStr = await AsyncStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;

      setTimeout(() => {
        if (token && user) {
          if (user.isProfileComplete) {
            navigation.replace("Home");
          } else {
            navigation.replace("CompleteProfile");
          }
        } else {
          navigation.replace("Welcome");
        }
      }, 2500);
    } catch (error) {
      navigation.replace("Welcome");
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#A50021",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
      }}
    >
      <Image
        source={require("../../assets/logo.png")}
        style={{ width: 120, height: 120, borderRadius: 60 }}
      />
      <Text
        style={{
          color: "#ffffff",
          fontSize: 30,
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
    </View>
  );
}
