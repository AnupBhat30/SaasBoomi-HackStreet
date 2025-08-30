import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React, { useState, useEffect } from 'react'
import Slider from '@react-native-community/slider';
import Animated, { FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface PersonalData {
  name: string;
  age: number;
  height: number;
  weight: number;
  gender: 'Male' | 'Female' | 'Other';
  location: string;
  BMI: number;
}

interface Props {
  data: PersonalData;
  onChange: (data: PersonalData) => void;
}

const Personal: React.FC<Props> = ({ data, onChange }) => {
  const [bmi, setBmi] = useState(0);

  useEffect(() => {
    setBmi(data.BMI);
  }, [data.BMI]);

  const getBmiColor = () => {
    if (bmi < 18.5) return '#F59E0B'; // warning
    if (bmi < 25) return '#22C55E'; // success
    if (bmi < 30) return '#F59E0B';
    return '#EF4444'; // error
  };

  const getBmiLabel = () => {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  };

  const updateField = (field: keyof PersonalData, value: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (field === 'height' || field === 'weight') {
      const newData = { ...data, [field]: value };
      const h = newData.height / 100;
      const b = newData.weight / (h * h);
      onChange({ ...newData, BMI: b });
    } else {
      onChange({ ...data, [field]: value });
    }
  };

  const increment = (field: 'age' | 'height' | 'weight') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateField(field, data[field] + 1);
  };

  const decrement = (field: 'age' | 'height' | 'weight') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (data[field] > 0) updateField(field, data[field] - 1);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <Animated.Text entering={FadeInUp.delay(200)} style={styles.title}>Tell Us About Yourself</Animated.Text>
        <Animated.Text entering={FadeInUp.delay(300)} style={styles.subtitle}>This helps us calculate your nutritional baseline.</Animated.Text>

      <Animated.View entering={FadeInUp.delay(400)} style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2933', marginBottom: 10 }}>Name</Text>
        <TextInput
          value={data.name}
          onChangeText={(text) => updateField('name', text)}
          placeholder="Enter your name"
          style={{ borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 10, fontSize: 16 }}
        />
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(500)} style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2933', marginBottom: 10 }}>Location</Text>
        <TextInput
          value={data.location}
          onChangeText={(text) => updateField('location', text)}
          placeholder="Enter your location"
          style={{ borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 10, fontSize: 16 }}
        />
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(600)} style={styles.section}>
        <Text style={styles.sectionTitle}>Age</Text>
        <Text style={styles.sliderValue}>{data.age} years</Text>
        <Slider
          style={styles.slider}
          minimumValue={10}
          maximumValue={100}
          step={1}
          value={data.age}
          onValueChange={(value) => updateField('age', value)}
          minimumTrackTintColor="#FF6B00"
          maximumTrackTintColor="#E5E7EB"
        />
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(700)} style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2933', marginBottom: 10 }}>Height (cm)</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => decrement('height')} style={{ padding: 10, backgroundColor: '#FF6B00', borderRadius: 8 }}>
            <Text style={{ color: 'white', fontSize: 18 }}>-</Text>
          </TouchableOpacity>
          <TextInput
            value={data.height.toString()}
            onChangeText={(text) => updateField('height', parseInt(text) || 0)}
            keyboardType='numeric'
            style={{ flex: 1, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 10, marginHorizontal: 10, fontSize: 16 }}
          />
          <TouchableOpacity onPress={() => increment('height')} style={{ padding: 10, backgroundColor: '#FF6B00', borderRadius: 8 }}>
            <Text style={{ color: 'white', fontSize: 18 }}>+</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

            <Animated.View entering={FadeInUp.delay(800)} style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2933', marginBottom: 10 }}>Weight (kg)</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => decrement('weight')} style={{ padding: 10, backgroundColor: '#FF6B00', borderRadius: 8 }}>
            <Text style={{ color: 'white', fontSize: 18 }}>-</Text>
          </TouchableOpacity>
          <TextInput
            value={data.weight.toString()}
            onChangeText={(text) => updateField('weight', parseInt(text) || 0)}
            keyboardType='numeric'
            style={{ flex: 1, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 10, marginHorizontal: 10, fontSize: 16 }}
          />
          <TouchableOpacity onPress={() => increment('weight')} style={{ padding: 10, backgroundColor: '#FF6B00', borderRadius: 8 }}>
            <Text style={{ color: 'white', fontSize: 18 }}>+</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(900)} style={styles.section}>
        <Text style={styles.sectionTitle}>Gender</Text>
        <View style={styles.genderContainer}>
          {['Male', 'Female', 'Other'].map((g, index) => (
            <Animated.View key={g} entering={FadeInUp.delay(1000 + index * 100)}>
              <TouchableOpacity
                onPress={() => updateField('gender', g as any)}
                style={[
                  styles.genderButton,
                  data.gender === g && styles.selectedGender,
                  index < 2 && { borderRightWidth: 1, borderRightColor: '#E5E7EB' }
                ]}
              >
                <Text style={[
                  styles.genderText,
                  data.gender === g && styles.selectedGenderText
                ]}>{g}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </Animated.View>

      {data.BMI > 0 && (
        <Animated.View entering={FadeInUp.delay(600)} style={styles.bmiContainer}>
          <Text style={styles.bmiText}>BMI: {data.BMI.toFixed(1)} - {getBmiLabel()}</Text>
          <View style={styles.bmiBar}>
            <View style={[styles.bmiFill, { width: `${Math.min((data.BMI / 40) * 100, 100)}%`, backgroundColor: getBmiColor() }]} />
          </View>
        </Animated.View>
      )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2933',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2933',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  sliderValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF6B00',
    textAlign: 'center',
    marginBottom: 10,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  thumb: {
    backgroundColor: '#FF6B00',
    borderRadius: 10,
    width: 20,
    height: 20,
  },
  genderContainer: {
    flexDirection: 'row',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  genderButton: {
    flex: 1,
    padding: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  selectedGender: {
    backgroundColor: '#FF6B00',
  },
  genderText: {
    color: '#1F2933',
    fontSize: 16,
  },
  selectedGenderText: {
    color: 'white',
  },
  bmiContainer: {
    marginTop: 20,
  },
  bmiText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2933',
  },
  bmiBar: {
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 5,
    marginTop: 10,
    overflow: 'hidden',
  },
  bmiFill: {
    height: 10,
    backgroundColor: '#22C55E',
    borderRadius: 5,
  },
});

export default Personal