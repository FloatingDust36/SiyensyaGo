# SiyensyaGo 🇵🇭🔬

SiyensyaGo is a mobile-first learning app that makes science exploration fun and culturally relatable for Filipino students. It transforms everyday Filipino surroundings into interactive STEM lessons by allowing students to scan objects and receive AI-powered explanations aligned with the DepEd curriculum.

## ✨ About The Project

The vision for SiyensyaGo is to empower Filipino students by turning their natural curiosity into a fun and educational experience. By simply using their phone's camera, students can scan any everyday object and get instant, culturally relevant explanations of the science behind it. The content is tailored to their grade level and aligned with Philippine education standards, making it a powerful supplement to classroom learning.

This repository contains the source code for the Phase 1 MVP, which focuses on the core individual learning experience.

### Key Features (Phase 1)
* **AI-Powered Object Recognition:** Utilizes the Gemini API to identify objects from a user's photo.
* **DepEd-Aligned Content:** Generates explanations that are mapped to Philippine education standards and tailored to the user's selected grade level (Elementary, Junior High, Senior High).
* **Secure Backend:** Uses Supabase Edge Functions to securely handle API calls to the Gemini AI, protecting secret keys.
* **Client-Side Optimization:** Images are compressed and resized on the device before upload to ensure fast performance, even on slower 3G/4G connections.

---
## 🛠️ Tech Stack

This project is built with a modern, cross-platform tech stack:

* **Frontend:** React Native (Expo), TypeScript
* **Navigation:** React Navigation (Stack & Tab)
* **Backend & Database:** Supabase (Edge Functions, Auth, Postgres)

---
## 🚀 Getting Started

Follow these instructions to set up and run the project on your local machine for development and testing purposes.

### Prerequisites

* Node.js (LTS version recommended)
* npm or yarn
* [Expo Go](https://expo.dev/go) app on your iOS or Android device
* A Supabase account and a new project created
* A Google Gemini API key
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (must be running to test Supabase functions locally)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/SiyensyaGo.git
    cd SiyensyaGo
    ```

2.  **Install NPM packages:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a file named `.env` in the root of the project and add your Supabase credentials. **This file is git-ignored for security.**
    ```env
    # .env
    EXPO_PUBLIC_SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL"
    EXPO_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
    ```

4.  **Set up Supabase CLI:**
    This project uses the Supabase CLI, which should be installed locally via `npm install`. All commands should be run with `npx`.
    ```bash
    # Login to your Supabase account
    npx supabase login

    # Link this project to your Supabase project on the cloud
    npx supabase link --project-ref [YOUR-PROJECT-ID]

    # Set your Gemini API key as a secure secret
    npx supabase secrets set GEMINI_API_KEY=[YOUR_GEMINI_API_KEY]
    ```

5.  **Deploy the Edge Function:**
    The AI logic lives in a Supabase Edge Function. Deploy it to the cloud.
    ```bash
    npx supabase functions deploy analyze-image --no-verify-jwt
    ```

### Running the App

1.  **Start the Metro bundler:**
    ```bash
    npx expo start
    ```
2.  **Scan the QR code** with the Expo Go app on your mobile device to open the application.

---
## 🗺️ Project Roadmap

This repository currently contains the Phase 1 MVP. Future development will include:
* **Phase 2: Social & Advanced Features:** Add community elements like study groups and advanced gamification.
* **Phase 3: Teacher/Parent Tools & Analytics:** Build professional tools for educators and detailed progress tracking.