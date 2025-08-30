# SaasBoomi-HackStreet

## 🚀 Family Nutrition AI App Setup

### Quick Start

1. **Start the Backend:**
   ```bash
   cd backend
   python main.py
   ```

2. **Find Your Computer's IP Address:**
   - **Mac:** Open Terminal and run `ipconfig getifaddr en0`
   - **Windows:** Open Command Prompt and run `ipconfig`
   - **Linux:** Open Terminal and run `hostname -I`

3. **Update the API URL in the App:**
   - Open `frontend/recipeApp/app/(tabs)/daily-plan.tsx`
   - Change the `API_BASE_URL` to your computer's IP:
   ```typescript
   const API_BASE_URL = 'http://YOUR_IP_ADDRESS:8000';
   ```

4. **Start the Frontend:**
   ```bash
   cd frontend/recipeApp
   npm start
   ```

5. **Test the Connection:**
   - Open the app on your phone
   - Go to the "Family Plan" tab
   - Tap "Test Connection" button
   - You should see a success message

### 📱 App Features

- **Family Plan Tab:** Main nutrition planning interface (now the default tab!)
- **Real-time Backend Connection:** Fetches personalized meal plans
- **Family Management:** Add and manage family members
- **AI-Powered Suggestions:** Get adaptive nutrition recommendations
- **Offline Mode:** Works with sample data when backend is unavailable

### 🔧 Troubleshooting

**Backend Connection Issues:**
1. Make sure backend is running on port 8000
2. Check that your phone and computer are on the same WiFi network
3. Verify the IP address in the app matches your computer's IP
4. Try disabling firewall temporarily

**App Not Loading:**
1. Clear Expo cache: `expo r -c`
2. Restart Metro bundler
3. Check console for error messages

**Family Data Not Showing:**
1. Test backend connection using the "Test Connection" button
2. Check browser console for API errors
3. Verify backend is returning proper JSON data

### 📊 API Endpoints

- `GET /` - Health check
- `POST /api/family/profile` - Create family profile
- `GET /api/nutrition/daily-plan` - Get daily meal plan
- `POST /api/deviation/log` - Log meal deviations
- `GET /api/nutrition/insights` - Get nutrition insights

### 🎯 Main Features

1. **Family-Centric Planning:** Personalized meal plans for entire families
2. **AI Adaptations:** Smart modifications based on health conditions
3. **Real-time Tracking:** Log meals and get instant feedback
4. **Cultural Relevance:** Indian cuisine focus with traditional recipes
5. **Health Integration:** Diabetes, hypertension, and other condition support