// In app/navigation/TabNavigator.tsx

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/theme';
import { RootTabParamList } from './types';

import CameraScreen from '../screens/CameraScreen';

const MuseumScreen = () => null;
const ProfileScreen = () => null;

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function TabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarStyle: {
                    backgroundColor: colors.background,
                    borderTopColor: colors.primary,
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.lightGray,
            }}
            // Set the initial route to be the Camera screen
            initialRouteName="Camera"
        >
            <Tab.Screen
                name="Museum"
                component={MuseumScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="library" color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="Camera"
                component={CameraScreen} // 3. THIS NOW USES THE REAL SCREEN
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="camera" color={color} size={size * 1.2} />
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person-circle" color={color} size={size} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}