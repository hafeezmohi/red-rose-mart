import { useContext, useEffect, useState, useCallback } from "react";
import {
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import BottomNav from "../components/BottomNav";
import { CartContext } from "../context/CartContext";
import { AddressContext } from "../context/AddressContext";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.1:5000";

const banners = [
  {
    id: "1",
    title: "Fresh Veggies",
    subtitle: "Up to 30% off today!",
    color: "#2e7d32",
  },
  {
    id: "2",
    title: "Dairy Fresh",
    subtitle: "Delivered daily",
    color: "#1565c0",
  },
  {
    id: "3",
    title: "Snacks & More",
    subtitle: "New arrivals",
    color: "#e65100",
  },
];

const categories = [
  { id: "all", name: "All", emoji: "🛒" },
  { id: "fruits-vegetables", name: "Veggies", emoji: "🥦" },
  { id: "dairy-eggs", name: "Dairy", emoji: "🥛" },
  { id: "rice-grains", name: "Grains", emoji: "🌾" },
  { id: "snacks", name: "Snacks", emoji: "🍿" },
  { id: "beverages", name: "Drinks", emoji: "🧃" },
  { id: "personal-care", name: "Care", emoji: "🧴" },
  { id: "haircare", name: "Hair", emoji: "💆" },
  { id: "household", name: "Home", emoji: "🏠" },
];

export default function HomeScreen({ navigation }) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showCartBar, setShowCartBar] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTimeout, setSearchTimeout] = useState(null);

  const { cartItems, addToCart } = useContext(CartContext);
  const { selectedAddress } = useContext(AddressContext);

  const fetchProducts = useCallback(
    async (category = "All", searchTerm = "") => {
      try {
        let url = `${API_URL}/api/products?limit=40`; 
        if (category !== "All") {
          const cat = categories.find((c) => c.name === category);
          if (cat && cat.id !== "all") url += `&category=${cat.id}`;
        }
        if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;

        const res = await fetch(url);
        const data = await res.json();
        if (data.success) setProducts(data.products);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchProducts(selectedCategory, search);
  }, [selectedCategory]);

  const onSearchChange = (text) => {
    setSearch(text);
    if (searchTimeout) clearTimeout(searchTimeout);
    setSearchTimeout(
      setTimeout(() => {
        fetchProducts(selectedCategory, text);
      }, 500),
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts(selectedCategory, search);
  };

  useEffect(() => {
    if (cartItems.length > 0) {
      setShowCartBar(true);
      const timer = setTimeout(() => setShowCartBar(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [cartItems]);

  const mappedProducts = products.map((p) => ({
    id: p._id,
    name: p.name,
    image:
      p.images?.length > 0
        ? p.images[0]
        : `https://placehold.co/150x150/f5f5f5/A50021?text=${encodeURIComponent(p.name)}`,
    price: p.discountPrice || p.price,
    originalPrice: p.discountPrice ? p.price : null,
    rating: p.ratings?.average || 0,
    reviews: p.ratings?.count || 0,
    category: categories.find((c) => c.id === p.category)?.name || p.category,
    unit: p.unit,
    stock: p.stock,
  }));

  const filteredProducts = mappedProducts.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" ? true : product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalItems = cartItems.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0,
  );
  const shortAddress = selectedAddress
    ? selectedAddress.slice(0, 28)
    : "Set delivery address";

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f7f3f3",
        }}
      >
        <ActivityIndicator size="large" color="#A50021" />
        <Text style={{ marginTop: 12, color: "#666" }}>
          Loading products...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f7f3f3" }}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#A50021"]}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 160 }}
      >
        {/* Header */}
        <View
          style={{
            backgroundColor: "#A50021",
            paddingTop: 55,
            paddingHorizontal: 20,
            paddingBottom: 95,
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
          }}
        >
          <Text style={{ color: "#ffffffcc", fontSize: 13 }}>Deliver To</Text>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("Address", {
                checkoutData: { cartItems: [], total: 0 },
              })
            }
          >
            <Text
              numberOfLines={1}
              style={{
                color: "#ffffff",
                fontSize: 22,
                fontWeight: "bold",
                marginTop: 4,
              }}
            >
              📍 {shortAddress}
            </Text>
          </TouchableOpacity>
          <Text style={{ color: "#ffffffcc", marginTop: 8 }}>
            Delivery in 10 mins ⚡
          </Text>
        </View>

        <View style={{ marginTop: -30, paddingHorizontal: 20 }}>
          {/* Search */}
          <View
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 18,
              paddingHorizontal: 16,
              height: 55,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 18, marginRight: 10 }}>🔍</Text>
            <TextInput
              placeholder="Search products"
              value={search}
              onChangeText={onSearchChange}
              style={{ flex: 1, fontSize: 15 }}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => onSearchChange("")}>
                <Text style={{ fontSize: 16, color: "#999" }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Categories */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: 22 }}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => setSelectedCategory(category.name)}
                style={{
                  backgroundColor:
                    selectedCategory === category.name ? "#A50021" : "#ffffff",
                  paddingHorizontal: 18,
                  paddingVertical: 10,
                  borderRadius: 14,
                  marginRight: 10,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 16, marginRight: 6 }}>
                  {category.emoji}
                </Text>
                <Text
                  style={{
                    color:
                      selectedCategory === category.name ? "#ffffff" : "#222",
                    fontWeight: "bold",
                  }}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Banners */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: 22 }}
          >
            {banners.map((banner) => (
              <View
                key={banner.id}
                style={{
                  width: 260,
                  backgroundColor: banner.color,
                  borderRadius: 24,
                  padding: 22,
                  marginRight: 14,
                }}
              >
                <Text
                  style={{ color: "#ffffff", fontSize: 24, fontWeight: "bold" }}
                >
                  {banner.title}
                </Text>
                <Text
                  style={{ color: "#ffffffdd", marginTop: 10, fontSize: 15 }}
                >
                  {banner.subtitle}
                </Text>
              </View>
            ))}
          </ScrollView>

          {/* Products */}
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              marginTop: 28,
              marginBottom: 18,
            }}
          >
            Products
          </Text>

          {filteredProducts.length === 0 ? (
            <View
              style={{ alignItems: "center", marginTop: 50, marginBottom: 50 }}
            >
              <Text style={{ fontSize: 70 }}>🔍</Text>
              <Text style={{ fontSize: 24, fontWeight: "bold", marginTop: 18 }}>
                No Products Found
              </Text>
              <Text
                style={{
                  color: "#666",
                  marginTop: 10,
                  textAlign: "center",
                  lineHeight: 24,
                }}
              >
                Try searching with another keyword
              </Text>
            </View>
          ) : (
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "space-between",
              }}
            >
              {filteredProducts.map((product) => (
                <TouchableOpacity
                  key={product.id}
                  onPress={() => navigation.navigate("Product", { product })}
                  style={{
                    backgroundColor: "#ffffff",
                    width: "48%",
                    borderRadius: 18,
                    padding: 12,
                    marginBottom: 16,
                  }}
                >
                  <Image
                    source={{ uri: product.image }}
                    style={{ width: "100%", height: 110, borderRadius: 14 }}
                  />
                  <Text
                    numberOfLines={1}
                    style={{ marginTop: 10, fontWeight: "bold", fontSize: 15 }}
                  >
                    {product.name}
                  </Text>
                  <Text style={{ color: "#999", fontSize: 12, marginTop: 2 }}>
                    {product.unit}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 6,
                    }}
                  >
                    <Text
                      style={{
                        color: "#ff9800",
                        fontWeight: "bold",
                        fontSize: 13,
                      }}
                    >
                      ⭐ {product.rating}
                    </Text>
                    <Text
                      style={{ color: "#777", fontSize: 12, marginLeft: 6 }}
                    >
                      ({product.reviews})
                    </Text>
                  </View>
                  <Text
                    style={{
                      color: "#A50021",
                      fontWeight: "bold",
                      marginTop: 8,
                      fontSize: 16,
                    }}
                  >
                    ₹{product.price}
                  </Text>
                  {product.originalPrice && (
                    <Text
                      style={{
                        color: "#999",
                        fontSize: 12,
                        textDecorationLine: "line-through",
                      }}
                    >
                      ₹{product.originalPrice}
                    </Text>
                  )}
                  <TouchableOpacity
                    onPress={() => addToCart(product)}
                    style={{
                      backgroundColor: "#A50021",
                      marginTop: 10,
                      borderRadius: 12,
                      paddingVertical: 10,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: "#ffffff", fontWeight: "bold" }}>
                      Add
                    </Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Cart Bar */}
      {showCartBar && totalItems > 0 && (
        <TouchableOpacity
          onPress={() => navigation.navigate("Cart")}
          style={{
            position: "absolute",
            bottom: 82,
            left: 20,
            right: 20,
            backgroundColor: "#A50021",
            borderRadius: 16,
            paddingVertical: 12,
            paddingHorizontal: 18,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#ffffff", fontWeight: "bold", fontSize: 14 }}>
            {totalItems} item added
          </Text>
          <Text style={{ color: "#ffffff", fontWeight: "bold", fontSize: 15 }}>
            ₹{totalPrice} →
          </Text>
        </TouchableOpacity>
      )}

      <BottomNav navigation={navigation} />
    </View>
  );
}
