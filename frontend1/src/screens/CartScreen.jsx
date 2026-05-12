import {
    useContext,
} from 'react';

import {
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import BottomNav from '../components/BottomNav';

import { CartContext } from '../context/CartContext';

export default function CartScreen({
    navigation,
}) {
    const {
        cartItems,
        increaseQty,
        decreaseQty,
    } = useContext(CartContext);

    const subtotal = cartItems.reduce(
        (sum, item) =>
            sum + item.price * item.qty,
        0
    );

    const deliveryFee =
        cartItems.length > 0 ? 25 : 0;

    const total =
        subtotal + deliveryFee;

    if (cartItems.length === 0) {
        return (
            <View
                style={{
                    flex: 1,
                    backgroundColor: '#f7f3f3',
                }}
            >
                <View
                    style={{
                        flex: 1,
                        justifyContent:
                            'center',
                        alignItems: 'center',
                        paddingHorizontal: 30,
                    }}
                >
                    <Text
                        style={{
                            fontSize: 90,
                        }}
                    >
                        🛒
                    </Text>

                    <Text
                        style={{
                            fontSize: 28,
                            fontWeight: 'bold',
                            marginTop: 20,
                        }}
                    >
                        Your Cart is Empty
                    </Text>

                    <Text
                        style={{
                            color: '#666',
                            textAlign: 'center',
                            marginTop: 14,
                            lineHeight: 24,
                            fontSize: 16,
                        }}
                    >
                        Looks like you haven't added
                        anything yet
                    </Text>

                    <TouchableOpacity
                        onPress={() =>
                            navigation.navigate(
                                'Home'
                            )
                        }
                        style={{
                            backgroundColor: '#A50021',
                            marginTop: 34,
                            paddingHorizontal: 32,
                            height: 56,
                            borderRadius: 18,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <Text
                            style={{
                                color: '#ffffff',
                                fontSize: 18,
                                fontWeight: 'bold',
                            }}
                        >
                            Continue Shopping
                        </Text>
                    </TouchableOpacity>
                </View>

                <BottomNav navigation={navigation} />
            </View>
        );
    }

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: '#f7f3f3',
            }}
        >
            <ScrollView
                showsVerticalScrollIndicator={
                    false
                }
                contentContainerStyle={{
                    paddingTop: 52,
                    paddingHorizontal: 16,
                    paddingBottom: 150,
                }}
            >
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent:
                            'space-between',
                        alignItems: 'center',
                        marginBottom: 24,
                    }}
                >
                    <Text
                        style={{
                            fontSize: 32,
                            fontWeight: 'bold',
                        }}
                    >
                        My Cart
                    </Text>

                    <Text
                        style={{
                            fontSize: 34,
                        }}
                    >
                        🛒
                    </Text>
                </View>

                {cartItems.map((item) => (
                    <View
                        key={item.id}
                        style={{
                            backgroundColor:
                                '#ffffff',
                            borderRadius: 18,
                            padding: 12,
                            marginBottom: 14,
                            borderWidth: 1,
                            borderColor: '#f0e5e5',
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}
                    >
                        <Image
                            source={{ uri: item.image }}
                            style={{
                                width: 62,
                                height: 62,
                                borderRadius: 14,
                            }}
                        />

                        <View
                            style={{
                                flex: 1,
                                marginLeft: 12,
                            }}
                        >
                            <Text
                                numberOfLines={1}
                                style={{
                                    fontSize: 16,
                                    fontWeight: 'bold',
                                }}
                            >
                                {item.name}
                            </Text>

                            <Text
                                style={{
                                    color: '#b00020',
                                    fontSize: 18,
                                    fontWeight: 'bold',
                                    marginTop: 6,
                                }}
                            >
                                ₹{item.price}
                            </Text>
                        </View>

                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor:
                                    '#A50021',
                                borderRadius: 10,
                                paddingHorizontal: 8,
                                paddingVertical: 6,
                            }}
                        >
                            <TouchableOpacity
                                onPress={() =>
                                    decreaseQty(item.id)
                                }
                            >
                                <Text
                                    style={{
                                        color: '#ffffff',
                                        fontSize: 20,
                                        fontWeight: 'bold',
                                    }}
                                >
                                    -
                                </Text>
                            </TouchableOpacity>

                            <Text
                                style={{
                                    color: '#ffffff',
                                    fontSize: 16,
                                    fontWeight: 'bold',
                                    marginHorizontal: 12,
                                }}
                            >
                                {item.qty}
                            </Text>

                            <TouchableOpacity
                                onPress={() =>
                                    increaseQty(item.id)
                                }
                            >
                                <Text
                                    style={{
                                        color: '#ffffff',
                                        fontSize: 20,
                                        fontWeight: 'bold',
                                    }}
                                >
                                    +
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}

                <View
                    style={{
                        backgroundColor: '#ffffff',
                        borderRadius: 18,
                        padding: 18,
                        marginTop: 8,
                    }}
                >
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent:
                                'space-between',
                            marginBottom: 12,
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 16,
                                color: '#555',
                            }}
                        >
                            Item Total
                        </Text>

                        <Text
                            style={{
                                fontSize: 16,
                            }}
                        >
                            ₹{subtotal}
                        </Text>
                    </View>

                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent:
                                'space-between',
                            marginBottom: 12,
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 16,
                                color: '#555',
                            }}
                        >
                            Delivery Fee
                        </Text>

                        <Text
                            style={{
                                fontSize: 16,
                            }}
                        >
                            ₹{deliveryFee}
                        </Text>
                    </View>

                    <View
                        style={{
                            borderBottomWidth: 1,
                            borderBottomColor:
                                '#ead6d6',
                            marginBottom: 12,
                        }}
                    />

                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent:
                                'space-between',
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 18,
                                fontWeight: 'bold',
                            }}
                        >
                            Total Amount
                        </Text>

                        <Text
                            style={{
                                fontSize: 20,
                                fontWeight: 'bold',
                                color: '#A50021',
                            }}
                        >
                            ₹{total}
                        </Text>
                    </View>
                </View>

                <TouchableOpacity
                    onPress={() =>
                        navigation.navigate(
                            'Address',
                            {
                                checkoutData: {
                                    cartItems,
                                    total,
                                },
                            }
                        )
                    }
                    style={{
                        backgroundColor: '#A50021',
                        height: 52,
                        borderRadius: 14,
                        marginTop: 18,
                        flexDirection: 'row',
                        justifyContent:
                            'space-between',
                        alignItems: 'center',
                        paddingHorizontal: 18,
                    }}
                >
                    <Text
                        style={{
                            color: '#ffffff',
                            fontSize: 18,
                            fontWeight: 'bold',
                        }}
                    >
                        Place Order
                    </Text>

                    <Text
                        style={{
                            color: '#ffffff',
                            fontSize: 18,
                            fontWeight: 'bold',
                        }}
                    >
                        ₹{total} →
                    </Text>
                </TouchableOpacity>
            </ScrollView>

            <BottomNav navigation={navigation} />
        </View>
    );
}