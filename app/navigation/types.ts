// In app/navigation/types.ts
import { NavigatorScreenParams } from '@react-navigation/native';
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
    MainTabs: NavigatorScreenParams<RootTabParamList>; // This will be our TabNavigator
    ObjectRecognition: { imageUri: string }; // This screen expects an imageUri parameter
    LearningContent: { 
    imageUri: string; 
    name: string; 
    confidence: number;
    quick_fact: string;
    the_science_in_action: string;
    why_it_matters_to_you: string;
    explore_further: string;
  };
};

// Helper types for our screens
export type RootStackScreenProps<T extends keyof RootStackParamList> =
    StackScreenProps<RootStackParamList, T>;

export type RootTabScreenProps<T extends keyof RootTabParamList> =
    BottomTabScreenProps<RootTabParamList, T>;