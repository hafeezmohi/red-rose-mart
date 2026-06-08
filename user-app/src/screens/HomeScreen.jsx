import { useContext, useEffect, useState, useCallback, useRef } from "react";
import {
  Image,
  Linking,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  StatusBar,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomNav from "../components/BottomNav";
import { CartContext } from "../context/CartContext";
import { AddressContext } from "../context/AddressContext";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "https://red-rose-backend.onrender.com/";

const categories = [
  { id: "all", name: "All Categories", icon: "grid-outline" },
  {
    id: "fruits-vegetables",
    name: "Fruits & Vegetables",
    icon: "leaf-outline",
  },
  { id: "dairy-eggs", name: "Dairy & Eggs", icon: "egg-outline" },
  { id: "rice-grains", name: "Rice & Grains", icon: "nutrition-outline" },
  { id: "snacks", name: "Snacks", icon: "fast-food-outline" },
  { id: "beverages", name: "Beverages", icon: "cafe-outline" },
  { id: "personal-care", name: "Personal Care", icon: "body-outline" },
  { id: "haircare", name: "Haircare", icon: "cut-outline" },
  { id: "household", name: "Household", icon: "home-outline" },
  { id: "frozen", name: "Frozen", icon: "snow-outline" },
  { id: "other", name: "Other", icon: "cube-outline" },
  {
    id: "instant-foods",
    name: "Instant Foods",
    icon: "fast-food-outline",
  },
  {
    id: "oil-masala",
    name: "Oil & Masala",
    icon: "restaurant-outline",
  },
  {
    id: "beauty-hygiene",
    name: "Beauty & Hygiene",
    icon: "sparkles-outline",
  },
  {
    id: "offers",
    name: "Special Offers",
    icon: "pricetag-outline",
  },
];

const SORT_OPTIONS = [
  { id: "none", label: "Default" },
  { id: "low_high", label: "Price: Low - High" },
  { id: "high_low", label: "Price: High - Low" },
];

const PAGE_SIZE = 40;

const SCREEN_WIDTH = Dimensions.get("window").width;

const CATEGORY_GRID = [
  {
    id: "fruits-vegetables",
    name: "Fruits & Vegetables",
    iconLib: "ion",
    icon: "leaf-outline",
  },
  {
    id: "dairy-eggs",
    name: "Dairy & Eggs",
    iconLib: "ion",
    icon: "egg-outline",
  },
  {
    id: "rice-grains",
    name: "Rice & Grains",
    iconLib: "ion",
    icon: "nutrition-outline",
  },
  { id: "snacks", name: "Snacks", iconLib: "ion", icon: "fast-food-outline" },
  { id: "beverages", name: "Beverages", iconLib: "ion", icon: "cafe-outline" },
  {
    id: "personal-care",
    name: "Personal Care",
    iconLib: "ion",
    icon: "body-outline",
  },
  { id: "haircare", name: "Haircare", iconLib: "ion", icon: "cut-outline" },
  { id: "household", name: "Household", iconLib: "ion", icon: "home-outline" },
  { id: "frozen", name: "Frozen", iconLib: "ion", icon: "snow-outline" },
  { id: "other", name: "Other", iconLib: "ion", icon: "cube-outline" },
  {
    id: "instant-foods",
    name: "Instant Foods",
    iconLib: "ion",
    icon: "fast-food-outline",
  },
  {
    id: "oil-masala",
    name: "Oil & Masala",
    iconLib: "ion",
    icon: "restaurant-outline",
  },
  {
    id: "beauty-hygiene",
    name: "Beauty & Hygiene",
    iconLib: "ion",
    icon: "sparkles-outline",
  },
  {
    id: "offers",
    name: "Special Offers",
    iconLib: "ion",
    icon: "pricetag-outline",
  },
];

const CategoryIcon = ({ item, size = 28, color = "#A50021" }) => {
  if (item.iconLib === "mci") {
    return (
      <MaterialCommunityIcons name={item.icon} size={size} color={color} />
    );
  }
  return <Ionicons name={item.icon} size={size} color={color} />;
};

export default function HomeScreen({ navigation, route }) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showOffersOnly, setShowOffersOnly] = useState(false);
  const [showCartBar, setShowCartBar] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [user, setUser] = useState(null);
  const [currentBanner, setCurrentBanner] = useState(0);

  const [showFilter, setShowFilter] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("none");
  const [appliedMin, setAppliedMin] = useState("");
  const [appliedMax, setAppliedMax] = useState("");
  const [appliedSort, setAppliedSort] = useState("none");

  const { cartItems, addToCart } = useContext(CartContext);
  const { selectedAddress } = useContext(AddressContext);

  const bannerScrollRef = useRef(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userStr = await AsyncStorage.getItem("user");
        if (userStr) setUser(JSON.parse(userStr));
      } catch (e) {
        // Error loading user
      }
    };
    loadUser();
  }, []);

  // Auto-scroll banner every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const next = (currentBanner + 1) % 3;

      bannerScrollRef.current?.scrollTo({
        x: next * (SCREEN_WIDTH - 24),
        animated: true,
      });

      setCurrentBanner(next);
    }, 3000);

    return () => clearInterval(interval);
  }, [currentBanner]);

  const fetchProducts = useCallback(
    async (category = "All", searchTerm = "", pageNum = 1, append = false) => {
      try {
        const limit = searchTerm ? 500 : PAGE_SIZE;
        let url = `${API_URL}/api/products?limit=${limit}&page=${pageNum}`;

        if (category !== "all") {
          url += `&category=${category}`;
        }

        if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;

        const res = await fetch(url);
        const data = await res.json();

        if (data.success) {
          const newProducts = data.products;
          setProducts((prev) =>
            append ? [...prev, ...newProducts] : newProducts,
          );
          setHasMore(!searchTerm && newProducts.length === PAGE_SIZE);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [],
  );

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
      }, 500),
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
    setMinPrice("");
    setMaxPrice("");
    setSortBy("none");
    setAppliedMin("");
    setAppliedMax("");
    setAppliedSort("none");
    setShowOffersOnly(false);
    setSelectedCategory("all");
    setShowFilter(false);
  };

  const isFilterActive =
    appliedMin !== "" || appliedMax !== "" || appliedSort !== "none";

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
    discount: p.discountPrice
      ? Math.round(((p.price - p.discountPrice) / p.price) * 100)
      : null,
  }));

  let filteredProducts = mappedProducts.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === "all"
        ? true
        : categories.find((c) => c.id === selectedCategory)?.name ===
          product.category;
    const matchesMin =
      appliedMin !== "" ? product.price >= Number(appliedMin) : true;
    const matchesMax =
      appliedMax !== "" ? product.price <= Number(appliedMax) : true;
    const matchesOffer = showOffersOnly ? product.originalPrice !== null : true;
    return (
      matchesSearch &&
      matchesCategory &&
      matchesMin &&
      matchesMax &&
      matchesOffer
    );
  });

  if (appliedSort === "low_high")
    filteredProducts = [...filteredProducts].sort((a, b) => a.price - b.price);
  if (appliedSort === "high_low")
    filteredProducts = [...filteredProducts].sort((a, b) => b.price - a.price);

  const totalItems = cartItems.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0,
  );

  const displayAddress =
    selectedAddress ||
    (user?.address?.street
      ? `${user.address.street}, ${user.address.city}`
      : "Set delivery address");

  const shortAddress =
    displayAddress.length > 28
      ? displayAddress.slice(0, 28) + "..."
      : displayAddress;

  const featuredProducts = filteredProducts.slice(0, 6);
  const bestSellerProducts = filteredProducts.slice(6, 12);
  const onSaleProducts = filteredProducts.filter((p) => p.discount).slice(0, 6);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f5f5f5",
        }}
      >
        <ActivityIndicator size="large" color="#A50021" />
        <Text style={{ marginTop: 12, color: "#666" }}>
          Loading products...
        </Text>
      </View>
    );
  }

  const ProductCard = ({ product, width = 160 }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("Product", { product })}
      style={{
        width,
        backgroundColor: "#fff",
        borderRadius: 16,
        marginRight: 12,
        marginBottom: 1,

        paddingBottom: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
        overflow: "hidden",
      }}
    >
      <View style={{ position: "relative" }}>
        <Image
          source={{ uri: product.image }}
          style={{ width: "100%", height: 130, backgroundColor: "#f9f9f9" }}
          resizeMode="contain"
        />
        {product.discount && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              backgroundColor: "#A50021",
              paddingHorizontal: 7,
              paddingVertical: 3,
              borderBottomRightRadius: 8,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 11, fontWeight: "bold" }}>
              {product.discount}%{"\n"}OFF
            </Text>
          </View>
        )}
      </View>
      <View style={{ paddingHorizontal: 10, paddingTop: 8 }}>
        <Text style={{ color: "#A50021", fontWeight: "bold", fontSize: 15 }}>
          ₹ {product.price}.00
        </Text>
        {product.originalPrice && (
          <Text
            style={{
              color: "#999",
              fontSize: 11,
              textDecorationLine: "line-through",
            }}
          >
            ₹{product.originalPrice}.00
          </Text>
        )}
        <Text
          numberOfLines={1}
          style={{ fontSize: 12, color: "#333", marginTop: 2 }}
        >
          {product.name}
        </Text>

        <TouchableOpacity
          onPress={() => addToCart(product)}
          style={{
            backgroundColor: "#f4c400",
            marginTop: 8,
            borderRadius: 20,
            marginHorizontal: 6,
            paddingVertical: 7,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#1a1a1a", fontWeight: "700", fontSize: 12 }}>
            Add To Cart
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView edges={["bottom"]} style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      <StatusBar barStyle="light-content" backgroundColor="#0a1f44" />

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#A50021"]}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
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
            <View style={{ flex: 1, alignItems: "left" }}>
              <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>
                Your Location
              </Text>
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
            </View>

            <TouchableOpacity
              onPress={() => Linking.openURL("tel:+918074559488")}
              style={{ padding: 6 }}
            >
              <Ionicons name="call" size={22} color="#fff" />
            </TouchableOpacity>
          </View>

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

        {isFilterActive && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              backgroundColor: "#fff",
            }}
          >
            {appliedMin !== "" && (
              <View
                style={{
                  backgroundColor: "#ffeef1",
                  borderRadius: 20,
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                  marginRight: 8,
                  borderWidth: 1,
                  borderColor: "#A50021",
                }}
              >
                <Text
                  style={{ color: "#A50021", fontSize: 11, fontWeight: "600" }}
                >
                  Min ₹{appliedMin}
                </Text>
              </View>
            )}
            {appliedMax !== "" && (
              <View
                style={{
                  backgroundColor: "#ffeef1",
                  borderRadius: 20,
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                  marginRight: 8,
                  borderWidth: 1,
                  borderColor: "#A50021",
                }}
              >
                <Text
                  style={{ color: "#A50021", fontSize: 11, fontWeight: "600" }}
                >
                  Max ₹{appliedMax}
                </Text>
              </View>
            )}
            {appliedSort !== "none" && (
              <View
                style={{
                  backgroundColor: "#ffeef1",
                  borderRadius: 20,
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                  marginRight: 8,
                  borderWidth: 1,
                  borderColor: "#A50021",
                }}
              >
                <Text
                  style={{ color: "#A50021", fontSize: 11, fontWeight: "600" }}
                >
                  {appliedSort === "low_high" ? "Price ↑" : "Price ↓"}
                </Text>
              </View>
            )}
            <TouchableOpacity
              onPress={handleResetFilter}
              style={{
                backgroundColor: "#f5f5f5",
                borderRadius: 20,
                paddingHorizontal: 12,
                paddingVertical: 4,
              }}
            >
              <Text style={{ color: "#999", fontSize: 11, fontWeight: "600" }}>
                Clear All
              </Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        <View
          style={{
            marginHorizontal: 12,
            marginTop: 12,
            marginBottom: 18,
            borderRadius: 18,
            overflow: "hidden",
          }}
        >
          <ScrollView
            ref={bannerScrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(
                e.nativeEvent.contentOffset.x /
                  e.nativeEvent.layoutMeasurement.width,
              );
              setCurrentBanner(index);
            }}
          >
            {[
              require("../../assets/banner1.jpeg"),
              require("../../assets/banner2.jpeg"),
              require("../../assets/banner3.jpeg"),
            ].map((banner, index) => (
              <Image
                key={index}
                source={banner}
                resizeMode="cover"
                style={{
                  width: SCREEN_WIDTH - 24,
                  height: 210,
                  borderRadius: 18,
                }}
              />
            ))}
          </ScrollView>

          <View
            style={{
              position: "absolute",
              bottom: 12,
              alignSelf: "center",
              flexDirection: "row",
            }}
          >
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                style={{
                  width: i === currentBanner ? 18 : 7,
                  height: 7,
                  borderRadius: 10,
                  marginHorizontal: 3,
                  backgroundColor:
                    i === currentBanner ? "#ffffff" : "rgba(255,255,255,0.5)",
                }}
              />
            ))}
          </View>
        </View>

        <View
          style={{
            marginHorizontal: 12,
            marginTop: 4,
            marginBottom: 18,
          }}
        >
          <View
            style={{
              alignItems: "center",
              marginBottom: 18,
            }}
          >
            <View
              style={{
                backgroundColor: "rgba(165,0,33,0.08)",
                paddingHorizontal: 22,
                paddingVertical: 8,
                borderRadius: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "800",
                  color: "#A50021",
                  letterSpacing: 0.4,
                }}
              >
                Shop By Categories
              </Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
            }}
          >
            {[
              {
                id: "rice-grains",
                name: "Food Grains",
                image: require("../../assets/foodgrains.webp"),
              },
              {
                id: "instant-foods",
                name: "Instant Foods",
                image: require("../../assets/instantfoods.jpeg"),
              },
              {
                id: "snacks",
                name: "Snacks",
                image: require("../../assets/snacks.jpeg"),
              },
              {
                id: "oil-masala",
                name: "Oil & Masala",
                image: require("../../assets/oilmasala.jpeg"),
              },
              {
                id: "personal-care",
                name: "Personal Care",
                image: require("../../assets/personalcare.jpeg"),
              },
              {
                id: "beverages",
                name: "Beverages",
                image: require("../../assets/beverages.jpeg"),
              },
              {
                id: "beauty-hygiene",
                name: "Beauty & Hygiene",
                image: require("../../assets/beautyhygiene.jpeg"),
              },
              {
                id: "other",
                name: "Other Products",
                image: require("../../assets/otherproducts.jpeg"),
              },
              {
                id: "offers",
                name: "Special Offers",
                image: require("../../assets/specialoffer.png"),
              },
            ].map((item, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.85}
                onPress={() => {
                  if (item.id === "offers") {
                    setShowOffersOnly(true);
                    setSelectedCategory("all");
                  } else {
                    setShowOffersOnly(false);
                    setSelectedCategory(item.id);
                  }
                }}
                style={{
                  width: "31%",
                  backgroundColor: "#fff",
                  borderRadius: 16,
                  marginBottom: 14,
                  alignItems: "center",
                  paddingVertical: 14,

                  shadowColor: "#000",
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  shadowOpacity: 0.08,
                  shadowRadius: 6,

                  elevation: 3,
                }}
              >
                <Image
                  source={item.image}
                  resizeMode="contain"
                  style={{
                    width: 52,
                    height: 52,
                    marginBottom: 10,
                  }}
                />

                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: "#333",
                    textAlign: "center",
                    paddingHorizontal: 4,
                  }}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {showOffersOnly && (
          <View
            style={{
              marginHorizontal: 14,
              marginBottom: 12,
              backgroundColor: "#fff3f5",
              borderRadius: 12,
              padding: 14,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: "#A50021",
                fontWeight: "800",
                fontSize: 20,
              }}
            >
              Special Offers
            </Text>

            <Text
              style={{
                color: "#666",
                marginTop: 4,
              }}
            >
              Showing discounted products only
            </Text>
          </View>
        )}

        {featuredProducts.length > 0 && (
          <View
            style={{
              borderTopWidth: 1,
              borderColor: "#ddd",
              marginTop: 10,
              marginBottom: 22,
              paddingTop: 22,
            }}
          >
            <View
              style={{
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <View
                style={{
                  backgroundColor: "rgba(165,0,33,0.08)",
                  paddingHorizontal: 20,
                  paddingVertical: 7,
                  borderRadius: 18,
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "800",
                    color: "#A50021",
                  }}
                >
                  Featured Products
                </Text>
              </View>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 14 }}
            >
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </ScrollView>
          </View>
        )}

        {bestSellerProducts.length > 0 && (
          <View
            style={{
              borderTopWidth: 1,
              borderBottomWidth: 1,
              borderColor: "#ddd",
              marginTop: 10,
              marginBottom: 22,
              paddingTop: 22,
              paddingBottom: 22,
            }}
          >
            <View
              style={{
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <View
                style={{
                  backgroundColor: "rgba(165,0,33,0.08)",
                  paddingHorizontal: 20,
                  paddingVertical: 7,
                  borderRadius: 18,
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "800",
                    color: "#A50021",
                  }}
                >
                  Best Seller Products
                </Text>
              </View>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 14 }}
            >
              {bestSellerProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </ScrollView>
          </View>
        )}

        {onSaleProducts.length > 0 && (
          <View style={{ marginTop: 10, marginBottom: 22 }}>
            <View
              style={{
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <View
                style={{
                  backgroundColor: "rgba(165,0,33,0.08)",
                  paddingHorizontal: 20,
                  paddingVertical: 7,
                  borderRadius: 18,
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "800",
                    color: "#A50021",
                  }}
                >
                  On Sale Products
                </Text>
              </View>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 14 }}
            >
              {onSaleProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </ScrollView>
          </View>
        )}

        {filteredProducts.length === 0 && (
          <View
            style={{ alignItems: "center", marginTop: 50, marginBottom: 50 }}
          >
            <Ionicons
              name="search-outline"
              size={48}
              color="#ccc"
              style={{ marginBottom: 12 }}
            />
            <Text
              style={{ fontSize: 22, fontWeight: "bold", color: "#1a1a1a" }}
            >
              No Products Found
            </Text>
            <Text
              style={{
                color: "#888",
                marginTop: 10,
                textAlign: "center",
                lineHeight: 22,
              }}
            >
              Try a different search or adjust your filters
            </Text>
          </View>
        )}
      </ScrollView>

      {showCartBar && totalItems > 0 && (
        <TouchableOpacity
          onPress={() => navigation.navigate("Cart")}
          style={{
            position: "absolute",
            bottom: 90,
            left: 16,
            right: 16,
            backgroundColor: "#A50021",
            borderRadius: 10,
            paddingVertical: 12,
            paddingHorizontal: 16,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            shadowColor: "#A50021",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 10,
            elevation: 6,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>
            {totalItems} item{totalItems > 1 ? "s" : ""} in cart
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>
              ₹{totalPrice}
            </Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </View>
        </TouchableOpacity>
      )}

      <BottomNav navigation={navigation} route={route} />

      <Modal
        visible={showFilter}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilter(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }}
          activeOpacity={1}
          onPress={() => setShowFilter(false)}
        />
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "#fff",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 24,
            paddingBottom: 42,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <Text
              style={{ fontSize: 20, fontWeight: "bold", color: "#1a1a1a" }}
            >
              Filters
            </Text>
            <TouchableOpacity onPress={() => setShowFilter(false)}>
              <Ionicons name="close" size={24} color="#bbb" />
            </TouchableOpacity>
          </View>

          <Text
            style={{
              fontWeight: "700",
              fontSize: 14,
              color: "#444",
              marginBottom: 12,
            }}
          >
            Price Range (₹)
          </Text>
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#aaa", fontSize: 12, marginBottom: 6 }}>
                Min Price
              </Text>
              <TextInput
                placeholder="e.g. 50"
                placeholderTextColor="#ccc"
                value={minPrice}
                onChangeText={setMinPrice}
                keyboardType="number-pad"
                style={{
                  backgroundColor: "#f8f8f8",
                  borderRadius: 10,
                  paddingHorizontal: 14,
                  height: 44,
                  fontSize: 14,
                  color: "#1a1a1a",
                  borderWidth: 1.5,
                  borderColor: minPrice ? "#A50021" : "#eee",
                }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#aaa", fontSize: 12, marginBottom: 6 }}>
                Max Price
              </Text>
              <TextInput
                placeholder="e.g. 500"
                placeholderTextColor="#ccc"
                value={maxPrice}
                onChangeText={setMaxPrice}
                keyboardType="number-pad"
                style={{
                  backgroundColor: "#f8f8f8",
                  borderRadius: 10,
                  paddingHorizontal: 14,
                  height: 44,
                  fontSize: 14,
                  color: "#1a1a1a",
                  borderWidth: 1.5,
                  borderColor: maxPrice ? "#A50021" : "#eee",
                }}
              />
            </View>
          </View>

          <Text
            style={{
              fontWeight: "700",
              fontSize: 14,
              color: "#444",
              marginBottom: 12,
            }}
          >
            Sort By Price
          </Text>
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 28 }}>
            {SORT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.id}
                onPress={() => setSortBy(opt.id)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 10,
                  alignItems: "center",
                  backgroundColor: sortBy === opt.id ? "#A50021" : "#f8f8f8",
                  borderWidth: 1.5,
                  borderColor: sortBy === opt.id ? "#A50021" : "#eee",
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "700",
                    color: sortBy === opt.id ? "#fff" : "#666",
                  }}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              onPress={handleResetFilter}
              style={{
                flex: 1,
                height: 50,
                borderRadius: 10,
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 2,
                borderColor: "#A50021",
              }}
            >
              <Text
                style={{ color: "#A50021", fontWeight: "700", fontSize: 15 }}
              >
                Reset
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleApplyFilter}
              style={{
                flex: 2,
                height: 50,
                borderRadius: 10,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#A50021",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>
                Apply Filters
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
