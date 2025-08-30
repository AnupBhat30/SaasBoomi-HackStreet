import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import Animated, { FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface HealthData {
  health_conditions: string[];
  allergies: string[];
  medication_details: string[];
}

interface Props {
  data: HealthData;
  onChange: (data: HealthData) => void;
}

const conditionsList = [
  { name: 'Vitamin D deficiency', icon: 'weather-sunny' },
  { name: 'Anemia', icon: 'water' },
  { name: 'Diabetes', icon: 'pulse' },
  { name: 'Hypertension', icon: 'heart' },
  { name: 'PCOS', icon: 'account' },
  { name: 'Thyroid issues', icon: 'thermometer' },
  { name: 'Heart disease', icon: 'heart' }
];
const allergiesList = [
  { name: 'Peanuts', icon: 'circle' },
  { name: 'Milk', icon: 'cup-water' },
  { name: 'Eggs', icon: 'circle' },
  { name: 'Wheat', icon: 'triangle' },
  { name: 'Soy', icon: 'circle' },
  { name: 'Shellfish', icon: 'circle' },
  { name: 'Tree nuts', icon: 'circle' }
];

const Health: React.FC<Props> = ({ data, onChange }) => {
  const [showCustomConditionInput, setShowCustomConditionInput] = React.useState(false);
  const [showCustomAllergyInput, setShowCustomAllergyInput] = React.useState(false);
  const [customConditionText, setCustomConditionText] = React.useState('');
  const [customAllergyText, setCustomAllergyText] = React.useState('');
  const toggleCondition = (cond: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newConditions = data.health_conditions.includes(cond) ? data.health_conditions.filter(c => c !== cond) : [...data.health_conditions, cond];
    onChange({ ...data, health_conditions: newConditions });
  };

  const toggleAllergy = (allergy: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newAllergies = data.allergies.includes(allergy) ? data.allergies.filter(a => a !== allergy) : [...data.allergies, allergy];
    onChange({ ...data, allergies: newAllergies });
  };

  const addCustomCondition = () => {
    setShowCustomConditionInput(true);
  };

  const confirmCustomCondition = () => {
    if (customConditionText.trim()) {
      const newConditions = [...data.health_conditions, customConditionText.trim()];
      onChange({ ...data, health_conditions: newConditions });
      setCustomConditionText('');
      setShowCustomConditionInput(false);
    }
  };

  const removeCustomCondition = (index: number) => {
    const newConditions = data.health_conditions.filter((_, i) => i !== index);
    onChange({ ...data, health_conditions: newConditions });
  };

  const addCustomAllergy = () => {
    setShowCustomAllergyInput(true);
  };

  const confirmCustomAllergy = () => {
    if (customAllergyText.trim()) {
      const newAllergies = [...data.allergies, customAllergyText.trim()];
      onChange({ ...data, allergies: newAllergies });
      setCustomAllergyText('');
      setShowCustomAllergyInput(false);
    }
  };

  const removeCustomAllergy = (index: number) => {
    const newAllergies = data.allergies.filter((_, i) => i !== index);
    onChange({ ...data, allergies: newAllergies });
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView style={{ flex: 1, backgroundColor: '#FFFFFF' }} contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 20 }}>
      <Animated.Text entering={FadeInUp.delay(100)} style={{ fontSize: 32, fontWeight: '700', color: '#1F2933', marginBottom: 8 }}>Your Health Profile</Animated.Text>
      <Animated.Text entering={FadeInUp.delay(200)} style={{ fontSize: 14, fontWeight: '400', color: '#6B7280', marginBottom: 20 }}>Select any conditions you&apos;re managing. This information remains private and helps us tailor your plan.</Animated.Text>

      <Animated.View entering={FadeInUp.delay(300)} style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2933', marginBottom: 10 }}>Health Conditions</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {conditionsList.map((cond, index) => (
            <Animated.View key={cond.name} entering={FadeInUp.delay(400 + index * 100)}>
              <TouchableOpacity
                onPress={() => toggleCondition(cond.name)}
                style={{
                  padding: 10,
                  margin: 5,
                  backgroundColor: data.health_conditions.includes(cond.name) ? '#FF6B00' : '#FFFFFF',
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                  flexDirection: 'row',
                  alignItems: 'center'
                }}
              >
                <MaterialCommunityIcons name={cond.icon as any} size={16} color={data.health_conditions.includes(cond.name) ? 'white' : '#1F2933'} style={{ marginRight: 5 }} />
                <Text style={{ color: data.health_conditions.includes(cond.name) ? 'white' : '#1F2933', fontSize: 14 }}>{cond.name}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
          {data.health_conditions.map((condition, index) => {
            if (conditionsList.some(cond => cond.name === condition)) return null;
            return (
              <Animated.View key={`custom-${index}`} entering={FadeInUp.delay(500 + index * 100)}>
                <View style={{ position: 'relative', margin: 5 }}>
                  <TouchableOpacity
                    onPress={() => toggleCondition(condition)}
                    style={{
                      padding: 10,
                      backgroundColor: data.health_conditions.includes(condition) ? '#FF6B00' : '#FFFFFF',
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: '#E5E7EB',
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingRight: 30
                    }}
                  >
                    <Text style={{ color: data.health_conditions.includes(condition) ? 'white' : '#1F2933', fontSize: 14 }}>{condition}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => removeCustomCondition(index)}
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
          <TouchableOpacity onPress={addCustomCondition} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center', margin: 5 }}>
            <MaterialCommunityIcons name="plus" size={20} color="#1F2933" />
          </TouchableOpacity>
        </View>
        {showCustomConditionInput && (
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 20, padding: 10, margin: 5, borderWidth: 1, borderColor: '#E5E7EB' }}>
            <TextInput
              value={customConditionText}
              onChangeText={setCustomConditionText}
              placeholder="Enter custom condition"
              style={{ flex: 1, fontSize: 14, color: '#1F2933' }}
              onSubmitEditing={confirmCustomCondition}
              autoFocus
            />
            <TouchableOpacity onPress={confirmCustomCondition} style={{ marginLeft: 10, width: 30, height: 30, borderRadius: 15, backgroundColor: '#FF6B00', alignItems: 'center', justifyContent: 'center' }}>
              <MaterialCommunityIcons name="check" size={16} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setShowCustomConditionInput(false); setCustomConditionText(''); }} style={{ marginLeft: 5, width: 30, height: 30, borderRadius: 15, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' }}>
              <MaterialCommunityIcons name="close" size={16} color="#1F2933" />
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(600)} style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2933', marginBottom: 10 }}>Allergies</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {allergiesList.map((allergy, index) => (
            <Animated.View key={allergy.name} entering={FadeInUp.delay(700 + index * 100)}>
              <TouchableOpacity
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
                <MaterialCommunityIcons name={allergy.icon as any} size={16} color={data.allergies.includes(allergy.name) ? 'white' : '#1F2933'} style={{ marginRight: 5 }} />
                <Text style={{ color: data.allergies.includes(allergy.name) ? 'white' : '#1F2933', fontSize: 14 }}>{allergy.name}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
          {data.allergies.map((allergy, index) => {
            if (allergiesList.some(a => a.name === allergy)) return null;
            return (
              <Animated.View key={`custom-${index}`} entering={FadeInUp.delay(800 + index * 100)}>
                <View style={{ position: 'relative', margin: 5 }}>
                  <TouchableOpacity
                    onPress={() => toggleAllergy(allergy)}
                    style={{
                      padding: 10,
                      backgroundColor: data.allergies.includes(allergy) ? '#FF6B00' : '#FFFFFF',
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: '#E5E7EB',
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingRight: 30
                    }}
                  >
                    <Text style={{ color: data.allergies.includes(allergy) ? 'white' : '#1F2933', fontSize: 14 }}>{allergy}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => removeCustomAllergy(index)}
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
          <TouchableOpacity onPress={addCustomAllergy} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center', margin: 5 }}>
            <MaterialCommunityIcons name="plus" size={20} color="#1F2933" />
          </TouchableOpacity>
        </View>
        {showCustomAllergyInput && (
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 20, padding: 10, margin: 5, borderWidth: 1, borderColor: '#E5E7EB' }}>
            <TextInput
              value={customAllergyText}
              onChangeText={setCustomAllergyText}
              placeholder="Enter custom allergy"
              style={{ flex: 1, fontSize: 14, color: '#1F2933' }}
              onSubmitEditing={confirmCustomAllergy}
              autoFocus
            />
            <TouchableOpacity onPress={confirmCustomAllergy} style={{ marginLeft: 10, width: 30, height: 30, borderRadius: 15, backgroundColor: '#FF6B00', alignItems: 'center', justifyContent: 'center' }}>
              <MaterialCommunityIcons name="check" size={16} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setShowCustomAllergyInput(false); setCustomAllergyText(''); }} style={{ marginLeft: 5, width: 30, height: 30, borderRadius: 15, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' }}>
              <MaterialCommunityIcons name="close" size={16} color="#1F2933" />
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(900)} style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2933', marginBottom: 10 }}>Medication Details</Text>
        <TextInput
          value={data.medication_details.join(', ')}
          onChangeText={(text) => onChange({ ...data, medication_details: text.split(',').map(s => s.trim()).filter(s => s) })}
          multiline
          placeholder="Enter medications separated by comma"
          style={{ borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 10, height: 100, fontSize: 16, textAlignVertical: 'top' }}
        />
      </Animated.View>
    </ScrollView>
    </SafeAreaView>
  )
}

export default Health