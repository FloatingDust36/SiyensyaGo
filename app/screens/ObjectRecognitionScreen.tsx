// In app/screens/ObjectRecognitionScreen.tsx

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, TouchableOpacity, Alert, ScrollView, Dimensions, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as ImageManipulator from 'expo-image-manipulator';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import { supabase } from '../lib/supabase'; // Import our Supabase client
import { RootStackParamList, AnalysisResult, DetectedObject, DetailedScienceInfo } from '../navigation/types';
import { colors, fonts } from '../theme/theme';
import { toByteArray } from 'base64-js'; // for decoding the base64 image for upload

type ObjectRecognitionScreenRouteProp = RouteProp<RootStackParamList, 'ObjectRecognition'>;
type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function ObjectRecognitionScreen() {
    // Use the hook to get route information
    const route = useRoute<ObjectRecognitionScreenRouteProp>();
    const navigation = useNavigation<NavigationProp>(); // Get navigation prop
    // Extract the imageUri from the route's parameters
    const { imageUri } = route.params;

    // State to manage the analysis process
    const [status, setStatus] = useState<'analyzing' | 'finished'| 'loading_info'>('analyzing');
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [selectedObjectIndex, setSelectedObjectIndex] = useState<number | null>(null);
    const [selectedObjectInfo, setSelectedObjectInfo] = useState<DetailedScienceInfo | null>(null);
    const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
    const imageRef = useRef<Image>(null);
    const [cachedBase64, setCachedBase64] = useState<string | null>(null);
    // Get screen dimensions for responsive layout
    const screenWidth = Dimensions.get('window').width;
    const imageWidth = screenWidth * 0.8; // 80% of screen width

    // Function to fetch the detailed information for a specific object
    const fetchObjectDetails = async (objectName: string) => {
        try {
            setStatus('loading_info');
            
            // 1. Re-run image manipulation to get base64 for the new API call
            const manipulatedImage = await ImageManipulator.manipulateAsync(
                imageUri,
                [{ resize: { width: 800 } }], // Needs to be consistent with the first call
                { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG, base64: true } 
            );

            if (!manipulatedImage.base64) {
                
                throw new Error("Failed to get base64 for detail request.");
            }

            // 2. Call the serverless function with the object name
            const { data: detailsData, error: detailsError } = await supabase.functions.invoke('analyze-image', {
                body: {
                    image: manipulatedImage.base64,
                    contentType: 'image/jpeg',
                    selectedObjectName: objectName, 
                },
            });

            if (detailsError) throw detailsError;
            if (detailsData && detailsData.error) {
                throw new Error(`Supabase Function Error: ${detailsData.error}`);
            }

            // The server is expected to return only the science content block
            setSelectedObjectInfo(detailsData as DetailedScienceInfo); // Cast the detailed response
            setStatus('finished'); // Back to finished

        } catch (error) {
            console.error("Error fetching object details:", error);
            Alert.alert("Error", `Could not load details for ${objectName}.`);
            setSelectedObjectInfo(null);
            setStatus('finished');
        }
    };

    // This useEffect will run once to call our AI function
    useEffect(() => {
        const analyzeAndSaveImage = async () => {
            try {
                // Compress and resize the image first
                const manipulatedImage = await ImageManipulator.manipulateAsync(
                    imageUri,
                    [{ resize: { width: 800 } }], // Resize the image to a max width of 1080px
                    { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG, base64: true } // Compress and get base64
                );

                if (!manipulatedImage.base64) {
                    throw new Error("Failed to get base64 from image.");
                }

                // Call our Supabase function with the smaller, compressed image data
                const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-image', {
                    body: {
                        image: manipulatedImage.base64, // Use the base64 string from the compressed image
                        contentType: 'image/jpeg',
                        // detectMultipleObjects: true // Request multiple object detection
                    },
                });
                const objects = analysisData?.objects ?? analysisData?.data?.objects ?? [];

                if (analysisError) throw analysisError;
                if (analysisData && analysisData.error) {
                    console.error("Supabase Function Error:", analysisData.error);
                    throw new Error(`Supabase Function Error: ${analysisData.error}`);
                }
                // Validate if the response is JSON-structured properly (more flexible)
                if (!analysisData || !analysisData.objects) {
                    console.error("Invalid AI Response Structure:", analysisData);  //  Log for debugging
                    throw new Error("Invalid response structure from analyze-image function: Missing 'objects' or 'selectedObject'.");
                }

                // Build the result...
                const aiResult: AnalysisResult = {
                    message: analysisData.message || "Multiple objects detected. Tap one to learn more!",
                    objects: analysisData.objects || [],
                };
                setResult(aiResult);
                setStatus('finished');

                 // AUTO-SELECT THE FIRST OBJECT (for better UX)
                if (aiResult.objects.length > 0) {
                    const firstObject = aiResult.objects[0];
                    setSelectedObjectIndex(0);
                    // Immediately fetch details for the first object
                    fetchObjectDetails(firstObject.name);
                }

            } catch (error) {
                console.error("Error in analysis or saving process:", error);
                Alert.alert("Analysis Failed", "Could not get a result from the AI. Please try again.");
                navigation.goBack();
            }
        };
         analyzeAndSaveImage();
    }, [imageUri, navigation]);

      useEffect(() => {
        const saveDiscovery = async (base64: string, analysisData: any) => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session?.user) throw new Error("User not logged in.");

                const userId = session.user.id;
                const filePath = `${userId}/${new Date().getTime()}.jpeg`;
                let cleanBase64 = base64;
                if (base64.startsWith('data:image')) {
                    cleanBase64 = base64.split(',')[1];  //  Strip data URL prefix if present
                }

                // Decode the base64 string into a byte array
                const byteArray = toByteArray(base64);

                // Upload to Supabase Storage
                const { error: uploadError } = await supabase.storage
                    .from("discoveries")
                    .upload(filePath, byteArray, { contentType: "image/jpeg" });

                if (uploadError) throw uploadError;

                // Get the public URL
                const { data: { publicUrl } } = supabase.storage
                    .from("discoveries")
                    .getPublicUrl(filePath);

                // Pull out selectedObject from AI analysis
                const selected = selectedObjectInfo || {} as DetailedScienceInfo;
                const roundedConfidence = Math.round(selected.confidence || 0); // Use Math.round()
                const boundingBoxes = analysisData?.objects?.map((obj: any) => obj.boundingBox).filter(Boolean) || null;

                // Insert record into database
                const { error: insertError } = await supabase.from("discoveries").insert({
                    user_id: userId,
                    image_url: publicUrl,
                    name: selected.name || "Unknown Object",
                    confidence: roundedConfidence || 0,
                    quick_fact: selected.quick_fact || null,
                    the_science_in_action: selected.the_science_in_action || null,
                    why_it_matters_to_you: selected.why_it_matters_to_you || null,
                    explore_further: selected.explore_further || null,
                    message: analysisData?.message || null, 
                    objects: analysisData?.objects || null, // store all detected objects (jsonb)
                    bounding_boxes: boundingBoxes,
                });

                if (insertError) throw insertError;

                console.log("Discovery saved successfully!");
            } catch (error) {
                console.error("Error saving discovery:", error);
            }
        };
        if (result && selectedObjectInfo && cachedBase64) {
  saveDiscovery(cachedBase64, result);
            
             console.log("Details loaded, ready to display/save.");
        }
    },  [result, selectedObjectInfo, selectedObjectIndex]); 
   

    // Get image dimensions for proper bounding box scaling
    useEffect(() => {
        if (imageUri) {
            Image.getSize(imageUri, (width, height) => {
                // Calculate aspect ratio to maintain proportions
                const aspectRatio = width / height;
                const calculatedHeight = imageWidth / aspectRatio;
                setImageSize({ width: imageWidth, height: calculatedHeight });
            },
                (error) => {  // Add error callback
                    console.error("Failed to get image size:", error);
                    setImageSize({ width: imageWidth, height: imageWidth });  // Fallback to square
                }
            );
        }
    }, [imageUri, imageWidth]);

    const handleSelectObject = (index: number) => {
       if (!result || !result.objects || index === selectedObjectIndex) return;

        setSelectedObjectIndex(index);
        setSelectedObjectInfo(null); // Clear previous info
        
        const selectedObject = result.objects[index];
        if (selectedObject) {
            fetchObjectDetails(selectedObject.name);
        }
    };

    const handleLearnMore = () => {
         const info = selectedObjectInfo as DetailedScienceInfo; // Cast to ensure fields exist
         if (info && info.quick_fact && info.the_science_in_action) {
             navigation.navigate('LearningContent', {
                 imageUri,
                 name: info.name,
                 confidence: result!.objects[selectedObjectIndex!].confidence, // Use confidence from the list
                 quick_fact: info.quick_fact,
                 the_science_in_action: info.the_science_in_action,
                 why_it_matters_to_you: info.why_it_matters_to_you,
                 explore_further: info.explore_further
             });
        }
    };

    const handleScanAgain = () => {
        navigation.goBack();
    };

    // Scale bounding box coordinates to match displayed image size
    const scaleBoundingBox = (box: { x: number, y: number, width: number, height: number }) => {
        if (imageSize.width === 0 || imageSize.height === 0) return box;

        // Assuming original image is 800px wide (from the resize operation)
        const scaleX = imageSize.width / 800;
        const scaleY = imageSize.height / 800;

        return {
            x: box.x * scaleX,
            y: box.y * scaleY,
            width: box.width * scaleX,
            height: box.height * scaleY
        };
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.imageContainer}>
                <Image
                    ref={imageRef}
                    source={{ uri: imageUri }}
                    style={[styles.image, { width: imageSize.width, height: imageSize.height }]}
                />

                {/* Overlay SVG for bounding boxes */}
                {status === 'finished' && result && (
                    <Svg
                        style={StyleSheet.absoluteFill}
                        width={imageSize.width}
                        height={imageSize.height}
                    >
                        {result.objects.map((obj, index) => {
                            if (!obj.boundingBox) return null;

                            const box = scaleBoundingBox(obj.boundingBox);
                            const isSelected = selectedObjectIndex === index;

                            return (
                                <React.Fragment key={index}>
                                    <Rect
                                        x={box.x}
                                        y={box.y}
                                        width={box.width}
                                        height={box.height}
                                        strokeWidth={3}
                                        stroke={isSelected ? colors.accent : colors.primary}
                                        fill="transparent"
                                    />
                                    <SvgText
                                        x={box.x}
                                        y={box.y - 5}
                                        fill={isSelected ? colors.accent : colors.primary}
                                        fontSize="14"
                                        fontWeight="bold"
                                    >
                                        {obj.name} - {obj.confidence}%
                                    </SvgText>
                                </React.Fragment>
                            );
                        })}
                    </Svg>
                )}
            </View>

            {/* Conditionally render UI based on the status */}
            {status === 'analyzing' ? (
                <View style={styles.statusContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.statusText}>Analyzing...</Text>
                </View>
            ) : (
                <View style={styles.resultsContainer}>
                    {result?.message && (
                        <Text style={styles.analysisMessage}>
                            {result.message}
                        </Text>
                    )}

                    {/* List of detected objects */}
                    {result?.objects && result.objects.length > 0 ? (
                        <FlatList
                            data={result.objects}
                            keyExtractor={(_, index) => `object-${index}`}
                            horizontal={false}
                            style={styles.objectsList}
                            renderItem={({ item, index }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.objectItem,
                                        selectedObjectIndex === index && styles.selectedObjectItem
                                    ]}
                                    onPress={() => handleSelectObject(index)}
                                >
                                    <Text style={styles.objectName}>{item.name}</Text>
                                    <Text style={styles.objectConfidence}>{item.confidence}%</Text>
                                </TouchableOpacity>
                            )}
                        />
                    ) : (
                        <Text style={styles.analysisMessage}>No objects detected. Try a clearer photo!</Text>  // Fallback
                    )}

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.secondaryButton} onPress={handleScanAgain}>
                            <Text style={styles.secondaryButtonText}>Scan Again</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={handleLearnMore}
                            disabled={selectedObjectInfo === null}
                        >
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
        alignItems: 'center',
        paddingVertical: 20,
        gap: 15,
    },
    imageContainer: {
        position: 'relative',
        borderRadius: 30,
        overflow: 'hidden',
        borderWidth: 4,
        borderColor: colors.primary,
    },
    image: {
        borderRadius: 26, // Account for the border
    },
    statusContainer: {
        alignItems: 'center',
        gap: 15,
        marginTop: 20,
    },
    statusText: {
        fontFamily: fonts.heading,
        color: colors.text,
        fontSize: 32,
    },
    analysisMessage: {
        fontFamily: fonts.heading,
        color: colors.accent,
        fontSize: 18,
        textAlign: 'center',
        marginVertical: 10,
    },
    resultsContainer: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    multipleObjectsText: {
        fontFamily: fonts.heading,
        color: colors.accent,
        fontSize: 18,
        textAlign: 'center',
        marginVertical: 10,
    },
    objectsList: {
        width: '100%',
        maxHeight: 200,
        marginVertical: 10,
    },
    objectItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.primary,
        padding: 12,
        borderRadius: 15,
        marginVertical: 5,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedObjectItem: {
        borderColor: colors.accent,
    },
    objectName: {
        fontFamily: fonts.heading,
        color: colors.text,
        fontSize: 18,
    },
    objectConfidence: {
        fontFamily: fonts.body,
        color: colors.primary,
        fontSize: 16,
    },
    buttonContainer: {
        flexDirection: 'row',
        marginTop: 15,
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
