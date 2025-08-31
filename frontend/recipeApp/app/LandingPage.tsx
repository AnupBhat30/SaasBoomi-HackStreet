import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Image, Dimensions } from 'react-native'
import React, { useState, useRef } from 'react'
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const LandingPage = ({ onGetStarted }: { onGetStarted?: () => void }) => {
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
  }, [scale]);

  const { width: screenWidth } = Dimensions.get('window');
  const scrollViewWidth = screenWidth - 40; // accounting for padding: 20 on both sides
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const slides = [
    { image: require('../assets/images/landing1.jpeg'), text: 'Eat healthy, every single day.\nMake better choices with Aahara!' },
    { image: require('../assets/images/landing2.jpeg'), text: 'Celebrate Indian food traditions.\nEnjoy heritage with every meal.' },
    { image: require('../assets/images/landing3.jpeg'), text: 'Strong families dine together.\nShare joy and good health at home.' },
  ];

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (onGetStarted) {
      onGetStarted();
    } else {
      console.warn('onGetStarted is not defined');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F6F7F9' }}>
      <View style={{ flex: 1, padding: 20 }}>
        {/* Header */}
        <View style={{ alignItems: 'center', marginTop: 40, marginBottom: 40 }}>
          <Text style={{ fontSize: 20, color: '#6B7280', fontWeight: '500' }}>Welcome to</Text>
          <Text style={{ fontSize: 32, color: '#FF6B00', fontWeight: '700' }}>Aahara</Text>
        </View>
        {/* Carousel */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={(event) => {
            const slideSize = event.nativeEvent.layoutMeasurement.width;
            const index = event.nativeEvent.contentOffset.x / slideSize;
            const roundIndex = Math.round(index);
            setCurrentIndex(roundIndex);
          }}
          scrollEventThrottle={16}
          style={{ flex: 1 }}
        >
          {slides.map((slide, index) => (
            <View key={index} style={{ width: scrollViewWidth, alignItems: 'center', justifyContent: 'center' }}>
              <Image source={slide.image} style={{ width: 200, height: 200, borderRadius: 100, marginBottom: 20 }} />
              <Text style={{ fontSize: 18, color: '#1F2933', textAlign: 'center', fontWeight: '500' }} numberOfLines={2}>{slide.text}</Text>
            </View>
          ))}
        </ScrollView>
        {/* Dots */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 40 }}>
          {slides.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => scrollViewRef.current?.scrollTo({ x: index * scrollViewWidth, animated: true })}
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: index === currentIndex ? '#FF6B00' : '#E5E7EB',
                marginHorizontal: 5,
              }}
            />
          ))}
        </View>
        {/* Button */}
        <Animated.View style={[animatedStyle, { alignItems: 'center' }]}>
          <TouchableOpacity
            onPress={handlePress}
            style={{
              backgroundColor: '#FF6B00',
              paddingVertical: 16,
              paddingHorizontal: 32,
              borderRadius: 16,
              alignItems: 'center',
              width: '80%',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.12,
              shadowRadius: 24,
              elevation: 8,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '600' }}>Get Started</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  )
}

export default LandingPage