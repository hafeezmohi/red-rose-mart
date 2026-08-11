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
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { wp, hp, moderateScale, BOTTOM_NAV_HEIGHT } from '../utils/responsive';
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomNav from "../components/BottomNav";
import Skeleton from '../components/Skeleton';
import { CartContext } from "../context/CartContext";
import { AddressContext } from "../context/AddressContext";
import ProductCard from "../components/ProductCard";
import CategoryModal from "../components/CategoryModal";
import { useNavigation } from '@react-navigation/native';

const API_URL = process.env.EXPO_PUBLIC_API_URL || "https://red-rose-backend.onrender.com/";

const categories = [
  { id: "all", name: "All Categories", icon: "grid-outline" },
  { id: "rice-grains", name: "Food Grains", icon: "nutrition-outline" },
  { id: "instant-foods", name: "Instant Foods", icon: "fast-food-outline" },
  { id: "snacks", name: "Snacks", icon: "fast-food-outline" },
  { id: "oil-masala", name: "Oil & Masala", icon: "restaurant-outline" },
  { id: "beverages", name: "Beverages", icon: "cafe-outline" },
  { id: "other", name: "Other Products", icon: "cube-outline" },
  { id: "offers", name: "Special Offers", icon: "pricetag-outline" },
  { id: "beauty-and-personal-care", name: "Beauty & Personal Care", icon: "sparkles-outline" },
  { id: "dryfruits", name: "Dryfruits", icon: "nutrition-outline" },
];

const SORT_OPTIONS = [
  { id: "none", label: "Default" },
  { id: "low_high", label: "Price: Low - High" },
  { id: "high_low", label: "Price: High - Low" },
];

const PAGE_SIZE = 50;

const SCREEN_WIDTH = Dimensions.get("window").width;

const CATEGORY_GRID = categories.filter(c => c.id !== "all").map(c => ({ ...c, iconLib: "ion" }));

const CategoryIcon = ({ item, size = 28, color = "#A50021" }) => {
  if (item.iconLib === "mci") {
    return (
      <MaterialCommunityIcons name={item.icon} size={size} color={color} />
    );
  }
  return <Ionicons name={item.icon} size={size} color={color} />;
};

