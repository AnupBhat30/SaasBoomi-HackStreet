import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React, { useState, useEffect } from 'react'
import Slider from '@react-native-community/slider';
import Animated, { FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';

interface PersonalData {
  name: string;
  age: number;
  height: number;
  weight: number;
  gender: 'Male' | 'Female';
  location: string;
  BMI: number;
}

interface Props {
  data: PersonalData;
  onChange: (data: PersonalData) => void;
  onNext: () => void;
}

const Personal: React.FC<Props> = ({ data, onChange, onNext }) => {
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

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <Animated.Text entering={FadeInUp.delay(200)} style={styles.title}>Hey! We would like to know you better</Animated.Text>
        <Animated.Text entering={FadeInUp.delay(300)} style={styles.subtitle}>This helps us calculate your nutritional baseline.</Animated.Text>

      <Animated.View entering={FadeInUp.delay(400)} style={{ marginBottom: 20 }}>
        <Text style={styles.label}>What can we call you?</Text>
        <Text style={styles.subtitleField}>This helps personalize app interactions.</Text>
        <TextInput
          value={data.name}
          onChangeText={(text) => updateField('name', text)}
          placeholder="Enter your name"
          style={styles.input}
        />
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(500)} style={{ marginBottom: 20 }}>
        <Text style={styles.label}>Where do you live?</Text>
        <Text style={styles.subtitleField}>This helps provide relevant and local food or ingredient suggestions.</Text>
        <View style={styles.pickerContainer}>
          <Ionicons name="location-outline" size={20} color="#FF6B00" style={styles.icon} />
          <Picker
            selectedValue={data.location}
            onValueChange={(itemValue) => updateField('location', itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Select Country" value="" />
            <Picker.Item label="India" value="India" />
            <Picker.Item label="USA" value="USA" />
            <Picker.Item label="UK" value="UK" />
            {/* Add more countries as needed */}
          </Picker>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(600)} style={styles.section}>
        <Text style={styles.label}>How old are you?</Text>
        <Text style={styles.subtitleField}>This helps tailor nutrition and goal recommendations.</Text>
        <Text style={styles.sliderValue}>{data.age} years</Text>
        <Slider
          style={styles.slider}
          minimumValue={15}
          maximumValue={100}
          step={1}
          value={data.age}
          onValueChange={(value) => updateField('age', value)}
          minimumTrackTintColor="#FF6B00"
          maximumTrackTintColor="#E5E7EB"
        />
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(700)} style={{ marginBottom: 20 }}>
        <Text style={styles.label}>Height</Text>
        <Text style={styles.subtitleField}>This is purely for nutritional guidance and privacy is maintained.</Text>
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderValue}>{data.height} cm</Text>
          <Slider
            style={styles.slider}
            minimumValue={120}
            maximumValue={220}
            step={1}
            value={data.height}
            onValueChange={(value) => updateField('height', value)}
            minimumTrackTintColor="#FF6B00"
            maximumTrackTintColor="#E5E7EB"
          />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(800)} style={{ marginBottom: 20 }}>
        <Text style={styles.label}>Weight</Text>
        <Text style={styles.subtitleField}>This is purely for nutritional guidance and privacy is maintained.</Text>
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderValue}>{data.weight} kg</Text>
          <Slider
            style={styles.slider}
            minimumValue={30}
            maximumValue={200}
            step={1}
            value={data.weight}
            onValueChange={(value) => updateField('weight', value)}
            minimumTrackTintColor="#FF6B00"
            maximumTrackTintColor="#E5E7EB"
          />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(700)} style={styles.section}>
        <Text style={styles.label}>What's your gender?</Text>
        <Text style={styles.subtitleField}>Some tips and features are tailored by gender.</Text>
        <View style={styles.genderContainer}>
          <TouchableOpacity
            onPress={() => updateField('gender', 'Male')}
            style={[
              styles.genderButton,
              data.gender === 'Male' && styles.selectedGender,
            ]}
          >
            <Ionicons name="male" size={24} color={data.gender === 'Male' ? 'white' : '#1F2933'} />
            <Text style={[
              styles.genderText,
              data.gender === 'Male' && styles.selectedGenderText
            ]}>Male</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => updateField('gender', 'Female')}
            style={[
              styles.genderButton,
              data.gender === 'Female' && styles.selectedGender,
            ]}
          >
            <Ionicons name="female" size={24} color={data.gender === 'Female' ? 'white' : '#1F2933'} />
            <Text style={[
              styles.genderText,
              data.gender === 'Female' && styles.selectedGenderText
            ]}>Female</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {data.height > 0 && data.weight > 0 && (
        <Animated.View entering={FadeInUp.delay(900)} style={styles.bmiContainer}>
          <Text style={styles.bmiValue}>BMI: {data.BMI.toFixed(1)}</Text>
          <View style={styles.bmiBar}>
            <View style={[styles.bmiSegment, { backgroundColor: '#22C55E', flex: 18.5 }]} />
            <View style={[styles.bmiSegment, { backgroundColor: '#F59E0B', flex: 6.5 }]} />
            <View style={[styles.bmiSegment, { backgroundColor: '#F59E0B', flex: 5 }]} />
            <View style={[styles.bmiSegment, { backgroundColor: '#EF4444', flex: 10 }]} />
            <View style={[styles.bmiThumb, { left: `${Math.min((data.BMI / 40) * 100, 100)}%` }]} />
          </View>
          <View style={styles.bmiAnnotations}>
            <Text style={styles.annotation}>{getBmiLabel()}</Text>
          </View>
        </Animated.View>
      )}

      <View style={styles.nextButtonContainer}>
        <TouchableOpacity onPress={onNext} style={styles.nextButton}>
          <Text style={styles.nextButtonText}>Next</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>
      </View>
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
    fontSize: 28,
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
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2933',
    marginBottom: 5,
  },
  subtitleField: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6B7280',
    marginBottom: 10,
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
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  icon: {
    marginRight: 10,
  },
  picker: {
    flex: 1,
    height: 50,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    justifyContent: 'space-around',
    marginTop: 10,
  },
  genderButton: {
    flex: 1,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    marginHorizontal: 5,
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
    alignItems: 'center',
  },
  bmiText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2933',
  },
  bmiBar: {
    height: 10,
    width: '100%',
    flexDirection: 'row',
    borderRadius: 5,
    marginBottom: 10,
    position: 'relative',
  },
  bmiFill: {
    height: 10,
    backgroundColor: '#22C55E',
    borderRadius: 5,
  },
  bmiValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2933',
    textAlign: 'center',
  },
  bmiLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 10,
  },
  bmiSegment: {
    height: 10,
    borderRadius: 5,
  },
  bmiThumb: {
    position: 'absolute',
    top: -5,
    width: 10,
    height: 20,
    backgroundColor: '#FF6B00',
    borderRadius: 5,
  },
  bmiAnnotations: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  annotation: {
    fontSize: 12,
    color: '#6B7280',
  },
  nextButtonContainer: {
    alignItems: 'flex-end',
    marginTop: 20,
    marginBottom: 20,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B00',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});

export default Personal