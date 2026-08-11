import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from 'react-native-safe-area-context';
import ProductCard from './ProductCard';
import { wp, hp } from '../utils/responsive';

const API_URL = process.env.EXPO_PUBLIC_API_URL || "https://red-rose-backend.onrender.com/";
const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function CategoryModal({ visible, onClose, categoryId, categoryName }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && categoryId) {
      setLoading(true);
      const url = `${API_URL}/api/products?limit=50&category=${categoryId}`;
      fetch(url)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setProducts(data.products.map(p => ({
              id: p._id?.$oid || p._id,
              name: p.name,
              image: p.images?.length > 0 ? p.images[0] : `https://placehold.co/150x150/f5f5f5/A50021?text=${encodeURIComponent(p.name)}`,
              price: p.discountPrice || p.price,
              originalPrice: p.discountPrice ? p.price : null,
              rating: p.ratings?.average || 0,
              reviews: p.ratings?.count || 0,
              category: p.category,
              unit: p.unit,
              discount: p.discountPrice ? Math.round(((p.price - p.discountPrice) / p.price) * 100) : null,
            })));
          }
        })
        .catch(err => console.error("Error fetching category products:", err))
        .finally(() => setLoading(false));
    } else {
      setProducts([]); // Clear on close
    }
  }, [visible, categoryId]);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: '#f5f5f5', height: SCREEN_HEIGHT * 0.9, borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' }}>
          {/* Header */}
          <SafeAreaView edges={['top']} style={{ backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee', paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 20, fontWeight: '800', color: '#333' }}>
              {categoryName}
            </Text>
            <TouchableOpacity onPress={onClose} style={{ padding: 4, backgroundColor: '#f0f0f0', borderRadius: 20 }}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </SafeAreaView>

          {/* Content */}
          {loading ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#A50021" />
            </View>
          ) : (
            <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                {products.length > 0 ? (
                  products.map((product) => (
                    <View key={product.id} style={{ width: '48%', marginBottom: 12 }}>
                      <ProductCard product={product} />
                    </View>
                  ))
                ) : (
                  <Text style={{ textAlign: 'center', width: '100%', marginTop: 40, color: '#888', fontSize: 16 }}>No products found in this category.</Text>
                )}
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}
