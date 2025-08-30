import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { Chip } from 'react-native-paper';
import Animated, { FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Slider from '@react-native-community/slider';

interface GoalsData {
  health_goals: string[];
  dietary_preferences: string[];
  budget_for_food: number;
}

interface Props {
  user_name?: string;
  data: GoalsData;
  onChange: (data: GoalsData) => void;
  onNext?: () => void;
  onBack?: () => void;
}

const goalsList = [
  { name: 'Weight Loss', icon: 'chart-bar' },
  { name: 'Improve Immunity', icon: 'shield' },
  { name: 'Increase Energy', icon: 'flash' },
  { name: 'Muscle Gain', icon: 'trending-up' },
  { name: 'Better Health', icon: 'heart' },
  { name: 'Disease Management', icon: 'pulse' }
];
const preferencesList = ['Vegan', 'Vegetarian', 'Jain', 'Low-sodium', 'Gluten-free', 'Keto', 'Low-carb'];

const Goals: React.FC<Props> = ({ user_name, data, onChange, onNext, onBack }) => {
  const [showCustomGoalInput, setShowCustomGoalInput] = React.useState(false);
  const [showCustomPreferenceInput, setShowCustomPreferenceInput] = React.useState(false);
  const [customGoalText, setCustomGoalText] = React.useState('');
  const [customPreferenceText, setCustomPreferenceText] = React.useState('');
  const toggleGoal = (goal: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newGoals = data.health_goals.includes(goal) ? data.health_goals.filter(g => g !== goal) : [...data.health_goals, goal];
    onChange({ ...data, health_goals: newGoals });
  };

  const togglePreference = (pref: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newPreferences = data.dietary_preferences.includes(pref) ? data.dietary_preferences.filter(p => p !== pref) : [...data.dietary_preferences, pref];
    onChange({ ...data, dietary_preferences: newPreferences });
  };

  const addCustomGoal = () => {
    setShowCustomGoalInput(true);
  };

  const confirmCustomGoal = () => {
    if (customGoalText.trim()) {
      const newGoals = [...data.health_goals, customGoalText.trim()];
      onChange({ ...data, health_goals: newGoals });
      setCustomGoalText('');
      setShowCustomGoalInput(false);
    }
  };

  const removeCustomGoal = (index: number) => {
    const newGoals = data.health_goals.filter((_, i) => i !== index);
    onChange({ ...data, health_goals: newGoals });
  };

  const addCustomPreference = () => {
    setShowCustomPreferenceInput(true);
  };

  const confirmCustomPreference = () => {
    if (customPreferenceText.trim()) {
      const newPreferences = [...data.dietary_preferences, customPreferenceText.trim()];
      onChange({ ...data, dietary_preferences: newPreferences });
      setCustomPreferenceText('');
      setShowCustomPreferenceInput(false);
    }
  };

  const removeCustomPreference = (index: number) => {
    const newPreferences = data.dietary_preferences.filter((_, i) => i !== index);
    onChange({ ...data, dietary_preferences: newPreferences });
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <Animated.Text entering={FadeInUp.delay(100)} style={styles.title}>Hey{user_name ? `, ${user_name}` : ''}! 👋 Let’s start with your goals.</Animated.Text>
        <Animated.Text entering={FadeInUp.delay(200)} style={styles.instruction}>Choose at least 3 goals that matter most to you.</Animated.Text>

        <Animated.View entering={FadeInUp.delay(300)} style={styles.section}>
          <Text style={styles.sectionTitle}>Health Goals</Text>
          <Text style={{ fontSize: 12, fontWeight: '400', color: '#6B7280', marginBottom: 10 }}>These goals help us tailor recipes to your specific health objectives.</Text>
          <View style={styles.goalsContainer}>
            {goalsList.map((goal, index) => (
              <Animated.View key={goal.name} entering={FadeInUp.delay(400 + index * 100)}>
                <TouchableOpacity onPress={() => toggleGoal(goal.name)} style={styles.goalCard}>
                  <MaterialCommunityIcons name={goal.icon as any} size={24} color="#1F2933" />
                  <Text style={styles.goalText}>{goal.name}</Text>
                  <MaterialCommunityIcons name={data.health_goals.includes(goal.name) ? 'checkbox-marked' : 'checkbox-blank-outline'} size={24} color="#FF6B00" />
                </TouchableOpacity>
              </Animated.View>
            ))}
            {data.health_goals.map((goal, index) => {
              if (goalsList.some(g => g.name === goal) || preferencesList.includes(goal)) return null;
              return (
                <Animated.View key={`custom-${index}`} entering={FadeInUp.delay(500 + index * 100)}>
                  <View style={styles.customGoalCard}>
                    <TouchableOpacity onPress={() => toggleGoal(goal)} style={styles.goalCardInner}>
                      <Text style={styles.goalText}>{goal}</Text>
                      <MaterialCommunityIcons name={data.health_goals.includes(goal) ? 'checkbox-marked' : 'checkbox-blank-outline'} size={24} color="#FF6B00" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => removeCustomGoal(index)} style={styles.removeButton}>
                      <MaterialCommunityIcons name="minus" size={12} color="#1F2933" />
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              );
            })}
            <TouchableOpacity onPress={addCustomGoal} style={styles.addButton}>
              <MaterialCommunityIcons name="plus" size={20} color="#1F2933" />
            </TouchableOpacity>
          </View>
          {showCustomGoalInput && (
            <View style={styles.customInputContainer}>
              <TextInput
                value={customGoalText}
                onChangeText={setCustomGoalText}
                placeholder="Enter custom goal"
                style={styles.customInput}
                onSubmitEditing={confirmCustomGoal}
                autoFocus
              />
              <TouchableOpacity onPress={confirmCustomGoal} style={styles.confirmButton}>
                <MaterialCommunityIcons name="check" size={16} color="white" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setShowCustomGoalInput(false); setCustomGoalText(''); }} style={styles.cancelButton}>
                <MaterialCommunityIcons name="close" size={16} color="#1F2933" />
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(600)} style={styles.section}>
          <Text style={styles.sectionTitle}>Set your weekly food budget</Text>
          <Text style={styles.helperText}>Helps us recommend affordable food options.</Text>
          <Text style={styles.budgetValue}>₹{data.budget_for_food}</Text>
          <Slider
            minimumValue={0}
            maximumValue={10000}
            step={100}
            value={data.budget_for_food}
            onValueChange={(value: number) => onChange({ ...data, budget_for_food: value })}
            style={styles.slider}
            minimumTrackTintColor="#FF6B00"
            maximumTrackTintColor="#E5E7EB"
            thumbTintColor="#FF6B00"
          />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(700)} style={styles.section}>
          <Text style={styles.sectionTitle}>Dietary Preferences</Text>
          <Text style={{ fontSize: 12, fontWeight: '400', color: '#6B7280', marginBottom: 10 }}>Your dietary preferences ensure we suggest meals that align with your lifestyle and restrictions.</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            <View style={styles.chipContainer}>
              {preferencesList.map((pref, index) => (
                <Animated.View key={pref} entering={FadeInUp.delay(800 + index * 50)}>
                  <Chip
                    selected={data.dietary_preferences.includes(pref)}
                    onPress={() => togglePreference(pref)}
                    style={[styles.chip, data.dietary_preferences.includes(pref) && styles.selectedChip]}
                    textStyle={{ color: data.dietary_preferences.includes(pref) ? '#FFFFFF' : '#1F2933' }}
                  >
                    {pref}
                  </Chip>
                </Animated.View>
              ))}
              {data.dietary_preferences.map((pref, index) => {
                if (preferencesList.includes(pref) || goalsList.some(g => g.name === pref)) return null;
                return (
                  <Animated.View key={`custom-pref-${index}`} entering={FadeInUp.delay(900 + index * 100)}>
                    <View style={{ position: 'relative', margin: 5 }}>
                      <TouchableOpacity
                        onPress={() => togglePreference(pref)}
                        style={{
                          padding: 10,
                          backgroundColor: data.dietary_preferences.includes(pref) ? '#FF6B00' : '#FFFFFF',
                          borderRadius: 20,
                          borderWidth: 1,
                          borderColor: '#E5E7EB',
                          paddingRight: 30
                        }}
                      >
                        <Text style={{ color: data.dietary_preferences.includes(pref) ? 'white' : '#1F2933', fontSize: 14 }}>{pref}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => removeCustomPreference(index)}
                        style={{
                          position: 'absolute',
                          top: -5,
                          right: -5,
                          width: 20,
                          height: 20,
                          borderRadius: 10,
                          backgroundColor: '#E5E7EB',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <MaterialCommunityIcons name="minus" size={12} color="#1F2933" />
                      </TouchableOpacity>
                    </View>
                  </Animated.View>
                );
              })}
              <TouchableOpacity onPress={addCustomPreference} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center', margin: 5, alignSelf: 'flex-start' }}>
                <MaterialCommunityIcons name="plus" size={20} color="#1F2933" />
              </TouchableOpacity>
            </View>
          </ScrollView>
          {showCustomPreferenceInput && (
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 20, padding: 10, margin: 5, borderWidth: 1, borderColor: '#E5E7EB', alignSelf: 'flex-start' }}>
              <TextInput
                value={customPreferenceText}
                onChangeText={setCustomPreferenceText}
                placeholder="Enter custom preference"
                style={{ flex: 1, fontSize: 14, color: '#1F2933', minWidth: 150 }}
                onSubmitEditing={confirmCustomPreference}
                autoFocus
              />
              <TouchableOpacity onPress={confirmCustomPreference} style={{ marginLeft: 10, width: 30, height: 30, borderRadius: 15, backgroundColor: '#FF6B00', alignItems: 'center', justifyContent: 'center' }}>
                <MaterialCommunityIcons name="check" size={16} color="white" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setShowCustomPreferenceInput(false); setCustomPreferenceText(''); }} style={{ marginLeft: 5, width: 30, height: 30, borderRadius: 15, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' }}>
                <MaterialCommunityIcons name="close" size={16} color="#1F2933" />
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
        <Animated.View entering={FadeInUp.delay(800)} style={styles.buttonContainer}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#1F2933" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onNext} style={styles.nextButton}>
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        </Animated.View>
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
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    margin: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
  },
  selectedChip: {
    backgroundColor: '#FF6B00',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 5,
  },
  instruction: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  goalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    margin: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    width: 280,
  },
  goalText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2933',
    marginLeft: 12,
  },
  customGoalCard: {
    position: 'relative',
    margin: 8,
  },
  goalCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    width: 280,
  },
  removeButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 8,
  },
  customInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    padding: 10,
    margin: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  customInput: {
    flex: 1,
    fontSize: 14,
    color: '#1F2933',
    minWidth: 150,
  },
  confirmButton: {
    marginLeft: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FF6B00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    marginLeft: 5,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  budgetValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FF6B00',
    textAlign: 'center',
    marginBottom: 10,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  chipScroll: {
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  backButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButton: {
    backgroundColor: '#FF6B00',
    borderRadius: 16,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default Goals