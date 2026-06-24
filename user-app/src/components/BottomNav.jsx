import { useContext } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { CartContext } from "../context/CartContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { moderateScale } from '../utils/responsive';

export default function BottomNav({ navigation, route }) {
  const { cartItems } = useContext(CartContext);
  const insets = useSafeAreaInsets();

  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);
  const activeRoute = route?.name;

  const ACTIVE_COLOR = "#A50021";
  const INACTIVE_COLOR = "#555";

  const getColor = (screen) => (activeRoute === screen ? ACTIVE_COLOR : INACTIVE_COLOR);

  return (
    <View
      style={{
        position: "absolute",
        bottom: insets.bottom + 12,
        left: 14,
        right: 14,
        height: moderateScale(64),
        paddingBottom: 4,
        backgroundColor: "#ffffff",
        borderRadius: 22,
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#eee",
        elevation: 8,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 10,
      }}
    >
      <TouchableOpacity
        onPress={() => navigation.navigate("Home")}
        style={{ alignItems: "center" }}
      >
        <Ionicons
          name={activeRoute === "Home" ? "home" : "home-outline"}
          size={24}
          color={getColor("Home")}
        />
        <Text style={{ fontSize: moderateScale(11), marginTop: 2, color: getColor("Home") }}>
          Home
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate("Orders")}
        style={{ alignItems: "center" }}
      >
        <Ionicons
          name={activeRoute === "Orders" ? "cube" : "cube-outline"}
          size={moderateScale(22)}
          color={getColor("Orders")}
        />
        <Text style={{ fontSize: moderateScale(11), marginTop: 2, color: getColor("Orders") }}>
          Orders
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate("Cart")}
        style={{
          alignItems: "center",
          position: "relative",
        }}
      >
        <View>
          <Ionicons
            name={activeRoute === "Cart" ? "cart" : "cart-outline"}
            size={moderateScale(22)}
            color={getColor("Cart")}
          />
          {cartCount > 0 && (
            <View
              style={{
                position: "absolute",
                top: -6,
                right: -10,
                backgroundColor: "#A50021",
                minWidth: moderateScale(18),
                height: moderateScale(18),
                borderRadius: moderateScale(9),
                justifyContent: "center",
                alignItems: "center",
                paddingHorizontal: moderateScale(3),
              }}
            >
              <Text
                style={{
                  color: "#ffffff",
                  fontSize: moderateScale(10),
                  fontWeight: "bold",
                }}
              >
                {cartCount}
              </Text>
            </View>
          )}
        </View>
        <Text style={{ fontSize: moderateScale(11), marginTop: 2, color: getColor("Cart") }}>
          Cart
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate("Profile")}
        style={{ alignItems: "center" }}
      >
        <Ionicons
          name={activeRoute === "Profile" ? "person" : "person-outline"}
          size={moderateScale(22)}
          color={getColor("Profile")}
        />
        <Text style={{ fontSize: moderateScale(11), marginTop: 2, color: getColor("Profile") }}>
          Profile
        </Text>
      </TouchableOpacity>
    </View>
  );
}