// In app/screens/ObjectRecognitionScreen.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { colors, fonts } from '../theme/theme';

type ObjectRecognitionScreenRouteProp = RouteProp<RootStackParamList, 'ObjectRecognition'>;
type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function ObjectRecognitionScreen() {
    // Use the hook to get route information
    const route = useRoute<ObjectRecognitionScreenRouteProp>();
    const navigation = useNavigation<NavigationProp>(); // Get navigation prop
    // Extract the imageUri from the route's parameters
    const { imageUri } = route.params;

    // State to manage the analysis process
    const [status, setStatus] = useState<'analyzing' | 'finished'>('analyzing');
    const [result, setResult] = useState<{ name: string; confidence: number } | null>(null);

    // This useEffect will run once to simulate the AI call
    useEffect(() => {
        const timer = setTimeout(() => {
            // After 2.5 seconds, set a mock result and change the status
            setResult({ name: 'BASKETBALL', confidence: 94 });
            setStatus('finished');
        }, 2500); // 2500 milliseconds = 2.5 seconds

        // Cleanup function to clear the timer if the user navigates away
        return () => clearTimeout(timer);
    }, []);

    const handleAccept = () => {
        if (result) {
            navigation.navigate('LearningContent', { ...result, imageUri });
        }
    };

    const handleReject = () => {
        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.container}>
            <Image source={{ uri: imageUri }} style={styles.image} />

            {/* Conditionally render UI based on the status */}
            {status === 'analyzing' ? (
                <View style={styles.statusContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.statusText}>Analyzing...</Text>
                </View>
            ) : (
                <View style={styles.statusContainer}>
                    <Text style={styles.resultName}>{result?.name}</Text>
                    <Text style={styles.resultConfidence}>{result?.confidence}% Confidence</Text>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.secondaryButton} onPress={handleReject}>
                            <Text style={styles.secondaryButtonText}>Scan Again</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.primaryButton} onPress={handleAccept}>
                            <Text style={styles.primaryButtonText}>Learn More</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 30,
    },
    image: {
        width: '80%',
        height: '60%',
        borderRadius: 30,
        borderWidth: 4,
        borderColor: colors.primary,
    },
    statusContainer: {
        alignItems: 'center',
        gap: 15,
    },
    statusText: {
        fontFamily: fonts.heading,
        color: colors.text,
        fontSize: 32,
    },
    resultName: {
        fontFamily: fonts.heading,
        color: colors.text,
        fontSize: 40,
    },
    resultConfidence: {
        fontFamily: fonts.body,
        color: colors.primary,
        fontSize: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        marginTop: 20,
        gap: 15,
    },
    primaryButton: {
        backgroundColor: colors.primary,
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 30,
    },
    primaryButtonText: {
        color: colors.background,
        fontSize: 16,
        fontWeight: 'bold',
    },
    secondaryButton: {
        borderColor: colors.primary,
        borderWidth: 2,
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 30,
    },
    secondaryButtonText: {
        color: colors.primary,
        fontSize: 16,
        fontWeight: 'bold',
    },
});