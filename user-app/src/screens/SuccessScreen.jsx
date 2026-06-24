import { Text, TouchableOpacity, View } from 'react-native';
import { moderateScale } from '../utils/responsive';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SuccessScreen({ route, navigation }) {
  const order = route.params?.order;

  const orderNumber = `RRM${Math.floor(
    100000 + Math.random() * 900000
  )}`;

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
      }}
    >
      {/* Success Icon */}
      <View
        style={{
          width: moderateScale(120),
          height: moderateScale(120),
          borderRadius: moderateScale(36),
          backgroundColor: '#E8F5E9',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: moderateScale(64) }}>✅</Text>
      </View>

      {/* Title */}
      <Text
        style={{
          fontSize: moderateScale(30),
          fontWeight: '800',
          color: '#111827',
          marginTop: 30,
          textAlign: 'center',
        }}
      >
         Order Confirmed!
      </Text>

      {/* Order Number */}
      <Text
        style={{
          fontSize: 16,
          color: '#6B7280',
          marginTop: 8,
          fontWeight: '600',
        }}
      >
        Order #{orderNumber}
      </Text>

      {/* Message */}
      <Text
        style={{
          color: '#4B5563',
          fontSize: 16,
          textAlign: 'center',
          lineHeight: 24,
          marginTop: 18,
          paddingHorizontal: 10,
        }}
      >
        Thank you for shopping with Red Rose Mart.
        {'\n'}
        Your order has been received and is now being prepared for delivery.
      </Text>

      {/* Order Summary */}
      <View
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 24,
          padding: 24,
          width: '100%',
          marginTop: 35,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 18,
          }}
        >
          <Text
            style={{
              color: '#000000',
              fontSize: 16,
            }}
          >
            Total
          </Text>

          <Text
            style={{
              color: '#A50021',
              fontWeight: 'bold',
              fontSize: 18,
            }}
          >
            ₹{order?.totalPrice || 0}
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <Text
            style={{
              color: '#000000',
              fontSize: 16,
            }}
          >
            Payment
          </Text>

          <Text
            style={{
              fontWeight: 'bold',
              fontSize: 16,
              color: '#2E7D32',
            }}
          >
            Cash on Delivery
          </Text>
        </View>
      </View>

      {/* Track Order */}
      <TouchableOpacity
        onPress={() => navigation.navigate('Orders')}
        style={{
          backgroundColor: '#A50021',
          width: '100%',
          padding: 20,
          borderRadius: 20,
          alignItems: 'center',
          marginTop: 35,
        }}
      >
        <Text
          style={{
            color: '#ffffff',
            fontSize: 18,
            fontWeight: 'bold',
          }}
        >
          Track Order
        </Text>
      </TouchableOpacity>

      {/* Continue Shopping */}
      <TouchableOpacity
        onPress={() =>
          navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          })
        }
        style={{
          width: '100%',
          padding: 20,
          borderRadius: 20,
          alignItems: 'center',
          marginTop: 16,
          backgroundColor: '#ffffff',
        }}
      >
        <Text
          style={{
            color: '#A50021',
            fontSize: 18,
            fontWeight: 'bold',
          }}
        >
          Continue Shopping
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}