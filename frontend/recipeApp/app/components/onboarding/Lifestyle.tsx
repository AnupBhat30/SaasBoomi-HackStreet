import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native'
import React from 'react'

interface LifestyleData {
  occupation_type: string;
  work_schedule: string;
  access_to_kitchen: string;
  stress_level: string;
  meal_source: string;
}

interface Props {
  data: LifestyleData;
  onChange: (data: LifestyleData) => void;
}

const occupations = ['Student', 'Homemaker', 'Office worker', 'Self-employed', 'Retired'];
const workSchedules = ['9-5', 'Shift work', 'Flexible', 'Irregular', 'No work'];
const kitchenAccesses = ['Always', 'Often', 'Sometimes', 'Rarely', 'Never'];
const mealSources = ['Home cooked', 'Fast food', 'Roadside', 'Canteen', 'Restaurant', 'Delivery'];
const stressLevels = [
  { level: 'low', label: 'Low' },
  { level: 'moderate', label: 'Moderate' },
  { level: 'high', label: 'High' }
];

const Lifestyle: React.FC<Props> = ({ data, onChange }) => {
  const select = (field: keyof LifestyleData, value: string | number) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView style={{ flex: 1, padding: 20, backgroundColor: '#FFFFFF', borderRadius: 24 }}>
      <Text style={{ fontSize: 32, fontWeight: '700', color: '#1F2933', marginBottom: 8 }}>Your Lifestyle</Text>
      <Text style={{ fontSize: 14, fontWeight: '400', color: '#6B7280', marginBottom: 20 }}>Understanding your routine helps us suggest practical recipes.</Text>

      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2933', marginBottom: 10 }}>Occupation Type</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {occupations.map((occ) => (
            <TouchableOpacity
              key={occ}
              onPress={() => select('occupation_type', occ)}
              style={{
                padding: 10,
                margin: 5,
                backgroundColor: data.occupation_type === occ ? '#FF6B00' : '#FFFFFF',
                borderRadius: 20,
                borderWidth: 1,
                borderColor: '#E5E7EB'
              }}
            >
              <Text style={{ color: data.occupation_type === occ ? 'white' : '#1F2933', fontSize: 14 }}>{occ}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2933', marginBottom: 10 }}>Work Schedule</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {workSchedules.map((ws) => (
            <TouchableOpacity
              key={ws}
              onPress={() => select('work_schedule', ws)}
              style={{
                padding: 10,
                margin: 5,
                backgroundColor: data.work_schedule === ws ? '#FF6B00' : '#FFFFFF',
                borderRadius: 20,
                borderWidth: 1,
                borderColor: '#E5E7EB'
              }}
            >
              <Text style={{ color: data.work_schedule === ws ? 'white' : '#1F2933', fontSize: 14 }}>{ws}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2933', marginBottom: 10 }}>Access to Kitchen</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {kitchenAccesses.map((ka) => (
            <TouchableOpacity
              key={ka}
              onPress={() => select('access_to_kitchen', ka)}
              style={{
                padding: 10,
                margin: 5,
                backgroundColor: data.access_to_kitchen === ka ? '#FF6B00' : '#FFFFFF',
                borderRadius: 20,
                borderWidth: 1,
                borderColor: '#E5E7EB'
              }}
            >
              <Text style={{ color: data.access_to_kitchen === ka ? 'white' : '#1F2933', fontSize: 14 }}>{ka}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', color: '#1F2933', marginBottom: 10 }}>Typical Stress Level</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {stressLevels.map((sl) => (
            <TouchableOpacity
              key={sl.level}
              onPress={() => select('stress_level', sl.level)}
              style={{
                padding: 10,
                margin: 5,
                backgroundColor: data.stress_level === sl.level ? '#FF6B00' : '#FFFFFF',
                borderRadius: 20,
                borderWidth: 1,
                borderColor: '#E5E7EB'
              }}
            >
              <Text style={{ color: data.stress_level === sl.level ? 'white' : '#1F2933', fontSize: 14 }}>{sl.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2933', marginBottom: 10 }}>Meal Source</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {mealSources.map((ms) => (
            <TouchableOpacity
              key={ms}
              onPress={() => select('meal_source', ms)}
              style={{
                padding: 10,
                margin: 5,
                backgroundColor: data.meal_source === ms ? '#FF6B00' : '#FFFFFF',
                borderRadius: 20,
                borderWidth: 1,
                borderColor: '#E5E7EB'
              }}
            >
              <Text style={{ color: data.meal_source === ms ? 'white' : '#1F2933', fontSize: 14 }}>{ms}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
    </SafeAreaView>
  )
}

export default Lifestyle