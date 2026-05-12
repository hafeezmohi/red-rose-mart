import {
    useState,
} from 'react';

import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

export default function LoginScreen({
    navigation,
}) {
    const [phone, setPhone] =
        useState('');

    return (
        <TouchableWithoutFeedback
            onPress={Keyboard.dismiss}
        >
            <KeyboardAvoidingView
                behavior={
                    Platform.OS === 'ios'
                        ? 'padding'
                        : 'height'
                }
                style={{
                    flex: 1,
                    backgroundColor: '#f7f3f3',
                }}
            >
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        paddingHorizontal: 24,
                    }}
                >
                    <Text
                        style={{
                            fontSize: 40,
                            fontWeight: 'bold',
                            color: '#A50021',
                        }}
                    >
                        Welcome 👋
                    </Text>

                    <Text
                        style={{
                            fontSize: 16,
                            color: '#666',
                            marginTop: 10,
                            marginBottom: 45,
                        }}
                    >
                        Login to continue shopping
                    </Text>

                    <View
                        style={{
                            backgroundColor:
                                '#ffffff',
                            borderRadius: 24,
                            padding: 22,
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 18,
                                fontWeight: 'bold',
                                marginBottom: 16,
                            }}
                        >
                            Mobile Number
                        </Text>

                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                borderWidth: 1,
                                borderColor:
                                    '#e6dede',
                                borderRadius: 16,
                                height: 60,
                                overflow: 'hidden',
                            }}
                        >
                            <View
                                style={{
                                    width: 75,
                                    height: '100%',
                                    justifyContent:
                                        'center',
                                    alignItems:
                                        'center',
                                    backgroundColor:
                                        '#faf5f5',
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: 18,
                                        fontWeight:
                                            'bold',
                                    }}
                                >
                                    +91
                                </Text>
                            </View>

                            <TextInput
                                placeholder="Enter mobile number"
                                keyboardType="number-pad"
                                maxLength={10}
                                value={phone}
                                onChangeText={setPhone}
                                style={{
                                    flex: 1,
                                    height: '100%',
                                    paddingHorizontal: 16,
                                    fontSize: 18,
                                }}
                            />
                        </View>

                        <TouchableOpacity
                            onPress={() =>
                                navigation.navigate(
                                    'Otp'
                                )
                            }
                            style={{
                                backgroundColor:
                                    '#A50021',
                                height: 58,
                                borderRadius: 18,
                                justifyContent:
                                    'center',
                                alignItems:
                                    'center',
                                marginTop: 28,
                            }}
                        >
                            <Text
                                style={{
                                    color: '#ffffff',
                                    fontSize: 18,
                                    fontWeight:
                                        'bold',
                                }}
                            >
                                Send OTP
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
}