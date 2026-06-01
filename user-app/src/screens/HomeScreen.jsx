import { useContext, useEffect, useState, useCallback } from "react";
import {
  Image, Linking, Modal, RefreshControl, ScrollView, Text,
  TextInput, TouchableOpacity, View, ActivityIndicator,
  StatusBar, FlatList,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomNav from "../components/BottomNav";
import { CartContext } from "../context/CartContext";
import { AddressContext } from "../context/AddressContext";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.1:5000";

const banners = [
  { id: "1", title: "GROCERIES", subtitle: "UP TO 50% OFF\nON GROCERIES ONLINE", color: "#A50021", badge: "OFFER" },
  { id: "2", title: "Dairy Fresh", subtitle: "Delivered daily", color: "#1565c0", badge: "NEW" },
  { id: "3", title: "Snacks & More", subtitle: "New arrivals", color: "#e65100", badge: "HOT" },
];

const categories = [
  { id: "all",               name: "All",          icon: "cart-outline" },
  { id: "fruits-vegetables", name: "Veggies",      icon: "leaf-outline" },
  { id: "dairy-eggs",        name: "Dairy",        icon: "egg-outline" },
  { id: "rice-grains",       name: "Food Grains",  icon: "nutrition-outline" },
  { id: "snacks",            name: "Snacks",       icon: "fast-food-outline" },
  { id: "beverages",         name: "Beverages",    icon: "cafe-outline" },
  { id: "personal-care",     name: "Personal Care",icon: "body-outline" },
  { id: "haircare",          name: "Hair",         icon: "cut-outline" },
  { id: "household",         name: "Home",         icon: "home-outline" },
];

const SORT_OPTIONS = [
  { id: "none",     label: "Default"          },
  { id: "low_high", label: "Price: Low - High" },
  { id: "high_low", label: "Price: High - Low" },
];

const PAGE_SIZE = 40;

// Category display grid
const CATEGORY_GRID = [
  { id: "rice-grains",       name: "Food Grains",    iconLib: "ion", icon: "nutrition-outline" },
  { id: "snacks",            name: "Instant Foods",  iconLib: "mci", icon: "noodles" },
  { id: "snacks",            name: "Snacks",         iconLib: "ion", icon: "fast-food-outline" },
  { id: "beverages",         name: "Oil & Masala",   iconLib: "mci", icon: "bottle-tonic-outline" },
  { id: "personal-care",     name: "Personal Care",  iconLib: "ion", icon: "body-outline" },
  { id: "beverages",         name: "Beverages",      iconLib: "ion", icon: "cafe-outline" },
  { id: "personal-care",     name: "Beauty & Hygiene",iconLib: "mci",icon: "face-woman-shimmer-outline" },
  { id: "household",         name: "Other Products", iconLib: "ion", icon: "cube-outline" },
  { id: "snacks",            name: "Special Offers", iconLib: "ion", icon: "pricetag-outline" },
];

const CategoryIcon = ({ item, size = 28, color = "#A50021" }) => {
  if (item.iconLib === "mci") {
    return <MaterialCommunityIcons name={item.icon} size={size} color={color} />;
  }
  return <Ionicons name={item.icon} size={size} color={color} />;
};

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
  const [currentBanner, setCurrentBanner]       = useState(0);

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

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userStr = await AsyncStorage.getItem("user");
        if (userStr) setUser(JSON.parse(userStr));
      } catch (e) { console.log(e); }
    };
    loadUser();
  }, []);

  const fetchProducts = useCallback(async (
    category = "All", searchTerm = "", pageNum = 1, append = false
  ) => {
    try {
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
    discount:      p.discountPrice ? Math.round(((p.price - p.discountPrice) / p.price) * 100) : null,
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

  const displayAddress = selectedAddress
    || (user?.address?.street ? `${user.address.street}, ${user.address.city}` : "Set delivery address");
  const shortAddress = displayAddress.length > 28
    ? displayAddress.slice(0, 28) + "..."
    : displayAddress;

  const featuredProducts    = filteredProducts.slice(0, 6);
  const bestSellerProducts  = filteredProducts.slice(6, 12);
  const onSaleProducts      = filteredProducts.filter(p => p.discount).slice(0, 6);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f5f5f5" }}>
        <ActivityIndicator size="large" color="#A50021" />
        <Text style={{ marginTop: 12, color: "#666" }}>Loading products...</Text>
      </View>
    );
  }

  const ProductCard = ({ product, width = 160 }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("Product", { product })}
      style={{
        width, backgroundColor: "#fff",
        borderRadius: 10, marginRight: 12,
        paddingBottom: 10,
        shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
        overflow: "hidden",
      }}
    >
      <View style={{ position: "relative" }}>
        <Image
          source={{ uri: product.image }}
          style={{ width: "100%", height: 120, backgroundColor: "#f9f9f9" }}
          resizeMode="contain"
        />
        {product.discount && (
          <View style={{
            position: "absolute", top: 0, left: 0,
            backgroundColor: "#A50021",
            paddingHorizontal: 7, paddingVertical: 3,
            borderBottomRightRadius: 8,
          }}>
            <Text style={{ color: "#fff", fontSize: 11, fontWeight: "bold" }}>{product.discount}%{"\n"}OFF</Text>
          </View>
        )}
      </View>
      <View style={{ paddingHorizontal: 10, paddingTop: 8 }}>
        <Text style={{ color: "#A50021", fontWeight: "bold", fontSize: 15 }}>
          ₹ {product.price}.00
        </Text>
        {product.originalPrice && (
          <Text style={{ color: "#999", fontSize: 11, textDecorationLine: "line-through" }}>
            ₹{product.originalPrice}.00
          </Text>
        )}
        <Text numberOfLines={1} style={{ fontSize: 12, color: "#333", marginTop: 2 }}>
          {product.name}
        </Text>
        {/* Star ratings using Ionicons */}
        <View style={{ flexDirection: "row", marginTop: 4 }}>
          {[1, 2, 3, 4, 5].map(i => (
            <Ionicons
              key={i}
              name={i <= Math.round(product.rating) ? "star" : "star-outline"}
              size={10}
              color={i <= Math.round(product.rating) ? "#f5a623" : "#ddd"}
            />
          ))}
        </View>
        <TouchableOpacity
          onPress={() => addToCart(product)}
          style={{
            backgroundColor: "#f0c000", marginTop: 8,
            borderRadius: 6, paddingVertical: 7, alignItems: "center",
          }}
        >
          <Text style={{ color: "#1a1a1a", fontWeight: "700", fontSize: 12 }}>Add To Cart</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      <StatusBar barStyle="light-content" backgroundColor="#0a1f44" />

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#A50021"]} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Dark Navy Header */}
        <View style={{
          backgroundColor: "#0a1f44",
          paddingTop: 50,
          paddingHorizontal: 16,
          paddingBottom: 16,
        }}>
          {/* Top row: location centre, call icon right */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            {/* Location (centred via flex) */}
            <View style={{ flex: 1, alignItems: "center" }}>
              <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>Your Location</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("Address", { checkoutData: { cartItems: [], total: 0 } })}
                style={{ flexDirection: "row", alignItems: "center" }}
              >
                <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16, marginRight: 4 }}>
                  {shortAddress}
                </Text>
                <Ionicons name="chevron-down" size={14} color="rgba(255,255,255,0.6)" />
              </TouchableOpacity>
            </View>

            {/* Call icon — opens dialler with number */}
            <TouchableOpacity
              onPress={() => Linking.openURL("tel:8421326526")}
              style={{ padding: 6 }}
            >
              <Ionicons name="call" size={22} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Search bar */}
          <View style={{
            flexDirection: "row", alignItems: "center",
            backgroundColor: "#fff", borderRadius: 8,
            paddingHorizontal: 12, height: 44, marginTop: 14,
          }}>
            <Ionicons name="search" size={18} color="#999" style={{ marginRight: 8 }} />
            <TextInput
              placeholder="Search for Products, Brands and More"
              placeholderTextColor="#aaa"
              value={search}
              onChangeText={onSearchChange}
              style={{ flex: 1, fontSize: 13, color: "#1a1a1a" }}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => onSearchChange("")}>
                <Ionicons name="close" size={18} color="#999" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => setShowFilter(true)}
              style={{ marginLeft: 8 }}
            >
              <Ionicons
                name={isFilterActive ? "options" : "options-outline"}
                size={20}
                color={isFilterActive ? "#A50021" : "#aaa"}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Active filter chips */}
        {isFilterActive && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: "#fff" }}>
            {appliedMin !== "" && (
              <View style={{ backgroundColor: "#ffeef1", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, marginRight: 8, borderWidth: 1, borderColor: "#A50021" }}>
                <Text style={{ color: "#A50021", fontSize: 11, fontWeight: "600" }}>Min ₹{appliedMin}</Text>
              </View>
            )}
            {appliedMax !== "" && (
              <View style={{ backgroundColor: "#ffeef1", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, marginRight: 8, borderWidth: 1, borderColor: "#A50021" }}>
                <Text style={{ color: "#A50021", fontSize: 11, fontWeight: "600" }}>Max ₹{appliedMax}</Text>
              </View>
            )}
            {appliedSort !== "none" && (
              <View style={{ backgroundColor: "#ffeef1", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, marginRight: 8, borderWidth: 1, borderColor: "#A50021" }}>
                <Text style={{ color: "#A50021", fontSize: 11, fontWeight: "600" }}>
                  {appliedSort === "low_high" ? "Price ↑" : "Price ↓"}
                </Text>
              </View>
            )}
            <TouchableOpacity onPress={handleResetFilter} style={{ backgroundColor: "#f5f5f5", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 }}>
              <Text style={{ color: "#999", fontSize: 11, fontWeight: "600" }}>Clear All</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* Banner Carousel */}
        <View style={{ margin: 14, borderRadius: 12, overflow: "hidden", backgroundColor: "#A50021", height: 130 }}>
          <ScrollView
            horizontal pagingEnabled showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / e.nativeEvent.layoutMeasurement.width);
              setCurrentBanner(idx);
            }}
          >
            {banners.map((banner) => (
              <View key={banner.id} style={{
                width: 340, height: 130, backgroundColor: banner.color,
                padding: 20, justifyContent: "center",
              }}>
                <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 11, fontWeight: "600", letterSpacing: 1 }}>
                  {banner.title}
                </Text>
                <Text style={{ color: "#fff", fontSize: 20, fontWeight: "bold", marginTop: 4, lineHeight: 26 }}>
                  {banner.subtitle}
                </Text>
              </View>
            ))}
          </ScrollView>
          {/* Dots */}
          <View style={{ position: "absolute", bottom: 10, left: 20, flexDirection: "row", gap: 6 }}>
            {banners.map((_, i) => (
              <View key={i} style={{
                width: i === currentBanner ? 20 : 6, height: 6,
                borderRadius: 3, backgroundColor: i === currentBanner ? "#fff" : "rgba(255,255,255,0.4)",
              }} />
            ))}
          </View>
        </View>

        {/* Scan & Go */}
        <View style={{
          marginHorizontal: 14, marginBottom: 14,
          backgroundColor: "#fff", borderRadius: 10,
          paddingHorizontal: 16, paddingVertical: 12,
          flexDirection: "row", alignItems: "center",
          shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.06, shadowRadius: 4, elevation: 1,
        }}>
          <Ionicons name="qr-code-outline" size={26} color="#0a1f44" style={{ marginRight: 12 }} />
          <View>
            <Text style={{ fontWeight: "bold", color: "#1a1a1a", fontSize: 14 }}>Scan & Go</Text>
            <Text style={{ color: "#888", fontSize: 12 }}>Scan items as you shop and pay at checkout</Text>
          </View>
        </View>

        {/* Shop By Categories */}
        <View style={{ marginHorizontal: 14, marginBottom: 14 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold", color: "#1a1a1a", marginBottom: 14, textAlign: "center" }}>
            Shop By Categories
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
            {CATEGORY_GRID.map((cat, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => setSelectedCategory(cat.name)}
                style={{
                  width: "31%", backgroundColor: "#fff",
                  borderRadius: 10, padding: 12, marginBottom: 12,
                  alignItems: "center",
                  shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
                }}
              >
                <CategoryIcon item={cat} size={28} color="#A50021" />
                <Text style={{ fontSize: 11, color: "#444", textAlign: "center", fontWeight: "500", marginTop: 6 }}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <View style={{ marginBottom: 14 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 14, marginBottom: 12 }}>
              <Text style={{ fontSize: 18, fontWeight: "bold", color: "#1a1a1a" }}>Featured Products</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 14 }}>
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Category Banners (Food Grains / Oil & Masala style) */}
        <View style={{ flexDirection: "row", paddingHorizontal: 14, gap: 12, marginBottom: 14 }}>
          <View style={{ flex: 1, backgroundColor: "#0a1f44", borderRadius: 10, padding: 14, minHeight: 80 }}>
            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 13 }}>FOOD GRAINS</Text>
            <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 10, marginTop: 2 }}>
              Basmati Rice · Aachronned Atta · Tea Powder
            </Text>
            <TouchableOpacity style={{
              marginTop: 10, backgroundColor: "#A50021",
              borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5, alignSelf: "flex-start",
              flexDirection: "row", alignItems: "center", gap: 4,
            }}>
              <Text style={{ color: "#fff", fontSize: 10, fontWeight: "bold" }}>SHOP NOW</Text>
              <Ionicons name="arrow-forward" size={10} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1, backgroundColor: "#0a1f44", borderRadius: 10, padding: 14, minHeight: 80 }}>
            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 13 }}>OIL & MASA...</Text>
            <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 10, marginTop: 2 }}>
              Oil · Palm · Haldi · Jinger · P...
            </Text>
            <TouchableOpacity style={{
              marginTop: 10, backgroundColor: "#A50021",
              borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5, alignSelf: "flex-start",
              flexDirection: "row", alignItems: "center", gap: 4,
            }}>
              <Text style={{ color: "#fff", fontSize: 10, fontWeight: "bold" }}>SHOP NOW</Text>
              <Ionicons name="arrow-forward" size={10} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Best Seller Products */}
        {bestSellerProducts.length > 0 && (
          <View style={{ marginBottom: 14 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 14, marginBottom: 12 }}>
              <Text style={{ fontSize: 18, fontWeight: "bold", color: "#1a1a1a" }}>Best Seller Products</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 14 }}>
              {bestSellerProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Beauty & Hygiene / Personal Care banners */}
        <View style={{ flexDirection: "row", paddingHorizontal: 14, gap: 12, marginBottom: 14 }}>
          <View style={{ flex: 1, backgroundColor: "#5c1a8a", borderRadius: 10, padding: 14, minHeight: 70 }}>
            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 13 }}>BEAUTY & HYGIENE</Text>
            <TouchableOpacity style={{
              marginTop: 10, backgroundColor: "#A50021",
              borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5, alignSelf: "flex-start",
              flexDirection: "row", alignItems: "center", gap: 4,
            }}>
              <Text style={{ color: "#fff", fontSize: 10, fontWeight: "bold" }}>SHOP NOW</Text>
              <Ionicons name="arrow-forward" size={10} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1, backgroundColor: "#1565c0", borderRadius: 10, padding: 14, minHeight: 70 }}>
            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 13 }}>PERSONAL C...</Text>
            <TouchableOpacity style={{
              marginTop: 10, backgroundColor: "#A50021",
              borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5, alignSelf: "flex-start",
              flexDirection: "row", alignItems: "center", gap: 4,
            }}>
              <Text style={{ color: "#fff", fontSize: 10, fontWeight: "bold" }}>SHOP NOW</Text>
              <Ionicons name="arrow-forward" size={10} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* On Sale Products */}
        {onSaleProducts.length > 0 && (
          <View style={{ marginBottom: 14 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 14, marginBottom: 12 }}>
              <Text style={{ fontSize: 18, fontWeight: "bold", color: "#1a1a1a" }}>On Sale Products</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 14 }}>
              {onSaleProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* No products fallback */}
        {filteredProducts.length === 0 && (
          <View style={{ alignItems: "center", marginTop: 50, marginBottom: 50 }}>
            <Ionicons name="search-outline" size={48} color="#ccc" style={{ marginBottom: 12 }} />
            <Text style={{ fontSize: 22, fontWeight: "bold", color: "#1a1a1a" }}>No Products Found</Text>
            <Text style={{ color: "#888", marginTop: 10, textAlign: "center", lineHeight: 22 }}>
              Try a different search or adjust your filters
            </Text>
          </View>
        )}

        {/* Load More */}
        {hasMore && !search && filteredProducts.length > 0 && (
          <TouchableOpacity
            onPress={handleLoadMore}
            disabled={loadingMore}
            style={{
              borderWidth: 2, borderColor: "#A50021",
              borderRadius: 8, height: 48, marginHorizontal: 14,
              justifyContent: "center", alignItems: "center",
              marginBottom: 12,
            }}
          >
            {loadingMore
              ? <ActivityIndicator color="#A50021" />
              : <Text style={{ color: "#A50021", fontWeight: "700", fontSize: 14 }}>See More Products</Text>
            }
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Cart Bar */}
      {showCartBar && totalItems > 0 && (
        <TouchableOpacity
          onPress={() => navigation.navigate("Cart")}
          style={{
            position: "absolute", bottom: 70, left: 16, right: 16,
            backgroundColor: "#A50021", borderRadius: 10,
            paddingVertical: 12, paddingHorizontal: 16,
            flexDirection: "row", justifyContent: "space-between", alignItems: "center",
            shadowColor: "#A50021", shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3, shadowRadius: 10, elevation: 6,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>
            {totalItems} item{totalItems > 1 ? "s" : ""} in cart
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>₹{totalPrice}</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </View>
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
          backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24,
          padding: 24, paddingBottom: 42,
        }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <Text style={{ fontSize: 20, fontWeight: "bold", color: "#1a1a1a" }}>Filters</Text>
            <TouchableOpacity onPress={() => setShowFilter(false)}>
              <Ionicons name="close" size={24} color="#bbb" />
            </TouchableOpacity>
          </View>

          <Text style={{ fontWeight: "700", fontSize: 14, color: "#444", marginBottom: 12 }}>Price Range (₹)</Text>
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#aaa", fontSize: 12, marginBottom: 6 }}>Min Price</Text>
              <TextInput
                placeholder="e.g. 50" placeholderTextColor="#ccc"
                value={minPrice} onChangeText={setMinPrice} keyboardType="number-pad"
                style={{
                  backgroundColor: "#f8f8f8", borderRadius: 10,
                  paddingHorizontal: 14, height: 44, fontSize: 14, color: "#1a1a1a",
                  borderWidth: 1.5, borderColor: minPrice ? "#A50021" : "#eee",
                }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#aaa", fontSize: 12, marginBottom: 6 }}>Max Price</Text>
              <TextInput
                placeholder="e.g. 500" placeholderTextColor="#ccc"
                value={maxPrice} onChangeText={setMaxPrice} keyboardType="number-pad"
                style={{
                  backgroundColor: "#f8f8f8", borderRadius: 10,
                  paddingHorizontal: 14, height: 44, fontSize: 14, color: "#1a1a1a",
                  borderWidth: 1.5, borderColor: maxPrice ? "#A50021" : "#eee",
                }}
              />
            </View>
          </View>

          <Text style={{ fontWeight: "700", fontSize: 14, color: "#444", marginBottom: 12 }}>Sort By Price</Text>
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 28 }}>
            {SORT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.id} onPress={() => setSortBy(opt.id)}
                style={{
                  flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center",
                  backgroundColor: sortBy === opt.id ? "#A50021" : "#f8f8f8",
                  borderWidth: 1.5, borderColor: sortBy === opt.id ? "#A50021" : "#eee",
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
              style={{ flex: 1, height: 50, borderRadius: 10, justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: "#A50021" }}
            >
              <Text style={{ color: "#A50021", fontWeight: "700", fontSize: 15 }}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleApplyFilter}
              style={{ flex: 2, height: 50, borderRadius: 10, justifyContent: "center", alignItems: "center", backgroundColor: "#A50021" }}
            >
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}