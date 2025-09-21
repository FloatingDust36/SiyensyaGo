// In app/screens/MuseumScreen.tsx

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { supabase } from '../lib/supabase';
import { colors, fonts } from '../theme/theme';
import { RootStackParamList } from '../navigation/types';

type MuseumNavigationProp = StackNavigationProp<RootStackParamList>;

type Discovery = {
    id: string;
    created_at: string;
    user_id: string;
    image_url: string;
    name: string;
    confidence: number;
    quick_fact: string;
    the_science_in_action: string;
    why_it_matters_to_you: string;
    explore_further: string;
};

const screenWidth = Dimensions.get('window').width;
const cardWidth = (screenWidth - 60) / 2;

export default function MuseumScreen() {
    const [loading, setLoading] = useState(true);
    const [discoveries, setDiscoveries] = useState<any[]>([]);
    const navigation = useNavigation<MuseumNavigationProp>();

    // This hook re-fetches data every time the screen comes into focus
    useFocusEffect(
        useCallback(() => {
            const fetchDiscoveries = async () => {
                try {
                    setLoading(true);
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session?.user) throw new Error("No user session");

                    const { data, error } = await supabase
                        .from('discoveries')
                        .select('*')
                        .eq('user_id', session.user.id)
                        .order('created_at', { ascending: false });

                    if (error) throw error;

                    setDiscoveries(data || []);
                } catch (error) {
                    Alert.alert("Error", "Could not fetch your discoveries.");
                } finally {
                    setLoading(false);
                }
            };

            fetchDiscoveries();
        }, [])
    );

    // Function to handle tapping on a discovery card
    const handleSelectDiscovery = (discovery: Discovery) => {
        // Navigate to the LearningContentScreen, passing all the discovery's data
        navigation.navigate('LearningContent', {
            ...discovery,
            imageUri: discovery.image_url // Pass image_url as imageUri
        });
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color={colors.primary} />
            </SafeAreaView>
        );
    }

    if (discoveries.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.title}>My STEM Museum</Text>
                <Text style={styles.emptyText}>Your museum is empty.</Text>
                <Text style={styles.emptySubText}>Tap the camera to start discovering!</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>My STEM Museum</Text>
            <FlatList
                data={discoveries}
                keyExtractor={(item) => item.id}
                numColumns={2} // This creates our grid layout!
                contentContainerStyle={styles.gridContainer}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => handleSelectDiscovery(item)}
                    >
                        <Image source={{ uri: item.image_url }} style={styles.cardImage} />
                        <View style={styles.cardOverlay}>
                            <Text style={styles.cardText}>{item.name}</Text>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    title: {
        fontFamily: fonts.heading,
        color: colors.text,
        fontSize: 32,
        marginVertical: 20,
        textAlign: 'center',
    },
    emptyText: {
        fontFamily: fonts.body,
        color: colors.text,
        fontSize: 18,
    },
    emptySubText: {
        fontFamily: fonts.body,
        color: colors.lightGray,
        fontSize: 14,
        marginTop: 10,
    },
    list: {
        width: '100%', // Add this to ensure the list takes full width
    },
    gridContainer: {
        paddingHorizontal: 10,
    },
    card: {
        //flex: 1,
        width: cardWidth,
        margin: 10,
        borderRadius: 15,
        overflow: 'hidden', // Clips the image to the card's border radius
        aspectRatio: 1, // Makes the card a perfect square
        backgroundColor: '#1A1C2A',
    },
    cardImage: {
        width: '100%',
        height: '100%',
    },
    cardOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        padding: 10,
    },
    cardText: {
        color: colors.text,
        fontFamily: fonts.body,
        fontSize: 14,
        textAlign: 'center',
    },
});