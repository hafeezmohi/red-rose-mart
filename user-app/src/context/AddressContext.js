import {
    createContext,
    useEffect,
    useState,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

export const AddressContext =
    createContext();

export const AddressProvider = ({
    children,
}) => {
    const [selectedAddress,
        setSelectedAddress] =
        useState(null);

    useEffect(() => {
        loadAddress();
    }, []);

    const loadAddress =
        async () => {
            try {
                const savedAddress =
                    await AsyncStorage.getItem(
                        'selectedAddress'
                    );

                if (savedAddress) {
                    setSelectedAddress(
                        JSON.parse(
                            savedAddress
                        )
                    );
                }
            } catch (error) {
                // Error
            }
        };

    const saveAddress =
        async (address) => {
            try {
                setSelectedAddress(
                    address
                );

                await AsyncStorage.setItem(
                    'selectedAddress',
                    JSON.stringify(
                        address
                    )
                );
            } catch (error) {
                // Error
            }
        };

    return (
        <AddressContext.Provider
            value={{
                selectedAddress,
                saveAddress,
            }}
        >
            {children}
        </AddressContext.Provider>
    );
};