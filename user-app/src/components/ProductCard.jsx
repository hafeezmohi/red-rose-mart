import React, { useContext } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { CartContext } from "../context/CartContext";
import { wp, hp } from "../utils/responsive";

export default function ProductCard({ product, width = wp(42) }) {
  const navigation = useNavigation();
  const { cartItems, addToCart, increaseQty, decreaseQty } = useContext(CartContext);
  
  const cartItem = cartItems.find((i) => i.id === product._id);
  const inCart = !!cartItem;

  return (
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
          style={{ width: "100%", height: hp(15), backgroundColor: "#f9f9f9" }}
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

        {inCart ? (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginHorizontal: 6, paddingVertical: 2 }}>
            <TouchableOpacity onPress={() => decreaseQty(cartItem.id)} style={{ width: 28, height: 28, backgroundColor: '#f5f5f5', borderRadius: 14, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1a1a1a' }}>-</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#1a1a1a' }}>{cartItem.qty}</Text>
            <TouchableOpacity onPress={() => increaseQty(cartItem.id)} style={{ width: 28, height: 28, backgroundColor: '#A50021', borderRadius: 14, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#fff' }}>+</Text>
            </TouchableOpacity>
          </View>
        ) : (
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
        )}
      </View>
    </TouchableOpacity>
  );
}
