import { useContext } from 'react';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNav from '../components/BottomNav';
import { CartContext } from '../context/CartContext';

const MIN_ORDER = 999;

export default function CartScreen({ navigation, route }) {
  const { cartItems, increaseQty, decreaseQty } = useContext(CartContext);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const deliveryFee = 0;
  const total = subtotal + deliveryFee;
  const isBelowMin = total < MIN_ORDER;

  const handlePlaceOrder = () => {
    if (isBelowMin) {
      Alert.alert(
        'Minimum Order Required',
        `Add items worth at least ₹${MIN_ORDER} to place an order. Your current total is ₹${total}.`,
        [{ text: 'Continue Shopping', style: 'default' }]
      );
      return;
    }

    navigation.navigate('Address', {
      checkoutData: { cartItems, total },
    });
  };

  if (cartItems.length === 0) {
    return (
      <SafeAreaView edges={["bottom"]} style={{ flex: 1, backgroundColor: '#f7f3f3' }}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 30,
          }}
        >
          <Text style={{ fontSize: 90 }}>🛒</Text>

          <Text
            style={{
              fontSize: 28,
              fontWeight: 'bold',
              marginTop: 20,
              color: '#1a1a1a',
            }}
          >
            Your Cart is Empty
          </Text>

          <Text
            style={{
              color: '#666',
              textAlign: 'center',
              marginTop: 14,
              lineHeight: 24,
              fontSize: 16,
            }}
          >
            Looks like you haven't added anything yet
          </Text>

          <TouchableOpacity
            onPress={() => navigation.navigate('Home')}
            style={{
              backgroundColor: '#A50021',
              marginTop: 34,
              paddingHorizontal: 32,
              height: 56,
              borderRadius: 18,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                color: '#ffffff',
                fontSize: 18,
                fontWeight: 'bold',
              }}
            >
              Continue Shopping
            </Text>
          </TouchableOpacity>
        </View>

        <BottomNav
          navigation={navigation}
          route={route}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["bottom"]} style={{ flex: 1, backgroundColor: '#f7f3f3' }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 52,
          paddingHorizontal: 16,
          paddingBottom: 150,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
          }}
        >
          <Text
            style={{
              fontSize: 32,
              fontWeight: 'bold',
              color: '#1a1a1a',
            }}
          >
            My Cart
          </Text>
        </View>

        {cartItems.map((item) => (
          <View
            key={item.id}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 18,
              padding: 12,
              marginBottom: 14,
              borderWidth: 1,
              borderColor: '#f0e5e5',
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Image
              source={{ uri: item.image }}
              style={{
                width: 62,
                height: 62,
                borderRadius: 14,
              }}
            />

            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: '#1a1a1a',
                }}
              >
                {item.name}
              </Text>

              <Text
                style={{
                  color: '#A50021',
                  fontSize: 18,
                  fontWeight: 'bold',
                  marginTop: 6,
                }}
              >
                ₹{item.price}
              </Text>
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#A50021',
                borderRadius: 10,
                paddingHorizontal: 8,
                paddingVertical: 6,
              }}
            >
              <TouchableOpacity onPress={() => decreaseQty(item.id)}>
                <Text
                  style={{
                    color: '#ffffff',
                    fontSize: 20,
                    fontWeight: 'bold',
                  }}
                >
                  -
                </Text>
              </TouchableOpacity>

              <Text
                style={{
                  color: '#ffffff',
                  fontSize: 16,
                  fontWeight: 'bold',
                  marginHorizontal: 12,
                }}
              >
                {item.qty}
              </Text>

              <TouchableOpacity onPress={() => increaseQty(item.id)}>
                <Text
                  style={{
                    color: '#ffffff',
                    fontSize: 20,
                    fontWeight: 'bold',
                  }}
                >
                  +
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 18,
            padding: 18,
            marginTop: 8,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 16, color: '#444' }}>
              Item Total
            </Text>

            <Text
              style={{
                fontSize: 16,
                color: '#1a1a1a',
                fontWeight: '600',
              }}
            >
              ₹{subtotal}
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 16, color: '#444' }}>
              Delivery Fee
            </Text>

            <Text
              style={{
                fontSize: 16,
                color: '#22c55e',
                fontWeight: '600',
              }}
            >
              FREE
            </Text>
          </View>

          <View
            style={{
              borderBottomWidth: 1,
              borderBottomColor: '#ead6d6',
              marginBottom: 12,
            }}
          />

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: '#1a1a1a',
              }}
            >
              Total Amount
            </Text>

            <Text
              style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: '#A50021',
              }}
            >
              ₹{total}
            </Text>
          </View>
        </View>

        {isBelowMin && (
          <View
            style={{
              backgroundColor: '#fff8e1',
              borderRadius: 12,
              padding: 12,
              marginTop: 14,
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#ffe082',
            }}
          >
            <Text style={{ fontSize: 16, marginRight: 8 }}>
              ⚠️
            </Text>

            <Text
              style={{
                color: '#b45309',
                fontWeight: '600',
                fontSize: 13,
                flex: 1,
              }}
            >
              Add ₹{MIN_ORDER - total} more to reach the minimum order of ₹{MIN_ORDER}
            </Text>
          </View>
        )}

        <TouchableOpacity
          onPress={handlePlaceOrder}
          style={{
            backgroundColor: isBelowMin ? '#bbb' : '#A50021',
            height: 52,
            borderRadius: 14,
            marginTop: 14,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 18,
          }}
        >
          <Text
            style={{
              color: '#ffffff',
              fontSize: 18,
              fontWeight: 'bold',
            }}
          >
            {isBelowMin ? `Min. Order ₹${MIN_ORDER}` : 'Place Order'}
          </Text>

          <Text
            style={{
              color: '#ffffff',
              fontSize: 18,
              fontWeight: 'bold',
            }}
          >
            ₹{total} →
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomNav
        navigation={navigation}
        route={route}
      />
    </SafeAreaView>
  );
}

