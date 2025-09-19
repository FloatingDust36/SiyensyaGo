// In app/screens/ObjectRecognitionScreen.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { colors, fonts } from '../theme/theme';

type ObjectRecognitionScreenRouteProp = RouteProp<RootStackParamList, 'ObjectRecognition'>;

export default function ObjectRecognitionScreen() {
    // Use the hook to get route information
    const route = useRoute<ObjectRecognitionScreenRouteProp>();
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
    // New styles for the status/result area
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
});