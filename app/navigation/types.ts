import { NavigatorScreenParams } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { StackScreenProps } from '@react-navigation/stack';

// --- Core API Data Types ---

// Type for a detected object (returned during the first API call)
export type DetectedObject = {
  name: string;
  confidence: number;
  boundingBox: { // Bounding box is required by the API schema
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

// Type for the detailed scientific explanation (returned during the second API call)
export type DetailedScienceInfo = {
  name: string; // The name of the object (used for continuity)
  quick_fact: string;
  confidence: number; // Confidence score from detection
  the_science_in_action: string;
  why_it_matters_to_you: string;
  explore_further: string;
};

// Type for the initial detection result (returned by the serverless function in detection mode)

export type AnalysisResult = {
  message: string; // The message from SiyensyaGo
  objects: DetectedObject[];
};

// --- React Navigation Type Definitions ---

// Defines the screens available in the bottom tab navigator
export type RootTabParamList = {
  Museum: undefined; // User's past discoveries
  Camera: undefined; // Main scanning screen
  Profile: undefined; // User profile/settings
};

// Defines all screens available in the app's root stack navigator
export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<RootTabParamList>;
  ObjectRecognition: { imageUri: string };
  // LearningContent receives ALL necessary science details as parameters
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

// --- Helper types for our screens ---

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  StackScreenProps<RootStackParamList, T>;

export type RootTabScreenProps<T extends keyof RootTabParamList> =
  BottomTabScreenProps<RootTabParamList, T>;