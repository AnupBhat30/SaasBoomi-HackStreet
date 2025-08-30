import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, ScrollView, Dimensions } from 'react-native'
import React, { useState, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'
import { MaterialIcons, Feather, Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import Animated, { FadeInUp, FadeInDown, SlideInRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import { ProgressBar } from 'react-native-paper';
import Collapsible from 'react-native-collapsible';
import LottieView from 'lottie-react-native';
import { Bar } from 'react-native-progress';

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

const { width } = Dimensions.get('window');

const HomePage = () => {
  const [userInfo, setUserInfo] = useState<userInfo | null>(null);
  const [streak, setStreak] = useState(0);
  const [goalsCollapsed, setGoalsCollapsed] = useState(true);
  const [tooltipVisible, setTooltipVisible] = useState(false);
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

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: 'Underweight', color: '#2196F3' };
    if (bmi < 25) return { category: 'Normal', color: '#4CAF50' };
    if (bmi < 30) return { category: 'Overweight', color: '#FF9800' };
    return { category: 'Obese', color: '#F44336' };
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getMotivationalText = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Let's make today a healthy one 🌅";
    if (hour < 17) return "Keep up the great work! 💪";
    return "Time for some healthy choices! 🌙";
  };

  const getStreakMessage = () => {
    if (streak === 0) return "No streak yet — start by logging your first meal! 🎉";
    if (streak < 3) return `${streak} day streak! You're on fire! 🔥`;
    if (streak < 7) return `${streak} day streak! Building healthy habits! 💪`;
    return `${streak} day streak! You're unstoppable! 🚀`;
  };

  const getBMIProgress = (bmi: number) => {
    if (bmi < 18.5) return { position: 0.2, color: '#2196F3', message: 'Focus on gaining healthy weight!' };
    if (bmi < 25) return { position: 0.5, color: '#4CAF50', message: 'Great job maintaining healthy range!' };
    if (bmi < 30) return { position: 0.7, color: '#FF9800', message: 'Consider healthy weight management!' };
    return { position: 0.9, color: '#F44336', message: 'Focus on sustainable weight goals!' };
  };

  const quickActions = [
    { icon: 'restaurant', label: 'Log Meal', route: '/LogMeal' as any, color: '#FF6B00', isPrimary: true },
    { icon: 'kitchen', label: 'Pantry', route: '/Pantry' as any, color: '#E8F5E9', textColor: '#4CAF50', isPrimary: false },
    { icon: 'search', label: 'Explore', route: '/(tabs)/explore' as any, color: '#E3F2FD', textColor: '#2196F3', isPrimary: false },
    { icon: 'analytics', label: 'Insights', route: '/ProfilePage' as any, color: '#F3E5F5', textColor: '#9C27B0', isPrimary: false },
  ];

  if (!userInfo) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <MotiView
            from={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'timing', duration: 1000 }}
          >
            <MaterialIcons name="restaurant" size={60} color="#FF6B00" />
            <Text style={styles.loadingText}>Loading your nutrition hub...</Text>
          </MotiView>
        </View>
      </SafeAreaView>
    );
  }

  const bmiInfo = getBMICategory(userInfo.BMI);
  const bmiProgress = getBMIProgress(userInfo.BMI);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#FFF8F0', '#FFFFFF']}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Animated.Text entering={FadeInUp.delay(100)} style={styles.welcome}>
                {getGreeting()}, {userInfo.name}! 👋
              </Animated.Text>
              <Animated.Text entering={FadeInUp.delay(200)} style={styles.subtitle}>
                {getMotivationalText()}
              </Animated.Text>
            </View>
            <TouchableOpacity
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/ProfilePage'); }}
              style={styles.avatarButton}
            >
              <MaterialIcons name="person" size={32} color="#FFF" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Streak Card */}
        <Animated.View entering={FadeInUp.delay(300)} style={styles.streakCard}>
          <LinearGradient colors={['#FFF3E0', '#FFE0B2']} style={styles.streakGradient}>
            <View style={styles.streakContent}>
              <MaterialIcons name="local-fire-department" size={28} color="#FF6B00" />
              <View style={styles.streakTextContainer}>
                <Text style={styles.streakNumber}>{streak}</Text>
                <Text style={styles.streakLabel}>{getStreakMessage()}</Text>
              </View>
              <Feather name="trending-up" size={24} color="#FF6B00" />
            </View>
          </LinearGradient>
        </Animated.View>

        {/* BMI Overview */}
        <Animated.View entering={FadeInUp.delay(400)} style={styles.bmiCard}>
          <View style={styles.bmiHeader}>
            <Text style={styles.bmiTitle}>Your BMI</Text>
            <View style={[styles.bmiBadge, { backgroundColor: bmiInfo.color }]}>
              <Text style={styles.bmiBadgeText}>{bmiInfo.category}</Text>
            </View>
          </View>
          <View style={styles.bmiValueContainer}>
            <TouchableOpacity onPress={() => setTooltipVisible(!tooltipVisible)}>
              <Text style={styles.bmiValue}>{userInfo.BMI.toFixed(1)}</Text>
            </TouchableOpacity>
            {tooltipVisible && (
              <View style={styles.tooltip}>
                <Text style={styles.tooltipText}>{bmiProgress.message}</Text>
              </View>
            )}
            <View style={styles.bmiProgressContainer}>
              <Bar
                progress={Math.min(userInfo.BMI / 40, 1)}
                width={null}
                height={8}
                color={bmiInfo.color}
                unfilledColor="#E5E7EB"
                borderRadius={4}
              />
              <View style={styles.bmiScale}>
                <Text style={styles.bmiScaleText}>18.5</Text>
                <Text style={styles.bmiScaleText}>25</Text>
                <Text style={styles.bmiScaleText}>30</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View entering={FadeInUp.delay(500)} style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <Animated.View
                key={action.label}
                entering={SlideInRight.delay(600 + index * 100)}
              >
                <TouchableOpacity
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push(action.route); }}
                  activeOpacity={0.8}
                  style={[
                    styles.actionButton,
                    action.isPrimary
                      ? { backgroundColor: action.color }
                      : { backgroundColor: action.color, borderWidth: 2, borderColor: action.textColor }
                  ]}
                >
                  <MaterialIcons
                    name={action.icon as any}
                    size={24}
                    color={action.isPrimary ? "#FFF" : action.textColor}
                  />
                  <Text style={[
                    styles.actionButtonText,
                    action.isPrimary ? { color: "#FFF" } : { color: action.textColor }
                  ]}>
                    {action.label}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Health Goals */}
        <Animated.View entering={FadeInUp.delay(700)} style={styles.goalsCard}>
          <TouchableOpacity onPress={() => setGoalsCollapsed(!goalsCollapsed)} style={styles.goalsHeader}>
            <Ionicons name="fitness" size={24} color="#4CAF50" />
            <Text style={styles.goalsTitle}>Your Health Goals</Text>
            <Ionicons name={goalsCollapsed ? "chevron-down" : "chevron-up"} size={24} color="#4CAF50" />
          </TouchableOpacity>
          <Collapsible collapsed={goalsCollapsed}>
            <View style={styles.goalsProgress}>
              <Text style={styles.goalsProgressText}>Weekly Goal: 12/20 Healthy Meals</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '60%' }]} />
              </View>
              <Text style={styles.goalsSubtext}>You&apos;re 60% towards your weekly target! 🎯</Text>
            </View>
            <View style={styles.goalsList}>
              {userInfo.health_goals.length > 0 ? (
                userInfo.health_goals.slice(0, 3).map((goal, index) => (
                  <View key={index} style={styles.goalItem}>
                    <Feather name="check-circle" size={16} color="#4CAF50" />
                    <Text style={styles.goalText}>{goal}</Text>
                  </View>
                ))
              ) : (
                <TouchableOpacity style={styles.setGoalsButton}>
                  <Ionicons name="heart" size={20} color="#FFF" />
                  <Text style={styles.setGoalsText}>Set Goals</Text>
                </TouchableOpacity>
              )}
            </View>
          </Collapsible>
        </Animated.View>

        {/* Today's Tip */}
        <Animated.View entering={FadeInDown.delay(800)} style={styles.tipCard}>
          <LinearGradient colors={['#E8F5E9', '#C8E6C9']} style={styles.tipGradient}>
            <View style={styles.tipContent}>
              <MaterialIcons name="lightbulb" size={24} color="#4CAF50" />
              <View style={styles.tipTextContainer}>
                <Text style={styles.tipTitle}>Today&apos;s Tip</Text>
                <Text style={styles.tipText}>
                  Try incorporating more colorful vegetables into your meals for better nutrition!
                </Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7F9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F6F7F9',
  },
  loadingText: {
    fontSize: 18,
    color: '#6B7280',
    marginTop: 16,
    fontWeight: '500',
  },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
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
  },
  avatarButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(31, 41, 55, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakCard: {
    marginHorizontal: 20,
    marginTop: -20,
    marginBottom: 24,
  },
  streakGradient: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  streakContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  streakTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FF6B00',
  },
  streakLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF6B00',
  },
  bmiCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  bmiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  bmiTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2933',
  },
  bmiBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  bmiBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  bmiValueContainer: {
    alignItems: 'center',
  },
  bmiValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2933',
    marginBottom: 8,
  },
  bmiMotivation: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  bmiProgressContainer: {
    width: '100%',
  },
  bmiProgressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  bmiProgressFill: {
    height: 8,
    borderRadius: 4,
  },
  bmiScale: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bmiScaleText: {
    fontSize: 12,
    color: '#6B7280',
  },
  actionsSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1F2933',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: (width - 60) / 2,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 80, // Better accessibility
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  goalsCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  goalsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  goalsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2933',
    marginLeft: 12,
  },
  goalsProgress: {
    marginBottom: 16,
  },
  goalsProgressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2933',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  goalsSubtext: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  goalsList: {
    gap: 12,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalText: {
    fontSize: 16,
    color: '#1F2933',
    marginLeft: 12,
  },
  setGoalsButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  setGoalsText: {
    color: '#FFF',
    fontSize: 16,
    marginLeft: 8,
  },
  tipCard: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  tipGradient: {
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  tipContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2933',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  tooltip: {
    backgroundColor: '#333',
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  tooltipText: {
    color: '#FFF',
    fontSize: 12,
  },
});

export default HomePage