import { View, Text, TouchableOpacity, Image, SafeAreaView } from 'react-native'
import React from 'react'
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const LandingPage = ({ onGetStarted }: { onGetStarted: () => void }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  React.useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onGetStarted();
  };

  return (
    <LinearGradient colors={['#FF6B00', '#FFD700']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          {/* Hero Animation */}
          <LottieView
            source={{ uri: 'https://assets10.lottiefiles.com/packages/lf20_4wo0zx.json' }}
            autoPlay
            loop
            style={{ width: 250, height: 250, marginBottom: 40 }}
          />

          <Text style={{ fontSize: 32, fontWeight: '700', color: '#FFFFFF', textAlign: 'center', marginBottom: 16 }}>
            Heritage Nutrition AI
          </Text>

          <Text style={{ fontSize: 16, color: '#FFFFFF', textAlign: 'center', marginBottom: 40, lineHeight: 24 }}>
            Discover your heritage nutrition journey! Personalized plans that respect your culture, health, and lifestyle.
          </Text>

          <Animated.View style={animatedStyle}>
            <TouchableOpacity
              onPress={handlePress}
              style={{
                backgroundColor: '#FFFFFF',
                paddingVertical: 16,
                paddingHorizontal: 32,
                borderRadius: 25,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 24,
                elevation: 8,
                alignItems: 'center'
              }}
            >
              <Text style={{ color: '#FF6B00', fontSize: 18, fontWeight: '600' }}>
                Get Started
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  )
}

export default LandingPage