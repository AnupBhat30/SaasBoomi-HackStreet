import { View, Text, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import LandingPage from './LandingPage'
import OnboardingPage from './OnboardingPage'

const index = () => {
  const [showOnboarding, setShowOnboarding] = useState(false)

  if (showOnboarding) {
    return <OnboardingPage />
  }

  return <LandingPage onGetStarted={() => setShowOnboarding(true)} />
}

const styles=StyleSheet.create({
  text:{
    color:"white",
  }
})

export default index