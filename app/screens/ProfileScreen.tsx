// In app/screens/ProfileScreen.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { colors, fonts } from '../theme/theme';

type Badge = {
    id: string;
    name: string;
    icon_name: string;
};

export default function ProfileScreen() {
    // Use state to store the email once we fetch it
    const [userEmail, setUserEmail] = useState('');
    const [badges, setBadges] = useState<Badge[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            // Fetch session
            const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
            if (sessionError) Alert.alert('Error', 'Could not retrieve user session.');
            else if (sessionData.session) setUserEmail(sessionData.session.user.email || '');

            // Fetch earned badges
            const { data: badgeData, error: badgeError } = await supabase
                .from('user_badges')
                .select('badges ( id, name, icon_name )');

            if (badgeError) {
                Alert.alert('Error', 'Could not fetch badges.');
            } else if (badgeData) {
                // flatMap will map over each 'user_badge' item
                // and flattens the inner 'badges' array into a single, clean list.
                const formattedBadges = badgeData.flatMap(item => item.badges || []) as Badge[];
                setBadges(formattedBadges);
            }

        };

        fetchData();
    }, []);

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            Alert.alert('Error', 'Failed to sign out. Please try again.');
        }
        // The onAuthStateChange listener in App.tsx will automatically
        // navigate the user back to the LoginScreen.
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>My Profile</Text>

            <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>Email Address</Text>
                <Text style={styles.infoValue}>{userEmail || 'Loading...'}</Text>
            </View>

            <Text style={styles.sectionTitle}>My Badges</Text>
            <FlatList
                data={badges}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.badge}>
                        <Ionicons name={item.icon_name as any} size={40} color={colors.primary} />
                        <Text style={styles.badgeText}>{item.name}</Text>
                    </View>
                )}
                ListEmptyComponent={<Text style={styles.emptyText}>No badges earned yet.</Text>}
                contentContainerStyle={{ paddingVertical: 10 }}
            />

            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                <Text style={styles.signOutButtonText}>Sign Out</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontFamily: fonts.heading,
        color: colors.text,
        fontSize: 32,
        marginVertical: 20,
    },
    infoCard: {
        backgroundColor: '#1A1C2A',
        borderRadius: 15,
        padding: 20,
        width: '100%',
        marginBottom: 30,
        borderWidth: 1,
        borderColor: 'rgba(0, 191, 255, 0.2)',
    },
    infoLabel: {
        fontFamily: fonts.body,
        color: colors.lightGray,
        fontSize: 14,
    },
    infoValue: {
        fontFamily: fonts.body,
        color: colors.text,
        fontSize: 18,
        marginTop: 5,
    },
    sectionTitle: { fontFamily: fonts.heading, color: colors.text, fontSize: 22, alignSelf: 'flex-start', marginBottom: 10 },
    badge: { alignItems: 'center', marginRight: 20, width: 80 },
    badgeText: { color: colors.lightGray, fontSize: 12, textAlign: 'center', marginTop: 5 },
    emptyText: { color: colors.lightGray, fontStyle: 'italic' },
    signOutButton: {
        backgroundColor: colors.warning, // Use our Plasma Orange for a destructive action
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 30,
        marginTop: 'auto', // Pushes the button to the bottom
        marginBottom: 20,
    },
    signOutButtonText: {
        color: colors.text,
        fontSize: 16,
        fontFamily: fonts.heading,
    },
});