import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native'
import React, { useState, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'
import { MaterialIcons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import Animated, { FadeInUp } from 'react-native-reanimated';

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
  const [streak, setStreak] = useState(0);
  const router = useRouter();

  const loadUserInfo = useCallback(async () => {
    const data = await AsyncStorage.getItem('userInfo');
    if (data) {
      setUserInfo(JSON.parse(data));
    }
    // Load streak
    const streakData = await AsyncStorage.getItem('streak');
    setStreak(streakData ? parseInt(streakData) : 0);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUserInfo();
    }, [loadUserInfo])
  );

  if (!userInfo) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header with Profile Icon */}
        <View style={styles.header}>
          <View />
          <TouchableOpacity onPress={() => router.push('/ProfilePage')}>
            <MaterialIcons name="person" size={32} color="#1F2933" />
          </TouchableOpacity>
        </View>

        {/* Welcome Message */}
        <Animated.Text entering={FadeInUp.delay(100)} style={styles.welcome}>
          Welcome, {userInfo.name}
        </Animated.Text>
        <Animated.Text entering={FadeInUp.delay(200)} style={styles.subtitle}>
          Here’s your personalized nutrition hub to support your health and family.
        </Animated.Text>

        {/* Streak */}
        <Animated.View entering={FadeInUp.delay(300)} style={styles.streakContainer}>
          <MaterialIcons name="local-fire-department" size={24} color="#FF6B00" />
          <Text style={styles.streakText}>{streak} day streak!</Text>
        </Animated.View>

        {/* Quick Overview */}
        <Animated.View entering={FadeInUp.delay(400)} style={styles.overview}>
          <Text style={styles.overviewTitle}>Quick Overview</Text>
          <Text style={styles.overviewText}>Age: {userInfo.age}</Text>
          <Text style={styles.overviewText}>BMI: {userInfo.BMI.toFixed(1)}</Text>
          <View style={styles.bmiBar}>
            <View style={[styles.bmiFill, { width: `${Math.min((userInfo.BMI / 40) * 100, 100)}%` }]} />
          </View>
          <Text style={styles.overviewText}>Health Goals: {userInfo.health_goals.join(', ')}</Text>
          <Text style={styles.helperText}>Your goal of healthier meals is a great first step!</Text>
        </Animated.View>

        {/* Log Meals Button */}
        <Animated.View entering={FadeInUp.delay(500)} style={styles.buttonContainer}>
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
            <Text style={styles.buttonText}>Log Your Meals</Text>
            <Text style={styles.buttonSubtext}>Log your meals so we can provide you with a personalized plan</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7F9',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcome: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2933',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#6B7280',
    marginBottom: 30,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 15,
    borderRadius: 20,
    marginBottom: 20,
  },
  streakText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF6B00',
    marginLeft: 10,
  },
  overview: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  overviewTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2933',
    marginBottom: 15,
  },
  overviewText: {
    fontSize: 16,
    color: '#1F2933',
    marginBottom: 10,
  },
  bmiBar: {
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 5,
    marginBottom: 10,
    overflow: 'hidden',
  },
  bmiFill: {
    height: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 5,
  },
  helperText: {
    fontSize: 14,
    color: '#6B7280',
  },
  buttonContainer: {
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#FF6B00',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
    width: '80%',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonSubtext: {
    color: 'white',
    fontSize: 14,
    marginTop: 5,
  },
});

export default HomePage