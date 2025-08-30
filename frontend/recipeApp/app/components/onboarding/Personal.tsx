import { View, Text, TextInput, TouchableOpacity, SafeAreaView } from 'react-native'
import React, { useState, useEffect } from 'react'

interface PersonalData {
  age: number;
  height: number;
  weight: number;
  gender: 'Male' | 'Female' | 'Other';
}

interface Props {
  data: PersonalData;
  onChange: (data: PersonalData) => void;
}

const Personal: React.FC<Props> = ({ data, onChange }) => {
  const [bmi, setBmi] = useState(0);

  useEffect(() => {
    if (data.height && data.weight && data.height > 0) {
      const h = data.height / 100;
      const b = data.weight / (h * h);
      setBmi(b);
    }
  }, [data.height, data.weight]);

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
    onChange({ ...data, [field]: value });
  };

  const increment = (field: 'age' | 'height' | 'weight') => {
    updateField(field, data[field] + 1);
  };

  const decrement = (field: 'age' | 'height' | 'weight') => {
    if (data[field] > 0) updateField(field, data[field] - 1);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <View style={{ flex: 1, borderRadius: 24, padding: 20 }}>
      <Text style={{ fontSize: 32, fontWeight: '700', color: '#1F2933', marginBottom: 8 }}>Tell Us About Yourself</Text>
      <Text style={{ fontSize: 14, fontWeight: '400', color: '#6B7280', marginBottom: 20 }}>This helps us calculate your nutritional baseline.</Text>

      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2933', marginBottom: 10 }}>Age</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => decrement('age')} style={{ padding: 10, backgroundColor: '#FF6B00', borderRadius: 8 }}>
            <Text style={{ color: 'white', fontSize: 18 }}>-</Text>
          </TouchableOpacity>
          <TextInput
            value={data.age.toString()}
            onChangeText={(text) => updateField('age', parseInt(text) || 0)}
            keyboardType='numeric'
            style={{ flex: 1, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 10, marginHorizontal: 10, fontSize: 16 }}
          />
          <TouchableOpacity onPress={() => increment('age')} style={{ padding: 10, backgroundColor: '#FF6B00', borderRadius: 8 }}>
            <Text style={{ color: 'white', fontSize: 18 }}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2933', marginBottom: 10 }}>Height (cm)</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => decrement('height')} style={{ padding: 10, backgroundColor: '#FF6B00', borderRadius: 8 }}>
            <Text style={{ color: 'white', fontSize: 18 }}>-</Text>
          </TouchableOpacity>
          <TextInput
            value={data.height.toString()}
            onChangeText={(text) => updateField('height', parseInt(text) || 0)}
            keyboardType='numeric'
            style={{ flex: 1, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 10, marginHorizontal: 10, fontSize: 16 }}
          />
          <TouchableOpacity onPress={() => increment('height')} style={{ padding: 10, backgroundColor: '#FF6B00', borderRadius: 8 }}>
            <Text style={{ color: 'white', fontSize: 18 }}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2933', marginBottom: 10 }}>Weight (kg)</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => decrement('weight')} style={{ padding: 10, backgroundColor: '#FF6B00', borderRadius: 8 }}>
            <Text style={{ color: 'white', fontSize: 18 }}>-</Text>
          </TouchableOpacity>
          <TextInput
            value={data.weight.toString()}
            onChangeText={(text) => updateField('weight', parseInt(text) || 0)}
            keyboardType='numeric'
            style={{ flex: 1, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 10, marginHorizontal: 10, fontSize: 16 }}
          />
          <TouchableOpacity onPress={() => increment('weight')} style={{ padding: 10, backgroundColor: '#FF6B00', borderRadius: 8 }}>
            <Text style={{ color: 'white', fontSize: 18 }}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2933', marginBottom: 10 }}>Gender</Text>
        <View style={{ flexDirection: 'row', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB' }}>
          {['Male', 'Female', 'Other'].map((g, index) => (
            <TouchableOpacity
              key={g}
              onPress={() => updateField('gender', g as any)}
              style={{
                flex: 1,
                padding: 15,
                backgroundColor: data.gender === g ? '#FF6B00' : '#FFFFFF',
                alignItems: 'center',
                borderRightWidth: index < 2 ? 1 : 0,
                borderRightColor: '#E5E7EB'
              }}
            >
              <Text style={{ color: data.gender === g ? 'white' : '#1F2933', fontSize: 16 }}>{g}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {bmi > 0 && (
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#1F2933' }}>BMI: {bmi.toFixed(1)} - {getBmiLabel()}</Text>
          <View style={{ height: 10, backgroundColor: '#E5E7EB', borderRadius: 5, marginTop: 10, overflow: 'hidden' }}>
            <View style={{ height: 10, width: `${Math.min((bmi / 40) * 100, 100)}%`, backgroundColor: getBmiColor(), borderRadius: 5 }} />
          </View>
        </View>
      )}
    </View>
    </SafeAreaView>
  )
}

export default Personal