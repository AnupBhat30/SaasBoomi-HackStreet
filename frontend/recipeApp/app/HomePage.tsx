import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, ScrollView, Dimensions, Image } from 'react-native'
import React, { useState, useCallback, useRef } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'
import { MaterialIcons, Feather, Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import Animated, { FadeInUp, FadeInDown, SlideInRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import Collapsible from 'react-native-collapsible';
import { Circle } from 'react-native-progress';

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
  medication_details: string[];
  budget_for_food: number;
  occupation_type: string[];
  work_schedule: string;
  access_to_kitchen: string;
  stress_level: string;
  meal_source: string[];
}

const { width } = Dimensions.get('window');

const HomePage = () => {
  const [userInfo, setUserInfo] = useState<userInfo | null>(null);
  const [streak, setStreak] = useState(0);
  const [goalsCollapsed, setGoalsCollapsed] = useState(true);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

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
    { icon: 'analytics', label: 'Insights', route: '/Insights' as any, color: '#F3E5F5', textColor: '#9C27B0', isPrimary: false },
  ];

  const discoverTiles = [
    {
      title: 'Pantry',
      description: 'Track your kitchen essentials, avoid waste, and always know what you have on hand!',
      image: require('../assets/images/disc1.jpeg'), // Using existing image
      route: '/Pantry'
    },
    {
      title: 'Log Meals',
      description: 'Quickly add what you eat—make every bite count for your health journey.',
      image: require('../assets/images/disc2.jpeg'), // Using existing image
      route: '/LogMeal'
    },
    {
      title: 'Insights',
      description: 'Visualize your progress with simple charts, trends, and personalized feedback.',
      image: require('../assets/images/disc3.jpeg'), // Using existing image
      route: '/Insights'
    },
    {
      title: 'Recipes for You',
      description: 'Discover healthy, heritage-inspired recipes made just for your goals.',
      image: require('../assets/images/disc4.jpeg'), // Using existing image
      route: '/Recipes' // Assuming route
    }
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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Top Bar Header */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/ProfilePage'); }}
            style={styles.avatarButton}
          >
            <MaterialIcons name="person" size={32} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.appTitle}>EWET</Text>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications" size={28} color="#1F2933" />
            {/* Add dot if unread */}
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>

        {/* Dashboard Carousel */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.carouselContainer}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(event) => {
              const slideSize = event.nativeEvent.layoutMeasurement.width;
              const index = event.nativeEvent.contentOffset.x / slideSize;
              const roundIndex = Math.round(index);
              setCurrentPage(roundIndex);
            }}
            scrollEventThrottle={16}
          >
            {/* Your Snapshot Slide */}
            <View style={styles.carouselSlide}>
              <Text style={styles.snapshotTitle}>Your Snapshot</Text>
              <View style={styles.statsContainer}>
                <View style={styles.statsMainRow}>
                  {/* BMI on the left */}
                  <View style={styles.bmiSection}>
                    <View style={styles.bmiHeader}>
                      <MaterialIcons name="monitor-weight" size={28} color="#FF6B00" />
                      <Text style={styles.statLabel}>BMI</Text>
                    </View>
                    <Text style={[styles.statValue, { color: bmiInfo.color }]}>{userInfo.BMI.toFixed(1)}</Text>
                    <View style={[styles.bmiBadge, { backgroundColor: bmiInfo.color }]}>
                      <Text style={styles.bmiBadgeText}>{bmiInfo.category}</Text>
                    </View>
                    <Circle
                      size={70}
                      thickness={6}
                      progress={Math.min(userInfo.BMI / 40, 1)}
                      color={bmiInfo.color}
                      unfilledColor="#E5E7EB"
                      borderWidth={0}
                      showsText={false}
                    />
                  </View>
                  {/* Right side: height, weight, goal weight vertically */}
                  <View style={styles.rightStatsSection}>
                    <View style={styles.rightStatItem}>
                      <View style={styles.statWithIcon}>
                        <MaterialIcons name="height" size={22} color="#FF6B00" />
                        <Text style={styles.rightStatLabel}>Height</Text>
                      </View>
                      <Text style={styles.rightStatValue}>{userInfo.height} cm</Text>
                    </View>
                    <View style={styles.rightStatItem}>
                      <View style={styles.statWithIcon}>
                        <MaterialIcons name="fitness-center" size={22} color="#FF6B00" />
                        <Text style={styles.rightStatLabel}>Weight</Text>
                      </View>
                      <Text style={styles.rightStatValue}>{userInfo.weight} kg</Text>
                    </View>
                    <View style={styles.rightStatItem}>
                      <View style={styles.statWithIcon}>
                        <MaterialIcons name="flag" size={22} color="#FF6B00" />
                        <Text style={styles.rightStatLabel}>Goal Weight</Text>
                      </View>
                      <Text style={styles.rightStatValue}>65 kg</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Your Goals Slide */}
            <View style={styles.carouselSlide}>
              <Text style={styles.goalsTitle}>Your Goals</Text>
              <View style={styles.goalsContainer}>
                <View style={styles.goalsList}>
                  {userInfo.health_goals.slice(0, 3).map((goal, index) => (
                    <View key={index} style={styles.goalItem}>
                      <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
                      <Text style={styles.goalItemText}>{goal}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.quoteContainer}>
                  <Text style={styles.quoteText}>
                    "Your body deserves the best."
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Carousel Indicators */}
          <View style={styles.indicatorContainer}>
            {[0, 1].map((index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  scrollViewRef.current?.scrollTo({ x: index * width, animated: true });
                  setCurrentPage(index);
                }}
                style={[
                  styles.indicator,
                  currentPage === index && styles.activeIndicator
                ]}
              />
            ))}
          </View>
        </Animated.View>

        {/* Meal Logging Section */}
        <Animated.View entering={FadeInUp.delay(150)} style={styles.mealLoggingSection}>
          <LinearGradient
            colors={['#FF6B00', '#FFA366']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.mealLoggingGradient}
          >
            <View style={styles.mealLoggingContent}>
              <MaterialIcons name="restaurant" size={30} color="#FFFFFF" style={styles.mealLoggingIcon} />
              <View style={styles.mealLoggingText}>
                <Text style={styles.mealLoggingTitle}>Track Your Meals</Text>
                <Text style={styles.mealLoggingDescription}>
                  Monitor your nutrition and stay on track with your health goals.
                </Text>
              </View>
              <TouchableOpacity
                style={styles.logMealsButton}
                onPress={() => router.push('/Pantry')}
              >
                <Text style={styles.logMealsButtonText}>Log Meals</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Discover Section */}
        <Animated.View entering={FadeInUp.delay(200)} style={styles.discoverSection}>
          <Text style={styles.discoverTitle}>Discover</Text>
          <Text style={styles.discoverDescription}>Explore personalized features to enhance your nutrition journey</Text>
          <View style={styles.grid}>
            {discoverTiles.map((tile, index) => (
              <Animated.View
                key={tile.title}
                entering={SlideInRight.delay(300 + index * 100)}
                style={styles.tile}
              >
                <TouchableOpacity
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push(tile.route as any); }}
                  activeOpacity={0.8}
                  style={styles.tileTouchable}
                >
                  <Image source={tile.image} style={styles.tileImage} />
                  <View style={styles.tileFooter}>
                    <Text style={styles.tileTitle}>{tile.title}</Text>
                    <Text style={styles.tileDescription}>{tile.description}</Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
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
  scrollContent: {
    paddingTop: 20, // Spacing at the top near notch
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(31, 41, 55, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FF6B00',
  },
  notificationButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F44336',
  },
  carouselContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 12,
    marginHorizontal: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
  },
  carouselSlide: {
    width: width - 80, // Account for padding
    paddingHorizontal: 4,
    flex: 1,
  },
  goalsContainer: {
    alignItems: 'center',
  },
  goalsList: {
    width: '100%',
    marginBottom: 12,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  goalItemText: {
    fontSize: 14,
    color: '#1F2933',
    marginLeft: 8,
    flex: 1,
  },
  quoteContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  quoteText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 4,
  },
  quoteAuthor: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#FF6B00',
    width: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1F2933',
    marginBottom: 16,
  },
  snapshotTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2933',
    marginBottom: 8,
  },
  goalsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2933',
    marginBottom: 16,
  },
  goalsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  goalBadge: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  goalBadgeText: {
    fontSize: 14,
    color: '#1F2933',
    fontWeight: '500',
  },
  statsContainer: {
    flex: 1,
  },
  statsMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bmiSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 12,
    marginTop: 12,
  },
  bmiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  rightStatsSection: {
    flex: 1,
    justifyContent: 'space-around',
  },
  rightStatItem: {
    alignItems: 'center',
    marginBottom: 8,
  },
  statWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  rightStatLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
  },
  rightStatValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2933',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1F2933',
    marginBottom: 0,
  },
  bmiBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    marginBottom: 4,
  },
  bmiBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
  bmiBar: {
    width: '80%',
    marginTop: 4,
  },
  discoverSection: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
  },
  discoverTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2933',
    marginBottom: 8,
  },
  discoverDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tile: {
    width: (width - 60) / 2,
    height: (width - 60) / 2,
    marginBottom: 16,
    borderRadius: 16, // Less rounded
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 4,
  },
  tileTouchable: {
    flex: 1,
  },
  tileImage: {
    width: '100%',
    height: (width - 60) / 2 * 0.7,
    borderTopLeftRadius: 16, // Match tile
    borderTopRightRadius: 16,
  },
  tileFooter: {
    backgroundColor: '#FFFFFF', // White background
    padding: 16, // Increased padding
    alignItems: 'center',
  },
  tileTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B00', // Orange text
    marginBottom: 8, // Increased margin
  },
  tileDescription: {
    fontSize: 12,
    color: '#FF6B00', // Orange text
    textAlign: 'center',
    lineHeight: 16,
  },
  mealLoggingSection: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  mealLoggingGradient: {
    padding: 16,
  },
  mealLoggingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealLoggingIcon: {
    marginRight: 12,
  },
  mealLoggingText: {
    flex: 0.6,
    paddingRight: 12,
  },
  mealLoggingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2933',
    marginBottom: 4,
  },
  mealLoggingDescription: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  logMealsButton: {
    flex: 0.35,
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logMealsButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B00',
    textAlign: 'center',
  },
});

export default HomePage