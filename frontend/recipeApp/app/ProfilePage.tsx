import { View, Text, TouchableOpacity, TextInput, SafeAreaView, ScrollView, StyleSheet, Image } from 'react-native'
import React, { useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'
import { MaterialIcons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker';
import Animated, { FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface userInfo {
  name: string;
  age: number;
  height: number;
  weight: number;
  BMI: number;
  gender: 'Male' | 'Female';
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
  const [avatar, setAvatar] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadUserInfo = async () => {
      const data = await AsyncStorage.getItem('userInfo');
      if (data) {
        const parsed = JSON.parse(data);
        setUserInfo(parsed);
        setEditedData(parsed);
      }
      const avatarData = await AsyncStorage.getItem('avatar');
      setAvatar(avatarData);
    };
    loadUserInfo();
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
      await AsyncStorage.setItem('avatar', result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (editedData) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Update localStorage
      await AsyncStorage.setItem('userInfo', JSON.stringify(editedData));
      setUserInfo(editedData);

      // Send to backend
      fetch('http://10.20.2.95:5000/nudging/store_user_info', {
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
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="#1F2933" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setEditing(!editing)}>
            <MaterialIcons name="edit" size={24} color="#FF6B00" />
          </TouchableOpacity>
        </View>

        {/* Avatar */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.avatarContainer}>
          <TouchableOpacity onPress={pickImage}>
            <Image
              source={avatar ? { uri: avatar } : require('../assets/images/icon.png')}
              style={styles.avatar}
            />
            <View style={styles.editIcon}>
              <MaterialIcons name="camera-alt" size={16} color="white" />
            </View>
          </TouchableOpacity>
        </Animated.View>

        <Animated.Text entering={FadeInUp.delay(200)} style={styles.title}>Your Profile</Animated.Text>

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
              // Clear backend data
              fetch('http://localhost:5000/nudging/store_user_info', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userInfo: {} }),
              })
                .then(response => response.json())
                .then(result => {
                  console.log('Backend cleared:', result);
                })
                .catch(error => {
                  console.error('Error clearing backend:', error);
                });
              // Navigate to index page which will show LandingPage
              router.replace('/');
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7F9',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FF6B00',
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FF6B00',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2933',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2933',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#F6F7F9',
  },
  text: {
    fontSize: 16,
    color: '#6B7280',
    backgroundColor: '#F6F7F9',
    padding: 10,
    borderRadius: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  halfInput: {
    flex: 1,
    marginHorizontal: 5,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
});

export default ProfilePage
