// In app/theme/theme.ts

import { Theme } from '@react-navigation/native';

export const colors = {
    background: '#0D0F18', // Deep Space
    primary: '#00BFFF',     // Quantum Blue
    secondary: '#8A2BE2',   // Galactic Purple
    text: '#F0F0F0',         // Starlight White
    success: '#39FF14',     // Signal Green
    warning: '#FF4500',      // Plasma Orange
    lightGray: '#a9a9a9',
    accent: '#FF00FF',      // Highlight Magenta
    cardBackground: '#1A1D2A', // Card Background
};

export const fonts = {
    heading: 'Orbitron_700Bold',
    body: 'System',
};

// FINAL CORRECTED VERSION
export const AppTheme: Theme = {
    dark: true,
    colors: {
        background: colors.background,
        card: colors.background,
        primary: colors.primary,
        text: colors.text,
        border: colors.primary,
        notification: colors.warning,
    },
    fonts: {
        regular: {
            fontFamily: fonts.body,
            fontWeight: 'normal',
        },
        medium: {
            fontFamily: fonts.body,
            fontWeight: '600',
        },
        bold: {
            fontFamily: fonts.heading,
            fontWeight: 'bold',
        },
        heavy: {
            fontFamily: fonts.heading,
            fontWeight: '800',
        },
    },
};