const LocalSearchBar = ({ isFilterActive, setShowFilter }) => {
  const [text, setText] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const debounceRef = useRef(null);
  const navigation = useNavigation();

  const fetchSuggestions = (query) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const url = `${API_URL}/api/products?limit=8&search=${encodeURIComponent(query.trim())}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.success && data.products.length > 0) {
          // Deduplicate by name (case-insensitive)
          const seen = new Set();
          const unique = [];
          for (const p of data.products) {
            const lower = p.name.toLowerCase();
            if (!seen.has(lower)) {
              seen.add(lower);
              unique.push(p.name);
            }
            if (unique.length >= 6) break;
          }
          setSuggestions(unique);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch (err) {
        console.error("Suggestion fetch error:", err);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300);
  };

  const handleChangeText = (newText) => {
    setText(newText);
    fetchSuggestions(newText);
  };

  const handleSearch = (query) => {
    const trimmed = (query || text).trim();
    if (trimmed) {
      setShowSuggestions(false);
      setSuggestions([]);
      setText("");
      navigation.navigate('SearchResults', { searchQuery: trimmed });
    }
  };

  const handleSuggestionPress = (suggestion) => {
    handleSearch(suggestion);
  };

  return (
    <View style={{ position: "relative", zIndex: 100, marginTop: 14 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#fff",
          borderRadius: 8,
          paddingHorizontal: 12,
          height: 44,
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
          value={text}
          onChangeText={handleChangeText}
          onSubmitEditing={() => handleSearch()}
          returnKeyType="search"
          style={{ flex: 1, fontSize: 13, color: "#1a1a1a" }}
        />
        {text.length > 0 && (
          <TouchableOpacity onPress={() => { setText(""); setSuggestions([]); setShowSuggestions(false); }}>
            <Ionicons name="close" size={18} color="#999" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={() => handleSearch()}
          style={{ marginLeft: 8, backgroundColor: '#A50021', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5 }}
        >
          <Ionicons name="search" size={16} color="#fff" />
        </TouchableOpacity>
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

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <View
          style={{
            position: "absolute",
            top: 48,
            left: 0,
            right: 0,
            backgroundColor: "#fff",
            borderRadius: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 8,
            zIndex: 200,
            overflow: "hidden",
          }}
        >
          {suggestions.map((item, index) => (
            <TouchableOpacity
              key={`suggestion-${index}`}
              onPress={() => handleSuggestionPress(item)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 12,
                paddingHorizontal: 14,
                borderBottomWidth: index < suggestions.length - 1 ? 1 : 0,
                borderBottomColor: "#f0f0f0",
              }}
            >
              <Ionicons name="search-outline" size={15} color="#bbb" style={{ marginRight: 10 }} />
              <Text
                numberOfLines={1}
                style={{ flex: 1, fontSize: 13, color: "#333" }}
              >
                {item}
              </Text>
              <Ionicons name="arrow-forward-outline" size={14} color="#ccc" />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};
export default function HomeScreen({ navigation, route }) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeModalCategory, setActiveModalCategory] = useState(null);
  const [activeModalCategoryName, setActiveModalCategoryName] = useState("");
  const [showOffersOnly, setShowOffersOnly] = useState(false);
  const [showCartBar, setShowCartBar] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
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

  const { cartItems, addToCart, increaseQty, decreaseQty } = useContext(CartContext);
  const { selectedAddress } = useContext(AddressContext);

  const bannerScrollRef = useRef(null);
  const insets = useSafeAreaInsets();

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
      const next = (currentBanner + 1) % 2;

      bannerScrollRef.current?.scrollTo({
        x: next * (SCREEN_WIDTH - 24),
        animated: true,
      });

      setCurrentBanner(next);
    }, 3000);

    return () => clearInterval(interval);
  }, [currentBanner]);

  const fetchProducts = useCallback(
    async (category = "all", pageNum = 1, append = false) => {
      try {
        let url = `${API_URL}/api/products?limit=${PAGE_SIZE}&page=${pageNum}`;

        if (category !== "all") {
          url += `&category=${category}`;
        }

        const res = await fetch(url);
        const data = await res.json();

        if (data.success) {
          const newProducts = data.products;
          if (append) {
            setProducts((prev) => {
              const existingIds = new Set(prev.map(p => p._id?.$oid || p._id));
              const uniqueNew = newProducts.filter(p => !existingIds.has(p._id?.$oid || p._id));
              return [...prev, ...uniqueNew];
            });
          } else {
            setProducts(newProducts);
          }
          setHasMore(newProducts.length === PAGE_SIZE);
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
    fetchProducts(selectedCategory, 1, false);
  }, [selectedCategory]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    setLoadingMore(true);
    fetchProducts(selectedCategory, nextPage, true);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchProducts(selectedCategory, 1, false);
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
    category: categories.find((c) => c.id === p.category)?.name || p.category,
    unit: p.unit,
    discount: p.discountPrice
      ? Math.round(((p.price - p.discountPrice) / p.price) * 100)
      : null,
  }));

  let filteredProducts = mappedProducts.filter((product) => {
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

  if (loading && page === 1) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f7f3f3" }}>
        <View style={{ paddingTop: insets.top + 10, paddingHorizontal: 12 }}>
           {/* Header */}
           <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, paddingHorizontal: 4 }}>
             <View>
               <Skeleton width={120} height={16} style={{ marginBottom: 8 }} />
               <Skeleton width={180} height={20} />
             </View>
             <Skeleton width={44} height={44} borderRadius={22} />
           </View>
           {/* Search */}
           <Skeleton width="100%" height={50} borderRadius={25} style={{ marginBottom: 20 }} />
           {/* Banner */}
           <Skeleton width="100%" height={hp(24)} borderRadius={18} style={{ marginBottom: 24 }} />
           {/* Categories */}
           <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }}>
             {[1,2,3,4].map(i => (
               <View key={i} style={{ alignItems: 'center' }}>
                 <Skeleton width={moderateScale(48)} height={moderateScale(48)} borderRadius={24} style={{ marginBottom: 10 }} />
                 <Skeleton width={50} height={10} />
               </View>
             ))}
           </View>
           {/* Products */}
           <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
             {[1,2,3,4].map(i => (
               <View key={i} style={{ width: wp(42), backgroundColor: '#fff', borderRadius: 16, paddingBottom: 14, marginBottom: 16 }}>
                 <Skeleton width="100%" height={hp(15)} />
                 <View style={{ padding: 10 }}>
                   <Skeleton width="60%" height={16} style={{ marginBottom: 6 }} />
                   <Skeleton width="40%" height={12} />
                 </View>
               </View>
             ))}
           </View>
        </View>
      </SafeAreaView>
    );
  }


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
        contentContainerStyle={{ paddingBottom: BOTTOM_NAV_HEIGHT + insets.bottom + 24 }}
      >
        <View
          style={{
            backgroundColor: "#0a1f44",
            paddingTop: insets.top + 10,
            paddingHorizontal: 16,
            paddingBottom: 16,
            zIndex: 100,
            elevation: 100,
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

          <LocalSearchBar 
            isFilterActive={isFilterActive} 
            setShowFilter={setShowFilter} 
          />
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
              require("../../assets/banner1.jpg"),
              require("../../assets/banner2.jpg"),
            ].map((banner, index) => (
              <Image
                key={index}
                source={banner}
                resizeMode="cover"
                style={{
                  width: SCREEN_WIDTH - 24,
                  height: hp(24),
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
            {[0, 1].map((i) => (
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
                image: require("../../assets/oilandmasala.jpeg"),
              },
              {
                id: "beverages",
                name: "Beverages",
                image: require("../../assets/beverages.jpeg"),
              },
              {
                id: "other",
                name: "Other Products",
                image: require("../../assets/otherproducts.jpeg"),
              },
              {
                id: "beauty-and-personal-care",
                name: "Beauty & Personal Care",
                image: require("../../assets/beautyandpersonalcare.jpeg"),
              },
              {
                id: "dryfruits",
                name: "Dryfruits",
                image: require("../../assets/dryfruits.jpeg"),
              },
              {
                id: "offers",
                name: "Special Offers",
                image: require("../../assets/specialoffer.jpeg"),
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
                    setActiveModalCategory(item.id);
                    setActiveModalCategoryName(item.name);
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
                    width: moderateScale(48),
                    height: moderateScale(48),
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

        {filteredProducts.length > 0 && (
          <View style={{ paddingHorizontal: 12, paddingBottom: 20 }}>
            <View style={{ alignItems: "center", marginBottom: 16, marginTop: 10 }}>
              <View style={{ backgroundColor: "rgba(165,0,33,0.08)", paddingHorizontal: 20, paddingVertical: 7, borderRadius: 18 }}>
                <Text style={{ fontSize: 20, fontWeight: "800", color: "#A50021" }}>All Products</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {filteredProducts.map((product, index) => (
                <View key={`all-${product.id}-${index}`} style={{ width: '48%', marginBottom: 12 }}>
                  <ProductCard product={product} />
                </View>
              ))}
            </View>
            {hasMore && (
              <TouchableOpacity
                onPress={handleLoadMore}
                disabled={loadingMore}
                style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#A50021', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 16 }}
              >
                {loadingMore ? (
                  <ActivityIndicator color="#A50021" size="small" />
                ) : (
                  <Text style={{ color: '#A50021', fontWeight: 'bold' }}>Show More</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      <CategoryModal 
        visible={!!activeModalCategory} 
        onClose={() => setActiveModalCategory(null)} 
        categoryId={activeModalCategory} 
        categoryName={activeModalCategoryName} 
      />

      {showCartBar && totalItems > 0 && (
        <TouchableOpacity
          onPress={() => navigation.navigate("Cart")}
          style={{
            position: "absolute",
            bottom: BOTTOM_NAV_HEIGHT + insets.bottom + 20,
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
            paddingBottom: insets.bottom + 16,
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
