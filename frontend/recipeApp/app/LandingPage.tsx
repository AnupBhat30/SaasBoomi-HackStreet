import { View, Text, TouchableOpacity, Image, SafeAreaView } from 'react-native'
import React from 'react'

const LandingPage = ({ onGetStarted }: { onGetStarted: () => void }) => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F6F7F9' }}>
      <View style={{ flex: 1, backgroundColor: '#F6F7F9', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      {/* Hero Image Placeholder - Replace with actual image */}
      <View style={{ width: 200, height: 200, backgroundColor: '#E5E7EB', borderRadius: 100, marginBottom: 40, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 48 }}>🍲</Text>
      </View>
      
      <Text style={{ fontSize: 32, fontWeight: '700', color: '#1F2933', textAlign: 'center', marginBottom: 16 }}>
        Heritage Nutrition AI
      </Text>
      
      <Text style={{ fontSize: 16, color: '#6B7280', textAlign: 'center', marginBottom: 40, lineHeight: 24 }}>
        Personalized nutrition guidance that respects your culture, health, and lifestyle.
      </Text>
      
      <TouchableOpacity
        onPress={onGetStarted}
        style={{
          backgroundColor: '#FF6B00',
          paddingVertical: 16,
          paddingHorizontal: 32,
          borderRadius: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.12,
          shadowRadius: 24,
          elevation: 8
        }}
      >
        <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>
          Get Started
        </Text>
      </TouchableOpacity>
    </View>
    </SafeAreaView>
  )
}

export default LandingPage