import {
    createContext,
    useEffect,
    useState,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

export const OrdersContext =
    createContext();

export const OrdersProvider = ({
    children,
}) => {
    const [orders, setOrders] =
        useState([]);

    useEffect(() => {
        loadOrders();
    }, []);

    useEffect(() => {
        saveOrders();
    }, [orders]);

    const loadOrders =
        async () => {
            try {
                const savedOrders =
                    await AsyncStorage.getItem(
                        'orders'
                    );

                if (savedOrders) {
                    setOrders(
                        JSON.parse(
                            savedOrders
                        )
                    );
                }
            } catch (error) {
                console.log(error);
            }
        };

    const saveOrders =
        async () => {
            try {
                await AsyncStorage.setItem(
                    'orders',
                    JSON.stringify(
                        orders
                    )
                );
            } catch (error) {
                console.log(error);
            }
        };

    const placeOrder = (
        items,
        total
    ) => {
        const otp = Math.floor(
            1000 +
            Math.random() * 9000
        );

        const newOrder = {
            id: Date.now(),
            items,
            total,
            status: 'Packed',
            otp,
            createdAt:
                new Date().toLocaleString(),
        };

        setOrders([
            newOrder,
            ...orders,
        ]);

        return newOrder;
    };

    const completeOrder = (
        orderId
    ) => {
        setOrders(
            orders.map((order) =>
                order.id === orderId
                    ? {
                        ...order,
                        status:
                            'Delivered',
                    }
                    : order
            )
        );
    };

    return (
        <OrdersContext.Provider
            value={{
                orders,
                placeOrder,
                completeOrder,
            }}
        >
            {children}
        </OrdersContext.Provider>
    );
};