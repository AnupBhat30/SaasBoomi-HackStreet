# Heritage Nutrition AI Backend

This is the FastAPI backend for the Heritage Nutrition AI Platform, providing AI-powered nutrition planning and family health management.

## Features

- **Family Profile Management**: Create and manage family health profiles
- **AI-Powered Meal Planning**: Generate personalized nutrition plans based on family health conditions
- **Meal Logging**: Track meals and nutritional intake
- **Deviation Tracking**: Log deviations from plans with adaptive nudging
- **Health Insights**: Get AI-generated health insights and recommendations

## Setup

1. **Install Dependencies**

   ```bash
   pip install -r requirements.txt
   ```

2. **Environment Variables**

   Create a `.env` file with your API keys:

   ```bash
   GOOGLE_API_KEY=your_google_ai_api_key
   ```

3. **Run the Server**

   ```bash
   python main.py
   ```

   The server will start at `http://localhost:8000`

## API Endpoints

### Family Management

- `POST /api/family/profile` - Create/update family profile
- `GET /api/family/profile/{profile_id}` - Get family profile

### Nutrition Planning

- `POST /api/nutrition/daily-plan` - Generate daily nutrition plan
- `POST /api/nutrition/generate-plan` - Generate new optimized plan
- `GET /api/nutrition/insights` - Get nutrition insights

### Tracking

- `POST /api/meal/log` - Log a meal
- `GET /api/meal/logs` - Get meal logs
- `POST /api/deviation/log` - Log a deviation
- `GET /api/deviation/logs` - Get deviation logs

## Data Models

The API uses Pydantic models for type safety and validation. Key models include:

- `FamilyMember`: Individual family member with health conditions
- `MealPlan`: Complete daily meal plan with modifications
- `MealLog`: Meal tracking entry
- `DeviationLog`: Plan deviation tracking

## Integration with Frontend

The backend is designed to work with the React Native frontend app. Make sure to update the `API_BASE_URL` in the frontend code to match your backend server address.

## Development

The backend integrates with the existing `family.py` module which contains the AI logic for nutrition planning and health analysis.
