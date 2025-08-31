import { View, Text, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import Personal from './components/onboarding/Personal'
import Health from './components/onboarding/Health'
import Goals from './components/onboarding/Goals'
import Lifestyle from './components/onboarding/Lifestyle'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'
import { ProgressBar } from 'react-native-paper';
import * as Haptics from 'expo-haptics';
import AnimatedComponent, { SlideInRight, SlideOutLeft } from 'react-native-reanimated';

interface userInfo {
  name: string;
  age: number;
  height: number;
  weight: number;
  BMI: number;
  gender: 'Male' | 'Female';
  location: string;
  health_conditions: string[];
  allergies: string[];
  health_goals: string[];
  dietary_preferences: string[];
  medication_details: string[];
  budget_for_food: number;
  occupation_type: string[];
  work_schedule: string;
  access_to_kitchen: string;
  stress_level: string;
  meal_source: string[];
}

const OnboardingPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [data, setData] = useState<userInfo>({
    name: '',
    age: 25,
    height: 170,
    weight: 70,
    BMI: 24.2,
    gender: 'Male',
    location: '',
    health_conditions: [],
    allergies: [],
    health_goals: [],
    dietary_preferences: [],
    medication_details: [],
    budget_for_food: 1000,
    occupation_type: [],
    work_schedule: '',
    access_to_kitchen: '',
    stress_level: 'moderate',
    meal_source: []
  });

  const router = useRouter();

  const handleBack = () => {
    if (currentStep > 0 && !animating) {
      setAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setAnimating(false);
      }, 150);
    }
  };

  const handleNext = async () => {
    if (currentStep < 3 && !animating) {
      setAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setAnimating(false);
      }, 150);
    } else if (currentStep === 3) {
      // Finish onboarding
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      console.log('userInfo:', data);
      
      try {
        // Save to localStorage first (most important)
        await AsyncStorage.setItem('userInfo', JSON.stringify(data));
        console.log('User data saved to AsyncStorage');
        
        // Send data to backend (optional, can fail)
        try {

          const response = await fetch('http://10.20.2.95:5000/nudging/store_user_info', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userInfo: data }),
          });
          const result = await response.json();
          console.log('Storage result:', result);
        } catch (backendError) {
          console.warn('Backend storage failed, but proceeding anyway:', backendError);
        }
        
        // Add a delay to ensure AsyncStorage operation is complete
        setTimeout(async () => {
          console.log('Attempting to navigate to HomePage...');
          // Verify the data was saved
          const savedData = await AsyncStorage.getItem('userInfo');
          console.log('Verified saved data:', savedData ? 'Data exists' : 'No data found');
          
          // Try direct navigation to HomePage
          router.replace('/HomePage');
        }, 500);
        
      } catch (error) {
        console.error('Error during onboarding completion:', error);
        // Even if there's an error, try to navigate anyway
        setTimeout(() => {
          console.log('Error occurred, but attempting navigation to HomePage anyway...');
          router.replace('/HomePage');
        }, 500);
      }
    }
  };

  const renderComponent = (step: number) => {
    switch (step) {
      case 0:
        return <Personal data={data} onChange={(d) => setData({ ...data, ...d })} onNext={() => setCurrentStep(step + 1)} />;
      case 1:
        return <Health data={data} onChange={(d) => setData({ ...data, ...d })} />;
      case 2:
        return <Goals data={data} onChange={(d) => setData({ ...data, ...d })} />;
      case 3:
        return <Lifestyle data={data} onChange={(d) => setData({ ...data, ...d })} />;
      default:
        return null;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F6F7F9' }}>
      <View style={{ flex: 1, backgroundColor: '#F6F7F9' }}>
        {/* Progress Bar */}
        <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
          <ProgressBar progress={(currentStep + 1) / 4} color="#FF6B00" style={{ height: 8, borderRadius: 4 }} />
          <Text style={{ textAlign: 'center', marginTop: 10, color: '#6B7280' }}>
            Step {currentStep + 1} of 4
          </Text>
        </View>

        {/* Skip Button */}
        <View style={{ alignItems: 'flex-end', paddingHorizontal: 20, paddingBottom: 10 }}>
          <TouchableOpacity onPress={() => router.replace('/HomePage')}>
            <Text style={{ color: '#FF6B00', fontSize: 16 }}>Skip</Text>
          </TouchableOpacity>
        </View>
      <AnimatedComponent.View
        key={currentStep}
        entering={SlideInRight.duration(300)}
        exiting={SlideOutLeft.duration(300)}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          justifyContent: 'center'
        }}
      >
        {renderComponent(currentStep)}
      </AnimatedComponent.View>

      <View style={{ position: 'absolute', bottom: 40, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between' }}>
        {currentStep > 0 && (
          <TouchableOpacity
            onPress={handleBack}
            style={{
              backgroundColor: '#FFFFFF',
              padding: 15,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: '#E5E7EB',
              flex: 1,
              marginRight: 10,
              alignItems: 'center'
            }}
          >
            <Text style={{ color: '#1F2933', fontSize: 18, fontWeight: '600' }}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={handleNext}
          style={{
            backgroundColor: '#FF6B00',
            padding: 15,
            borderRadius: 16,
            flex: currentStep > 0 ? 1 : 1,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.12,
            shadowRadius: 24,
            elevation: 8
          }}
        >
          <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>
            {currentStep < 3 ? 'Next' : 'Finish'}
          </Text>
        </TouchableOpacity>
      </View>
        </View>
    </View>
  )
}

export default OnboardingPage