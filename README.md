
# Heritage Nutrition AI Platform - Aahara

Welcome to the Heritage Nutrition AI Platform, an intelligent system designed to bridge the gap between India’s rich culinary heritage and the rising challenges of modern lifestyle diseases. This platform leverages a suite of AI agents to deliver personalized, culturally-aligned, and practical nutrition guidance, empowering Indian families to eat healthier without sacrificing tradition, flavor, or feasibility.

At its core, the application uses a **Contextual Nudging Agent** to provide timely dietary advice and a **Family Network Agent** to create coordinated meal plans that cater to the unique health needs of every family member.

---

## Key Features

-   **🧠 AI-Powered Family Meal Planning:** Generates a single, coordinated meal plan from one recipe idea, with personalized modifications and portion sizes for each family member based on their health profiles (e.g., diabetes, hypertension, weight goals).
-   **✨ Contextual & Adaptive Nudges:** Receive timely, empathetic, and actionable nutritional advice based on your meal logs, health goals, and even environmental factors like ingredient availability and season.
-   **🥗 Smart Pantry & Recipe Generation:** Keep track of your kitchen inventory and receive AI-powered recipe recommendations that utilize the ingredients you already have.
-   **📝 Comprehensive Meal Logging:** An intuitive interface to log your daily meals, providing a clear picture of your nutritional intake and helping the AI deliver more accurate insights.
-   **📊 Data-Driven Health Insights:** Visualize your family's health patterns, track progress towards goals, and receive summaries that highlight successes and areas for improvement.
-   **🇮🇳 Rich Cultural Alignment:** Deeply integrated with Indian culinary traditions, offering heritage alternatives and modern twists on classic dishes.

---

## Tech Stack & Architecture

The platform is built on a modern, robust stack designed for scalability and a seamless user experience across mobile devices.

#### Backend
-   **Framework:** FastAPI
-   **Language:** Python
-   **AI Integration:** Google Generative AI (Gemini)
-   **Data Validation:** Pydantic
-   **Database:** MongoDB Atlas (for food data), with local JSON files for user context and logs.
-   **Key Libraries:** `uvicorn`, `pymongo`, `python-dotenv`, `PyMuPDF`

#### Frontend
-   **Framework:** React Native with Expo
-   **Routing:** Expo Router (File-based)
-   **Language:** TypeScript
-   **UI Library:** React Native Paper
-   **Animations:** Moti, React Native Reanimated
-   **State Management:** React Context & `AsyncStorage`

#### AI & Data
-   **AI Model:** Google Gemini Series
-   **Vector Search:** MongoDB Atlas Vector Search (for food search)
-   **Context Data:**
    -   `food_data.json`: Scraped and processed nutritional/recipe data.
    -   `digi_data.json`: Curated dietary guidelines for the Indian context.
    -   `user_data.json`, `meal_log.json`, `environment_context.json`: User-specific data that provides real-time context to the AI agents.

---

## 🚀 Getting Started

Follow these instructions to get the backend server and the mobile application running on your local machine.

### Prerequisites

-   **Node.js** (LTS version) and **npm**
-   **Python** 3.8+ and **pip**
-   **Expo Go** app on your mobile device or an Android/iOS emulator.
-   A **Google Generative AI API Key**.

### 1. Backend Setup

The backend is a FastAPI server that powers the AI logic and data management.

```bash
# 1. Navigate to the backend directory
cd backend/

# 2. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows, use `venv\Scripts\activate`

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Create an environment file
touch .env

# 5. Add your Google AI API Key to the .env file
echo "GEMINI_API_KEY=YOUR_GOOGLE_AI_API_KEY" > .env
echo "MONGO_URI=YOUR_MONGO_DB_ATLAS_URI" >> .env # Optional: for food database

# 6. Run the server
uvicorn main:app --host 0.0.0.0 --port 8000
```

> **Note:** The server will now be running on `http://0.0.0.0:8000`. Keep this terminal window open.

### 2. Frontend Setup

The frontend is a React Native application built with Expo.

```bash
# 1. Navigate to the frontend directory
cd frontend/recipeApp/

# 2. Install Node.js dependencies
npm install

# 3. Find your computer's local IP address
# Mac: ipconfig getifaddr en0
# Windows: ipconfig (Look for your IPv4 Address)
# Linux: hostname -I

# 4. Update the API URL in the app code
# Open the files below and replace 'http://10.20.2.95:5000'
# with 'http://YOUR_LOCAL_IP:8000'
# - frontend/recipeApp/app/Family.tsx
# - frontend/recipeApp/app/LogMeal.tsx
# - frontend/recipeApp/app/Insights.tsx
# - frontend/recipeApp/app/Recipes.tsx
# - frontend/recipeApp/app/ProfilePage.tsx


# 5. Start the development server
npx expo start
```

