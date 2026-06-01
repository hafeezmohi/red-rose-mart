import { useContext, useEffect, useState } from 'react';
import {
  Image, ScrollView, Text, TouchableOpacity, View,
  ActivityIndicator, StatusBar, TextInput,
} from 'react-native';
import { CartContext } from '../context/CartContext';
import { FavoritesContext } from '../context/FavoritesContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.x.x:5000';

export default function ProductScreen({ route, navigation }) {
  const { product } = route.params;
  const { addToCart, cartItems } = useContext(CartContext);
  const { toggleFavorite, isFavorite } = useContext(FavoritesContext);
  const [related, setRelated]   = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [inCart, setInCart]     = useState(false);
  const liked = isFavorite(product.id);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  useEffect(() => {
    fetchRelated();
    const cartItem = cartItems.find(i => i.id === product.id);
    if (cartItem) setInCart(true);
  }, [product]);

  const fetchRelated = async () => {
    try {
      const res  = await fetch(`${API_URL}/api/products?category=${product.category}&limit=10`);
      const data = await res.json();
      if (data.success) {
        const filtered = data.products
          .filter(p => p._id !== product.id)
          .map(p => ({
            id:       p._id,
            name:     p.name,
            image:    p.images?.[0] || `https://placehold.co/150x150/f5f5f5/A50021?text=${encodeURIComponent(p.name)}`,
            price:    p.discountPrice || p.price,
            originalPrice: p.discountPrice ? p.price : null,
            rating:   p.ratings?.average || 0,
            category: p.category,
            unit:     p.unit,
            stock:    p.stock,
          }));
        setRelated(filtered);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    setInCart(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Fixed Top Nav bar */}
      <View style={{
        backgroundColor: '#0a1f44',
        paddingTop: 48, paddingBottom: 12,
        paddingHorizontal: 16,
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <TouchableOpacity>
          <Text style={{ color: '#fff', fontSize: 20 }}>☰</Text>
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>Your Location</Text>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>Kagaznagar</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 14 }}>
          <Text style={{ color: '#fff', fontSize: 18 }}>▦</Text>
          <Text style={{ color: '#fff', fontSize: 18 }}>📞</Text>
          <Text style={{ color: '#fff', fontSize: 18 }}>⋮</Text>
        </View>
      </View>

      {/* Search bar */}
      <View style={{
        backgroundColor: '#0a1f44',
        paddingHorizontal: 16, paddingBottom: 14,
      }}>
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          backgroundColor: '#fff', borderRadius: 8,
          paddingHorizontal: 12, height: 42,
        }}>
          <Text style={{ fontSize: 16, marginRight: 8, color: '#999' }}>🔍</Text>
          <TextInput
            placeholder="Search for Products, Brands and More"
            placeholderTextColor="#aaa"
            style={{ flex: 1, fontSize: 13 }}
            editable={false}
            onFocus={() => navigation.goBack()}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Product Image Card */}
        <View style={{
          margin: 14,
          backgroundColor: '#fff',
          borderRadius: 12,
          padding: 16,
          alignItems: 'center',
          shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
          position: 'relative',
        }}>
          {discount && (
            <View style={{
              position: 'absolute', top: 0, left: 0,
              backgroundColor: '#A50021',
              paddingHorizontal: 10, paddingVertical: 6,
              borderTopLeftRadius: 12, borderBottomRightRadius: 12,
            }}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 11, textAlign: 'center' }}>
                {discount}%{'\n'}OFF
              </Text>
            </View>
          )}
          <Image
            source={{ uri: product.image }}
            style={{ width: 220, height: 180 }}
            resizeMode="contain"
          />
        </View>

        {/* Product Info Card */}
        <View style={{
          marginHorizontal: 14, marginBottom: 14,
          backgroundColor: '#fff', borderRadius: 12,
          padding: 18,
          shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
        }}>
          {/* Category */}
          <Text style={{ color: '#888', fontSize: 13, marginBottom: 4 }}>{product.category}</Text>

          {/* Name */}
          <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#1a1a1a' }}>{product.name}</Text>

          {/* Price row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 10 }}>
            <Text style={{ color: '#A50021', fontWeight: 'bold', fontSize: 20 }}>
              ₹ {product.price}.00
            </Text>
            {product.originalPrice && (
              <Text style={{ color: '#999', fontSize: 15, textDecorationLine: 'line-through' }}>
                ₹{product.originalPrice}.00
              </Text>
            )}
          </View>

          {/* Rating */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 8 }}>
            <View style={{
              backgroundColor: '#2e7d32', borderRadius: 6,
              paddingHorizontal: 8, paddingVertical: 3,
              flexDirection: 'row', alignItems: 'center', gap: 3,
            }}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>
                {product.rating} ★
              </Text>
            </View>
            <Text style={{ color: '#666', fontSize: 13 }}>{product.reviews} reviews</Text>
          </View>

          {/* Divider */}
          <View style={{ height: 1, backgroundColor: '#f0f0f0', marginVertical: 14 }} />

          {/* Availability */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <Text style={{ color: '#444', fontSize: 14, fontWeight: '500', width: 110 }}>Availability:</Text>
            <Text style={{
              color: product.stock > 0 ? '#A50021' : '#999',
              fontWeight: '600', fontSize: 14,
            }}>
              {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </Text>
          </View>

          {/* Rewards */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
            <Text style={{ color: '#444', fontSize: 14, fontWeight: '500', width: 110 }}>Rewards:</Text>
            <Text style={{ color: '#1a1a1a', fontWeight: '600', fontSize: 14 }}>0</Text>
          </View>

          {/* Quantity */}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ color: '#444', fontSize: 14, fontWeight: '500', width: 110 }}>Quantity:</Text>
            <View style={{
              flexDirection: 'row', alignItems: 'center',
              borderWidth: 1.5, borderColor: '#ddd', borderRadius: 30,
              overflow: 'hidden',
            }}>
              <TouchableOpacity
                onPress={() => setQuantity(q => Math.max(1, q - 1))}
                style={{
                  width: 38, height: 38,
                  justifyContent: 'center', alignItems: 'center',
                  backgroundColor: '#A50021',
                }}
              >
                <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold', lineHeight: 22 }}>−</Text>
              </TouchableOpacity>
              <Text style={{ paddingHorizontal: 20, fontSize: 16, fontWeight: '600', color: '#1a1a1a' }}>
                {quantity}
              </Text>
              <TouchableOpacity
                onPress={() => setQuantity(q => q + 1)}
                style={{
                  width: 38, height: 38,
                  justifyContent: 'center', alignItems: 'center',
                  backgroundColor: '#A50021',
                }}
              >
                <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold', lineHeight: 22 }}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Divider */}
          <View style={{ height: 1, backgroundColor: '#f0f0f0', marginVertical: 14 }} />

          {/* Wishlist & Notes row */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <TouchableOpacity
              onPress={() => toggleFavorite(product)}
              style={{ alignItems: 'center', padding: 8 }}
            >
              <Text style={{ fontSize: 26 }}>{liked ? '❤️' : '🤍'}</Text>
            </TouchableOpacity>
            <View style={{ width: 1, backgroundColor: '#f0f0f0' }} />
            <TouchableOpacity style={{ alignItems: 'center', padding: 8 }}>
              <Text style={{ fontSize: 22 }}>✏️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Description */}
        <View style={{
          marginHorizontal: 14, marginBottom: 14,
          backgroundColor: '#fff', borderRadius: 12,
          padding: 18,
          shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.06, shadowRadius: 4, elevation: 1,
        }}>
          <Text style={{ fontSize: 17, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 12 }}>Description</Text>
          <Text style={{ color: '#555', lineHeight: 24, fontSize: 14 }}>
            Premium quality grocery product freshly packed for fast delivery. Carefully selected for daily needs and freshness. In India, this is a popular choice when it comes to daily needs. The natural flavour is not only a treat but also provides nutrition. Be it raisins, dates, dehydrated mangoes and berries, there are plenty of options to choose from.
          </Text>
        </View>

        {/* Reviews */}
        <View style={{
          marginHorizontal: 14, marginBottom: 14,
          backgroundColor: '#fff', borderRadius: 12, padding: 18,
          shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.06, shadowRadius: 4, elevation: 1,
        }}>
          <Text style={{ fontSize: 17, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 14 }}>
            Reviews ({product.reviews || 0})
          </Text>
          {product.reviews > 0 ? (
            <View style={{
              backgroundColor: '#fffbe6', borderRadius: 10, padding: 14,
              borderLeftWidth: 4, borderLeftColor: '#f5a623',
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 15, color: '#1a1a1a' }}>Customer</Text>
                <View style={{ flexDirection: 'row' }}>
                  {[1,2,3,4,5].map(i => (
                    <Text key={i} style={{ color: i <= Math.round(product.rating) ? '#f5a623' : '#ddd', fontSize: 14 }}>★</Text>
                  ))}
                </View>
              </View>
              <Text style={{ color: '#555', lineHeight: 22, fontSize: 13 }}>
                Great product! Exactly as described. Delivery was also very prompt.
              </Text>
            </View>
          ) : (
            <Text style={{ color: '#aaa', fontSize: 13 }}>No reviews yet.</Text>
          )}
        </View>

        {/* Related Products */}
        {related.length > 0 && (
          <View style={{ marginBottom: 14 }}>
            <Text style={{ fontSize: 17, fontWeight: 'bold', marginHorizontal: 14, marginBottom: 12, color: '#1a1a1a' }}>
              You May Also Like
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 14 }}>
              {related.map(item => {
                const itemDiscount = item.originalPrice
                  ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
                  : null;
                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => navigation.push('Product', { product: item })}
                    style={{
                      width: 150, backgroundColor: '#fff',
                      borderRadius: 10, marginRight: 12,
                      overflow: 'hidden',
                      shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
                    }}
                  >
                    <View style={{ position: 'relative' }}>
                      <Image
                        source={{ uri: item.image }}
                        style={{ width: '100%', height: 100, backgroundColor: '#f9f9f9' }}
                        resizeMode="contain"
                      />
                      {itemDiscount && (
                        <View style={{
                          position: 'absolute', top: 0, left: 0,
                          backgroundColor: '#A50021',
                          paddingHorizontal: 6, paddingVertical: 3,
                          borderBottomRightRadius: 6,
                        }}>
                          <Text style={{ color: '#fff', fontSize: 9, fontWeight: 'bold' }}>
                            {itemDiscount}% OFF
                          </Text>
                        </View>
                      )}
                    </View>
                    <View style={{ padding: 10 }}>
                      <Text style={{ color: '#A50021', fontWeight: 'bold', fontSize: 14 }}>₹{item.price}</Text>
                      <Text numberOfLines={1} style={{ fontWeight: '600', fontSize: 12, color: '#333', marginTop: 2 }}>
                        {item.name}
                      </Text>
                      <View style={{ flexDirection: 'row', marginTop: 4 }}>
                        {[1,2,3,4,5].map(i => (
                          <Text key={i} style={{ color: i <= Math.round(item.rating) ? '#f5a623' : '#ddd', fontSize: 10 }}>★</Text>
                        ))}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: '#fff',
        borderTopWidth: 1, borderTopColor: '#f0f0f0',
        flexDirection: 'row',
        paddingHorizontal: 0, paddingVertical: 0,
      }}>
        <TouchableOpacity
          onPress={() => inCart ? navigation.navigate('Cart') : handleAddToCart()}
          style={{
            flex: 1, height: 56,
            justifyContent: 'center', alignItems: 'center',
            borderRightWidth: 1, borderRightColor: '#eee',
          }}
        >
          <Text style={{ color: '#1a1a1a', fontWeight: 'bold', fontSize: 15, letterSpacing: 0.3 }}>
            {inCart ? 'GO TO CART' : 'ADD TO CART'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            handleAddToCart();
            navigation.navigate('Cart');
          }}
          style={{
            flex: 1, height: 56,
            backgroundColor: '#f0c000',
            justifyContent: 'center', alignItems: 'center',
          }}
        >
          <Text style={{ color: '#1a1a1a', fontWeight: 'bold', fontSize: 15, letterSpacing: 0.3 }}>BUY NOW</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Nav */}
      {/* BottomNav would go here — keeping consistent with the rest of the app */}
    </View>
  );
}