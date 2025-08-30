import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native'
import React from 'react'

interface LifestyleData {
  occupation: string;
  workSchedule: string;
  kitchenAccess: string;
  stressLevel: number;
  mealSource: string;
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
  { level: 1, label: 'Low' },
  { level: 2, label: 'Moderate' },
  { level: 3, label: 'High' }
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
              onPress={() => select('occupation', occ)}
              style={{
                padding: 10,
                margin: 5,
                backgroundColor: data.occupation === occ ? '#FF6B00' : '#FFFFFF',
                borderRadius: 20,
                borderWidth: 1,
                borderColor: '#E5E7EB'
              }}
            >
              <Text style={{ color: data.occupation === occ ? 'white' : '#1F2933', fontSize: 14 }}>{occ}</Text>
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
              onPress={() => select('workSchedule', ws)}
              style={{
                padding: 10,
                margin: 5,
                backgroundColor: data.workSchedule === ws ? '#FF6B00' : '#FFFFFF',
                borderRadius: 20,
                borderWidth: 1,
                borderColor: '#E5E7EB'
              }}
            >
              <Text style={{ color: data.workSchedule === ws ? 'white' : '#1F2933', fontSize: 14 }}>{ws}</Text>
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
              onPress={() => select('kitchenAccess', ka)}
              style={{
                padding: 10,
                margin: 5,
                backgroundColor: data.kitchenAccess === ka ? '#FF6B00' : '#FFFFFF',
                borderRadius: 20,
                borderWidth: 1,
                borderColor: '#E5E7EB'
              }}
            >
              <Text style={{ color: data.kitchenAccess === ka ? 'white' : '#1F2933', fontSize: 14 }}>{ka}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', color: '#1F2933', marginBottom: 10 }}>Typical Stress Level</Text>
        <View style={{ flexDirection: 'row', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB' }}>
          {stressLevels.map((sl, index) => (
            <TouchableOpacity
              key={sl.level}
              onPress={() => select('stressLevel', sl.level)}
              style={{
                flex: 1,
                padding: 15,
                backgroundColor: data.stressLevel === sl.level ? '#FF6B00' : '#FFFFFF',
                alignItems: 'center',
                borderRightWidth: index < 2 ? 1 : 0,
                borderRightColor: '#E5E7EB'
              }}
            >
              <Text style={{ color: data.stressLevel === sl.level ? 'white' : '#1F2933', fontSize: 16 }}>{sl.label}</Text>
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
              onPress={() => select('mealSource', ms)}
              style={{
                padding: 10,
                margin: 5,
                backgroundColor: data.mealSource === ms ? '#FF6B00' : '#FFFFFF',
                borderRadius: 20,
                borderWidth: 1,
                borderColor: '#E5E7EB'
              }}
            >
              <Text style={{ color: data.mealSource === ms ? 'white' : '#1F2933', fontSize: 14 }}>{ms}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
    </SafeAreaView>
  )
}

export default Lifestyle