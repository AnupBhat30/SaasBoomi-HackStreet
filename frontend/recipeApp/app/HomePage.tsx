import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'
import { MaterialIcons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'

interface userInfo {
  name: string;
  age: number;
  height: number;
  weight: number;
  BMI: number;
  gender: 'Male' | 'Female' | 'Other';
  location: string;
  health_conditions: string[];
  allergies: string[];
  health_goals: string[];
  medication_details: string[];
  budget_for_food: number;
  occupation_type: string;
  work_schedule: string;
  access_to_kitchen: string;
  stress_level: string;
  meal_source: string;
}

const HomePage = () => {
  const [userInfo, setUserInfo] = useState<userInfo | null>(null);
  const router = useRouter();

  const loadUserInfo = useCallback(async () => {
    const data = await AsyncStorage.getItem('userInfo');
    if (data) {
      setUserInfo(JSON.parse(data));
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUserInfo();
    }, [loadUserInfo])
  );

  if (!userInfo) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F6F7F9', justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F6F7F9' }}>
      <View style={{ flex: 1, padding: 20 }}>
        {/* Header with Profile Icon */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <View />
          <TouchableOpacity onPress={() => router.push('/ProfilePage')}>
            <MaterialIcons name="person" size={32} color="#1F2933" />
          </TouchableOpacity>
        </View>

        {/* Welcome Message */}
        <Text style={{ fontSize: 28, fontWeight: '700', color: '#1F2933', marginBottom: 8 }}>
          Welcome, {userInfo.name}
        </Text>
        <Text style={{ fontSize: 16, fontWeight: '400', color: '#6B7280', marginBottom: 30 }}>
          Here’s your personalized nutrition hub to support your health and family.
        </Text>

        {/* Quick Overview */}
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, marginBottom: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 24, elevation: 8 }}>
          <Text style={{ fontSize: 20, fontWeight: '600', color: '#1F2933', marginBottom: 15 }}>Quick Overview</Text>
          <Text style={{ fontSize: 16, color: '#1F2933', marginBottom: 10 }}>Age: {userInfo.age}</Text>
          <Text style={{ fontSize: 16, color: '#1F2933', marginBottom: 10 }}>BMI: {userInfo.BMI.toFixed(1)}</Text>
          <Text style={{ fontSize: 16, color: '#1F2933', marginBottom: 10 }}>Health Goals: {userInfo.health_goals.join(', ')}</Text>
          <Text style={{ fontSize: 14, color: '#6B7280' }}>Your goal of healthier meals is a great first step!</Text>
        </View>

        {/* Log Meals Button */}
        <View style={{ alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => router.push('/Pantry')}
            style={{
              backgroundColor: '#FF6B00',
              padding: 20,
              borderRadius: 16,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.12,
              shadowRadius: 24,
              elevation: 8,
              width: '80%'
            }}
          >
            <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>Log Your Meals</Text>
            <Text style={{ color: 'white', fontSize: 14, marginTop: 5 }}>Log your meals so we can provide you with a personalized plan</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default HomePage