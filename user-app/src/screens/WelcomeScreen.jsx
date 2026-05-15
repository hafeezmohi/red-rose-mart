
import {
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function WelcomeScreen({
    navigation,
}) {
    return (
        <View
            style={{
                flex: 1,
                backgroundColor: '#A50021',
                paddingHorizontal: 28,
                paddingTop: 70,
                paddingBottom: 40,
            }}
        >
            <View
                style={{
                    alignItems: 'center',
                    marginTop: 10,
                }}
            >
                <Text
                    style={{
                        fontSize: 72,
                        color: '#ffffff',
                    }}
                >
                    🛍️
                </Text>

                <Text
                    style={{
                        color: '#ffffff',
                        fontSize: 38,
                        fontWeight: 'bold',
                        marginTop: 20,
                        textAlign: 'center',
                    }}
                >
                    Red Rose Mart
                </Text>

                <Text
                    style={{
                        color: '#ffffffdd',
                        fontSize: 18,
                        textAlign: 'center',
                        marginTop: 18,
                        lineHeight: 30,
                        paddingHorizontal: 10,
                    }}
                >
                    Premium groceries delivered
                    with crimson speed.
                </Text>
            </View>

            <View
                style={{
                    flex: 1,
                }}
            />

            <TouchableOpacity
                onPress={() =>
                    navigation.navigate(
                        'Login'
                    )
                }
                style={{
                    backgroundColor: '#ffffff',
                    height: 65,
                    borderRadius: 20,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Text
                    style={{
                        color: '#A50021',
                        fontSize: 22,
                        fontWeight: 'bold',
                    }}
                >
                    Get Started
                </Text>
            </TouchableOpacity>
        </View>
    );
}