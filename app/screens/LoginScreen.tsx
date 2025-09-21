// In app/screens/LoginScreen.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { colors, fonts } from '../theme/theme';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    async function signInWithEmail() {
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) Alert.alert('Error', error.message);
        setLoading(false);
    }

    async function signUpWithEmail() {
        setLoading(true);
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) Alert.alert('Error', error.message);
        else Alert.alert('Success', 'Please check your email for a verification link!');
        setLoading(false);
    }

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.header}>SiyensyaGo</Text>
            <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={colors.lightGray}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={colors.lightGray}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <TouchableOpacity style={styles.button} onPress={signInWithEmail} disabled={loading}>
                <Text style={styles.buttonText}>{loading ? 'Loading...' : 'Sign In'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.outlineButton} onPress={signUpWithEmail} disabled={loading}>
                <Text style={styles.outlineButtonText}>Sign Up</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: colors.background },
    header: { fontFamily: fonts.heading, color: colors.text, fontSize: 40, textAlign: 'center', marginBottom: 30 },
    input: {
        backgroundColor: '#1A1C2A',
        color: colors.text,
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        fontSize: 16,
    },
    button: { backgroundColor: colors.primary, padding: 15, borderRadius: 10, alignItems: 'center' },
    buttonText: { color: colors.background, fontSize: 18, fontFamily: fonts.heading },
    outlineButton: { borderColor: colors.primary, borderWidth: 2, padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
    outlineButtonText: { color: colors.primary, fontSize: 18, fontFamily: fonts.heading },
});