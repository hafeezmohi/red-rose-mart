import {
    useContext,
} from 'react';

import {
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { CartContext } from '../context/CartContext';

export default function BottomNav({
    navigation,
}) {
    const { cartItems } =
        useContext(CartContext);

    const cartCount =
        cartItems.reduce(
            (sum, item) =>
                sum + item.qty,
            0
        );

    return (
        <View
            style={{
                position: 'absolute',
                bottom: 18,
                left: 14,
                right: 14,
                height: 68,
                backgroundColor: '#ffffff',
                borderRadius: 22,
                flexDirection: 'row',
                justifyContent:
                    'space-around',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#eee',
            }}
        >
            <TouchableOpacity
                onPress={() =>
                    navigation.navigate(
                        'Home'
                    )
                }
                style={{
                    alignItems: 'center',
                }}
            >
                <Text
                    style={{
                        fontSize: 24,
                    }}
                >
                    🏠
                </Text>

                <Text
                    style={{
                        fontSize: 12,
                        marginTop: 2,
                    }}
                >
                    Home
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() =>
                    navigation.navigate(
                        'Orders'
                    )
                }
                style={{
                    alignItems: 'center',
                }}
            >
                <Text
                    style={{
                        fontSize: 24,
                    }}
                >
                    📦
                </Text>

                <Text
                    style={{
                        fontSize: 12,
                        marginTop: 2,
                    }}
                >
                    Orders
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() =>
                    navigation.navigate(
                        'Cart'
                    )
                }
                style={{
                    alignItems: 'center',
                    position: 'relative',
                }}
            >
                <View>
                    <Text
                        style={{
                            fontSize: 24,
                        }}
                    >
                        🛒
                    </Text>

                    {cartCount > 0 && (
                        <View
                            style={{
                                position: 'absolute',
                                top: -6,
                                right: -10,
                                backgroundColor:
                                    '#A50021',
                                minWidth: 20,
                                height: 20,
                                borderRadius: 10,
                                justifyContent:
                                    'center',
                                alignItems: 'center',
                                paddingHorizontal: 4,
                            }}
                        >
                            <Text
                                style={{
                                    color: '#ffffff',
                                    fontSize: 11,
                                    fontWeight:
                                        'bold',
                                }}
                            >
                                {cartCount}
                            </Text>
                        </View>
                    )}
                </View>

                <Text
                    style={{
                        fontSize: 12,
                        marginTop: 2,
                    }}
                >
                    Cart
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() =>
                    navigation.navigate(
                        'Profile'
                    )
                }
                style={{
                    alignItems: 'center',
                }}
            >
                <Text
                    style={{
                        fontSize: 24,
                    }}
                >
                    👤
                </Text>

                <Text
                    style={{
                        fontSize: 12,
                        marginTop: 2,
                    }}
                >
                    Profile
                </Text>
            </TouchableOpacity>
        </View>
    );
}