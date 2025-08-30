import { View, Text, StyleSheet } from 'react-native'
import React, { useState, useEffect } from 'react'
import LandingPage from './LandingPage'
import OnboardingPage from './OnboardingPage'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SplashScreen from 'expo-splash-screen';
import Animated, { FadeIn } from 'react-native-reanimated';
import LottieView from 'lottie-react-native';

const index = () => {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      await SplashScreen.preventAutoHideAsync();
      // Check if onboarding is completed
      const userInfo = await AsyncStorage.getItem('userInfo');
      if (userInfo) {
        setShowOnboarding(false);
      } else {
        setShowOnboarding(true);
      }
      setIsReady(true);
      await SplashScreen.hideAsync();
    }
    prepare();
  }, []);

  if (!isReady) {
    return (
      <View style={styles.splashContainer}>
        <LottieView
          source={{ uri: 'https://assets2.lottiefiles.com/packages/lf20_jcikwtux.json' }}
          autoPlay
          loop
          style={styles.splashAnimation}
        />
        <Text style={styles.splashText}>Heritage Nutrition AI</Text>
      </View>
    );
  }

  return (
    <Animated.View entering={FadeIn.duration(500)} style={styles.container}>
      {showOnboarding ? <OnboardingPage /> : <LandingPage onGetStarted={() => setShowOnboarding(true)} />}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF6B00',
  },
  splashAnimation: {
    width: 200,
    height: 200,
  },
  splashText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    marginTop: 20,
  },
  container: {
    flex: 1,
  },
});

export default index