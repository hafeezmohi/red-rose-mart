import { useContext, useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  TextInput,
  Linking,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { wp, hp, moderateScale } from '../utils/responsive';
import Skeleton from "../components/Skeleton";

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { CartContext } from "../context/CartContext";
import { FavoritesContext } from "../context/FavoritesContext";
import { AddressContext } from "../context/AddressContext";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "https://red-rose-backend.onrender.com/";
import ProductCard from "../components/ProductCard";

export default function ProductScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { product } = route.params;

  const { addToCart, cartItems, increaseQty, decreaseQty } = useContext(CartContext);
  const { toggleFavorite, isFavorite } = useContext(FavoritesContext);
  const { selectedAddress } = useContext(AddressContext);

  const [related, setRelated] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [user, setUser] = useState(null);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const liked = isFavorite(product.id || product._id);
  const cartItem = cartItems.find((i) => i.id === (product.id || product._id));
  const inCart = !!cartItem;

  const discount = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100,
      )
    : null;

  useEffect(() => {
    fetchRelated();
  }, [product]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userStr = await AsyncStorage.getItem("user");

        if (userStr) {
          setUser(JSON.parse(userStr));
        }
      } catch (e) {
        // Error loading user
      }
    };

    loadUser();
  }, []);

  const fetchRelated = async () => {
    try {
      setLoadingRelated(true);
      const res = await fetch(
        `${API_URL}/api/products?category=${product.category}&limit=10`,
      );

      const data = await res.json();

      if (data.success) {
        const filtered = data.products
          .filter((p) => p._id !== product.id && p._id !== product._id)
          .map((p) => ({
            id: p._id,
            name: p.name,
            image:
              p.images?.[0] ||
              `https://placehold.co/150x150/f5f5f5/A50021?text=${encodeURIComponent(
                p.name,
              )}`,
            price: p.discountPrice || p.price,
            originalPrice: p.discountPrice ? p.price : null,
            rating: p.ratings?.average || 0,
            reviews: p.ratings?.count || 0,
            category: p.category,
            unit: p.unit,
          }));

        setRelated(filtered);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRelated(false);
    }
  };


  const handleAddToCart = () => {
    addToCart(product);
  };

  const displayAddress =
    selectedAddress ||
    (user?.address?.street
      ? `${user.address.street}, ${user.address.city}`
      : "Set delivery address");

  const shortAddress =
    displayAddress.length > 28
      ? displayAddress.slice(0, 28) + "..."
      : displayAddress;

  return (
    <SafeAreaView edges={["bottom"]} style={{
        flex: 1,
        backgroundColor: "#f5f5f5",
      }}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0a1f44" />

      {/* TOP HEADER */}
      <View
        style={{
          backgroundColor: "#0a1f44",
          paddingTop: insets.top + 10,
          paddingHorizontal: 16,
          paddingBottom: 16,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: "rgba(255,255,255,0.6)",
                fontSize: 11,
              }}
            >
              Your Location
            </Text>

            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: 16,
                  marginRight: 4,
                }}
              >
                {shortAddress}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => Linking.openURL("tel:+918074559488")}
            style={{ padding: 6 }}
          >
            <Ionicons name="call" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* SEARCH BAR */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#fff",
            borderRadius: 8,
            paddingHorizontal: 12,
            height: 44,
            marginTop: 14,
          }}
        >
          <Ionicons
            name="search"
            size={18}
            color="#999"
            style={{ marginRight: 8 }}
          />

          <TextInput
            placeholder="Search for Products, Brands and More"
            placeholderTextColor="#aaa"
            style={{
              flex: 1,
              fontSize: 13,
              color: "#1a1a1a",
            }}
            editable={false}
            onFocus={() => navigation.goBack()}
          />

          <Ionicons name="options-outline" size={20} color="#aaa" />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 120,
        }}
      >
        {/* PRODUCT IMAGE */}
        <View
          style={{
            marginHorizontal: 14,
            marginTop: 14,
            backgroundColor: "#fff",
            borderRadius: 24,
            paddingTop: 24,
            paddingBottom: 20,
            paddingHorizontal: 18,
            alignItems: "center",
            elevation: 3,
            shadowColor: "#000",
            shadowOpacity: 0.08,
            shadowRadius: 10,
          }}
        >
          {/* DISCOUNT */}
          {discount && (
            <View
              style={{
                position: "absolute",
                top: 16,
                left: 16,
                backgroundColor: "#A50021",
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 30,
                zIndex: 10,
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontWeight: "700",
                  fontSize: 12,
                }}
              >
                {discount}% OFF
              </Text>
            </View>
          )}


          {/* WISHLIST */}
          <TouchableOpacity
            onPress={() => toggleFavorite(product)}
            style={{
              position: "absolute",
              top: 14,
              right: 14,
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: "#fff",
              justifyContent: "center",
              alignItems: "center",
              elevation: 4,
              shadowColor: "#000",
              shadowOpacity: 0.12,
              shadowRadius: 6,
              zIndex: 10,
            }}
          >
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={22}
              color="#A50021"
            />
          </TouchableOpacity>

          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const x = e.nativeEvent.contentOffset.x;
              setActiveImageIndex(Math.round(x / wp(80)));
            }}
            scrollEventThrottle={16}
            style={{ width: wp(80) }}
          >
            {(product.images && product.images.length > 0 ? product.images : [product.image]).map((img, idx) => (
              <View key={idx} style={{ width: wp(80), alignItems: 'center' }}>
                <Image
                  source={{ uri: img }}
                  style={{
                    width: wp(65),
                    height: hp(28),
                  }}
                  resizeMode="contain"
                />
              </View>
            ))}
          </ScrollView>

          {/* DOTS */}
          {(product.images && product.images.length > 1) && (
            <View style={{ flexDirection: 'row', marginTop: 12 }}>
              {product.images.map((_, idx) => (
                <View
                  key={idx}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: activeImageIndex === idx ? '#A50021' : '#ddd',
                    marginHorizontal: 4
                  }}
                />
              ))}
            </View>
          )}
        </View>

        {/* PRODUCT DETAILS */}
        <View
          style={{
            marginHorizontal: 14,
            marginTop: 14,
            backgroundColor: "#fff",
            borderRadius: 24,
            padding: 22,
            elevation: 2,
            shadowColor: "#000",
            shadowOpacity: 0.06,
            shadowRadius: 8,
          }}
        >
          <Text
            style={{
              color: "#888",
              fontSize: 12,
              fontWeight: "600",
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            {product.category}
          </Text>

          <Text
            style={{
              fontSize: moderateScale(26),
              fontWeight: "bold",
              color: "#111",
              marginTop: 8,
              lineHeight: 36,
            }}
          >
            {product.name}
          </Text>

          {/* PRICE */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 18,
            }}
          >
            <Text
              style={{
                color: "#A50021",
                fontWeight: "bold",
                fontSize: moderateScale(28),
              }}
            >
              ₹ {product.price}.00
            </Text>

            {product.originalPrice && (
              <Text
                style={{
                  color: "#999",
                  fontSize: 16,
                  textDecorationLine: "line-through",
                  marginLeft: 12,
                }}
              >
                ₹{product.originalPrice}.00
              </Text>
            )}
          </View>





        </View>

        {/* DESCRIPTION */}
        <View
          style={{
            marginHorizontal: 14,
            marginTop: 14,
            backgroundColor: "#fff",
            borderRadius: 14,
            padding: 18,
          }}
        >
          <Text
            style={{
              color: "#333",
              fontSize: 18,
              fontWeight: "bold",
              marginBottom: 10,
            }}
          >
            Description
          </Text>

          <Text
            numberOfLines={isDescExpanded ? undefined : 3}
            style={{
              color: "#555",
              lineHeight: 24,
            }}
          >
            {product.description || "Premium quality grocery product freshly packed for fast delivery. Carefully selected for freshness and quality."}
          </Text>
          
          {(product.description || "Premium quality grocery product freshly packed for fast delivery. Carefully selected for freshness and quality.").length > 120 && (
            <TouchableOpacity onPress={() => setIsDescExpanded(!isDescExpanded)}>
              <Text style={{ color: "#A50021", fontWeight: "bold", marginTop: 8 }}>
                {isDescExpanded ? "Show Less" : "Read More"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* RELATED PRODUCTS */}
        {related.length > 0 && (
          <View
            style={{
              marginTop: 18,
              marginBottom: 20,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                marginHorizontal: 14,
                marginBottom: 14,
                color: "#1a1a1a",
              }}
            >
              You May Also Like
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingLeft: 14,
              }}
            >
              {loadingRelated ? (
                [1, 2, 3].map((i) => (
                  <View key={`skeleton-${i}`} style={{ width: wp(40), backgroundColor: "#fff", borderRadius: 12, marginRight: 14, overflow: "hidden", elevation: 1 }}>
                    <Skeleton width="100%" height={hp(14)} />
                    <View style={{ padding: 10 }}>
                      <Skeleton width="80%" height={14} style={{ marginBottom: 6 }} />
                      <Skeleton width="40%" height={12} />
                    </View>
                  </View>
                ))
              ) : (
                related.map((item, index) => (
                  <ProductCard key={`${item.id}-${index}`} product={item} width={wp(40)} />
              )))}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {/* BOTTOM BUTTONS */}
      <View
        style={{
          position: "absolute",
          bottom: insets.bottom,
          left: 0,
          right: 0,
          flexDirection: "row",
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#eee",
        }}
      >
        {inCart ? (
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', borderRightWidth: 1, borderRightColor: '#eee' }}>
            <TouchableOpacity onPress={() => decreaseQty(cartItem.id)} style={{ width: 44, height: 44, backgroundColor: '#f5f5f5', borderRadius: 22, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1a1a1a' }}>-</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1a1a1a' }}>{cartItem.qty}</Text>
            <TouchableOpacity onPress={() => increaseQty(cartItem.id)} style={{ width: 44, height: 44, backgroundColor: '#A50021', borderRadius: 22, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff' }}>+</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => handleAddToCart()}
            style={{
              flex: 1,
              height: 58,
              justifyContent: "center",
              alignItems: "center",
              borderRightWidth: 1,
              borderRightColor: "#eee",
            }}
          >
            <Text
              style={{
                fontWeight: "bold",
                color: "#1a1a1a",
              }}
            >
              ADD TO CART
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => {
            handleAddToCart();
            navigation.navigate("Cart");
          }}
          style={{
            flex: 1,
            height: 58,
            backgroundColor: "#f0c000",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontWeight: "bold",
              color: "#1a1a1a",
            }}
          >
            BUY NOW
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
