// In app/navigation/StackNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from './types';

import TabNavigator from './TabNavigator';
import ObjectRecognitionScreen from '../screens/ObjectRecognitionScreen';
import LearningContentScreen from '../screens/LearningContentScreen';

const Stack = createStackNavigator<RootStackParamList>();

export default function StackNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="MainTabs" component={TabNavigator} />
            <Stack.Screen name="ObjectRecognition" component={ObjectRecognitionScreen} />
            <Stack.Screen name="LearningContent" component={LearningContentScreen} />
        </Stack.Navigator>
    );
}