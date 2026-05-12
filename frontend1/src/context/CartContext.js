import {
    createContext,
    useEffect,
    useState,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

export const CartContext =
    createContext();

export const CartProvider = ({
    children,
}) => {
    const [cartItems, setCartItems] =
        useState([]);

    useEffect(() => {
        loadCart();
    }, []);

    useEffect(() => {
        saveCart();
    }, [cartItems]);

    const loadCart = async () => {
        try {
            const savedCart =
                await AsyncStorage.getItem(
                    'cartItems'
                );

            if (savedCart) {
                const parsed =
                    JSON.parse(savedCart);

                setCartItems(
                    Array.isArray(parsed)
                        ? parsed
                        : []
                );
            }
        } catch (error) {
            console.log(error);
            setCartItems([]);
        }
    };

    const saveCart = async () => {
        try {
            await AsyncStorage.setItem(
                'cartItems',
                JSON.stringify(cartItems)
            );
        } catch (error) {
            console.log(error);
        }
    };

    const addToCart = (
        product
    ) => {
        const existing =
            cartItems.find(
                (item) =>
                    item.id === product.id
            );

        if (existing) {
            setCartItems(
                cartItems.map((item) =>
                    item.id === product.id
                        ? {
                            ...item,
                            qty:
                                item.qty + 1,
                        }
                        : item
                )
            );
        } else {
            setCartItems([
                ...cartItems,
                {
                    ...product,
                    qty: 1,
                },
            ]);
        }
    };

    const increaseQty = (
        productId
    ) => {
        setCartItems(
            cartItems.map((item) =>
                item.id === productId
                    ? {
                        ...item,
                        qty:
                            item.qty + 1,
                    }
                    : item
            )
        );
    };

    const decreaseQty = (
        productId
    ) => {
        const updated =
            cartItems
                .map((item) =>
                    item.id ===
                        productId
                        ? {
                            ...item,
                            qty:
                                item.qty - 1,
                        }
                        : item
                )
                .filter(
                    (item) => item.qty > 0
                );

        setCartItems(updated);
    };

    const clearCart = () => {
        setCartItems([]);
    };

    return (
        <CartContext.Provider
            value={{
                cartItems:
                    cartItems || [],
                addToCart,
                increaseQty,
                decreaseQty,
                clearCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};