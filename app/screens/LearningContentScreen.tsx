// In app/screens/LearningContentScreen.tsx

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/types';
import { colors, fonts } from '../theme/theme';

// Define the type for this screen's route prop
type LearningContentScreenRouteProp = RouteProp<RootStackParamList, 'LearningContent'>;
type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function LearningContentScreen() {
    // Use the hook to get route information
    const route = useRoute<LearningContentScreenRouteProp>();
    const navigation = useNavigation<NavigationProp>();
    const insets = useSafeAreaInsets();
    // Extract all the data from the route's parameters
    const { imageUri, name, confidence, quick_fact, the_science_in_action, why_it_matters_to_you, explore_further } = route.params;

    return (
        // Use edges prop to control safe area behavior, we handle bottom manually
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            {/* Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={28} color={colors.primary} />
            </TouchableOpacity>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Image source={{ uri: imageUri }} style={styles.image} />

                <Text style={styles.title}>{name}</Text>
                <Text style={styles.confidenceText}>{confidence}% Confidence</Text>

                {/* Quick Fact Card */}
                <View style={[styles.card, styles.factCard]}>
                    <Text style={styles.sectionTitle}>💡 Quick Fact</Text>
                    <Text style={styles.bodyText}>{quick_fact}</Text>
                </View>

                {/* The Science in Action Card */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>🔬 The Science in Action</Text>
                    <Text style={styles.bodyText}>{the_science_in_action}</Text>
                </View>

                {/* Why It Matters Card */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>🇵🇭 Why It Matters to You</Text>
                    <Text style={styles.bodyText}>{why_it_matters_to_you}</Text>
                </View>

                {/* Explore Further Card */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>🤔 Explore Further</Text>
                    <Text style={styles.bodyText}>{explore_further}</Text>
                </View>
            </ScrollView>

            {/* Action Button to Scan Again */}
            <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 10 }]}>
                <TouchableOpacity
                    style={styles.scanButton}
                    onPress={() => navigation.navigate('MainTabs', { screen: 'Camera' })}
                >
                    <Text style={styles.scanButtonText}>Scan Another Object</Text>
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
    backButton: {
        position: 'absolute',
        top: 54,
        left: 20,
        zIndex: 1,
        width: 44,
        height: 44,
        borderRadius: 22, // Half of width/height makes it a perfect circle
        backgroundColor: 'rgba(0, 191, 255, 0.1)', // A faint, 10% opaque Quantum Blue
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContainer: {
        padding: 20,
        paddingTop: 55, // Make space for back button
        paddingBottom: 120, // Make space for bottom bar
    },
    image: {
        width: '100%',
        height: 250,
        borderRadius: 20,
        marginBottom: 20,
    },
    title: {
        fontFamily: fonts.heading,
        color: colors.text,
        fontSize: 36,
        textAlign: 'center',
    },
    confidenceText: {
        fontFamily: fonts.body,
        color: colors.primary,
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 30,
    },
    card: {
        backgroundColor: '#1A1C2A', // Slightly lighter than background
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(0, 191, 255, 0.2)', // Faint blue border
    },
    factCard: {
        borderColor: colors.secondary, // Galactic Purple border for emphasis
        backgroundColor: '#2A1A3A'
    },
    sectionTitle: {
        fontFamily: fonts.heading,
        color: colors.text,
        fontSize: 22,
        marginBottom: 10,
    },
    bodyText: {
        fontFamily: fonts.body,
        color: colors.lightGray,
        fontSize: 16,
        lineHeight: 24,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20, // Use horizontal padding
        paddingTop: 10, // Add some top padding
        backgroundColor: colors.background,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 191, 255, 0.2)', // Fainter top border
    },
    scanButton: {
        backgroundColor: colors.primary,
        padding: 15,
        borderRadius: 30,
        alignItems: 'center',
    },
    scanButtonText: {
        color: colors.background,
        fontSize: 18,
        fontFamily: fonts.heading,
    },
});