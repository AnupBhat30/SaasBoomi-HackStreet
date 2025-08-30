import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Card, Button, IconButton, ProgressBar, TextInput, Modal, Portal } from 'react-native-paper';
import Collapsible from 'react-native-collapsible';
import { useRouter } from 'expo-router';

type MealType = 'breakfast' | 'lunch' | 'snacks' | 'dinner';

const LogMeal = () => {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [meals, setMeals] = useState<Record<MealType, string[]>>({
    breakfast: [],
    lunch: [],
    snacks: [],
    dinner: []
  });
  const [expandedMeal, setExpandedMeal] = useState<MealType | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [currentMeal, setCurrentMeal] = useState<MealType | null>(null);
  const [foodName, setFoodName] = useState<string>('');
  const [editing, setEditing] = useState<boolean>(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const mealTypes: MealType[] = ['breakfast', 'lunch', 'snacks', 'dinner'];

  const toggleMeal = (meal: MealType) => {
    setExpandedMeal(expandedMeal === meal ? null : meal);
  };

  const addFoodItem = (meal: MealType) => {
    setCurrentMeal(meal);
    setModalVisible(true);
  };

  const editFoodItem = (meal: MealType, index: number) => {
    setEditing(true);
    setEditingIndex(index);
    setCurrentMeal(meal);
    setFoodName(meals[meal][index]);
    setModalVisible(true);
  };

  const deleteFoodItem = (meal: MealType, index: number) => {
    const updatedMeals = { ...meals };
    updatedMeals[meal].splice(index, 1);
    setMeals(updatedMeals);
  };

  const calculateProgress = (): number => {
    let logged = 0;
    mealTypes.forEach(meal => {
      if (meals[meal].length > 0) logged++;
    });
    return logged / mealTypes.length;
  };

  const handleAddFood = () => {
    if (foodName.trim() && currentMeal) {
      if (editing && editingIndex !== null) {
        const updatedMeals = { ...meals };
        updatedMeals[currentMeal][editingIndex] = foodName.trim();
        setMeals(updatedMeals);
      } else {
        setMeals(prev => ({ ...prev, [currentMeal]: [...prev[currentMeal], foodName.trim()] }));
      }
      setFoodName('');
      setModalVisible(false);
      setEditing(false);
      setEditingIndex(null);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: '#F6F7F9' }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: '#1F2933' }]}>Log Your Meal</Text>
        <TouchableOpacity onPress={() => Alert.alert('Date Selector', 'Calendar popup to be implemented')} style={styles.dateSelector}>
          <Text style={[styles.dateText, { color: '#FF6B00' }]}>
            {selectedDate.toDateString()}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <Text style={[styles.progressText, { color: '#6B7280' }]}>
          Daily Progress: {Math.round(calculateProgress() * 100)}%
        </Text>
        <ProgressBar progress={calculateProgress()} color="#FF6B00" style={styles.progressBar} />
      </View>

      {/* Meal Sections */}
      {mealTypes.map((meal) => (
        <Card key={meal} style={[styles.mealCard, { backgroundColor: '#FFFFFF' }]}>
          <TouchableOpacity onPress={() => toggleMeal(meal)} style={styles.mealHeader}>
            <Text style={[styles.mealTitle, { color: '#1F2933' }]}>
              {meal.charAt(0).toUpperCase() + meal.slice(1)}
            </Text>
            <Text style={[styles.mealCount, { color: '#6B7280' }]}>
              {meals[meal].length} items
            </Text>
          </TouchableOpacity>
          <Collapsible collapsed={expandedMeal !== meal}>
            <View style={styles.mealContent}>
              {meals[meal].map((item: string, index: number) => (
                <View key={index} style={styles.foodItem}>
                  <Text style={[styles.foodName, { color: '#1F2933' }]}>{item}</Text>
                  <View style={styles.itemActions}>
                    <IconButton icon="pencil" size={20} onPress={() => editFoodItem(meal, index)} />
                    <IconButton icon="close" size={20} iconColor="#F59E0B" onPress={() => deleteFoodItem(meal, index)} />
                  </View>
                </View>
              ))}
              <Button
                mode="outlined"
                onPress={() => addFoodItem(meal)}
                style={[styles.addButton, { borderColor: '#FF6B00' }]}
                labelStyle={{ color: '#FF6B00' }}
              >
                Add Food Item
              </Button>
            </View>
          </Collapsible>
        </Card>
      ))}

      {/* Date Picker Modal - Temporarily disabled */}
      {/* <DatePickerModal
        locale="en"
        mode="single"
        visible={datePickerVisible}
        onDismiss={() => setDatePickerVisible(false)}
        date={selectedDate}
        onConfirm={(params) => onDateChange(params.date)}
      /> */}

      {/* Add Food Modal */}
      <Portal>
        <Modal visible={modalVisible} onDismiss={() => { setModalVisible(false); setFoodName(''); setEditing(false); setEditingIndex(null); }} contentContainerStyle={styles.modalContainer}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoid}>
            <View style={styles.modalContent}>
              <Text style={[styles.modalTitle, { color: '#1F2933' }]}>
                {editing ? 'Edit' : 'Add'} to {currentMeal ? currentMeal.charAt(0).toUpperCase() + currentMeal.slice(1) : ''}
              </Text>
              <TextInput
                label="Food Name"
                value={foodName}
                onChangeText={setFoodName}
                style={[styles.input, { color: '#1F2933' }]}
                mode="outlined"
                theme={{ 
                  colors: { 
                    primary: '#FF6B00', 
                    text: '#1F2933', 
                    placeholder: '#6B7280',
                    background: '#FFFFFF',
                    surface: '#FFFFFF'
                  } 
                }}
              />
              <View style={styles.modalButtons}>
                <Button onPress={() => setModalVisible(false)} mode="outlined" style={styles.cancelButton}>
                  Cancel
                </Button>
                <Button onPress={handleAddFood} mode="contained" style={[styles.addButtonModal, { backgroundColor: '#FF6B00' }]}>
                  {editing ? 'Update' : 'Add'}
                </Button>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </Portal>

      <View style={{ marginTop: 20, alignItems: 'center' }}>
        <Button
          mode="contained"
          onPress={() => {
            const mealLog = {
              breakfast: { foods: meals.breakfast },
              lunch: { foods: meals.lunch },
              snacks: { foods: meals.snacks },
              dinner: { foods: meals.dinner }
            };
            fetch('http://10.20.1.20:5000/store_meal_log', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ mealLog }),
            })
              .then(response => response.json())
              .then(result => {
                console.log('Meal log stored:', result);
                Alert.alert('Success', 'Meal log sent to backend!');
                
                // Fetch insights
                fetch('http://10.20.1.20:5000/insights')
                  .then(response => response.json())
                  .then(insights => {
                    console.log('Insights:', insights);
                    // Navigate to Insights
                    router.push('/Insights' as any);
                  })
                  .catch(error => {
                    console.error('Error fetching insights:', error);
                    Alert.alert('Error', 'Failed to fetch insights.');
                  });
              })
              .catch(error => {
                console.error('Error storing meal log:', error);
                Alert.alert('Error', 'Failed to send meal log.');
              });
          }}
          style={{ backgroundColor: '#FF6B00', borderRadius: 16, paddingHorizontal: 20 }}
          labelStyle={{ color: 'white', fontSize: 16 }}
        >
          Get Your Nutrition Plan
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  dateSelector: {
    alignSelf: 'center',
    padding: 10,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dateText: {
    fontSize: 16,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressText: {
    fontSize: 14,
    marginBottom: 5,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  mealCard: {
    marginBottom: 16,
    borderRadius: 20,
    elevation: 2,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  mealCount: {
    fontSize: 14,
  },
  mealContent: {
    padding: 16,
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  foodName: {
    fontSize: 16,
    flex: 1,
  },
  itemActions: {
    flexDirection: 'row',
  },
  addButton: {
    marginTop: 10,
    borderRadius: 16,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: '25%', // Slightly lower to show more content
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    color: '#1F2933', // Use direct color since styles are outside component
    width: '100%',
  },
  input: {
    marginBottom: 15,
    minHeight: 56, // Better height for inputs
    width: '100%',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    marginRight: 10,
    borderColor: '#E5E7EB',
    borderWidth: 1,
  },
  addButtonModal: {
    flex: 1,
    marginLeft: 10,
  },
  keyboardAvoid: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LogMeal;