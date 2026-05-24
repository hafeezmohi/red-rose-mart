import { useContext, useEffect, useState, useCallback } from "react";
import {
  Image, Modal, RefreshControl, ScrollView, Text,
  TextInput, TouchableOpacity, View, ActivityIndicator,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomNav from "../components/BottomNav";
import { CartContext } from "../context/CartContext";
import { AddressContext } from "../context/AddressContext";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.1:5000";

const banners = [
  { id: "1", title: "Fresh Veggies",  subtitle: "Up to 30% off today!", color: "#2e7d32" },
  { id: "2", title: "Dairy Fresh",    subtitle: "Delivered daily",       color: "#1565c0" },
  { id: "3", title: "Snacks & More",  subtitle: "New arrivals",          color: "#e65100" },
];

const categories = [
  { id: "all",               name: "All"     },
  { id: "fruits-vegetables", name: "Veggies" },
  { id: "dairy-eggs",        name: "Dairy"   },
  { id: "rice-grains",       name: "Grains"  },
  { id: "snacks",            name: "Snacks"  },
  { id: "beverages",         name: "Drinks"  },
  { id: "personal-care",     name: "Care"    },
  { id: "haircare",          name: "Hair"    },
  { id: "household",         name: "Home"    },
];

const SORT_OPTIONS = [
  { id: "none",     label: "Default"          },
  { id: "low_high", label: "Price: Low - High" },
  { id: "high_low", label: "Price: High - Low" },
];

const PAGE_SIZE = 40;

export default function HomeScreen({ navigation }) {
  const [search, setSearch]                     = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showCartBar, setShowCartBar]           = useState(false);
  const [refreshing, setRefreshing]             = useState(false);
  const [products, setProducts]                 = useState([]);
  const [loading, setLoading]                   = useState(true);
  const [loadingMore, setLoadingMore]           = useState(false);
  const [searchTimeout, setSearchTimeout]       = useState(null);
  const [page, setPage]                         = useState(1);
  const [hasMore, setHasMore]                   = useState(true);
  const [user, setUser]                         = useState(null);

  // Filter state
  const [showFilter, setShowFilter]   = useState(false);
  const [minPrice, setMinPrice]       = useState("");
  const [maxPrice, setMaxPrice]       = useState("");
  const [sortBy, setSortBy]           = useState("none");
  const [appliedMin, setAppliedMin]   = useState("");
  const [appliedMax, setAppliedMax]   = useState("");
  const [appliedSort, setAppliedSort] = useState("none");

  const { cartItems, addToCart } = useContext(CartContext);
  const { selectedAddress }      = useContext(AddressContext);

  // Load user from AsyncStorage
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userStr = await AsyncStorage.getItem("user");
        if (userStr) setUser(JSON.parse(userStr));
      } catch (e) {
        console.log(e);
      }
    };
    loadUser();
  }, []);

  const fetchProducts = useCallback(async (
    category = "All",
    searchTerm = "",
    pageNum = 1,
    append = false
  ) => {
    try {
      // When searching, fetch all (large limit) so search covers everything
      const limit = searchTerm ? 500 : PAGE_SIZE;
      let url = `${API_URL}/api/products?limit=${limit}&page=${pageNum}`;

      if (category !== "All") {
        const cat = categories.find((c) => c.name === category);
        if (cat && cat.id !== "all") url += `&category=${cat.id}`;
      }
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;

      const res  = await fetch(url);
      const data = await res.json();

      if (data.success) {
        const newProducts = data.products;
        setProducts(prev => append ? [...prev, ...newProducts] : newProducts);
        // If we got fewer than PAGE_SIZE or we're in search mode, no more pages
        setHasMore(!searchTerm && newProducts.length === PAGE_SIZE);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    setLoading(true);
    fetchProducts(selectedCategory, search, 1, false);
  }, [selectedCategory]);

  const onSearchChange = (text) => {
    setSearch(text);
    setPage(1);
    if (searchTimeout) clearTimeout(searchTimeout);
    setSearchTimeout(
      setTimeout(() => {
        setLoading(true);
        fetchProducts(selectedCategory, text, 1, false);
      }, 500)
    );
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    setLoadingMore(true);
    fetchProducts(selectedCategory, search, nextPage, true);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchProducts(selectedCategory, search, 1, false);
  };

  useEffect(() => {
    if (cartItems.length > 0) {
      setShowCartBar(true);
      const timer = setTimeout(() => setShowCartBar(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [cartItems]);

  const handleApplyFilter = () => {
    setAppliedMin(minPrice);
    setAppliedMax(maxPrice);
    setAppliedSort(sortBy);
    setShowFilter(false);
  };

  const handleResetFilter = () => {
    setMinPrice(""); setMaxPrice(""); setSortBy("none");
    setAppliedMin(""); setAppliedMax(""); setAppliedSort("none");
    setShowFilter(false);
  };

  const isFilterActive = appliedMin !== "" || appliedMax !== "" || appliedSort !== "none";

  const mappedProducts = products.map((p) => ({
    id:            p._id,
    name:          p.name,
    image:         p.images?.length > 0
      ? p.images[0]
      : `https://placehold.co/150x150/f5f5f5/A50021?text=${encodeURIComponent(p.name)}`,
    price:         p.discountPrice || p.price,
    originalPrice: p.discountPrice ? p.price : null,
    rating:        p.ratings?.average || 0,
    reviews:       p.ratings?.count || 0,
    category:      categories.find((c) => c.id === p.category)?.name || p.category,
    unit:          p.unit,
    stock:         p.stock,
  }));

  let filteredProducts = mappedProducts.filter((product) => {
    const matchesSearch   = product.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" ? true : product.category === selectedCategory;
    const matchesMin      = appliedMin !== "" ? product.price >= Number(appliedMin) : true;
    const matchesMax      = appliedMax !== "" ? product.price <= Number(appliedMax) : true;
    return matchesSearch && matchesCategory && matchesMin && matchesMax;
  });

  if (appliedSort === "low_high") filteredProducts = [...filteredProducts].sort((a, b) => a.price - b.price);
  if (appliedSort === "high_low") filteredProducts = [...filteredProducts].sort((a, b) => b.price - a.price);

  const totalItems = cartItems.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  // Address: prefer AddressContext, fallback to user's saved address
  const displayAddress = selectedAddress
    || (user?.address?.street ? `${user.address.street}, ${user.address.city}` : "Set delivery address");
  const shortAddress = displayAddress.length > 32
    ? displayAddress.slice(0, 32) + "..."
    : displayAddress;

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f7f3f3" }}>
        <ActivityIndicator size="large" color="#A50021" />
        <Text style={{ marginTop: 12, color: "#666" }}>Loading products...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f7f3f3" }}>
      <StatusBar barStyle="light-content" backgroundColor="#A50021" />

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#A50021"]} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 160 }}
      >
        {/* Header */}
        <View style={{
          backgroundColor: "#A50021",
          paddingTop: 54,
          paddingHorizontal: 20,
          paddingBottom: 90,
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
        }}>
          <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, letterSpacing: 0.8, textTransform: "uppercase" }}>
            Deliver To
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("Address", { checkoutData: { cartItems: [], total: 0 } })}
            style={{ flexDirection: "row", alignItems: "center", marginTop: 5 }}
          >
            <View style={{
              width: 7, height: 7, borderRadius: 4,
              backgroundColor: "#fff", marginRight: 8, marginTop: 1,
            }} />
            <Text numberOfLines={1} style={{ color: "#ffffff", fontSize: 17, fontWeight: "700", flex: 1 }}>
              {shortAddress}
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginLeft: 6 }}>Change</Text>
          </TouchableOpacity>
          {user?.name && (
            <Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, marginTop: 8 }}>
              Hello, {user.name.split(" ")[0]}
            </Text>
          )}
        </View>

        <View style={{ marginTop: -30, paddingHorizontal: 20 }}>

          {/* Search + Filter row */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={{
              flex: 1, backgroundColor: "#ffffff", borderRadius: 16,
              paddingHorizontal: 16, height: 52,
              flexDirection: "row", alignItems: "center",
              shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
            }}>
              <Text style={{ fontSize: 15, marginRight: 10, color: "#999" }}>Search</Text>
              <TextInput
                placeholder="Products, categories..."
                placeholderTextColor="#bbb"
                value={search}
                onChangeText={onSearchChange}
                style={{ flex: 1, fontSize: 14, color: "#1a1a1a" }}
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => onSearchChange("")}>
                  <Text style={{ fontSize: 15, color: "#999" }}>x</Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              onPress={() => setShowFilter(true)}
              style={{
                width: 52, height: 52, borderRadius: 16,
                backgroundColor: isFilterActive ? "#A50021" : "#ffffff",
                justifyContent: "center", alignItems: "center",
                shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: "700", color: isFilterActive ? "#fff" : "#A50021" }}>
                Filter
              </Text>
              {isFilterActive && (
                <View style={{
                  position: "absolute", top: 8, right: 8,
                  width: 8, height: 8, borderRadius: 4,
                  backgroundColor: "#fff", borderWidth: 1.5, borderColor: "#A50021",
                }} />
              )}
            </TouchableOpacity>
          </View>

          {/* Active filter chips */}
          {isFilterActive && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
              {appliedMin !== "" && (
                <View style={{ backgroundColor: "#ffeef1", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, marginRight: 8, borderWidth: 1, borderColor: "#A50021" }}>
                  <Text style={{ color: "#A50021", fontSize: 12, fontWeight: "600" }}>Min Rs.{appliedMin}</Text>
                </View>
              )}
              {appliedMax !== "" && (
                <View style={{ backgroundColor: "#ffeef1", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, marginRight: 8, borderWidth: 1, borderColor: "#A50021" }}>
                  <Text style={{ color: "#A50021", fontSize: 12, fontWeight: "600" }}>Max Rs.{appliedMax}</Text>
                </View>
              )}
              {appliedSort !== "none" && (
                <View style={{ backgroundColor: "#ffeef1", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, marginRight: 8, borderWidth: 1, borderColor: "#A50021" }}>
                  <Text style={{ color: "#A50021", fontSize: 12, fontWeight: "600" }}>
                    {appliedSort === "low_high" ? "Price Low-High" : "Price High-Low"}
                  </Text>
                </View>
              )}
              <TouchableOpacity onPress={handleResetFilter} style={{ backgroundColor: "#f5f5f5", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, marginRight: 8 }}>
                <Text style={{ color: "#999", fontSize: 12, fontWeight: "600" }}>Clear All</Text>
              </TouchableOpacity>
            </ScrollView>
          )}

          {/* Categories */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 22 }}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => setSelectedCategory(category.name)}
                style={{
                  backgroundColor: selectedCategory === category.name ? "#A50021" : "#ffffff",
                  paddingHorizontal: 18, paddingVertical: 10,
                  borderRadius: 12, marginRight: 10,
                }}
              >
                <Text style={{
                  color: selectedCategory === category.name ? "#ffffff" : "#444",
                  fontWeight: "700", fontSize: 13,
                }}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Banners */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 22 }}>
            {banners.map((banner) => (
              <View key={banner.id} style={{
                width: 240, backgroundColor: banner.color,
                borderRadius: 20, padding: 20, marginRight: 14,
              }}>
                <Text style={{ color: "#ffffff", fontSize: 20, fontWeight: "bold" }}>{banner.title}</Text>
                <Text style={{ color: "rgba(255,255,255,0.85)", marginTop: 8, fontSize: 14 }}>{banner.subtitle}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Products header */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 28, marginBottom: 18 }}>
            <Text style={{ fontSize: 22, fontWeight: "bold", color: "#1a1a1a" }}>Products</Text>
            <Text style={{ color: "#999", fontSize: 13 }}>{filteredProducts.length} items</Text>
          </View>

          {filteredProducts.length === 0 ? (
            <View style={{ alignItems: "center", marginTop: 50, marginBottom: 50 }}>
              <Text style={{ fontSize: 22, fontWeight: "bold", color: "#1a1a1a" }}>No Products Found</Text>
              <Text style={{ color: "#888", marginTop: 10, textAlign: "center", lineHeight: 22 }}>
                Try a different search or adjust your filters
              </Text>
            </View>
          ) : (
            <>
              <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
                {filteredProducts.map((product) => (
                  <TouchableOpacity
                    key={product.id}
                    onPress={() => navigation.navigate("Product", { product })}
                    style={{
                      backgroundColor: "#ffffff", width: "48%",
                      borderRadius: 16, padding: 12, marginBottom: 16,
                      shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05, shadowRadius: 6, elevation: 1,
                    }}
                  >
                    <Image
                      source={{ uri: product.image }}
                      style={{ width: "100%", height: 110, borderRadius: 12 }}
                    />
                    <Text numberOfLines={1} style={{ marginTop: 10, fontWeight: "700", fontSize: 14, color: "#1a1a1a" }}>
                      {product.name}
                    </Text>
                    <Text style={{ color: "#aaa", fontSize: 11, marginTop: 2 }}>{product.unit}</Text>
                    <View style={{ flexDirection: "row", alignItems: "center", marginTop: 5 }}>
                      <Text style={{ color: "#f59e0b", fontWeight: "700", fontSize: 12 }}>{product.rating} *</Text>
                      <Text style={{ color: "#bbb", fontSize: 11, marginLeft: 4 }}>({product.reviews})</Text>
                    </View>
                    <Text style={{ color: "#A50021", fontWeight: "bold", marginTop: 6, fontSize: 15 }}>
                      Rs. {product.price}
                    </Text>
                    {product.originalPrice && (
                      <Text style={{ color: "#bbb", fontSize: 11, textDecorationLine: "line-through" }}>
                        Rs. {product.originalPrice}
                      </Text>
                    )}
                    <TouchableOpacity
                      onPress={() => addToCart(product)}
                      style={{
                        backgroundColor: "#A50021", marginTop: 10,
                        borderRadius: 10, paddingVertical: 9, alignItems: "center",
                      }}
                    >
                      <Text style={{ color: "#ffffff", fontWeight: "700", fontSize: 13 }}>Add to Cart</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>

              {/* See More Button */}
              {hasMore && !search && (
                <TouchableOpacity
                  onPress={handleLoadMore}
                  disabled={loadingMore}
                  style={{
                    borderWidth: 2, borderColor: "#A50021",
                    borderRadius: 14, height: 52,
                    justifyContent: "center", alignItems: "center",
                    marginTop: 4, marginBottom: 12,
                  }}
                >
                  {loadingMore ? (
                    <ActivityIndicator color="#A50021" />
                  ) : (
                    <Text style={{ color: "#A50021", fontWeight: "700", fontSize: 15 }}>
                      See More Products
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Cart Bar */}
      {showCartBar && totalItems > 0 && (
        <TouchableOpacity
          onPress={() => navigation.navigate("Cart")}
          style={{
            position: "absolute", bottom: 82, left: 20, right: 20,
            backgroundColor: "#A50021", borderRadius: 14,
            paddingVertical: 12, paddingHorizontal: 18,
            flexDirection: "row", justifyContent: "space-between", alignItems: "center",
            shadowColor: "#A50021", shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3, shadowRadius: 10, elevation: 6,
          }}
        >
          <Text style={{ color: "#ffffff", fontWeight: "700", fontSize: 14 }}>
            {totalItems} item{totalItems > 1 ? "s" : ""} in cart
          </Text>
          <Text style={{ color: "#ffffff", fontWeight: "700", fontSize: 15 }}>
            Rs. {totalPrice}  →
          </Text>
        </TouchableOpacity>
      )}

      <BottomNav navigation={navigation} />

      {/* Filter Modal */}
      <Modal visible={showFilter} transparent animationType="slide" onRequestClose={() => setShowFilter(false)}>
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }}
          activeOpacity={1}
          onPress={() => setShowFilter(false)}
        />
        <View style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          backgroundColor: "#fff", borderTopLeftRadius: 28, borderTopRightRadius: 28,
          padding: 24, paddingBottom: 42,
        }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <Text style={{ fontSize: 20, fontWeight: "bold", color: "#1a1a1a" }}>Filters</Text>
            <TouchableOpacity onPress={() => setShowFilter(false)}>
              <Text style={{ fontSize: 18, color: "#bbb", fontWeight: "600" }}>Close</Text>
            </TouchableOpacity>
          </View>

          {/* Price Range */}
          <Text style={{ fontWeight: "700", fontSize: 14, color: "#444", marginBottom: 12, letterSpacing: 0.3 }}>
            Price Range (Rs.)
          </Text>
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#aaa", fontSize: 12, marginBottom: 6 }}>Min Price</Text>
              <TextInput
                placeholder="e.g. 50"
                placeholderTextColor="#ccc"
                value={minPrice}
                onChangeText={setMinPrice}
                keyboardType="number-pad"
                style={{
                  backgroundColor: "#f8f8f8", borderRadius: 12,
                  paddingHorizontal: 14, height: 46,
                  fontSize: 14, color: "#1a1a1a",
                  borderWidth: 1.5, borderColor: minPrice ? "#A50021" : "#eee",
                }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#aaa", fontSize: 12, marginBottom: 6 }}>Max Price</Text>
              <TextInput
                placeholder="e.g. 500"
                placeholderTextColor="#ccc"
                value={maxPrice}
                onChangeText={setMaxPrice}
                keyboardType="number-pad"
                style={{
                  backgroundColor: "#f8f8f8", borderRadius: 12,
                  paddingHorizontal: 14, height: 46,
                  fontSize: 14, color: "#1a1a1a",
                  borderWidth: 1.5, borderColor: maxPrice ? "#A50021" : "#eee",
                }}
              />
            </View>
          </View>

          {/* Sort */}
          <Text style={{ fontWeight: "700", fontSize: 14, color: "#444", marginBottom: 12, letterSpacing: 0.3 }}>
            Sort By Price
          </Text>
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 28 }}>
            {SORT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.id}
                onPress={() => setSortBy(opt.id)}
                style={{
                  flex: 1, paddingVertical: 11, borderRadius: 12,
                  alignItems: "center",
                  backgroundColor: sortBy === opt.id ? "#A50021" : "#f8f8f8",
                  borderWidth: 1.5,
                  borderColor: sortBy === opt.id ? "#A50021" : "#eee",
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: "700", color: sortBy === opt.id ? "#fff" : "#666" }}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              onPress={handleResetFilter}
              style={{
                flex: 1, height: 52, borderRadius: 14,
                justifyContent: "center", alignItems: "center",
                borderWidth: 2, borderColor: "#A50021",
              }}
            >
              <Text style={{ color: "#A50021", fontWeight: "700", fontSize: 15 }}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleApplyFilter}
              style={{
                flex: 2, height: 52, borderRadius: 14,
                justifyContent: "center", alignItems: "center",
                backgroundColor: "#A50021",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}