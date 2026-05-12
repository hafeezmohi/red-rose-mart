import {
    useEffect,
    useState,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
    Alert,
    Linking,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import BottomNav from '../components/BottomNav';

export default function ProfileScreen({
    navigation,
}) {
    const [profile, setProfile] =
        useState(null);

    useEffect(() => {
        loadProfile();

        const unsubscribe =
            navigation.addListener(
                'focus',
                () => {
                    loadProfile();
                }
            );

        return unsubscribe;
    }, [navigation]);

    const loadProfile =
        async () => {
            try {
                const savedProfile =
                    await AsyncStorage.getItem(
                        'userProfile'
                    );

                if (savedProfile) {
                    setProfile(
                        JSON.parse(
                            savedProfile
                        )
                    );
                }
            } catch (error) {
                console.log(error);
            }
        };

    const handleWhatsApp =
        async () => {
            const phoneNumber =
                '919381901949';

            const message =
                'Hello Red Rose Mart, I need support regarding my order.';

            const url =
                `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
                    message
                )}`;

            try {
                await Linking.openURL(
                    url
                );
            } catch (error) {
                Alert.alert(
                    'Error',
                    'WhatsApp not installed'
                );
            }
        };

    const handleLogout =
        async () => {
            Alert.alert(
                'Logout',
                'Are you sure you want to logout?',
                [
                    {
                        text: 'Cancel',
                        style: 'cancel',
                    },

                    {
                        text: 'Logout',

                        onPress: async () => {
                            try {
                                await AsyncStorage.removeItem(
                                    'isLoggedIn'
                                );

                                navigation.reset({
                                    index: 0,
                                    routes: [
                                        {
                                            name:
                                                'Welcome',
                                        },
                                    ],
                                });
                            } catch (error) {
                                console.log(error);
                            }
                        },
                    },
                ]
            );
        };

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: '#f7f3f3',
            }}
        >
            <ScrollView
                contentContainerStyle={{
                    paddingTop: 55,
                    paddingHorizontal: 20,
                    paddingBottom: 140,
                }}
            >
                <View
                    style={{
                        alignItems: 'center',
                    }}
                >
                    <View
                        style={{
                            width: 110,
                            height: 110,
                            borderRadius: 55,
                            backgroundColor:
                                '#A50021',
                            justifyContent:
                                'center',
                            alignItems: 'center',
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 44,
                                color: '#ffffff',
                                fontWeight: 'bold',
                            }}
                        >
                            👤
                        </Text>
                    </View>

                    <Text
                        style={{
                            fontSize: 28,
                            fontWeight: 'bold',
                            marginTop: 20,
                        }}
                    >
                        {profile?.name ||
                            'Welcome Back'}
                    </Text>

                    <Text
                        style={{
                            color: '#666',
                            marginTop: 8,
                        }}
                    >
                        {profile?.phone ||
                            'Red Rose Mart Customer'}
                    </Text>

                    {profile?.email ? (
                        <Text
                            style={{
                                color: '#888',
                                marginTop: 6,
                            }}
                        >
                            {profile.email}
                        </Text>
                    ) : null}
                </View>

                <View
                    style={{
                        backgroundColor:
                            '#ffffff',
                        borderRadius: 22,
                        padding: 20,
                        marginTop: 34,
                    }}
                >
                    <TouchableOpacity
                        onPress={() =>
                            navigation.navigate(
                                'EditProfile'
                            )
                        }
                        style={{
                            flexDirection: 'row',
                            justifyContent:
                                'space-between',
                            alignItems: 'center',
                            paddingVertical: 18,
                            borderBottomWidth: 1,
                            borderBottomColor:
                                '#f3e5e5',
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 16,
                                fontWeight: 'bold',
                            }}
                        >
                            ✏️ Edit Profile
                        </Text>

                        <Text
                            style={{
                                fontSize: 18,
                            }}
                        >
                            →
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() =>
                            navigation.navigate(
                                'Orders'
                            )
                        }
                        style={{
                            flexDirection: 'row',
                            justifyContent:
                                'space-between',
                            alignItems: 'center',
                            paddingVertical: 18,
                            borderBottomWidth: 1,
                            borderBottomColor:
                                '#f3e5e5',
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 16,
                                fontWeight: 'bold',
                            }}
                        >
                            📦 My Orders
                        </Text>

                        <Text
                            style={{
                                fontSize: 18,
                            }}
                        >
                            →
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() =>
                            navigation.navigate(
                                'Wishlist'
                            )
                        }
                        style={{
                            flexDirection: 'row',
                            justifyContent:
                                'space-between',
                            alignItems: 'center',
                            paddingVertical: 18,
                            borderBottomWidth: 1,
                            borderBottomColor:
                                '#f3e5e5',
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 16,
                                fontWeight: 'bold',
                            }}
                        >
                            ❤️ Wishlist
                        </Text>

                        <Text
                            style={{
                                fontSize: 18,
                            }}
                        >
                            →
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() =>
                            navigation.navigate(
                                'Address',
                                {
                                    checkoutData: {
                                        cartItems: [],
                                        total: 0,
                                    },
                                }
                            )
                        }
                        style={{
                            flexDirection: 'row',
                            justifyContent:
                                'space-between',
                            alignItems: 'center',
                            paddingVertical: 18,
                            borderBottomWidth: 1,
                            borderBottomColor:
                                '#f3e5e5',
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 16,
                                fontWeight: 'bold',
                            }}
                        >
                            📍 Saved Address
                        </Text>

                        <Text
                            style={{
                                fontSize: 18,
                            }}
                        >
                            →
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={
                            handleWhatsApp
                        }
                        style={{
                            flexDirection: 'row',
                            justifyContent:
                                'space-between',
                            alignItems: 'center',
                            paddingVertical: 18,
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 16,
                                fontWeight: 'bold',
                            }}
                        >
                            ☎️ WhatsApp Support
                        </Text>

                        <Text
                            style={{
                                fontSize: 18,
                            }}
                        >
                            →
                        </Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    onPress={handleLogout}
                    style={{
                        backgroundColor: '#A50021',
                        height: 58,
                        borderRadius: 18,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginTop: 34,
                    }}
                >
                    <Text
                        style={{
                            color: '#ffffff',
                            fontSize: 18,
                            fontWeight: 'bold',
                        }}
                    >
                        Logout
                    </Text>
                </TouchableOpacity>
            </ScrollView>

            <BottomNav navigation={navigation} />
        </View>
    );
}