import { View, Text, TouchableOpacity, TextInput, SafeAreaView, ScrollView } from 'react-native'
import React, { useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'
import { MaterialIcons } from '@expo/vector-icons'

interface userInfo {
  name: string;
  age: number;
  height: number;
  weight: number;
  BMI: number;
  gender: 'Male' | 'Female' | 'Other';
  location: string;
  health_conditions: string[];
  allergies: string[];
  health_goals: string[];
  medication_details: string[];
  budget_for_food: number;
  occupation_type: string;
  work_schedule: string;
  access_to_kitchen: string;
  stress_level: string;
  meal_source: string;
}

const ProfilePage = () => {
  const [userInfo, setUserInfo] = useState<userInfo | null>(null);
  const [editing, setEditing] = useState(false);
  const [editedData, setEditedData] = useState<userInfo | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadUserInfo = async () => {
      const data = await AsyncStorage.getItem('userInfo');
      if (data) {
        const parsed = JSON.parse(data);
        setUserInfo(parsed);
        setEditedData(parsed);
      }
    };
    loadUserInfo();
  }, []);

  const handleSave = async () => {
    if (editedData) {
      // Update localStorage
      await AsyncStorage.setItem('userInfo', JSON.stringify(editedData));
      setUserInfo(editedData);

      // Send to backend
      fetch('http://10.20.1.20:5000/store_user_info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userInfo: editedData }),
      })
        .then(response => response.json())
        .then(result => {
          console.log('Update result:', result);
        })
        .catch(error => {
          console.error('Error updating userInfo:', error);
        });

      setEditing(false);
    }
  };

  const updateField = (field: keyof userInfo, value: any) => {
    if (editedData) {
      if (field === 'height' || field === 'weight') {
        const newData = { ...editedData, [field]: value };
        const h = newData.height / 100;
        const b = newData.weight / (h * h);
        setEditedData({ ...newData, BMI: b });
      } else {
        setEditedData({ ...editedData, [field]: value });
      }
    }
  };

  if (!userInfo || !editedData) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F6F7F9', justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F6F7F9' }}>
      <ScrollView style={{ flex: 1, padding: 20 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="#1F2933" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setEditing(!editing)}>
            <MaterialIcons name="edit" size={24} color="#FF6B00" />
          </TouchableOpacity>
        </View>

        <Text style={{ fontSize: 28, fontWeight: '700', color: '#1F2933', marginBottom: 20 }}>Your Profile</Text>

        {/* Personal Information Section */}
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 24, elevation: 8 }}>
          <Text style={{ fontSize: 20, fontWeight: '600', color: '#1F2933', marginBottom: 15 }}>Personal Information</Text>

          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2933', marginBottom: 5 }}>Name</Text>
            {editing ? (
              <TextInput
                value={editedData.name}
                onChangeText={(text) => updateField('name', text)}
                style={{ borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 10, fontSize: 16, backgroundColor: '#F6F7F9' }}
              />
            ) : (
              <Text style={{ fontSize: 16, color: '#6B7280', backgroundColor: '#F6F7F9', padding: 10, borderRadius: 8 }}>{userInfo.name}</Text>
            )}
          </View>

          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2933', marginBottom: 5 }}>Location</Text>
            {editing ? (
              <TextInput
                value={editedData.location}
                onChangeText={(text) => updateField('location', text)}
                style={{ borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 10, fontSize: 16, backgroundColor: '#F6F7F9' }}
              />
            ) : (
              <Text style={{ fontSize: 16, color: '#6B7280', backgroundColor: '#F6F7F9', padding: 10, borderRadius: 8 }}>{userInfo.location}</Text>
            )}
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2933', marginBottom: 5 }}>Age</Text>
              {editing ? (
                <TextInput
                  value={editedData.age.toString()}
                  onChangeText={(text) => updateField('age', parseInt(text) || 0)}
                  keyboardType='numeric'
                  style={{ borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 10, fontSize: 16, backgroundColor: '#F6F7F9' }}
                />
              ) : (
                <Text style={{ fontSize: 16, color: '#6B7280', backgroundColor: '#F6F7F9', padding: 10, borderRadius: 8 }}>{userInfo.age}</Text>
              )}
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2933', marginBottom: 5 }}>Gender</Text>
              {editing ? (
                <TextInput
                  value={editedData.gender}
                  onChangeText={(text) => updateField('gender', text)}
                  style={{ borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 10, fontSize: 16, backgroundColor: '#F6F7F9' }}
                />
              ) : (
                <Text style={{ fontSize: 16, color: '#6B7280', backgroundColor: '#F6F7F9', padding: 10, borderRadius: 8 }}>{userInfo.gender}</Text>
              )}
            </View>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2933', marginBottom: 5 }}>Height (cm)</Text>
              {editing ? (
                <TextInput
                  value={editedData.height.toString()}
                  onChangeText={(text) => updateField('height', parseInt(text) || 0)}
                  keyboardType='numeric'
                  style={{ borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 10, fontSize: 16, backgroundColor: '#F6F7F9' }}
                />
              ) : (
                <Text style={{ fontSize: 16, color: '#6B7280', backgroundColor: '#F6F7F9', padding: 10, borderRadius: 8 }}>{userInfo.height}</Text>
              )}
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2933', marginBottom: 5 }}>Weight (kg)</Text>
              {editing ? (
                <TextInput
                  value={editedData.weight.toString()}
                  onChangeText={(text) => updateField('weight', parseInt(text) || 0)}
                  keyboardType='numeric'
                  style={{ borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 10, fontSize: 16, backgroundColor: '#F6F7F9' }}
                />
              ) : (
                <Text style={{ fontSize: 16, color: '#6B7280', backgroundColor: '#F6F7F9', padding: 10, borderRadius: 8 }}>{userInfo.weight}</Text>
              )}
            </View>
          </View>

          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2933', marginBottom: 5 }}>BMI</Text>
            <Text style={{ fontSize: 16, color: '#6B7280', backgroundColor: '#F6F7F9', padding: 10, borderRadius: 8 }}>{userInfo.BMI.toFixed(1)}</Text>
          </View>
        </View>

        {/* Health Information Section */}
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 24, elevation: 8 }}>
          <Text style={{ fontSize: 20, fontWeight: '600', color: '#1F2933', marginBottom: 15 }}>Health Information</Text>

          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2933', marginBottom: 5 }}>Health Conditions</Text>
            {editing ? (
              <TextInput
                value={editedData.health_conditions.join(', ')}
                onChangeText={(text) => updateField('health_conditions', text.split(', '))}
                placeholder="Enter conditions separated by commas"
                style={{ borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 10, fontSize: 16, backgroundColor: '#F6F7F9' }}
              />
            ) : (
              <Text style={{ fontSize: 16, color: '#6B7280', backgroundColor: '#F6F7F9', padding: 10, borderRadius: 8 }}>{userInfo.health_conditions.join(', ') || 'None'}</Text>
            )}
          </View>

          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2933', marginBottom: 5 }}>Allergies</Text>
            {editing ? (
              <TextInput
                value={editedData.allergies.join(', ')}
                onChangeText={(text) => updateField('allergies', text.split(', '))}
                placeholder="Enter allergies separated by commas"
                style={{ borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 10, fontSize: 16, backgroundColor: '#F6F7F9' }}
              />
            ) : (
              <Text style={{ fontSize: 16, color: '#6B7280', backgroundColor: '#F6F7F9', padding: 10, borderRadius: 8 }}>{userInfo.allergies.join(', ') || 'None'}</Text>
            )}
          </View>

          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2933', marginBottom: 5 }}>Medication Details</Text>
            {editing ? (
              <TextInput
                value={editedData.medication_details.join(', ')}
                onChangeText={(text) => updateField('medication_details', text.split(', '))}
                placeholder="Enter medications separated by commas"
                style={{ borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 10, fontSize: 16, backgroundColor: '#F6F7F9' }}
              />
            ) : (
              <Text style={{ fontSize: 16, color: '#6B7280', backgroundColor: '#F6F7F9', padding: 10, borderRadius: 8 }}>{userInfo.medication_details.join(', ') || 'None'}</Text>
            )}
          </View>
        </View>

        {/* Goals Section */}
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 24, elevation: 8 }}>
          <Text style={{ fontSize: 20, fontWeight: '600', color: '#1F2933', marginBottom: 15 }}>Health Goals</Text>

          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2933', marginBottom: 5 }}>Goals</Text>
            {editing ? (
              <TextInput
                value={editedData.health_goals.join(', ')}
                onChangeText={(text) => updateField('health_goals', text.split(', '))}
                placeholder="Enter goals separated by commas"
                style={{ borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 10, fontSize: 16, backgroundColor: '#F6F7F9' }}
              />
            ) : (
              <Text style={{ fontSize: 16, color: '#6B7280', backgroundColor: '#F6F7F9', padding: 10, borderRadius: 8 }}>{userInfo.health_goals.join(', ') || 'None'}</Text>
            )}
          </View>
        </View>

        {/* Lifestyle Section */}
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 24, elevation: 8 }}>
          <Text style={{ fontSize: 20, fontWeight: '600', color: '#1F2933', marginBottom: 15 }}>Lifestyle</Text>

          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2933', marginBottom: 5 }}>Occupation Type</Text>
            {editing ? (
              <TextInput
                value={editedData.occupation_type}
                onChangeText={(text) => updateField('occupation_type', text)}
                style={{ borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 10, fontSize: 16, backgroundColor: '#F6F7F9' }}
              />
            ) : (
              <Text style={{ fontSize: 16, color: '#6B7280', backgroundColor: '#F6F7F9', padding: 10, borderRadius: 8 }}>{userInfo.occupation_type || 'Not specified'}</Text>
            )}
          </View>

          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2933', marginBottom: 5 }}>Work Schedule</Text>
            {editing ? (
              <TextInput
                value={editedData.work_schedule}
                onChangeText={(text) => updateField('work_schedule', text)}
                style={{ borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 10, fontSize: 16, backgroundColor: '#F6F7F9' }}
              />
            ) : (
              <Text style={{ fontSize: 16, color: '#6B7280', backgroundColor: '#F6F7F9', padding: 10, borderRadius: 8 }}>{userInfo.work_schedule || 'Not specified'}</Text>
            )}
          </View>

          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2933', marginBottom: 5 }}>Access to Kitchen</Text>
            {editing ? (
              <TextInput
                value={editedData.access_to_kitchen}
                onChangeText={(text) => updateField('access_to_kitchen', text)}
                style={{ borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 10, fontSize: 16, backgroundColor: '#F6F7F9' }}
              />
            ) : (
              <Text style={{ fontSize: 16, color: '#6B7280', backgroundColor: '#F6F7F9', padding: 10, borderRadius: 8 }}>{userInfo.access_to_kitchen || 'Not specified'}</Text>
            )}
          </View>

          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2933', marginBottom: 5 }}>Stress Level</Text>
            {editing ? (
              <TextInput
                value={editedData.stress_level}
                onChangeText={(text) => updateField('stress_level', text)}
                style={{ borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 10, fontSize: 16, backgroundColor: '#F6F7F9' }}
              />
            ) : (
              <Text style={{ fontSize: 16, color: '#6B7280', backgroundColor: '#F6F7F9', padding: 10, borderRadius: 8 }}>{userInfo.stress_level || 'Not specified'}</Text>
            )}
          </View>

          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2933', marginBottom: 5 }}>Meal Source</Text>
            {editing ? (
              <TextInput
                value={editedData.meal_source}
                onChangeText={(text) => updateField('meal_source', text)}
                style={{ borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 10, fontSize: 16, backgroundColor: '#F6F7F9' }}
              />
            ) : (
              <Text style={{ fontSize: 16, color: '#6B7280', backgroundColor: '#F6F7F9', padding: 10, borderRadius: 8 }}>{userInfo.meal_source || 'Not specified'}</Text>
            )}
          </View>

          <View style={{ marginBottom: 15 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2933', marginBottom: 5 }}>Budget for Food</Text>
            {editing ? (
              <TextInput
                value={editedData.budget_for_food.toString()}
                onChangeText={(text) => updateField('budget_for_food', parseInt(text) || 0)}
                keyboardType='numeric'
                style={{ borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 10, fontSize: 16, backgroundColor: '#F6F7F9' }}
              />
            ) : (
              <Text style={{ fontSize: 16, color: '#6B7280', backgroundColor: '#F6F7F9', padding: 10, borderRadius: 8 }}>{userInfo.budget_for_food} INR</Text>
            )}
          </View>
        </View>

        {editing && (
          <TouchableOpacity
            onPress={handleSave}
            style={{
              backgroundColor: '#FF6B00',
              padding: 15,
              borderRadius: 16,
              alignItems: 'center',
              marginTop: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.12,
              shadowRadius: 24,
              elevation: 8
            }}
          >
            <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>Save Changes</Text>
          </TouchableOpacity>
        )}

        {/* Logout/Delete Account Section */}
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 24, elevation: 8 }}>
          <Text style={{ fontSize: 20, fontWeight: '600', color: '#1F2933', marginBottom: 15 }}>Account</Text>

          <TouchableOpacity
            onPress={async () => {
              // Remove userInfo from localStorage
              await AsyncStorage.removeItem('userInfo');
              // Navigate to LandingPage
              router.push('/LandingPage');
            }}
            style={{
              backgroundColor: '#EF4444',
              padding: 15,
              borderRadius: 16,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.12,
              shadowRadius: 24,
              elevation: 8
            }}
          >
            <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>Logout / Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default ProfilePage
