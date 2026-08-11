import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ProductCard from '../components/ProductCard';
import { wp } from '../utils/responsive';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://red-rose-backend.onrender.com/';

export default function SearchResultsScreen({ navigation, route }) {
  const { searchQuery } = route.params;
  const [query, setQuery] = useState(searchQuery || '');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  const fetchSearchResults = async (term) => {
    if (!term.trim()) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const url = `${API_URL}/api/products?limit=50&search=${encodeURIComponent(term)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setProducts(
          data.products.map((p) => ({
            id: p._id?.$oid || p._id,
            name: p.name,
            image:
              p.images?.length > 0
                ? p.images[0]
                : `https://placehold.co/150x150/f5f5f5/A50021?text=${encodeURIComponent(p.name)}`,
            price: p.discountPrice || p.price,
            originalPrice: p.discountPrice ? p.price : null,
            rating: p.ratings?.average || 0,
            reviews: p.ratings?.count || 0,
            category: p.category,
            unit: p.unit,
            discount: p.discountPrice
              ? Math.round(((p.price - p.discountPrice) / p.price) * 100)
              : null,
          }))
        );
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSearchResults(searchQuery);
  }, [searchQuery]);

  const handleSearch = () => {
    if (query.trim()) {
      fetchSearchResults(query);
    }
  };

  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <StatusBar barStyle="light-content" backgroundColor="#0a1f44" />

      {/* Header */}
      <View
        style={{
          backgroundColor: '#0a1f44',
          paddingTop: insets.top + 10,
          paddingHorizontal: 16,
          paddingBottom: 16,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#fff',
              borderRadius: 8,
              paddingHorizontal: 12,
              height: 44,
            }}
          >
            <Ionicons name="search" size={18} color="#999" style={{ marginRight: 8 }} />
            <TextInput
              placeholder="Search for Products, Brands and More"
              placeholderTextColor="#aaa"
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              autoFocus={false}
              style={{ flex: 1, fontSize: 13, color: '#1a1a1a' }}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => { setQuery(''); setProducts([]); }}>
                <Ionicons name="close" size={18} color="#999" />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleSearch} style={{ marginLeft: 8, backgroundColor: '#A50021', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 6 }}>
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>Search</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Results */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#A50021" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 12, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {products.length > 0 ? (
            <>
              <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
                {products.length} result{products.length !== 1 ? 's' : ''} for "{searchQuery}"
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                {products.map((product, index) => (
                  <View key={`${product.id}-${index}`} style={{ width: '48%', marginBottom: 12 }}>
                    <ProductCard product={product} />
                  </View>
                ))}
              </View>
            </>
          ) : (
            <View style={{ alignItems: 'center', marginTop: 60 }}>
              <Ionicons name="search-outline" size={48} color="#ccc" style={{ marginBottom: 12 }} />
              <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#1a1a1a' }}>
                No Products Found
              </Text>
              <Text style={{ color: '#888', marginTop: 10, textAlign: 'center', lineHeight: 22 }}>
                Try a different search term
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
