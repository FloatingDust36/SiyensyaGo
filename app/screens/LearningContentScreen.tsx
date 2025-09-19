// In app/screens/LearningContentScreen.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts } from '../theme/theme';

export default function LearningContentScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Learning Content</Text>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontFamily: fonts.heading,
        color: colors.text,
        fontSize: 32,
    },
});