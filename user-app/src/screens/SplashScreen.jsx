import {
    useEffect,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
    ActivityIndicator,
    Text,
    View,
} from 'react-native';

export default function SplashScreen({
    navigation,
}) {
    useEffect(() => {
        checkLogin();
    }, []);

    const checkLogin = async () => {
        try {
            const loginStatus =
                await AsyncStorage.getItem(
                    'isLoggedIn'
                );

            setTimeout(() => {
                if (
                    loginStatus === 'true'
                ) {
                    navigation.replace(
                        'Home'
                    );
                } else {
                    navigation.replace(
                        'Welcome'
                    );
                }
            }, 2500);
        } catch (error) {
            console.log(error);

            navigation.replace(
                'Welcome'
            );
        }
    };

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: '#A50021',
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 24,
            }}
        >
            <Text
                style={{
                    fontSize: 90,
                }}
            >
                🌹
            </Text>

            <Text
                style={{
                    color: '#ffffff',
                    fontSize: 38,
                    fontWeight: 'bold',
                    marginTop: 16,
                }}
            >
                Red Rose Mart
            </Text>

            <Text
                style={{
                    color: '#ffffffcc',
                    marginTop: 14,
                    fontSize: 16,
                    textAlign: 'center',
                    lineHeight: 24,
                }}
            >
                Fast Grocery Delivery
                {"\n"}
                Delivered in Minutes ⚡
            </Text>

            <View
                style={{
                    marginTop: 40,
                }}
            >
                <ActivityIndicator
                    size="large"
                    color="#ffffff"
                />
            </View>
        </View>
    );
}