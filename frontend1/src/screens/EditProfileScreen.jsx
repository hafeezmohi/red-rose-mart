import {
    useEffect,
    useState,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function EditProfileScreen({
    navigation,
}) {
    const [name, setName] =
        useState('');

    const [phone, setPhone] =
        useState('');

    const [email, setEmail] =
        useState('');

    const [loading, setLoading] =
        useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile =
        async () => {
            try {
                const savedProfile =
                    await AsyncStorage.getItem(
                        'userProfile'
                    );

                if (savedProfile) {
                    const parsed =
                        JSON.parse(
                            savedProfile
                        );

                    setName(
                        parsed.name || ''
                    );

                    setPhone(
                        parsed.phone || ''
                    );

                    setEmail(
                        parsed.email || ''
                    );
                }
            } catch (error) {
                console.log(error);
            }
        };

    const handleSave =
        async () => {
            if (!name.trim()) {
                Alert.alert(
                    'Enter Name',
                    'Please enter your name'
                );

                return;
            }

            try {
                setLoading(true);

                const profileData = {
                    name,
                    phone,
                    email,
                };

                await AsyncStorage.setItem(
                    'userProfile',
                    JSON.stringify(
                        profileData
                    )
                );

                setTimeout(() => {
                    setLoading(false);

                    Alert.alert(
                        'Profile Updated 🎉'
                    );

                    navigation.goBack();
                }, 1000);
            } catch (error) {
                console.log(error);

                setLoading(false);
            }
        };

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: '#f7f3f3',
            }}
        >
            <ScrollView
                contentContainerStyle={{
                    paddingTop: 55,
                    paddingHorizontal: 20,
                    paddingBottom: 80,
                }}
            >
                <Text
                    style={{
                        fontSize: 32,
                        fontWeight: 'bold',
                    }}
                >
                    Edit Profile 👤
                </Text>

                <Text
                    style={{
                        color: '#666',
                        marginTop: 10,
                    }}
                >
                    Update your account details
                </Text>

                <View
                    style={{
                        backgroundColor:
                            '#ffffff',
                        borderRadius: 22,
                        padding: 20,
                        marginTop: 30,
                    }}
                >
                    <Text
                        style={{
                            fontWeight: 'bold',
                            marginBottom: 10,
                        }}
                    >
                        Full Name
                    </Text>

                    <TextInput
                        placeholder="Enter your name"
                        value={name}
                        onChangeText={setName}
                        style={{
                            borderWidth: 1,
                            borderColor: '#eee',
                            borderRadius: 14,
                            paddingHorizontal: 16,
                            height: 54,
                            marginBottom: 22,
                        }}
                    />

                    <Text
                        style={{
                            fontWeight: 'bold',
                            marginBottom: 10,
                        }}
                    >
                        Phone Number
                    </Text>

                    <TextInput
                        placeholder="Enter phone number"
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                        style={{
                            borderWidth: 1,
                            borderColor: '#eee',
                            borderRadius: 14,
                            paddingHorizontal: 16,
                            height: 54,
                            marginBottom: 22,
                        }}
                    />

                    <Text
                        style={{
                            fontWeight: 'bold',
                            marginBottom: 10,
                        }}
                    >
                        Email Address
                    </Text>

                    <TextInput
                        placeholder="Enter email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        style={{
                            borderWidth: 1,
                            borderColor: '#eee',
                            borderRadius: 14,
                            paddingHorizontal: 16,
                            height: 54,
                        }}
                    />
                </View>

                <TouchableOpacity
                    disabled={loading}
                    onPress={handleSave}
                    style={{
                        backgroundColor:
                            loading
                                ? '#d38c9c'
                                : '#A50021',

                        height: 58,
                        borderRadius: 18,
                        justifyContent:
                            'center',
                        alignItems: 'center',
                        marginTop: 34,
                    }}
                >
                    <Text
                        style={{
                            color: '#ffffff',
                            fontSize: 18,
                            fontWeight: 'bold',
                        }}
                    >
                        {loading
                            ? 'Saving...'
                            : 'Save Changes'}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}