import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React from 'react'
import Animated, { FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface LifestyleData {
  occupation_type: string[];
  work_schedule: string;
  access_to_kitchen: string;
  stress_level: string;
  meal_source: string[];
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
  const [showCustomOccupationInput, setShowCustomOccupationInput] = React.useState(false);
  const [showCustomMealSourceInput, setShowCustomMealSourceInput] = React.useState(false);
  const [customOccupationText, setCustomOccupationText] = React.useState('');
  const [customMealSourceText, setCustomMealSourceText] = React.useState('');
  const selectOccupation = (occ: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newOccupations = data.occupation_type.includes(occ) ? data.occupation_type.filter(o => o !== occ) : [...data.occupation_type, occ];
    onChange({ ...data, occupation_type: newOccupations });
  };

  const selectMealSource = (ms: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newMealSources = data.meal_source.includes(ms) ? data.meal_source.filter(m => m !== ms) : [...data.meal_source, ms];
    onChange({ ...data, meal_source: newMealSources });
  };

  const addCustomOccupation = () => {
    setShowCustomOccupationInput(true);
  };

  const confirmCustomOccupation = () => {
    if (customOccupationText.trim()) {
      const newOccupations = [...data.occupation_type, customOccupationText.trim()];
      onChange({ ...data, occupation_type: newOccupations });
      setCustomOccupationText('');
      setShowCustomOccupationInput(false);
    }
  };

  const removeCustomOccupation = (index: number) => {
    const newOccupations = data.occupation_type.filter((_, i) => i !== index);
    onChange({ ...data, occupation_type: newOccupations });
  };

  const addCustomMealSource = () => {
    setShowCustomMealSourceInput(true);
  };

  const confirmCustomMealSource = () => {
    if (customMealSourceText.trim()) {
      const newMealSources = [...data.meal_source, customMealSourceText.trim()];
      onChange({ ...data, meal_source: newMealSources });
      setCustomMealSourceText('');
      setShowCustomMealSourceInput(false);
    }
  };

  const removeCustomMealSource = (index: number) => {
    const newMealSources = data.meal_source.filter((_, i) => i !== index);
    onChange({ ...data, meal_source: newMealSources });
  };

  const select = (field: keyof LifestyleData, value: string | number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange({ ...data, [field]: value });
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView style={{ flex: 1, backgroundColor: '#FFFFFF' }} contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 20 }}>
      <Animated.Text entering={FadeInUp.delay(100)} style={{ fontSize: 32, fontWeight: '700', color: '#1F2933', marginBottom: 8 }}>Your Lifestyle</Animated.Text>
      <Animated.Text entering={FadeInUp.delay(200)} style={{ fontSize: 14, fontWeight: '400', color: '#6B7280', marginBottom: 20 }}>Understanding your routine helps us suggest practical recipes.</Animated.Text>

      <Animated.View entering={FadeInUp.delay(300)} style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2933', marginBottom: 10 }}>Occupation Type</Text>
        <Text style={{ fontSize: 12, fontWeight: '400', color: '#6B7280', marginBottom: 10 }}>This helps us understand your daily routine and suggest recipes that fit your lifestyle.</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {occupations.map((occ, index) => (
            <Animated.View key={occ} entering={FadeInUp.delay(400 + index * 100)}>
              <TouchableOpacity
                onPress={() => selectOccupation(occ)}
                style={{
                  padding: 10,
                  margin: 5,
                  backgroundColor: data.occupation_type.includes(occ) ? '#FF6B00' : '#FFFFFF',
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: '#E5E7EB'
                }}
              >
                <Text style={{ color: data.occupation_type.includes(occ) ? 'white' : '#1F2933', fontSize: 14 }}>{occ}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
          {data.occupation_type.map((occ, index) => {
            if (occupations.includes(occ)) return null;
            return (
              <Animated.View key={`custom-occ-${index}`} entering={FadeInUp.delay(500 + index * 100)}>
                <View style={{ position: 'relative', margin: 5 }}>
                  <TouchableOpacity
                    onPress={() => selectOccupation(occ)}
                    style={{
                      padding: 10,
                      backgroundColor: data.occupation_type.includes(occ) ? '#FF6B00' : '#FFFFFF',
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: '#E5E7EB',
                      paddingRight: 30
                    }}
                  >
                    <Text style={{ color: data.occupation_type.includes(occ) ? 'white' : '#1F2933', fontSize: 14 }}>{occ}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => removeCustomOccupation(index)}
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
          <TouchableOpacity onPress={addCustomOccupation} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center', margin: 5 }}>
            <MaterialCommunityIcons name="plus" size={20} color="#1F2933" />
          </TouchableOpacity>
        </View>
        {showCustomOccupationInput && (
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 20, padding: 10, margin: 5, borderWidth: 1, borderColor: '#E5E7EB' }}>
            <TextInput
              value={customOccupationText}
              onChangeText={setCustomOccupationText}
              placeholder="Enter custom occupation"
              style={{ flex: 1, fontSize: 14, color: '#1F2933' }}
              onSubmitEditing={confirmCustomOccupation}
              autoFocus
            />
            <TouchableOpacity onPress={confirmCustomOccupation} style={{ marginLeft: 10, width: 30, height: 30, borderRadius: 15, backgroundColor: '#FF6B00', alignItems: 'center', justifyContent: 'center' }}>
              <MaterialCommunityIcons name="check" size={16} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setShowCustomOccupationInput(false); setCustomOccupationText(''); }} style={{ marginLeft: 5, width: 30, height: 30, borderRadius: 15, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' }}>
              <MaterialCommunityIcons name="close" size={16} color="#1F2933" />
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(600)} style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2933', marginBottom: 10 }}>Work Schedule</Text>
        <Text style={{ fontSize: 12, fontWeight: '400', color: '#6B7280', marginBottom: 10 }}>Your work hours influence meal timing and preparation complexity.</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {workSchedules.map((ws, index) => (
            <Animated.View key={ws} entering={FadeInUp.delay(700 + index * 100)}>
              <TouchableOpacity
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
            </Animated.View>
          ))}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(900)} style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2933', marginBottom: 10 }}>Access to Kitchen</Text>
        <Text style={{ fontSize: 12, fontWeight: '400', color: '#6B7280', marginBottom: 10 }}>Knowing your kitchen availability helps recommend appropriate cooking methods.</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {kitchenAccesses.map((ka, index) => (
            <Animated.View key={ka} entering={FadeInUp.delay(1000 + index * 100)}>
              <TouchableOpacity
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
            </Animated.View>
          ))}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(1200)} style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', color: '#1F2933', marginBottom: 10 }}>Typical Stress Level</Text>
        <Text style={{ fontSize: 12, fontWeight: '400', color: '#6B7280', marginBottom: 10 }}>Stress affects food choices; we'll suggest calming or energizing meals accordingly.</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {stressLevels.map((sl, index) => (
            <Animated.View key={sl.level} entering={FadeInUp.delay(1300 + index * 100)}>
              <TouchableOpacity
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
            </Animated.View>
          ))}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(1500)} style={{ marginBottom: 100 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2933', marginBottom: 10 }}>Meal Source</Text>
        <Text style={{ fontSize: 12, fontWeight: '400', color: '#6B7280', marginBottom: 10 }}>Understanding your eating habits helps personalize recipe suggestions.</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {mealSources.map((ms, index) => (
            <Animated.View key={ms} entering={FadeInUp.delay(1600 + index * 100)}>
              <TouchableOpacity
                onPress={() => selectMealSource(ms)}
                style={{
                  padding: 10,
                  margin: 5,
                  backgroundColor: data.meal_source.includes(ms) ? '#FF6B00' : '#FFFFFF',
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: '#E5E7EB'
                }}
              >
                <Text style={{ color: data.meal_source.includes(ms) ? 'white' : '#1F2933', fontSize: 14 }}>{ms}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
          {data.meal_source.map((ms, index) => {
            if (mealSources.includes(ms)) return null;
            return (
              <Animated.View key={`custom-ms-${index}`} entering={FadeInUp.delay(1700 + index * 100)}>
                <View style={{ position: 'relative', margin: 5 }}>
                  <TouchableOpacity
                    onPress={() => selectMealSource(ms)}
                    style={{
                      padding: 10,
                      backgroundColor: data.meal_source.includes(ms) ? '#FF6B00' : '#FFFFFF',
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: '#E5E7EB',
                      paddingRight: 30
                    }}
                  >
                    <Text style={{ color: data.meal_source.includes(ms) ? 'white' : '#1F2933', fontSize: 14 }}>{ms}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => removeCustomMealSource(index)}
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
          <TouchableOpacity onPress={addCustomMealSource} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center', margin: 5 }}>
            <MaterialCommunityIcons name="plus" size={20} color="#1F2933" />
          </TouchableOpacity>
        </View>
        {showCustomMealSourceInput && (
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 20, padding: 10, margin: 5, borderWidth: 1, borderColor: '#E5E7EB' }}>
            <TextInput
              value={customMealSourceText}
              onChangeText={setCustomMealSourceText}
              placeholder="Enter custom meal source"
              style={{ flex: 1, fontSize: 14, color: '#1F2933' }}
              onSubmitEditing={confirmCustomMealSource}
              autoFocus
            />
            <TouchableOpacity onPress={confirmCustomMealSource} style={{ marginLeft: 10, width: 30, height: 30, borderRadius: 15, backgroundColor: '#FF6B00', alignItems: 'center', justifyContent: 'center' }}>
              <MaterialCommunityIcons name="check" size={16} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setShowCustomMealSourceInput(false); setCustomMealSourceText(''); }} style={{ marginLeft: 5, width: 30, height: 30, borderRadius: 15, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' }}>
              <MaterialCommunityIcons name="close" size={16} color="#1F2933" />
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    </ScrollView>
    </SafeAreaView>
  )
}

export default Lifestyle