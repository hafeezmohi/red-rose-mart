import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://red-rose-backend.onrender.com/';

export async function registerPushToken() {
    if (!Device.isDevice) {
        return;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        return;
    }

    try {
        const { data: pushToken } = await Notifications.getExpoPushTokenAsync({
            projectId: 'a9723b26-b48e-4a07-8611-00b6ca6933eb',
        });

        const token = await AsyncStorage.getItem('token');

        const res = await fetch(`${API_URL}/api/auth/push-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ pushToken }),
        });
        await res.json();
    } catch (err) {
        // Error registering push token
    }
}