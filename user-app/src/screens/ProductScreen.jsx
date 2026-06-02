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
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { CartContext } from "../context/CartContext";
import { FavoritesContext } from "../context/FavoritesContext";
import { AddressContext } from "../context/AddressContext";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.1:5000";

export default function ProductScreen({ route, navigation }) {
  const { product } = route.params;

  const { addToCart, cartItems } = useContext(CartContext);

  const { toggleFavorite, isFavorite } = useContext(FavoritesContext);

  const { selectedAddress } = useContext(AddressContext);

  const [related, setRelated] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [inCart, setInCart] = useState(false);
  const [user, setUser] = useState(null);

  const liked = isFavorite(product.id);

  const discount = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100,
      )
    : null;

  useEffect(() => {
    fetchRelated();

    const cartItem = cartItems.find((i) => i.id === product.id);

    if (cartItem) setInCart(true);
  }, [product]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userStr = await AsyncStorage.getItem("user");

        if (userStr) {
          setUser(JSON.parse(userStr));
        }
      } catch (e) {
        console.log(e);
      }
    };

    loadUser();
  }, []);

  const fetchRelated = async () => {
    try {
      const res = await fetch(
        `${API_URL}/api/products?category=${product.category}&limit=10`,
      );

      const data = await res.json();

      if (data.success) {
        const filtered = data.products
          .filter((p) => p._id !== product.id)
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
            stock: p.stock,
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
    <View
      style={{
        flex: 1,
        backgroundColor: "#f5f5f5",
      }}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0a1f44" />

      {/* TOP HEADER */}
      <View
        style={{
          backgroundColor: "#0a1f44",
          paddingTop: 50,
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

          <Image
            source={{ uri: product.image }}
            style={{
              width: 260,
              height: 240,
            }}
            resizeMode="contain"
          />
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
              fontSize: 28,
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
                fontSize: 30,
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

          {/* RATING */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 14,
            }}
          >
            {[1, 2, 3, 4, 5].map((i) => (
              <Ionicons
                key={i}
                name={i <= Math.round(product.rating) ? "star" : "star-outline"}
                size={16}
                color="#f5a623"
                style={{ marginRight: 2 }}
              />
            ))}

            <Text
              style={{
                marginLeft: 8,
                color: "#777",
                fontSize: 13,
                fontWeight: "500",
              }}
            >
              {product.reviews || 0} reviews
            </Text>
          </View>

          {/* STOCK */}
          <View
            style={{
              marginTop: 18,
              alignSelf: "flex-start",
              backgroundColor: product.stock > 0 ? "#e8f5e9" : "#f5f5f5",
              paddingHorizontal: 14,
              paddingVertical: 7,
              borderRadius: 30,
            }}
          >
            <Text
              style={{
                color: product.stock > 0 ? "#2e7d32" : "#888",
                fontWeight: "700",
                fontSize: 13,
              }}
            >
              {product.stock > 0 ? "In Stock" : "Out of Stock"}
            </Text>
          </View>

          {/* QUANTITY */}
          <View
            style={{
              marginTop: 28,
            }}
          >
            <Text
              style={{
                color: "#333",
                fontWeight: "700",
                marginBottom: 12,
                fontSize: 15,
              }}
            >
              Quantity
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <TouchableOpacity
                onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 14,
                  backgroundColor: "#A50021",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 22,
                    fontWeight: "bold",
                  }}
                >
                  −
                </Text>
              </TouchableOpacity>

              <View
                style={{
                  marginHorizontal: 16,
                  minWidth: 60,
                  height: 46,
                  borderRadius: 14,
                  backgroundColor: "#f7f7f7",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "700",
                    color: "#111",
                  }}
                >
                  {quantity}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setQuantity((q) => q + 1)}
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 14,
                  backgroundColor: "#A50021",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 22,
                    fontWeight: "bold",
                  }}
                >
                  +
                </Text>
              </TouchableOpacity>
            </View>
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
            style={{
              color: "#555",
              lineHeight: 24,
            }}
          >
            Premium quality grocery product freshly packed for fast delivery.
            Carefully selected for freshness and quality.
          </Text>
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
              {related.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() =>
                    navigation.push("Product", {
                      product: item,
                    })
                  }
                  style={{
                    width: 160,
                    backgroundColor: "#fff",
                    borderRadius: 12,
                    marginRight: 14,
                    overflow: "hidden",
                    elevation: 1,
                  }}
                >
                  <Image
                    source={{ uri: item.image }}
                    style={{
                      width: "100%",
                      height: 120,
                      backgroundColor: "#f9f9f9",
                    }}
                    resizeMode="contain"
                  />

                  <View style={{ padding: 10 }}>
                    <Text
                      style={{
                        color: "#A50021",
                        fontWeight: "bold",
                        fontSize: 15,
                      }}
                    >
                      ₹{item.price}
                    </Text>

                    <Text
                      numberOfLines={1}
                      style={{
                        color: "#333",
                        marginTop: 4,
                        fontWeight: "600",
                      }}
                    >
                      {item.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {/* BOTTOM BUTTONS */}
      <View
        style={{
          position: "absolute",
          bottom: 10,
          left: 0,
          right: 0,
          flexDirection: "row",
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#eee",
        }}
      >
        <TouchableOpacity
          onPress={() =>
            inCart ? navigation.navigate("Cart") : handleAddToCart()
          }
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
            {inCart ? "GO TO CART" : "ADD TO CART"}
          </Text>
        </TouchableOpacity>

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
    </View>
  );
}
