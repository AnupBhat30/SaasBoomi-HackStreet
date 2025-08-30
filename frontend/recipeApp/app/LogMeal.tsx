import React, { useState, useRef, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, FlatList, Animated, Dimensions } from 'react-native';
import { Card, Button, IconButton, ProgressBar, TextInput, Chip, Divider, Surface } from 'react-native-paper';
import Collapsible from 'react-native-collapsible';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { MotiView, AnimatePresence } from 'moti';
import * as Haptics from 'expo-haptics';

type MealType = 'breakfast' | 'lunch' | 'snacks' | 'dinner';

interface FoodItem {
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface MealData {
  items: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

const mockFoodData = [
  { name: 'Apple', calories: 95, protein: 0.5, carbs: 25, fat: 0.3 },
  { name: 'Banana', calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
  { name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { name: 'Rice', calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  { name: 'Egg', calories: 70, protein: 6, carbs: 0.6, fat: 5 },
  { name: 'Milk', calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3 },
  { name: 'Bread', calories: 79, protein: 2.7, carbs: 15, fat: 1 },
  { name: 'Potato', calories: 77, protein: 2, carbs: 17, fat: 0.1 },
  { name: 'Tomato', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2 },
  { name: 'Spinach', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
];

const LogMeal = () => {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [meals, setMeals] = useState<Record<MealType, MealData>>({
    breakfast: { items: [], totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 },
    lunch: { items: [], totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 },
    snacks: { items: [], totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 },
    dinner: { items: [], totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 }
  });
  const [expandedMeal, setExpandedMeal] = useState<MealType | null>(null);
  const [searchQueries, setSearchQueries] = useState<Record<MealType, string>>({
    breakfast: '',
    lunch: '',
    snacks: '',
    dinner: ''
  });
  const [searchResults, setSearchResults] = useState<Record<MealType, any[]>>({
    breakfast: [],
    lunch: [],
    snacks: [],
    dinner: []
  });
  const [showSuggestions, setShowSuggestions] = useState<Record<MealType, boolean>>({
    breakfast: false,
    lunch: false,
    snacks: false,
    dinner: false
  });
  const slideAnim = useRef(new Animated.Value(0)).current;

  const mealTypes: MealType[] = ['breakfast', 'lunch', 'snacks', 'dinner'];

  const getMealIcon = (meal: MealType) => {
    switch (meal) {
      case 'breakfast': return 'sunny-outline';
      case 'lunch': return 'restaurant-outline';
      case 'snacks': return 'fast-food-outline';
      case 'dinner': return 'moon-outline';
      default: return 'restaurant-outline';
    }
  };

  const toggleMeal = (meal: MealType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedMeal(expandedMeal === meal ? null : meal);
  };

  const deleteFoodItem = (meal: MealType, index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const updatedMeals = { ...meals };
    const item = updatedMeals[meal].items[index];
    updatedMeals[meal].items.splice(index, 1);
    updatedMeals[meal].totalCalories -= item.calories * item.quantity;
    updatedMeals[meal].totalProtein -= item.protein * item.quantity;
    updatedMeals[meal].totalCarbs -= item.carbs * item.quantity;
    updatedMeals[meal].totalFat -= item.fat * item.quantity;
    setMeals(updatedMeals);
  };

  const calculateProgress = (): number => {
    let logged = 0;
    mealTypes.forEach(meal => {
      if (meals[meal].items.length > 0) logged++;
    });
    return logged / mealTypes.length;
  };

  // MongoDB Atlas Search function
  const searchFoods = useCallback(async (query: string, meal: MealType) => {
    if (query.length === 0) {
      setSearchResults(prev => ({ ...prev, [meal]: [] }));
      setShowSuggestions(prev => ({ ...prev, [meal]: false }));
      return;
    }

    try {
      const response = await fetch(`http://10.20.1.20:5000/search_foods?query=${encodeURIComponent(query)}&limit=5`);
      if (!response.ok) {
        throw new Error('Search request failed');
      }
      const results = await response.json();
      
      setSearchResults(prev => ({ ...prev, [meal]: results }));
      setShowSuggestions(prev => ({ ...prev, [meal]: true }));
    } catch (error) {
      console.error('Error searching foods:', error);
      // Fallback to mock data if API fails
      const filtered = mockFoodData.filter(food =>
        food.name.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(prev => ({ ...prev, [meal]: filtered }));
      setShowSuggestions(prev => ({ ...prev, [meal]: true }));
    }
  }, []);

  const handleSearchChange = (meal: MealType, query: string) => {
    setSearchQueries(prev => ({ ...prev, [meal]: query }));
    // Debounce the search
    const timeoutId = setTimeout(() => {
      searchFoods(query, meal);
    }, 300);
    return () => clearTimeout(timeoutId);
  };

  const selectFoodInline = (meal: MealType, food: any) => {
    const newItem: FoodItem = {
      name: food.name,
      quantity: 1,
      unit: food.unit || 'pieces',
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
    };

    const updatedMeals = { ...meals };
    updatedMeals[meal].items.push(newItem);
    updatedMeals[meal].totalCalories += food.calories;
    updatedMeals[meal].totalProtein += food.protein;
    updatedMeals[meal].totalCarbs += food.carbs;
    updatedMeals[meal].totalFat += food.fat;

    setMeals(updatedMeals);
    setSearchQueries(prev => ({ ...prev, [meal]: '' }));
    setShowSuggestions(prev => ({ ...prev, [meal]: false }));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const addCustomFood = (meal: MealType, foodName: string) => {
    if (foodName.trim()) {
      const newItem: FoodItem = {
        name: foodName.trim(),
        quantity: 1,
        unit: 'pieces',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      };

      const updatedMeals = { ...meals };
      updatedMeals[meal].items.push(newItem);

      setMeals(updatedMeals);
      setSearchQueries(prev => ({ ...prev, [meal]: '' }));
      setShowSuggestions(prev => ({ ...prev, [meal]: false }));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const updateQuantity = (meal: MealType, index: number, change: number) => {
    const updatedMeals = { ...meals };
    const item = updatedMeals[meal].items[index];
    const newQuantity = Math.max(0.1, item.quantity + change);

    // Calculate the difference in nutrition
    const oldNutrition = {
      calories: item.calories * item.quantity,
      protein: item.protein * item.quantity,
      carbs: item.carbs * item.quantity,
      fat: item.fat * item.quantity,
    };

    const newNutrition = {
      calories: item.calories * newQuantity,
      protein: item.protein * newQuantity,
      carbs: item.carbs * newQuantity,
      fat: item.fat * newQuantity,
    };

    // Update item quantity
    item.quantity = newQuantity;

    // Update totals
    updatedMeals[meal].totalCalories += (newNutrition.calories - oldNutrition.calories);
    updatedMeals[meal].totalProtein += (newNutrition.protein - oldNutrition.protein);
    updatedMeals[meal].totalCarbs += (newNutrition.carbs - oldNutrition.carbs);
    updatedMeals[meal].totalFat += (newNutrition.fat - oldNutrition.fat);

    setMeals(updatedMeals);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const clearAllMeals = () => {
    Alert.alert(
      'Clear All Meals',
      'Are you sure you want to clear all logged meals for today?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            setMeals({
              breakfast: { items: [], totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 },
              lunch: { items: [], totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 },
              snacks: { items: [], totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 },
              dinner: { items: [], totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 }
            });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: '#F6F7F9' }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
      <View style={styles.header}>
        <Text style={[styles.title, { color: '#1F2933' }]}>Log Your Meal</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => Alert.alert('Date Selector', 'Calendar popup to be implemented')} style={styles.dateSelector}>
            <Text style={[styles.dateText, { color: '#FF6B00' }]}>
              {selectedDate.toDateString()}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={clearAllMeals} style={styles.clearButton}>
            <Ionicons name="trash-outline" size={20} color="#F59E0B" />
          </TouchableOpacity>
        </View>
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
        <MotiView
          key={meal}
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 300, delay: mealTypes.indexOf(meal) * 100 }}
        >
          <Card style={[styles.mealCard, { backgroundColor: '#FFFFFF' }]}>
            <TouchableOpacity onPress={() => toggleMeal(meal)} style={styles.mealHeader}>
              <View style={styles.mealHeaderLeft}>
                <Ionicons name={getMealIcon(meal)} size={24} color="#FF6B00" style={styles.mealIcon} />
                <View>
                  <Text style={[styles.mealTitle, { color: '#1F2933' }]}>
                    {meal.charAt(0).toUpperCase() + meal.slice(1)}
                  </Text>
                  <Text style={[styles.mealSummary, { color: '#6B7280' }]}>
                    {meals[meal].items.length} items • {meals[meal].totalCalories} kcal
                  </Text>
                </View>
              </View>
              <Ionicons
                name={expandedMeal === meal ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#6B7280"
              />
            </TouchableOpacity>
            <Collapsible collapsed={expandedMeal !== meal}>
              <View style={styles.mealContent}>
                {/* Inline Search Input */}
                <View style={styles.inlineSearchContainer}>
                  <TextInput
                    placeholder="Type to search or add food..."
                    value={searchQueries[meal]}
                    onChangeText={(query) => handleSearchChange(meal, query)}
                    style={[styles.inlineSearchInput, { color: '#1F2933' }]}
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
                    onSubmitEditing={() => addCustomFood(meal, searchQueries[meal])}
                  />
                </View>

                {/* Search Suggestions Dropdown */}
                <AnimatePresence>
                  {showSuggestions[meal] && searchResults[meal].length > 0 && (
                    <MotiView
                      from={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ type: 'timing', duration: 200 }}
                      style={styles.suggestionsDropdown}
                    >
                      <ScrollView 
                        style={styles.suggestionsList}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                      >
                        {searchResults[meal].map((item, index) => (
                          <TouchableOpacity
                            key={`${item.name}-${index}`}
                            style={styles.suggestionItem}
                            onPress={() => selectFoodInline(meal, item)}
                          >
                            <View style={styles.suggestionContent}>
                              <MaterialIcons name="restaurant" size={20} color="#FF6B00" />
                              <View style={styles.suggestionText}>
                                <Text style={[styles.suggestionName, { color: '#1F2933' }]}>
                                  {item.name}
                                </Text>
                                <Text style={[styles.suggestionNutrition, { color: '#6B7280' }]}>
                                  {item.calories} kcal • {item.protein}g protein • {item.carbs}g carbs • {item.fat}g fat
                                </Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </MotiView>
                  )}
                </AnimatePresence>

                {/* No Results Message */}
                {showSuggestions[meal] && searchResults[meal].length === 0 && searchQueries[meal].length > 0 && (
                  <MotiView
                    from={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={styles.noResultsContainer}
                  >
                    <Text style={[styles.noResultsText, { color: '#6B7280' }]}>
                      No matching foods found. Press Enter to add "{searchQueries[meal]}" as custom item.
                    </Text>
                  </MotiView>
                )}

                {/* Logged Items List */}
                <AnimatePresence>
                  {meals[meal].items.map((item: FoodItem, index: number) => (
                    <MotiView
                      key={`${item.name}-${index}`}
                      from={{ opacity: 0, translateX: -20 }}
                      animate={{ opacity: 1, translateX: 0 }}
                      exit={{ opacity: 0, translateX: 20 }}
                      transition={{ type: 'timing', duration: 300 }}
                      style={styles.foodItem}
                    >
                      <View style={styles.foodItemLeft}>
                        <MaterialIcons name="restaurant" size={20} color="#FF6B00" />
                        <View style={styles.foodDetails}>
                          <Text style={[styles.foodName, { color: '#1F2933' }]}>{item.name}</Text>
                          <Text style={[styles.foodQuantity, { color: '#6B7280' }]}>
                            {item.quantity} {item.unit} • {item.calories} kcal
                          </Text>
                        </View>
                      </View>
                      <View style={styles.itemActions}>
                        <IconButton
                          icon="minus"
                          size={20}
                          onPress={() => updateQuantity(meal, index, Math.max(0.1, item.quantity - 0.5))}
                          iconColor="#F59E0B"
                        />
                        <IconButton
                          icon="plus"
                          size={20}
                          onPress={() => updateQuantity(meal, index, item.quantity + 0.5)}
                          iconColor="#22C55E"
                        />
                        <IconButton
                          icon="delete"
                          size={20}
                          onPress={() => deleteFoodItem(meal, index)}
                          iconColor="#EF4444"
                        />
                      </View>
                    </MotiView>
                  ))}
                </AnimatePresence>
                {/* Nutrition Summary - Only show if there are items */}
                {meals[meal].items.length > 0 && (
                  <View style={styles.nutritionSummary}>
                    <Text style={[styles.summaryTitle, { color: '#1F2933' }]}>Nutrition Summary</Text>
                    <View style={styles.macroContainer}>
                      <View style={styles.macroItem}>
                        <Text style={[styles.macroValue, { color: '#FF6B00' }]}>{meals[meal].totalCalories}</Text>
                        <Text style={[styles.macroLabel, { color: '#6B7280' }]}>kcal</Text>
                      </View>
                      <View style={styles.macroItem}>
                        <Text style={[styles.macroValue, { color: '#22C55E' }]}>{meals[meal].totalProtein}g</Text>
                        <Text style={[styles.macroLabel, { color: '#6B7280' }]}>Protein</Text>
                      </View>
                      <View style={styles.macroItem}>
                        <Text style={[styles.macroValue, { color: '#2563EB' }]}>{meals[meal].totalCarbs}g</Text>
                        <Text style={[styles.macroLabel, { color: '#6B7280' }]}>Carbs</Text>
                      </View>
                      <View style={styles.macroItem}>
                        <Text style={[styles.macroValue, { color: '#F59E0B' }]}>{meals[meal].totalFat}g</Text>
                        <Text style={[styles.macroLabel, { color: '#6B7280' }]}>Fat</Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            </Collapsible>
          </Card>
        </MotiView>
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
























      <View style={{ marginTop: 20, alignItems: 'center' }}>
        <Button
          mode="contained"
          onPress={() => {
            // Transform meals data to match backend expectation
            const mealLog = {
              breakfast: meals.breakfast.items.map(item => item.name),
              lunch: meals.lunch.items.map(item => item.name),
              snacks: meals.snacks.items.map(item => item.name),
              dinner: meals.dinner.items.map(item => item.name)
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
    </KeyboardAvoidingView>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  dateText: {
    fontSize: 16,
  },
  clearButton: {
    padding: 10,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginLeft: 10,
  },
  dateSelector: {
    padding: 10,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    color: '#1F2933',
    width: '100%',
  },
  modalTitleContainer: {
    width: '100%',
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1F2933',
  },
  inputDescription: {
    fontSize: 12,
    marginTop: 4,
    color: '#6B7280',
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
  mealHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  mealIcon: {
    marginRight: 12,
  },
  mealSummary: {
    fontSize: 12,
    marginTop: 2,
  },
  foodItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  foodDetails: {
    marginLeft: 12,
    flex: 1,
  },
  foodQuantity: {
    fontSize: 12,
    marginTop: 2,
  },
  nutritionSummary: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  macroContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  macroLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  searchContainer: {
    width: '100%',
    marginBottom: 15,
  },
  suggestionsList: {
    maxHeight: 150,
    width: '100%',
    marginBottom: 15,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  quantityContainer: {
    width: '100%',
    marginBottom: 15,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2933',
  },
  quantityValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF6B00',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  unitContainer: {
    width: '100%',
    marginBottom: 15,
  },
  unitButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  unitButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  nutritionPreview: {
    width: '100%',
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  nutritionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2933',
    marginBottom: 12,
    textAlign: 'center',
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF6B00',
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  keyboardAvoid: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inlineSearchContainer: {
    marginBottom: 12,
  },
  inlineSearchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  suggestionsDropdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 4,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  suggestionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  suggestionText: {
    marginLeft: 12,
    flex: 1,
  },
  suggestionName: {
    fontSize: 16,
    fontWeight: '500',
  },
  suggestionNutrition: {
    fontSize: 12,
    marginTop: 2,
  },
  noResultsContainer: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default LogMeal;