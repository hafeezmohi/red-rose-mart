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

import { SafeAreaView } from 'react-native-safe-area-context';

import BottomNav from '../components/BottomNav';

import {
    FavoritesContext,
} from '../context/FavoritesContext';

import { CartContext } from '../context/CartContext';

export default function WishlistScreen({
    navigation,
}) {
    const {
        favorites,
        toggleFavorite,
    } = useContext(
        FavoritesContext
    );

    const { addToCart } =
        useContext(CartContext);

    return (
        <SafeAreaView
            edges={["bottom"]}
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
                    paddingTop: 55,
                    paddingHorizontal: 20,
                    paddingBottom: 140,
                }}
            >
                <Text
                    style={{
                        color: '#1a1a1a',
                        fontSize: 32,
                        fontWeight: 'bold',
                        marginBottom: 24,
                    }}
                >
                    Wishlist
                </Text>

                {favorites.length ===
                    0 ? (
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
                            🤍
                        </Text>

                        <Text
                            style={{
                                color: '#1a1a1a',
                                fontSize: 24,
                                fontWeight: 'bold',
                                marginTop: 20,
                            }}
                        >
                            No Favorites Yet
                        </Text>

                        <Text
                            style={{
                                marginTop: 10,
                                color: '#666',
                                textAlign: 'center',
                                lineHeight: 24,
                            }}
                        >
                            Products you like will
                            appear here
                        </Text>
                    </View>
                ) : (
                    favorites.map((product) => (
                        <TouchableOpacity
                            key={product.id}
                            onPress={() =>
                                navigation.navigate(
                                    'Product',
                                    {
                                        product,
                                    }
                                )
                            }
                            style={{
                                backgroundColor:
                                    '#ffffff',
                                borderRadius: 20,
                                padding: 14,
                                marginBottom: 16,
                                flexDirection: 'row',
                                alignItems: 'center',
                            }}
                        >
                            <Image
                                source={{
                                    uri: product.image,
                                }}
                                style={{
                                    width: 82,
                                    height: 82,
                                    borderRadius: 16,
                                }}
                            />

                            <View
                                style={{
                                    flex: 1,
                                    marginLeft: 14,
                                }}
                            >
                                <Text
                                    numberOfLines={1}
                                    style={{
                                        color: '#1a1a1a',
                                        fontSize: 18,
                                        fontWeight: 'bold',
                                    }}
                                >
                                    {product.name}
                                </Text>

                                <Text
                                    style={{
                                        color: '#1a1a1a',
                                        fontSize: 18,
                                        fontWeight: 'bold',
                                        marginTop: 10,
                                    }}
                                >
                                    ₹{product.price}
                                </Text>

                                <TouchableOpacity
                                    onPress={() =>
                                        addToCart(
                                            product
                                        )
                                    }
                                    style={{
                                        backgroundColor:
                                            '#A50021',
                                        marginTop: 12,
                                        paddingVertical: 8,
                                        borderRadius: 12,
                                        alignItems:
                                            'center',
                                        width: 120,
                                    }}
                                >
                                    <Text
                                        style={{
                                            color:
                                                '#ffffff',
                                            fontWeight:
                                                'bold',
                                        }}
                                    >
                                        Add To Cart
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                onPress={() =>
                                    toggleFavorite(
                                        product
                                    )
                                }
                            >
                                <Text
                                    style={{
                                        fontSize: 28,
                                    }}
                                >
                                    ❤️
                                </Text>
                            </TouchableOpacity>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>

            <BottomNav navigation={navigation} />
        </SafeAreaView>
    );
}