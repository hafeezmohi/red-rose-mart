import {
    useContext,
    useState,
} from 'react';

import {
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import BottomNav from '../components/BottomNav';

import {
    OrdersContext,
} from '../context/OrdersContext';

export default function OrdersScreen({
    navigation,
}) {
    const { orders } =
        useContext(OrdersContext);

    const [expandedOrder,
        setExpandedOrder] =
        useState(null);

    const toggleExpand = (
        orderId
    ) => {
        if (
            expandedOrder === orderId
        ) {
            setExpandedOrder(null);
        } else {
            setExpandedOrder(orderId);
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
                    paddingHorizontal: 18,
                    paddingBottom: 140,
                }}
            >
                <Text
                    style={{
                        fontSize: 30,
                        fontWeight: 'bold',
                        marginBottom: 24,
                    }}
                >
                    My Orders 📦
                </Text>

                {(!orders ||
                    orders.length === 0) && (
                        <View
                            style={{
                                marginTop: 120,
                                alignItems: 'center',
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 70,
                                }}
                            >
                                📦
                            </Text>

                            <Text
                                style={{
                                    fontSize: 24,
                                    fontWeight: 'bold',
                                    marginTop: 20,
                                }}
                            >
                                No Orders Yet
                            </Text>

                            <Text
                                style={{
                                    color: '#666',
                                    marginTop: 10,
                                }}
                            >
                                Your placed orders will
                                appear here
                            </Text>
                        </View>
                    )}

                {(orders || []).map(
                    (order) => (
                        <TouchableOpacity
                            activeOpacity={0.9}
                            key={order.id}
                            onPress={() =>
                                toggleExpand(
                                    order.id
                                )
                            }
                            style={{
                                backgroundColor:
                                    '#ffffff',
                                borderRadius: 20,
                                padding: 18,
                                marginBottom: 18,
                            }}
                        >
                            <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent:
                                        'space-between',
                                    alignItems:
                                        'center',
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: 18,
                                        fontWeight: 'bold',
                                    }}
                                >
                                    Order #{order.id}
                                </Text>

                                <Text
                                    style={{
                                        color: '#A50021',
                                        fontWeight: 'bold',
                                    }}
                                >
                                    {order.status ||
                                        'Packed'}
                                </Text>
                            </View>

                            <Text
                                style={{
                                    color: '#666',
                                    marginTop: 10,
                                }}
                            >
                                {(order.items || [])
                                    .length}{' '}
                                items
                            </Text>

                            <Text
                                style={{
                                    fontSize: 18,
                                    fontWeight: 'bold',
                                    marginTop: 12,
                                    color: '#A50021',
                                }}
                            >
                                ₹{order.total || 0}
                            </Text>

                            <View
                                style={{
                                    backgroundColor:
                                        '#fff5f5',
                                    borderRadius: 14,
                                    padding: 16,
                                    marginTop: 18,
                                }}
                            >
                                <Text
                                    style={{
                                        color: '#A50021',
                                        fontWeight: 'bold',
                                        fontSize: 16,
                                        marginBottom: 18,
                                    }}
                                >
                                    Live Order Tracking
                                </Text>

                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems:
                                            'center',
                                        marginBottom: 16,
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: 18,
                                        }}
                                    >
                                        ✅
                                    </Text>

                                    <Text
                                        style={{
                                            marginLeft: 12,
                                            fontWeight:
                                                'bold',
                                        }}
                                    >
                                        Order Confirmed
                                    </Text>
                                </View>

                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems:
                                            'center',
                                        marginBottom: 16,
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: 18,
                                        }}
                                    >
                                        📦
                                    </Text>

                                    <Text
                                        style={{
                                            marginLeft: 12,
                                            fontWeight:
                                                'bold',
                                        }}
                                    >
                                        Packed
                                    </Text>
                                </View>

                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems:
                                            'center',
                                        marginBottom: 16,
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: 18,
                                        }}
                                    >
                                        🛵
                                    </Text>

                                    <Text
                                        style={{
                                            marginLeft: 12,
                                            color: '#777',
                                        }}
                                    >
                                        Out For Delivery
                                    </Text>
                                </View>

                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems:
                                            'center',
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: 18,
                                        }}
                                    >
                                        🎉
                                    </Text>

                                    <Text
                                        style={{
                                            marginLeft: 12,
                                            color: '#777',
                                        }}
                                    >
                                        Delivered
                                    </Text>
                                </View>

                                <View
                                    style={{
                                        backgroundColor:
                                            '#ffffff',
                                        borderRadius: 14,
                                        padding: 14,
                                        marginTop: 22,
                                    }}
                                >
                                    <Text
                                        style={{
                                            color:
                                                '#A50021',
                                            fontWeight:
                                                'bold',
                                            fontSize: 16,
                                        }}
                                    >
                                        Delivery OTP
                                    </Text>

                                    <Text
                                        style={{
                                            fontSize: 34,
                                            fontWeight:
                                                'bold',
                                            letterSpacing: 6,
                                            marginTop: 10,
                                            color: '#111',
                                        }}
                                    >
                                        {order.otp ||
                                            '0000'}
                                    </Text>
                                </View>
                            </View>

                            <Text
                                style={{
                                    color: '#666',
                                    marginTop: 14,
                                }}
                            >
                                {order.createdAt ||
                                    ''}
                            </Text>

                            <View
                                style={{
                                    marginTop: 18,
                                    alignItems: 'center',
                                }}
                            >
                                <Text
                                    style={{
                                        color: '#A50021',
                                        fontWeight: 'bold',
                                    }}
                                >
                                    {expandedOrder ===
                                        order.id
                                        ? 'Hide Details ▲'
                                        : 'View Details ▼'}
                                </Text>
                            </View>

                            {expandedOrder ===
                                order.id && (
                                    <View
                                        style={{
                                            marginTop: 22,
                                            borderTopWidth: 1,
                                            borderTopColor:
                                                '#f0e5e5',
                                            paddingTop: 18,
                                        }}
                                    >
                                        {(order.items ||
                                            []).map(
                                                (item) => (
                                                    <View
                                                        key={item.id}
                                                        style={{
                                                            flexDirection:
                                                                'row',
                                                            alignItems:
                                                                'center',
                                                            marginBottom: 16,
                                                        }}
                                                    >
                                                        <Image
                                                            source={{
                                                                uri:
                                                                    item.image,
                                                            }}
                                                            style={{
                                                                width: 58,
                                                                height: 58,
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
                                                                numberOfLines={
                                                                    1
                                                                }
                                                                style={{
                                                                    fontWeight:
                                                                        'bold',
                                                                    fontSize: 15,
                                                                }}
                                                            >
                                                                {
                                                                    item.name
                                                                }
                                                            </Text>

                                                            <Text
                                                                style={{
                                                                    color:
                                                                        '#666',
                                                                    marginTop: 6,
                                                                }}
                                                            >
                                                                Qty:{' '}
                                                                {
                                                                    item.qty
                                                                }
                                                            </Text>
                                                        </View>

                                                        <Text
                                                            style={{
                                                                fontWeight:
                                                                    'bold',
                                                                color:
                                                                    '#A50021',
                                                                fontSize: 16,
                                                            }}
                                                        >
                                                            ₹
                                                            {item.price *
                                                                item.qty}
                                                        </Text>
                                                    </View>
                                                )
                                            )}
                                    </View>
                                )}
                        </TouchableOpacity>
                    )
                )}
            </ScrollView>

            <BottomNav navigation={navigation} />
        </View>
    );
}