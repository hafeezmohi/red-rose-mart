import {
    createContext,
    useEffect,
    useState,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

export const FavoritesContext =
    createContext();

export const FavoritesProvider = ({
    children,
}) => {
    const [favorites, setFavorites] =
        useState([]);

    useEffect(() => {
        loadFavorites();
    }, []);

    useEffect(() => {
        saveFavorites();
    }, [favorites]);

    const loadFavorites =
        async () => {
            try {
                const savedFavorites =
                    await AsyncStorage.getItem(
                        'favorites'
                    );

                if (savedFavorites) {
                    setFavorites(
                        JSON.parse(
                            savedFavorites
                        )
                    );
                }
            } catch (error) {
                console.log(error);
            }
        };

    const saveFavorites =
        async () => {
            try {
                await AsyncStorage.setItem(
                    'favorites',
                    JSON.stringify(
                        favorites
                    )
                );
            } catch (error) {
                console.log(error);
            }
        };

    const toggleFavorite = (
        product
    ) => {
        const exists =
            favorites.find(
                (item) =>
                    item.id === product.id
            );

        if (exists) {
            setFavorites(
                favorites.filter(
                    (item) =>
                        item.id !==
                        product.id
                )
            );
        } else {
            setFavorites([
                ...favorites,
                product,
            ]);
        }
    };

    const isFavorite = (
        productId
    ) => {
        return favorites.some(
            (item) =>
                item.id === productId
        );
    };

    return (
        <FavoritesContext.Provider
            value={{
                favorites,
                toggleFavorite,
                isFavorite,
            }}
        >
            {children}
        </FavoritesContext.Provider>
    );
};