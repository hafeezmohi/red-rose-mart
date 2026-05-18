// import { Text, TouchableOpacity, View, ActivityIndicator, Alert } from 'react-native';
// import { useState } from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { GoogleSignin } from '@react-native-google-signin/google-signin';

// const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

// GoogleSignin.configure({
//   webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
// });

// export default function WelcomeScreen({ navigation }) {
//   const [loading, setLoading] = useState(false);

//   const handleGoogleSignIn = async () => {
//     try {
//       setLoading(true);
//       await GoogleSignin.hasPlayServices();
//       const { idToken } = await GoogleSignin.signIn();

//       const res = await fetch(`${API_URL}/api/auth/google`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ idToken }),
//       });

//       const data = await res.json();

//       if (!data.success) {
//         Alert.alert('Login Failed', data.message);
//         return;
//       }

//       await AsyncStorage.setItem('token', data.token);
//       await AsyncStorage.setItem('user', JSON.stringify(data.user));

//       if (data.isProfileComplete) {
//         navigation.replace('Home');
//       } else {
//         navigation.replace('CompleteProfile');
//       }
//     } catch (error) {
//       console.error('Google Sign In error:', error);
//       Alert.alert('Error', 'Google Sign In failed. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={{ flex: 1, backgroundColor: '#A50021', paddingHorizontal: 28, paddingTop: 70, paddingBottom: 40 }}>
//       <View style={{ alignItems: 'center', marginTop: 10 }}>
//         <Text style={{ fontSize: 72, color: '#ffffff' }}>🛍️</Text>
//         <Text style={{ color: '#ffffff', fontSize: 38, fontWeight: 'bold', marginTop: 20, textAlign: 'center' }}>
//           Red Rose Mart
//         </Text>
//         <Text style={{ color: '#ffffffdd', fontSize: 18, textAlign: 'center', marginTop: 18, lineHeight: 30, paddingHorizontal: 10 }}>
//           Premium groceries delivered{"\n"}with crimson speed.
//         </Text>
//       </View>

//       <View style={{ flex: 1 }} />

//       {/* Google Sign In Button */}
//       <TouchableOpacity
//         onPress={handleGoogleSignIn}
//         disabled={loading}
//         style={{
//           backgroundColor: '#ffffff',
//           height: 65,
//           borderRadius: 20,
//           justifyContent: 'center',
//           alignItems: 'center',
//           flexDirection: 'row',
//           gap: 12,
//         }}
//       >
//         {loading ? (
//           <ActivityIndicator color="#A50021" />
//         ) : (
//           <>
//             <Text style={{ fontSize: 24 }}>🔵</Text>
//             <Text style={{ color: '#A50021', fontSize: 20, fontWeight: 'bold' }}>
//               Continue with Google
//             </Text>
//           </>
//         )}
//       </TouchableOpacity>
//     </View>
//   );
// }

// For development/testing purposes, we can have a simple login flow without Google Sign-In. This allows us to quickly access the app without going through the OAuth process every time.
import { useState } from 'react';
import { Text, TouchableOpacity, View, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.x.x:5000';

export default function WelcomeScreen({ navigation }) {
  const [loading, setLoading] = useState(false);

  const handleDevLogin = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/auth/dev-login`, { method: 'POST' });
      const data = await res.json();

      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));

      if (data.user?.isProfileComplete) {
        navigation.replace('Home');
      } else {
        navigation.replace('CompleteProfile');
      }
    } catch (error) {
      Alert.alert('Error', 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#A50021', paddingHorizontal: 28, paddingTop: 70, paddingBottom: 40 }}>
      <View style={{ alignItems: 'center', marginTop: 10 }}>
        <Text style={{ fontSize: 72, color: '#ffffff' }}>🛍️</Text>
        <Text style={{ color: '#ffffff', fontSize: 38, fontWeight: 'bold', marginTop: 20, textAlign: 'center' }}>
          Red Rose Mart
        </Text>
        <Text style={{ color: '#ffffffdd', fontSize: 18, textAlign: 'center', marginTop: 18, lineHeight: 30, paddingHorizontal: 10 }}>
          Premium groceries delivered{"\n"}with crimson speed.
        </Text>
      </View>

      <View style={{ flex: 1 }} />

      <TouchableOpacity
        onPress={handleDevLogin}
        disabled={loading}
        style={{ backgroundColor: '#ffffff', height: 65, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}
      >
        {loading ? (
          <ActivityIndicator color="#A50021" />
        ) : (
          <Text style={{ color: '#A50021', fontSize: 22, fontWeight: 'bold' }}>Get Started</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}