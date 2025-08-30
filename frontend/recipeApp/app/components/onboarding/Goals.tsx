import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native'
import React from 'react'
import { Feather } from '@expo/vector-icons'

interface GoalsData {
  health_goals: string[];
  budget_for_food: number;
}

interface Props {
  data: GoalsData;
  onChange: (data: GoalsData) => void;
}

const goalsList = [
  { name: 'Weight Loss', icon: 'bar-chart-2' },
  { name: 'Improve Immunity', icon: 'shield' },
  { name: 'Increase Energy', icon: 'zap' },
  { name: 'Muscle Gain', icon: 'trending-up' },
  { name: 'Better Health', icon: 'heart' },
  { name: 'Disease Management', icon: 'activity' }
];
const preferencesList = ['Vegan', 'Vegetarian', 'Jain', 'Low-sodium', 'Gluten-free', 'Keto', 'Low-carb'];

const Goals: React.FC<Props> = ({ data, onChange }) => {
  const toggleGoal = (goal: string) => {
    const newGoals = data.health_goals.includes(goal) ? data.health_goals.filter(g => g !== goal) : [...data.health_goals, goal];
    onChange({ ...data, health_goals: newGoals });
  };

  const togglePreference = (pref: string) => {
    const newPreferences = data.health_goals.includes(pref) ? data.health_goals.filter(p => p !== pref) : [...data.health_goals, pref];
    onChange({ ...data, health_goals: newPreferences });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView style={{ flex: 1, padding: 20, backgroundColor: '#FFFFFF', borderRadius: 24 }}>
      <Text style={{ fontSize: 32, fontWeight: '700', color: '#1F2933', marginBottom: 8 }}>Your Goals</Text>
      <Text style={{ fontSize: 14, fontWeight: '400', color: '#6B7280', marginBottom: 20 }}>Let's set your targets. We'll help you get there.</Text>

      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2933', marginBottom: 10 }}>Health Goals</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {goalsList.map((goal) => (
            <TouchableOpacity
              key={goal.name}
              onPress={() => toggleGoal(goal.name)}
              style={{
                padding: 10,
                margin: 5,
                backgroundColor: data.health_goals.includes(goal.name) ? '#FF6B00' : '#FFFFFF',
                borderRadius: 20,
                borderWidth: 1,
                borderColor: '#E5E7EB',
                flexDirection: 'row',
                alignItems: 'center'
              }}
            >
              <Feather name={goal.icon as any} size={16} color={data.health_goals.includes(goal.name) ? 'white' : '#1F2933'} style={{ marginRight: 5 }} />
              <Text style={{ color: data.health_goals.includes(goal.name) ? 'white' : '#1F2933', fontSize: 14 }}>{goal.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2933', marginBottom: 10 }}>Weekly Food Budget (₹)</Text>
        <TextInput
          value={data.budget_for_food.toString()}
          onChangeText={(text) => onChange({ ...data, budget_for_food: parseInt(text) || 0 })}
          keyboardType='numeric'
          placeholder="Enter your weekly budget..."
          style={{ borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 10, fontSize: 16 }}
        />
        <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 5 }}>This helps us find foods within your budget.</Text>
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2933', marginBottom: 10 }}>Dietary Preferences</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {preferencesList.map((pref) => (
            <TouchableOpacity
              key={pref}
              onPress={() => togglePreference(pref)}
              style={{
                padding: 10,
                margin: 5,
                backgroundColor: data.health_goals.includes(pref) ? '#FF6B00' : '#FFFFFF',
                borderRadius: 20,
                borderWidth: 1,
                borderColor: '#E5E7EB'
              }}
            >
              <Text style={{ color: data.health_goals.includes(pref) ? 'white' : '#1F2933', fontSize: 14 }}>{pref}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
    </SafeAreaView>
  )
}

export default Goals