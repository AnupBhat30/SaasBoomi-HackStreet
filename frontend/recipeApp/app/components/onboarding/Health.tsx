import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native'
import React from 'react'
import { Feather } from '@expo/vector-icons'

interface HealthData {
  conditions: string[];
  allergies: string[];
  medication: string;
}

interface Props {
  data: HealthData;
  onChange: (data: HealthData) => void;
}

const conditionsList = [
  { name: 'Vitamin D deficiency', icon: 'sun' },
  { name: 'Anemia', icon: 'droplet' },
  { name: 'Diabetes', icon: 'activity' },
  { name: 'Hypertension', icon: 'heart' },
  { name: 'PCOS', icon: 'user' },
  { name: 'Thyroid issues', icon: 'thermometer' },
  { name: 'Heart disease', icon: 'heart' }
];
const allergiesList = [
  { name: 'Peanuts', icon: 'circle' },
  { name: 'Milk', icon: 'droplet' },
  { name: 'Eggs', icon: 'circle' },
  { name: 'Wheat', icon: 'triangle' },
  { name: 'Soy', icon: 'circle' },
  { name: 'Shellfish', icon: 'circle' },
  { name: 'Tree nuts', icon: 'circle' }
];

const Health: React.FC<Props> = ({ data, onChange }) => {
  const toggleCondition = (cond: string) => {
    const newConditions = data.conditions.includes(cond) ? data.conditions.filter(c => c !== cond) : [...data.conditions, cond];
    onChange({ ...data, conditions: newConditions });
  };

  const toggleAllergy = (allergy: string) => {
    const newAllergies = data.allergies.includes(allergy) ? data.allergies.filter(a => a !== allergy) : [...data.allergies, allergy];
    onChange({ ...data, allergies: newAllergies });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView style={{ flex: 1, padding: 20, backgroundColor: '#FFFFFF', borderRadius: 24 }}>
      <Text style={{ fontSize: 32, fontWeight: '700', color: '#1F2933', marginBottom: 8 }}>Your Health Profile</Text>
      <Text style={{ fontSize: 14, fontWeight: '400', color: '#6B7280', marginBottom: 20 }}>Select any conditions you're managing. This information remains private and helps us tailor your plan.</Text>

      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2933', marginBottom: 10 }}>Health Conditions</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {conditionsList.map((cond) => (
            <TouchableOpacity
              key={cond.name}
              onPress={() => toggleCondition(cond.name)}
              style={{
                padding: 10,
                margin: 5,
                backgroundColor: data.conditions.includes(cond.name) ? '#FF6B00' : '#FFFFFF',
                borderRadius: 20,
                borderWidth: 1,
                borderColor: '#E5E7EB',
                flexDirection: 'row',
                alignItems: 'center'
              }}
            >
              <Feather name={cond.icon as any} size={16} color={data.conditions.includes(cond.name) ? 'white' : '#1F2933'} style={{ marginRight: 5 }} />
              <Text style={{ color: data.conditions.includes(cond.name) ? 'white' : '#1F2933', fontSize: 14 }}>{cond.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2933', marginBottom: 10 }}>Allergies</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {allergiesList.map((allergy) => (
            <TouchableOpacity
              key={allergy.name}
              onPress={() => toggleAllergy(allergy.name)}
              style={{
                padding: 10,
                margin: 5,
                backgroundColor: data.allergies.includes(allergy.name) ? '#FF6B00' : '#FFFFFF',
                borderRadius: 20,
                borderWidth: 1,
                borderColor: '#E5E7EB',
                flexDirection: 'row',
                alignItems: 'center'
              }}
            >
              <Feather name={allergy.icon as any} size={16} color={data.allergies.includes(allergy.name) ? 'white' : '#1F2933'} style={{ marginRight: 5 }} />
              <Text style={{ color: data.allergies.includes(allergy.name) ? 'white' : '#1F2933', fontSize: 14 }}>{allergy.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2933', marginBottom: 10 }}>Medication Details</Text>
        <TextInput
          value={data.medication}
          onChangeText={(text) => onChange({ ...data, medication: text })}
          multiline
          placeholder="Enter any medications or details..."
          style={{ borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 10, height: 100, fontSize: 16, textAlignVertical: 'top' }}
        />
      </View>
    </ScrollView>
    </SafeAreaView>
  )
}

export default Health