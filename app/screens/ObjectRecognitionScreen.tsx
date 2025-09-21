// In app/screens/ObjectRecognitionScreen.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as ImageManipulator from 'expo-image-manipulator';
import { supabase } from '../lib/supabase'; // Import our Supabase client
import { RootStackParamList } from '../navigation/types';
import { colors, fonts } from '../theme/theme';

type ObjectRecognitionScreenRouteProp = RouteProp<RootStackParamList, 'ObjectRecognition'>;
type NavigationProp = StackNavigationProp<RootStackParamList>;

// Define a type for our AI's response
type AnalysisResult = {
    name: string;
    confidence: number;
    quick_fact: string;
    the_science_in_action: string;
    why_it_matters_to_you: string;
    explore_further: string;
};

export default function ObjectRecognitionScreen() {
    // Use the hook to get route information
    const route = useRoute<ObjectRecognitionScreenRouteProp>();
    const navigation = useNavigation<NavigationProp>(); // Get navigation prop
    // Extract the imageUri from the route's parameters
    const { imageUri } = route.params;

    // State to manage the analysis process
    const [status, setStatus] = useState<'analyzing' | 'finished'>('analyzing');
    const [result, setResult] = useState<{ name: string; confidence: number } | null>(null);

    // This useEffect will run once to call our REAL AI function
    useEffect(() => {
        const analyzeImage = async () => {
            try {
                // 2. Compress and resize the image first
                const manipulatedImage = await ImageManipulator.manipulateAsync(
                    imageUri,
                    [{ resize: { width: 1080 } }], // Resize the image to a max width of 1080px
                    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true } // Compress and get base64
                );

                // 3. Call our Supabase function with the SMALLER, compressed image data
                const { data, error } = await supabase.functions.invoke('analyze-image', {
                    body: {
                        image: manipulatedImage.base64, // Use the base64 string from the compressed image
                        contentType: 'image/jpeg'
                    },
                });

                if (error) throw error;

                setResult(data);
                setStatus('finished');
            } catch (error) {
                console.error("Error analyzing image:", error);
                Alert.alert("Analysis Failed", "Could not get a result from the AI. Please try again.");
                navigation.goBack();
            }
        };

        analyzeImage();
    }, [imageUri]);

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