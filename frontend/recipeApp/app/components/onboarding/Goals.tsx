import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { Chip } from 'react-native-paper';
import Animated, { FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface GoalsData {
  health_goals: string[];
  budget_for_food: number;
}

interface Props {
  data: GoalsData;
  onChange: (data: GoalsData) => void;
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

const Goals: React.FC<Props> = ({ data, onChange }) => {
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
    const newPreferences = data.health_goals.includes(pref) ? data.health_goals.filter(p => p !== pref) : [...data.health_goals, pref];
    onChange({ ...data, health_goals: newPreferences });
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
      const newPreferences = [...data.health_goals, customPreferenceText.trim()];
      onChange({ ...data, health_goals: newPreferences });
      setCustomPreferenceText('');
      setShowCustomPreferenceInput(false);
    }
  };

  const removeCustomPreference = (index: number) => {
    const newPreferences = data.health_goals.filter((_, i) => i !== index);
    onChange({ ...data, health_goals: newPreferences });
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <Animated.Text entering={FadeInUp.delay(100)} style={styles.title}>Your Goals</Animated.Text>
        <Animated.Text entering={FadeInUp.delay(200)} style={styles.subtitle}>Let's set your targets. We'll help you get there.</Animated.Text>

        <Animated.View entering={FadeInUp.delay(300)} style={styles.section}>
          <Text style={styles.sectionTitle}>Health Goals</Text>
          <View style={styles.chipContainer}>
            {goalsList.map((goal, index) => (
              <Animated.View key={goal.name} entering={FadeInUp.delay(400 + index * 100)}>
                <Chip
                  selected={data.health_goals.includes(goal.name)}
                  onPress={() => toggleGoal(goal.name)}
                  icon={goal.icon}
                  style={[styles.chip, data.health_goals.includes(goal.name) && styles.selectedChip]}
                  textStyle={{ color: data.health_goals.includes(goal.name) ? '#FFFFFF' : '#1F2933' }}
                >
                  {goal.name}
                </Chip>
              </Animated.View>
            ))}
            {data.health_goals.map((goal, index) => {
              if (goalsList.some(g => g.name === goal) || preferencesList.includes(goal)) return null;
              return (
                <Animated.View key={`custom-${index}`} entering={FadeInUp.delay(500 + index * 100)}>
                  <View style={{ position: 'relative', margin: 5 }}>
                    <TouchableOpacity
                      onPress={() => toggleGoal(goal)}
                      style={{
                        padding: 10,
                        backgroundColor: data.health_goals.includes(goal) ? '#FF6B00' : '#FFFFFF',
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                        paddingRight: 30
                      }}
                    >
                      <Text style={{ color: data.health_goals.includes(goal) ? 'white' : '#1F2933', fontSize: 14 }}>{goal}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => removeCustomGoal(index)}
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
            <TouchableOpacity onPress={addCustomGoal} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center', margin: 5, alignSelf: 'flex-start' }}>
              <MaterialCommunityIcons name="plus" size={20} color="#1F2933" />
            </TouchableOpacity>
          </View>
          {showCustomGoalInput && (
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 20, padding: 10, margin: 5, borderWidth: 1, borderColor: '#E5E7EB', alignSelf: 'flex-start' }}>
              <TextInput
                value={customGoalText}
                onChangeText={setCustomGoalText}
                placeholder="Enter custom goal"
                style={{ flex: 1, fontSize: 14, color: '#1F2933', minWidth: 150 }}
                onSubmitEditing={confirmCustomGoal}
                autoFocus
              />
              <TouchableOpacity onPress={confirmCustomGoal} style={{ marginLeft: 10, width: 30, height: 30, borderRadius: 15, backgroundColor: '#FF6B00', alignItems: 'center', justifyContent: 'center' }}>
                <MaterialCommunityIcons name="check" size={16} color="white" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setShowCustomGoalInput(false); setCustomGoalText(''); }} style={{ marginLeft: 5, width: 30, height: 30, borderRadius: 15, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' }}>
                <MaterialCommunityIcons name="close" size={16} color="#1F2933" />
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(600)} style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Food Budget (₹)</Text>
          <TextInput
            value={data.budget_for_food.toString()}
            onChangeText={(text) => onChange({ ...data, budget_for_food: parseInt(text) || 0 })}
            keyboardType='numeric'
            placeholder="Enter your weekly budget..."
            style={styles.input}
          />
          <Text style={styles.helperText}>This helps us find foods within your budget.</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(700)} style={styles.section}>
          <Text style={styles.sectionTitle}>Dietary Preferences</Text>
          <View style={styles.chipContainer}>
            {preferencesList.map((pref, index) => (
              <Animated.View key={pref} entering={FadeInUp.delay(800 + index * 50)}>
                <Chip
                  selected={data.health_goals.includes(pref)}
                  onPress={() => togglePreference(pref)}
                  style={[styles.chip, data.health_goals.includes(pref) && styles.selectedChip]}
                  textStyle={{ color: data.health_goals.includes(pref) ? '#FFFFFF' : '#1F2933' }}
                >
                  {pref}
                </Chip>
              </Animated.View>
            ))}
            {data.health_goals.map((pref, index) => {
              if (preferencesList.includes(pref) || goalsList.some(g => g.name === pref)) return null;
              return (
                <Animated.View key={`custom-pref-${index}`} entering={FadeInUp.delay(900 + index * 100)}>
                  <View style={{ position: 'relative', margin: 5 }}>
                    <TouchableOpacity
                      onPress={() => togglePreference(pref)}
                      style={{
                        padding: 10,
                        backgroundColor: data.health_goals.includes(pref) ? '#FF6B00' : '#FFFFFF',
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                        paddingRight: 30
                      }}
                    >
                      <Text style={{ color: data.health_goals.includes(pref) ? 'white' : '#1F2933', fontSize: 14 }}>{pref}</Text>
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
});

export default Goals