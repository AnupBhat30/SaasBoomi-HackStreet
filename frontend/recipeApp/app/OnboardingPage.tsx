import { View, Text, TouchableOpacity, Animated, Dimensions, SafeAreaView } from 'react-native'
import React, { useState, useRef } from 'react'
import Personal from './components/onboarding/Personal'
import Health from './components/onboarding/Health'
import Goals from './components/onboarding/Goals'
import Lifestyle from './components/onboarding/Lifestyle'

interface OnboardingData {
  personal: {
    age: number;
    height: number;
    weight: number;
    gender: 'Male' | 'Female' | 'Other';
  };
  health: {
    conditions: string[];
    allergies: string[];
    medication: string;
  };
  goals: {
    goals: string[];
    budget: number;
    preferences: string[];
  };
  lifestyle: {
    occupation: string;
    workSchedule: string;
    kitchenAccess: string;
    stressLevel: number;
    mealSource: string;
  };
}

const OnboardingPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    personal: { age: 25, height: 170, weight: 70, gender: 'Male' },
    health: { conditions: [], allergies: [], medication: '' },
    goals: { goals: [], budget: 1000, preferences: [] },
    lifestyle: { occupation: '', workSchedule: '', kitchenAccess: '', stressLevel: 3, mealSource: '' }
  });

  const { width } = Dimensions.get('window');
  const animatedValue = useRef(new Animated.Value(0)).current;

  const handleBack = () => {
    if (currentStep > 0) {
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }).start(() => {
        setCurrentStep(currentStep - 1);
        animatedValue.setValue(0);
      });
    }
  };

  const handleNext = () => {
    if (currentStep < 3) {
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }).start(() => {
        setCurrentStep(currentStep + 1);
        animatedValue.setValue(0);
      });
    } else {
      // Finish onboarding
      console.log('Onboarding complete:', data);
      // Here you can navigate to the next screen or save data
    }
  };

  const renderComponent = (step: number) => {
    switch (step) {
      case 0:
        return <Personal data={data.personal} onChange={(d) => setData({ ...data, personal: d })} />;
      case 1:
        return <Health data={data.health} onChange={(d) => setData({ ...data, health: d })} />;
      case 2:
        return <Goals data={data.goals} onChange={(d) => setData({ ...data, goals: d })} />;
      case 3:
        return <Lifestyle data={data.lifestyle} onChange={(d) => setData({ ...data, lifestyle: d })} />;
      default:
        return null;
    }
  };

  const currentTranslateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -width]
  });

  const nextTranslateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [width, 0]
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F6F7F9' }}>
      <View style={{ flex: 1, backgroundColor: '#F6F7F9' }}>
      <Animated.View
        style={{
          transform: [{ translateX: currentTranslateX }],
          position: 'absolute',
          width: '100%',
          height: '100%',
          padding: 20,
          justifyContent: 'center'
        }}
      >
        {renderComponent(currentStep)}
      </Animated.View>

      {currentStep < 3 && (
        <Animated.View
          style={{
            transform: [{ translateX: nextTranslateX }],
            position: 'absolute',
            width: '100%',
            height: '100%',
            padding: 20,
            justifyContent: 'center'
          }}
        >
          {renderComponent(currentStep + 1)}
        </Animated.View>
      )}

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
    </SafeAreaView>
  )
}

export default OnboardingPage