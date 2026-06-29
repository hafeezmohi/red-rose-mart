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

    return (
        <AddressContext.Provider
            value={{
                selectedAddress,
            }}
        >
            {children}
        </AddressContext.Provider>
    );
};