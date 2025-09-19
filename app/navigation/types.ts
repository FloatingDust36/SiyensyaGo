// In app/navigation/types.ts
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { StackScreenProps } from '@react-navigation/stack';

// Defines the screens available in the bottom tab navigator
export type RootTabParamList = {
    Museum: undefined; // undefined means no params
    Camera: undefined;
    Profile: undefined;
};

// Defines all screens available in the app's root stack navigator
export type RootStackParamList = {
    MainTabs: undefined; // This will be our TabNavigator
    ObjectRecognition: { imageUri: string }; // This screen expects an imageUri parameter
    LearningContent: { imageUri: string; name: string; confidence: number };
};

// Helper types for our screens
export type RootStackScreenProps<T extends keyof RootStackParamList> =
    StackScreenProps<RootStackParamList, T>;

export type RootTabScreenProps<T extends keyof RootTabParamList> =
    BottomTabScreenProps<RootTabParamList, T>;