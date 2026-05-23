import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.1:5000';

export async function registerPushToken() {
    console.log('registerPushToken called');

    if (!Device.isDevice) {
        console.log('Not a real device — skipping');
        return;
    }

    console.log('Real device detected');

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    console.log('Existing permission status:', existingStatus);

    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
        console.log('New permission status:', finalStatus);
    }

    if (finalStatus !== 'granted') {
        console.log('Permission denied — cannot get push token');
        return;
    }

    try {
        const { data: pushToken } = await Notifications.getExpoPushTokenAsync({
            projectId: 'a9723b26-b48e-4a07-8611-00b6ca6933eb',
        });
        console.log('Push token:', pushToken);

        const token = await AsyncStorage.getItem('token');
        console.log('JWT token exists:', !!token);

        const res = await fetch(`${API_URL}/api/auth/push-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ pushToken }),
        });
        const data = await res.json();
        console.log('Push token save response:', JSON.stringify(data));
    } catch (err) {
        console.error('Push token error:', err.message);
    }
}