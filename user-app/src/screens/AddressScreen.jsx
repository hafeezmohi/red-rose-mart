import {
    useContext,
    useState,
} from 'react';

import {
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { CartContext } from '../context/CartContext';

import {
    OrdersContext,
} from '../context/OrdersContext';

import {
    AddressContext,
} from '../context/AddressContext';

export default function AddressScreen({
    route,
    navigation,
}) {
    const { checkoutData } =
        route.params;

    const {
        selectedAddress,
        saveAddress,
    } = useContext(AddressContext);

    const [address, setAddress] =
        useState(
            selectedAddress || ''
        );

    const [loading, setLoading] =
        useState(false);

    const { clearCart } =
        useContext(CartContext);

    const { placeOrder } =
        useContext(OrdersContext);

    const handlePlaceOrder =
        async () => {
            if (!address.trim()) {
                Alert.alert(
                    'Enter Address',
                    'Please enter delivery address'
                );

                return;
            }

            try {
                setLoading(true);

                await saveAddress(address);

                const newOrder =
                    placeOrder(
                        checkoutData.cartItems,
                        checkoutData.total
                    );

                setTimeout(() => {
                    clearCart();

                    setLoading(false);

                    navigation.reset({
                        index: 0,
                        routes: [
                            {
                                name:
                                    'Orders',
                            },
                        ],
                    });

                    Alert.alert(
                        'Order Placed 🎉',
                        `Delivery OTP: ${newOrder.otp}`
                    );
                }, 1500);
            } catch (error) {
                console.log(error);

                setLoading(false);
            }
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
                    paddingBottom: 80,
                }}
            >
                <Text
                    style={{
                        fontSize: 32,
                        fontWeight: 'bold',
                    }}
                >
                    Delivery Address 📍
                </Text>

                <Text
                    style={{
                        color: '#666',
                        marginTop: 12,
                        lineHeight: 24,
                    }}
                >
                    Enter your delivery address
                    for fast doorstep delivery
                </Text>

                <View
                    style={{
                        backgroundColor:
                            '#ffffff',
                        borderRadius: 20,
                        padding: 18,
                        marginTop: 28,
                    }}
                >
                    <Text
                        style={{
                            fontWeight: 'bold',
                            marginBottom: 14,
                            fontSize: 16,
                        }}
                    >
                        Full Address
                    </Text>

                    <TextInput
                        placeholder="House no, street, landmark..."
                        value={address}
                        onChangeText={setAddress}
                        multiline
                        style={{
                            minHeight: 130,
                            textAlignVertical:
                                'top',
                            borderWidth: 1,
                            borderColor: '#eee',
                            borderRadius: 16,
                            padding: 16,
                            fontSize: 16,
                        }}
                    />
                </View>

                <View
                    style={{
                        backgroundColor:
                            '#ffffff',
                        borderRadius: 20,
                        padding: 18,
                        marginTop: 22,
                    }}
                >
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent:
                                'space-between',
                            marginBottom: 14,
                        }}
                    >
                        <Text
                            style={{
                                color: '#666',
                                fontSize: 16,
                            }}
                        >
                            Total Amount
                        </Text>

                        <Text
                            style={{
                                fontSize: 18,
                                fontWeight: 'bold',
                            }}
                        >
                            ₹{checkoutData.total}
                        </Text>
                    </View>

                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent:
                                'space-between',
                        }}
                    >
                        <Text
                            style={{
                                color: '#666',
                                fontSize: 16,
                            }}
                        >
                            Payment Method
                        </Text>

                        <Text
                            style={{
                                fontWeight: 'bold',
                                color: '#A50021',
                            }}
                        >
                            Cash on Delivery
                        </Text>
                    </View>
                </View>

                <TouchableOpacity
                    disabled={loading}
                    onPress={
                        handlePlaceOrder
                    }
                    style={{
                        backgroundColor:
                            loading
                                ? '#d38c9c'
                                : '#A50021',

                        height: 58,
                        borderRadius: 18,
                        justifyContent:
                            'center',
                        alignItems: 'center',
                        marginTop: 30,
                    }}
                >
                    <Text
                        style={{
                            color: '#ffffff',
                            fontSize: 18,
                            fontWeight: 'bold',
                        }}
                    >
                        {loading
                            ? 'Placing Order...'
                            : 'Place Order'}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}