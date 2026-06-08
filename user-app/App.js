import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as Notifications from "expo-notifications";
import SplashScreen from "./src/screens/SplashScreen";
import WelcomeScreen from "./src/screens/WelcomeScreen";
import CompleteProfileScreen from "./src/screens/CompleteProfileScreen";
import HomeScreen from "./src/screens/HomeScreen";
import ProductScreen from "./src/screens/ProductScreen";
import CartScreen from "./src/screens/CartScreen";
import OrdersScreen from "./src/screens/OrdersScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import AddressScreen from "./src/screens/AddressScreen";
import WishlistScreen from "./src/screens/WishlistScreen";
import SuccessScreen from "./src/screens/SuccessScreen";
import { CartProvider } from "./src/context/CartContext";
import { FavoritesProvider } from "./src/context/FavoritesContext";
import { AddressProvider } from "./src/context/AddressContext";
import OrderDetailScreen from "./src/screens/Orderdetailscreen";

// Push notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <AddressProvider>
        <FavoritesProvider>
          <CartProvider>
            <NavigationContainer>
              <Stack.Navigator
                initialRouteName="Splash"
                screenOptions={{ headerShown: false }}
              >
                <Stack.Screen name="Splash" component={SplashScreen} />
                <Stack.Screen name="Welcome" component={WelcomeScreen} />
                <Stack.Screen
                  name="CompleteProfile"
                  component={CompleteProfileScreen}
                />
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="Product" component={ProductScreen} />
                <Stack.Screen name="Cart" component={CartScreen} />
                <Stack.Screen name="Orders" component={OrdersScreen} />
                <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
                <Stack.Screen name="Profile" component={ProfileScreen} />
                <Stack.Screen name="Address" component={AddressScreen} />
                <Stack.Screen name="Wishlist" component={WishlistScreen} />
                <Stack.Screen name="Success" component={SuccessScreen} />
              </Stack.Navigator>
            </NavigationContainer>
          </CartProvider>
        </FavoritesProvider>
      </AddressProvider>
    </SafeAreaProvider>
  );
}
