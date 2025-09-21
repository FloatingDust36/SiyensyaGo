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
import { toByteArray } from 'base64-js'; // for decoding the base64 image for upload

type ObjectRecognitionScreenRouteProp = RouteProp<RootStackParamList, 'ObjectRecognition'>;
type NavigationProp = StackNavigationProp<RootStackParamList>;

// 1. Define a type for our AI's response
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
    const [result, setResult] = useState<AnalysisResult | null>(null);

    // This useEffect will run once to call our AI function
    useEffect(() => {
        const analyzeAndSaveImage = async () => {
            try {
                // Compress and resize the image first
                const manipulatedImage = await ImageManipulator.manipulateAsync(
                    imageUri,
                    [{ resize: { width: 1080 } }], // Resize the image to a max width of 1080px
                    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true } // Compress and get base64
                );

                if (!manipulatedImage.base64) {
                    throw new Error("Failed to get base64 from image.");
                }

                // Call our Supabase function with the smaller, compressed image data
                const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-image', {
                    body: {
                        image: manipulatedImage.base64, // Use the base64 string from the compressed image
                        contentType: 'image/jpeg'
                    },
                });

                if (analysisError) throw analysisError;

                setResult(analysisData);
                setStatus('finished');

                // save to databse
                // This runs in the background after the result is shown to the user
                saveDiscovery(manipulatedImage.base64, analysisData);
            } catch (error) {
                console.error("Error in analysis or saving process:", error);
                Alert.alert("Analysis Failed", "Could not get a result from the AI. Please try again.");
                navigation.goBack();
            }
        };

        const saveDiscovery = async (base64: string, analysisData: AnalysisResult) => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session?.user) throw new Error("User not logged in.");

                const userId = session.user.id;
                const filePath = `${userId}/${new Date().getTime()}.jpeg`;

                // Decode the base64 string into a byte array
                const byteArray = toByteArray(base64);

                // Upload to Supabase Storage
                const { error: uploadError } = await supabase.storage
                    .from('discoveries')
                    .upload(filePath, byteArray, { contentType: 'image/jpeg' });

                if (uploadError) throw uploadError;

                // Get the public URL of the uploaded image
                const { data: { publicUrl } } = supabase.storage
                    .from('discoveries')
                    .getPublicUrl(filePath);

                // Insert into the 'discoveries' database table
                const { error: insertError } = await supabase.from('discoveries').insert({
                    image_url: publicUrl,
                    name: analysisData.name,
                    confidence: analysisData.confidence,
                    quick_fact: analysisData.quick_fact,
                    the_science_in_action: analysisData.the_science_in_action,
                    why_it_matters_to_you: analysisData.why_it_matters_to_you,
                    explore_further: analysisData.explore_further,
                });

                if (insertError) throw insertError;

                console.log('Discovery saved successfully!');
            } catch (error) {
                console.error('Error saving discovery:', error);
                // We don't show an alert here because the user can already see the content.
                // This is a background task.
            }
        };

        analyzeAndSaveImage();
    }, [imageUri, navigation]);

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
        textAlign: 'center',
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