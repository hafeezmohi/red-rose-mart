import { useContext, useEffect, useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { CartContext } from '../context/CartContext';
import { FavoritesContext } from '../context/FavoritesContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.x.x:5000';

export default function ProductScreen({ route, navigation }) {
  const { product } = route.params;
  const { addToCart } = useContext(CartContext);
  const { toggleFavorite, isFavorite } = useContext(FavoritesContext);
  const [related, setRelated] = useState([]);
  const liked = isFavorite(product.id);

  useEffect(() => {
    fetchRelated();
  }, [product]);

  const fetchRelated = async () => {
    try {
      const res = await fetch(`${API_URL}/api/products?category=${product.category}&limit=10`);
      const data = await res.json();
      if (data.success) {
        const filtered = data.products
          .filter(p => p._id !== product.id)
          .map(p => ({
            id: p._id,
            name: p.name,
            image: p.images?.[0] || `https://placehold.co/150x150/f5f5f5/A50021?text=${encodeURIComponent(p.name)}`,
            price: p.discountPrice || p.price,
            rating: p.ratings?.average || 0,
            category: p.category,
            unit: p.unit,
            stock: p.stock,
          }));
        setRelated(filtered);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f7f3f3' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 160 }}>
        <View style={{ position: 'relative' }}>
          <Image source={{ uri: product.image }} style={{ width: '100%', height: 340 }} />
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ position: 'absolute', top: 55, left: 20, backgroundColor: '#ffffff', width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' }}
          >
            <Text style={{ fontSize: 20 }}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => toggleFavorite(product)}
            style={{ position: 'absolute', top: 55, right: 20, backgroundColor: '#ffffff', width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' }}
          >
            <Text style={{ fontSize: 22 }}>{liked ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ padding: 22 }}>
          <Text style={{ fontSize: 30, fontWeight: 'bold' }}>{product.name}</Text>
          <Text style={{ color: '#888', marginTop: 4 }}>{product.unit}</Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
            <View style={{ backgroundColor: '#e8f5e9', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 }}>
              <Text style={{ color: '#2e7d32', fontWeight: 'bold' }}>⭐ {product.rating}</Text>
            </View>
            <Text style={{ marginLeft: 10, color: '#666', fontSize: 15 }}>{product.reviews} reviews</Text>
          </View>

          <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#A50021', marginTop: 18 }}>₹{product.price}</Text>
          {product.originalPrice && (
            <Text style={{ color: '#999', fontSize: 14, textDecorationLine: 'line-through' }}>₹{product.originalPrice}</Text>
          )}

          <View style={{ backgroundColor: '#fff5f5', borderRadius: 18, padding: 16, marginTop: 22 }}>
            <Text style={{ color: '#A50021', fontWeight: 'bold', fontSize: 16 }}>⚡ Delivery in 10 mins</Text>
            <Text style={{ color: '#666', marginTop: 8, lineHeight: 22 }}>Fresh product delivered directly to your doorstep</Text>
          </View>

          <View style={{ marginTop: 34, backgroundColor: '#ffffff', borderRadius: 22, padding: 18 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Product Details</Text>
            <Text style={{ color: '#666', marginTop: 14, lineHeight: 26 }}>
              Premium quality grocery product freshly packed for fast delivery. Carefully selected for daily needs and freshness.
            </Text>
          </View>

          {related.length > 0 && (
            <View style={{ marginTop: 34 }}>
              <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 18 }}>You May Also Like</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {related.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => navigation.push('Product', { product: item })}
                    style={{ width: 170, backgroundColor: '#ffffff', borderRadius: 18, padding: 12, marginRight: 14 }}
                  >
                    <Image source={{ uri: item.image }} style={{ width: '100%', height: 100, borderRadius: 14 }} />
                    <Text numberOfLines={1} style={{ fontWeight: 'bold', marginTop: 10, fontSize: 15 }}>{item.name}</Text>
                    <Text style={{ color: '#ff9800', marginTop: 6, fontWeight: 'bold' }}>⭐ {item.rating}</Text>
                    <Text style={{ color: '#A50021', fontWeight: 'bold', marginTop: 8, fontSize: 17 }}>₹{item.price}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={{ position: 'absolute', bottom: 30, left: 20, right: 20 }}>
        <TouchableOpacity
          onPress={() => addToCart(product)}
          style={{ backgroundColor: '#A50021', height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center' }}
        >
          <Text style={{ color: '#ffffff', fontSize: 20, fontWeight: 'bold' }}>Add To Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}