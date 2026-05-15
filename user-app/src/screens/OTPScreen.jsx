import {
    useRef,
    useState,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
    ActivityIndicator,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

export default function OTPScreen({
    navigation,
}) {
    const [otp, setOtp] =
        useState(['', '', '', '']);

    const [loading, setLoading] =
        useState(false);

    const inputs = useRef([]);

    const handleChange = (
        text,
        index
    ) => {
        const newOtp = [...otp];

        newOtp[index] = text;

        setOtp(newOtp);

        if (
            text &&
            index < 3
        ) {
            inputs.current[
                index + 1
            ].focus();
        }
    };

    const handleKeyPress = (
        e,
        index
    ) => {
        if (
            e.nativeEvent.key ===
            'Backspace' &&
            otp[index] === '' &&
            index > 0
        ) {
            inputs.current[
                index - 1
            ].focus();
        }
    };

    const handleVerifyOTP =
        async () => {
            try {
                setLoading(true);

                setTimeout(async () => {
                    await AsyncStorage.setItem(
                        'isLoggedIn',
                        'true'
                    );

                    navigation.reset({
                        index: 0,
                        routes: [
                            {
                                name:
                                    'Home',
                            },
                        ],
                    });

                    setLoading(false);
                }, 1500);
            } catch (error) {
                console.log(error);

                setLoading(false);
            }
        };

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
                        Verify OTP 🔐
                    </Text>

                    <Text
                        style={{
                            fontSize: 16,
                            color: '#666',
                            marginTop: 10,
                            marginBottom: 45,
                        }}
                    >
                        Enter the 4 digit OTP
                    </Text>

                    <View
                        style={{
                            backgroundColor:
                                '#ffffff',
                            borderRadius: 24,
                            padding: 22,
                        }}
                    >
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent:
                                    'space-between',
                            }}
                        >
                            {otp.map(
                                (
                                    digit,
                                    index
                                ) => (
                                    <TextInput
                                        key={index}
                                        ref={(ref) =>
                                        (inputs.current[
                                            index
                                        ] = ref)
                                        }
                                        value={digit}
                                        onChangeText={(
                                            text
                                        ) =>
                                            handleChange(
                                                text,
                                                index
                                            )
                                        }
                                        onKeyPress={(e) =>
                                            handleKeyPress(
                                                e,
                                                index
                                            )
                                        }
                                        keyboardType="number-pad"
                                        maxLength={1}
                                        editable={!loading}
                                        style={{
                                            width: 62,
                                            height: 62,
                                            borderWidth: 1,
                                            borderColor:
                                                '#e5dcdc',
                                            borderRadius: 18,
                                            textAlign:
                                                'center',
                                            fontSize: 24,
                                            fontWeight:
                                                'bold',
                                        }}
                                    />
                                )
                            )}
                        </View>

                        <TouchableOpacity
                            disabled={loading}
                            onPress={
                                handleVerifyOTP
                            }
                            style={{
                                backgroundColor:
                                    loading
                                        ? '#c77b8a'
                                        : '#A50021',

                                height: 58,
                                borderRadius: 18,
                                justifyContent:
                                    'center',
                                alignItems:
                                    'center',
                                marginTop: 34,
                            }}
                        >
                            {loading ? (
                                <ActivityIndicator
                                    color="#ffffff"
                                />
                            ) : (
                                <Text
                                    style={{
                                        color:
                                            '#ffffff',
                                        fontSize: 18,
                                        fontWeight:
                                            'bold',
                                    }}
                                >
                                    Verify OTP
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
}