import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView,
  Alert
} from 'react-native';
import { TextInput, Button, Chip } from 'react-native-paper';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, SlideInRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface FamilyMember {
  name: string;
  role: string;
  BMI: number;
  gender: 'Male' | 'Female';
  health_conditions: string[];
  health_goals: string[];
  access_to_kitchen: string;
  stress_level: string;
  meal_source: string;
}

interface AddFamilyMemberProps {
  onAddMember: (member: FamilyMember) => void;
  onCancel: () => void;
}

const AddFamilyMember: React.FC<AddFamilyMemberProps> = ({ onAddMember, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    height: '',
    weight: '',
    gender: 'Female' as 'Male' | 'Female',
    access_to_kitchen: 'always',
    stress_level: 'low',
    meal_source: 'home_cooked'
  });

  const [selectedHealthConditions, setSelectedHealthConditions] = useState<string[]>([]);
  const [selectedHealthGoals, setSelectedHealthGoals] = useState<string[]>([]);
  const [customCondition, setCustomCondition] = useState('');
  const [customGoal, setCustomGoal] = useState('');

  const commonHealthConditions = [
    'Hypertension', 'Diabetes', 'Pre-diabetic', 'Anemia', 'High Cholesterol',
    'Vitamin D deficiency', 'Thyroid issues', 'Heart disease', 'Obesity', 'Arthritis'
  ];

  const commonHealthGoals = [
    'Lose weight', 'Gain weight', 'Maintain weight', 'Build muscle',
    'Improve energy', 'Better digestion', 'Reduce blood pressure',
    'Manage blood sugar', 'Healthier lifestyle', 'Nutritious meals'
  ];

  const roleOptions = [
    'Father', 'Mother', 'Son', 'Daughter', 'Grandfather', 'Grandmother',
    'Student', 'Working Professional', 'Homemaker', 'Retired'
  ];

  const calculateBMI = () => {
    const height = parseFloat(formData.height);
    const weight = parseFloat(formData.weight);
    if (height && weight) {
      const heightInMeters = height / 100;
      return weight / (heightInMeters * heightInMeters);
    }
    return 0;
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }
    if (!formData.height || !formData.weight) {
      Alert.alert('Error', 'Please enter height and weight');
      return;
    }

    const bmi = calculateBMI();
    if (bmi < 10 || bmi > 50) {
      Alert.alert('Error', 'Please check height and weight values');
      return;
    }

    const newMember: FamilyMember = {
      name: formData.name.trim(),
      role: formData.role || 'Family Member',
      BMI: bmi,
      gender: formData.gender,
      health_conditions: selectedHealthConditions,
      health_goals: selectedHealthGoals,
      access_to_kitchen: formData.access_to_kitchen,
      stress_level: formData.stress_level,
      meal_source: formData.meal_source
    };

    onAddMember(newMember);
  };

  const toggleHealthCondition = (condition: string) => {
    setSelectedHealthConditions(prev => 
      prev.includes(condition) 
        ? prev.filter(c => c !== condition)
        : [...prev, condition]
    );
  };

  const toggleHealthGoal = (goal: string) => {
    setSelectedHealthGoals(prev => 
      prev.includes(goal) 
        ? prev.filter(g => g !== goal)
        : [...prev, goal]
    );
  };

  const addCustomCondition = () => {
    if (customCondition.trim() && !selectedHealthConditions.includes(customCondition.trim())) {
      setSelectedHealthConditions([...selectedHealthConditions, customCondition.trim()]);
      setCustomCondition('');
    }
  };

  const addCustomGoal = () => {
    if (customGoal.trim() && !selectedHealthGoals.includes(customGoal.trim())) {
      setSelectedHealthGoals([...selectedHealthGoals, customGoal.trim()]);
      setCustomGoal('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2933" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Family Member</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Welcome Card */}
        <Animated.View entering={FadeInUp.delay(100)}>
          <LinearGradient
            colors={['#FF6B00', '#FFA366']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.welcomeCard}
          >
            <MaterialIcons name="person-add" size={32} color="#FFF" />
            <Text style={styles.welcomeTitle}>Add a New Family Member</Text>
            <Text style={styles.welcomeSubtitle}>
              Help us track everyone's health journey together
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* Basic Information */}
        <Animated.View entering={SlideInRight.delay(200)} style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <TextInput
            label="Name *"
            value={formData.name}
            onChangeText={(text) => setFormData({...formData, name: text})}
            mode="outlined"
            style={styles.input}
          />

          <View style={styles.roleContainer}>
            <Text style={styles.inputLabel}>Role in Family</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.roleScroll}>
              {roleOptions.map((role, index) => (
                <Chip
                  key={index}
                  selected={formData.role === role}
                  onPress={() => setFormData({...formData, role})}
                  style={[styles.roleChip, formData.role === role && styles.selectedChip]}
                  textStyle={formData.role === role ? styles.selectedChipText : styles.chipText}
                >
                  {role}
                </Chip>
              ))}
            </ScrollView>
          </View>

          {/* Gender Selection */}
          <View style={styles.genderContainer}>
            <Text style={styles.inputLabel}>Gender</Text>
            <View style={styles.genderButtons}>
              <TouchableOpacity
                style={[styles.genderButton, formData.gender === 'Male' && styles.selectedGenderButton]}
                onPress={() => setFormData({...formData, gender: 'Male'})}
              >
                <MaterialIcons name="man" size={24} color={formData.gender === 'Male' ? '#FFF' : '#FF6B00'} />
                <Text style={[styles.genderText, formData.gender === 'Male' && styles.selectedGenderText]}>
                  Male
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.genderButton, formData.gender === 'Female' && styles.selectedGenderButton]}
                onPress={() => setFormData({...formData, gender: 'Female'})}
              >
                <MaterialIcons name="woman" size={24} color={formData.gender === 'Female' ? '#FFF' : '#FF6B00'} />
                <Text style={[styles.genderText, formData.gender === 'Female' && styles.selectedGenderText]}>
                  Female
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Height and Weight */}
          <View style={styles.row}>
            <TextInput
              label="Height (cm) *"
              value={formData.height}
              onChangeText={(text) => setFormData({...formData, height: text})}
              mode="outlined"
              keyboardType="numeric"
              style={[styles.input, styles.halfInput]}
            />
            <TextInput
              label="Weight (kg) *"
              value={formData.weight}
              onChangeText={(text) => setFormData({...formData, weight: text})}
              mode="outlined"
              keyboardType="numeric"
              style={[styles.input, styles.halfInput]}
            />
          </View>

          {/* BMI Display */}
          {formData.height && formData.weight && (
            <View style={styles.bmiDisplay}>
              <MaterialIcons name="monitor-weight" size={20} color="#FF6B00" />
              <Text style={styles.bmiText}>BMI: {calculateBMI().toFixed(1)}</Text>
            </View>
          )}
        </Animated.View>

        {/* Health Conditions */}
        <Animated.View entering={SlideInRight.delay(300)} style={styles.section}>
          <Text style={styles.sectionTitle}>Health Conditions</Text>
          <Text style={styles.sectionSubtitle}>Select any current health conditions</Text>
          
          <View style={styles.chipContainer}>
            {commonHealthConditions.map((condition, index) => (
              <Chip
                key={index}
                selected={selectedHealthConditions.includes(condition)}
                onPress={() => toggleHealthCondition(condition)}
                style={[styles.chip, selectedHealthConditions.includes(condition) && styles.selectedChip]}
                textStyle={selectedHealthConditions.includes(condition) ? styles.selectedChipText : styles.chipText}
              >
                {condition}
              </Chip>
            ))}
          </View>

          <View style={styles.customInputContainer}>
            <TextInput
              label="Add custom condition"
              value={customCondition}
              onChangeText={setCustomCondition}
              mode="outlined"
              style={[styles.input, styles.customInput]}
              right={
                <TextInput.Icon 
                  icon="plus" 
                  onPress={addCustomCondition}
                  disabled={!customCondition.trim()}
                />
              }
            />
          </View>
        </Animated.View>

        {/* Health Goals */}
        <Animated.View entering={SlideInRight.delay(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>Health Goals</Text>
          <Text style={styles.sectionSubtitle}>What are their health objectives?</Text>
          
          <View style={styles.chipContainer}>
            {commonHealthGoals.map((goal, index) => (
              <Chip
                key={index}
                selected={selectedHealthGoals.includes(goal)}
                onPress={() => toggleHealthGoal(goal)}
                style={[styles.chip, selectedHealthGoals.includes(goal) && styles.selectedChip]}
                textStyle={selectedHealthGoals.includes(goal) ? styles.selectedChipText : styles.chipText}
              >
                {goal}
              </Chip>
            ))}
          </View>

          <View style={styles.customInputContainer}>
            <TextInput
              label="Add custom goal"
              value={customGoal}
              onChangeText={setCustomGoal}
              mode="outlined"
              style={[styles.input, styles.customInput]}
              right={
                <TextInput.Icon 
                  icon="plus" 
                  onPress={addCustomGoal}
                  disabled={!customGoal.trim()}
                />
              }
            />
          </View>
        </Animated.View>

        {/* Lifestyle Information */}
        <Animated.View entering={SlideInRight.delay(500)} style={styles.section}>
          <Text style={styles.sectionTitle}>Lifestyle</Text>
          
          <View style={styles.lifestyleOption}>
            <Text style={styles.optionLabel}>Kitchen Access</Text>
            <View style={styles.optionButtons}>
              {['always', 'sometimes', 'rarely'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton, 
                    formData.access_to_kitchen === option && styles.selectedOptionButton
                  ]}
                  onPress={() => setFormData({...formData, access_to_kitchen: option})}
                >
                  <Text style={[
                    styles.optionButtonText,
                    formData.access_to_kitchen === option && styles.selectedOptionButtonText
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.lifestyleOption}>
            <Text style={styles.optionLabel}>Stress Level</Text>
            <View style={styles.optionButtons}>
              {['low', 'moderate', 'high'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton, 
                    formData.stress_level === option && styles.selectedOptionButton
                  ]}
                  onPress={() => setFormData({...formData, stress_level: option})}
                >
                  <Text style={[
                    styles.optionButtonText,
                    formData.stress_level === option && styles.selectedOptionButtonText
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.lifestyleOption}>
            <Text style={styles.optionLabel}>Primary Meal Source</Text>
            <View style={styles.optionButtons}>
              {['home_cooked', 'take_out', 'fast_food', 'mixed'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton, 
                    formData.meal_source === option && styles.selectedOptionButton
                  ]}
                  onPress={() => setFormData({...formData, meal_source: option})}
                >
                  <Text style={[
                    styles.optionButtonText,
                    formData.meal_source === option && styles.selectedOptionButtonText
                  ]}>
                    {option.replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Animated.View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <Button mode="outlined" onPress={onCancel} style={styles.footerButton}>
          Cancel
        </Button>
        <Button mode="contained" onPress={handleSubmit} style={styles.footerButton}>
          Add Member
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7F9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2933',
  },
  placeholder: {
    width: 40,
  },
  scrollContainer: {
    flex: 1,
    padding: 20,
  },
  welcomeCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginTop: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
    textAlign: 'center',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2933',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#FFF',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  bmiDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  bmiText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F57C00',
    marginLeft: 8,
  },
  roleContainer: {
    marginBottom: 16,
  },
  roleScroll: {
    flexDirection: 'row',
  },
  roleChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  genderContainer: {
    marginBottom: 16,
  },
  genderButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF6B00',
    marginHorizontal: 4,
  },
  selectedGenderButton: {
    backgroundColor: '#FF6B00',
  },
  genderText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF6B00',
    marginLeft: 8,
  },
  selectedGenderText: {
    color: '#FFF',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
  },
  selectedChip: {
    backgroundColor: '#FF6B00',
  },
  chipText: {
    color: '#374151',
  },
  selectedChipText: {
    color: '#FFF',
  },
  customInputContainer: {
    marginTop: 8,
  },
  customInput: {
    backgroundColor: '#FFF',
  },
  lifestyleOption: {
    marginBottom: 20,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  optionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginRight: 8,
    marginBottom: 8,
  },
  selectedOptionButton: {
    backgroundColor: '#FF6B00',
    borderColor: '#FF6B00',
  },
  optionButtonText: {
    fontSize: 14,
    color: '#374151',
    textTransform: 'capitalize',
  },
  selectedOptionButtonText: {
    color: '#FFF',
  },
  bottomSpacing: {
    height: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default AddFamilyMember;