Scan the QR code with the Expo Go app on your phone, or run the app in a simulator. Ensure your phone and computer are on the same Wi-Fi network.

---

## 📁 Folder Structure

The project is organized into a `backend` for the server-side logic and a `frontend` for the mobile application.

```plaintext
AnupBhat30-SaasBoomi-HackStreet-9da8dd2/
├── backend/
│   ├── main.py             # FastAPI app entry point
│   ├── family_api.py       # API routes for family features
│   ├── nudging.py          # API routes and logic for AI insights
│   ├── logmeal.py          # API routes for meal logging & food search
│   ├── family.py           # Core logic for the Family Network Agent
│   ├── food_data.json      # Curated nutritional data for AI context
│   └── digi_data.json      # Indian dietary guidelines for AI context
│
└── frontend/
    └── recipeApp/
        ├── app/
        │   ├── index.tsx         # App entry screen (Landing/Onboarding)
        │   ├── HomePage.tsx      # Main dashboard screen
        │   ├── Family.tsx        # Family meal coordination screen
        │   ├── LogMeal.tsx       # Meal logging interface
        │   ├── Insights.tsx      # Displays AI-generated nudges
        │   ├── Pantry.tsx        # User's pantry management
        │   ├── Recipes.tsx       # Recipe search and generation
        │   └── components/
        │       ├── family/       # Components for family features
        │       ├── insights/     # Components for displaying insights
        │       └── onboarding/   # Multi-step onboarding UI
        │
        ├── assets/               # Static assets like images and fonts
        └── package.json          # Frontend dependencies
```

---

## 💡 Usage Examples

### Coordinated Family Meal Planning

1.  Navigate to the **Family** tab.
2.  Enter a meal idea you want to cook (e.g., "Palak Paneer").
3.  The AI analyzes the health profiles of all family members.
4.  It returns a **Coordinated Meal Plan** with:
    -   A base recipe that everyone can eat.
    -   Specific modifications for individuals (e.g., "Use low-fat paneer for Rajesh," "Add extra vegetables for Priya").
    -   Tailored portion sizes to meet different calorie and nutrient goals.

### Daily Meal Logging and Insights

1.  Navigate to the **Log Meal** tab.
2.  Use the smart search (powered by MongoDB Atlas) to find and add food items to your breakfast, lunch, dinner, or snacks.
3.  Once logged, tap **"Get Your Nutrition Plan"**.
4.  The backend saves your meal log and triggers the **Contextual Nudging Agent**.
5.  Navigate to the **Insights** tab to view your personalized feedback, including simple swaps, heritage alternatives, and modern health tips based on what you ate.

---
### ⚠️ Known Limitations & Risks
As this is a hackathon project, there are several limitations to be aware of:
Medical Disclaimer: The AI-generated advice is for informational purposes only and is not a substitute for professional medical or dietetic consultation. Users should consult a healthcare provider before making significant dietary changes.
Nutritional Accuracy: While based on public data, nutritional values are estimates. Actual values can vary based on ingredients, preparation methods, and portion sizes.
Data Bias: The food_data.json is derived from public forums and may not be fully representative of all regional Indian cuisines or dietary patterns.
AI Hallucinations: Although we use structured prompting and data validation, the LLM may occasionally generate incorrect or nonsensical information.
Scalability: The current proof-of-concept uses local JSON files for storing user profiles and meal logs. A production version would require a robust, scalable database solution.


## 🤝 Contribution Guidelines

We welcome contributions to enhance the Heritage Nutrition AI Platform. To contribute, please follow these steps:

1.  **Fork the repository.**
2.  Create a new branch for your feature or bug fix: `git checkout -b feature/your-feature-name`.
3.  Make your changes and commit them with clear, descriptive messages.
4.  Push your branch to your fork: `git push origin feature/your-feature-name`.
5.  Open a pull request to the main repository, detailing the changes you've made.

Please ensure your code adheres to the existing style and that you run linters before submitting.

## Team Hackstreet
# Anup Bhat - https://anupbhat.me/
# Hamdan Shaik - https://hamdans-portfolio.vercel.app/

## 📄 License

This project was created for the SaasBoomi HackStreet hackathon and is distributed under the MIT License. See `LICENSE` for more information.
```
