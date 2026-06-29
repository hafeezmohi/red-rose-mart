import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://red-rose-backend.onrender.com/';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // helper — get token
  const getToken = async () => await AsyncStorage.getItem('token');

  // fetch cart from backend
  const fetchCart = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      const token = await getToken();
      if (!token) return;

      const res = await fetch(`${API_URL}/api/cart`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
      });
      const data = await res.json();

      if (data.success) {
        // Detect corrupted cart items (where product is null because of $oid corruption)
        const hasCorrupted = (data.cart.items || []).some(item => !item.product);
        if (hasCorrupted) {
          console.warn('Corrupted cart detected, clearing cart...');
          await fetch(`${API_URL}/api/cart`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });
          setCartItems([]);
          return;
        }

        // map backend cart items to match UI shape
        const mapped = (data.cart.items || []).map(item => ({
          id: item.product._id,
          name: item.product.name,
          price: item.product.discountPrice || item.product.price,
          image: item.product.images?.[0] ||
            `https://placehold.co/150x150/f5f5f5/A50021?text=${encodeURIComponent(item.product.name)}`,
          unit: item.product.unit,
          qty: item.quantity,
        }));
        setCartItems(mapped);
      }
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart(true);
  }, []);

  // add to cart
  const addToCart = async (product) => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });
      const data = await res.json();
      if (data.success) await fetchCart(false);
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
  };

  // increase qty
  const increaseQty = async (productId) => {
    try {
      const item = cartItems.find(i => i.id === productId);
      if (!item) return;

      // Optimistic update
      setCartItems(prev => prev.map(i => i.id === productId ? { ...i, qty: i.qty + 1 } : i));

      const token = await getToken();
      const res = await fetch(`${API_URL}/api/cart/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ quantity: item.qty + 1 }),
      });
      const data = await res.json();
      if (data.success) await fetchCart(false);
    } catch (err) {
      console.error('Failed to increase qty:', err);
    }
  };

  // decrease qty — remove if qty becomes 0
  const decreaseQty = async (productId) => {
    try {
      const item = cartItems.find(i => i.id === productId);
      if (!item) return;

      // Optimistic update
      if (item.qty <= 1) {
        setCartItems(prev => prev.filter(i => i.id !== productId));
      } else {
        setCartItems(prev => prev.map(i => i.id === productId ? { ...i, qty: i.qty - 1 } : i));
      }

      const token = await getToken();

      if (item.qty <= 1) {
        // remove item
        const res = await fetch(`${API_URL}/api/cart/${productId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) await fetchCart(false);
      } else {
        // decrease
        const res = await fetch(`${API_URL}/api/cart/${productId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ quantity: item.qty - 1 }),
        });
        const data = await res.json();
        if (data.success) await fetchCart(false);
      }
    } catch (err) {
      console.error('Failed to decrease qty:', err);
    }
  };

  // clear cart (after order placed)
  const clearCart = async () => {
    try {
      setCartItems([]);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        return;
      }
      await fetch(`${API_URL}/api/cart`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error('Failed to clear cart:', err);
    }
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      loading,
      addToCart,
      increaseQty,
      decreaseQty,
      clearCart,
      fetchCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};