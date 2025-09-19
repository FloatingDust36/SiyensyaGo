// In app/screens/CameraScreen.tsx

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Button, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, Camera, PermissionStatus, PermissionResponse } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack'; // Import this
import { RootStackParamList } from '../navigation/types';
import { colors, fonts } from '../theme/theme';

// Define the type for our navigation prop
type CameraScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MainTabs'>;

export default function CameraScreen() {
    const [permission, setPermission] = useState<PermissionResponse | null>(null);
    const cameraRef = useRef<CameraView>(null); // Create a ref for the camera
    // Tell useNavigation what our stack looks like
    const navigation = useNavigation<CameraScreenNavigationProp>();

    useEffect(() => {
        (async () => {
            const { status } = await Camera.getCameraPermissionsAsync();
            setPermission({ status } as PermissionResponse);
        })();
    }, []);

    const requestPermission = async () => {
        const response = await Camera.requestCameraPermissionsAsync();
        setPermission(response);
    };

    const handleScan = async () => {
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePictureAsync();
                console.log('Photo taken:', photo.uri);
                // Navigate to the next screen, passing the photo's URI as a parameter
                navigation.navigate('ObjectRecognition', { imageUri: photo.uri });
            } catch (error) {
                console.error("Failed to take picture:", error);
            }
        }
    };

    if (!permission) {
        return <View />;
    }

    if (permission.status !== PermissionStatus.GRANTED) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.permissionContainer}>
                    <Text style={styles.promptText}>We need your permission to use the camera</Text>
                    <Button onPress={requestPermission} title="Grant Permission" color={colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.topContainer}>
                <Text style={styles.promptText}>What do you want to discover today?</Text>
            </View>

            <View style={styles.middleContainer}>
                <CameraView style={styles.camera} ref={cameraRef} />
                <View style={styles.cameraOverlay}>
                    <Text style={styles.targetingBrackets}>[    ]</Text>
                </View>
            </View>

            <View style={styles.bottomContainer}>
                <TouchableOpacity style={styles.scanButton} onPress={handleScan}>
                    <Ionicons name="scan-outline" color={colors.background} size={40} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 20,
    },
    topContainer: {
        flex: 0.2,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    middleContainer: {
        flex: 0.6,
        borderRadius: 30,
        overflow: 'hidden',
    },
    bottomContainer: {
        flex: 0.2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    camera: {
        ...StyleSheet.absoluteFillObject,
    },
    cameraOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 30,
        borderWidth: 4,
        borderColor: colors.primary,
    },
    targetingBrackets: {
        color: colors.primary,
        fontSize: 80,
        fontWeight: '100',
        opacity: 0.5,
    },
    promptText: {
        color: colors.text,
        fontSize: 22,
        textAlign: 'center',
        fontFamily: fonts.heading,
    },
    scanButton: {
        width: 80,
        height: 80,
        borderRadius: 40, // Makes it a perfect circle
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        // Add a subtle shadow for depth
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 15,
        elevation: 10,
    },
});