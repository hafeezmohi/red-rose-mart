
import { NavigationContainer } from '@react-navigation/native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CartScreen from '../screens/CartScreen';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import OrdersScreen from '../screens/OrdersScreen';
import OTPScreen from '../screens/OTPScreen';
import ProductScreen from '../screens/ProductScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SuccessScreen from '../screens/SuccessScreen';
import WelcomeScreen from '../screens/WelcomeScreen';

const Stack =
    createNativeStackNavigator();

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Welcome"
                screenOptions={{
                    headerShown: false,
                }}
            >
                <Stack.Screen
                    name="Welcome"
                    component={WelcomeScreen}
                />

                <Stack.Screen
                    name="Login"
                    component={LoginScreen}
                />

                <Stack.Screen
                    name="OTP"
                    component={OTPScreen}
                />

                <Stack.Screen
                    name="Home"
                    component={HomeScreen}
                />

                <Stack.Screen
                    name="Product"
                    component={ProductScreen}
                />

                <Stack.Screen
                    name="Cart"
                    component={CartScreen}
                />

                <Stack.Screen
                    name="Orders"
                    component={OrdersScreen}
                />

                <Stack.Screen
                    name="Profile"
                    component={ProfileScreen}
                />

                <Stack.Screen
                    name="Success"
                    component={SuccessScreen}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}