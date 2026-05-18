import { NavigationContainer } from "@react-navigation/native";

import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SplashScreen from "./src/screens/SplashScreen";

import WelcomeScreen from "./src/screens/WelcomeScreen";

import CompleteProfileScreen from "./src/screens/CompleteProfileScreen";

import OTPScreen from "./src/screens/OTPScreen";

import HomeScreen from "./src/screens/HomeScreen";

import ProductScreen from "./src/screens/ProductScreen";

import CartScreen from "./src/screens/CartScreen";

import OrdersScreen from "./src/screens/OrdersScreen";

import ProfileScreen from "./src/screens/ProfileScreen";

import EditProfileScreen from "./src/screens/EditProfileScreen";

import AddressScreen from "./src/screens/AddressScreen";

import WishlistScreen from "./src/screens/WishlistScreen";

import { CartProvider } from "./src/context/CartContext";

import { OrdersProvider } from "./src/context/OrdersContext";

import { FavoritesProvider } from "./src/context/FavoritesContext";

import { AddressProvider } from "./src/context/AddressContext";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AddressProvider>
      <FavoritesProvider>
        <CartProvider>
          <OrdersProvider>
            <NavigationContainer>
              <Stack.Navigator
                initialRouteName="Splash"
                screenOptions={{
                  headerShown: false,
                }}
              >
                <Stack.Screen name="Splash" component={SplashScreen} />

                <Stack.Screen name="Welcome" component={WelcomeScreen} />

                <Stack.Screen
                  name="CompleteProfile"
                  component={CompleteProfileScreen}
                  options={{ headerShown: false }}
                />

                <Stack.Screen name="Otp" component={OTPScreen} />

                <Stack.Screen name="Home" component={HomeScreen} />

                <Stack.Screen name="Product" component={ProductScreen} />

                <Stack.Screen name="Cart" component={CartScreen} />

                <Stack.Screen name="Orders" component={OrdersScreen} />

                <Stack.Screen name="Profile" component={ProfileScreen} />

                <Stack.Screen
                  name="EditProfile"
                  component={EditProfileScreen}
                />

                <Stack.Screen name="Address" component={AddressScreen} />

                <Stack.Screen name="Wishlist" component={WishlistScreen} />
              </Stack.Navigator>
            </NavigationContainer>
          </OrdersProvider>
        </CartProvider>
      </FavoritesProvider>
    </AddressProvider>
  );
}
