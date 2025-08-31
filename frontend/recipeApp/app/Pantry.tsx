import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView, AnimatePresence } from 'moti';


// Load ingredients from JSON file
const INGREDIENTS_DATA = require('../ingredients.json');

const Pantry = () => {
  const [items, setItems] = useState<{name: string, expiry?: Date, quantity: number}[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filteredIngredients, setFilteredIngredients] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const [bagExpanded, setBagExpanded] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Load from AsyncStorage if exists
    AsyncStorage.getItem('pantryItems').then((data) => {
      if (data) {
        setItems(JSON.parse(data));
      }
    });
  }, []);

  // Filter ingredients based on search text
  useEffect(() => {
    if (searchText.length > 0) {
      const filtered = INGREDIENTS_DATA.filter((ingredient: string) =>
        ingredient.toLowerCase().includes(searchText.toLowerCase()) &&
        !items.some(item => item.name === ingredient) // Don't show already added items
      );
      setFilteredIngredients(filtered);
      setShowDropdown(true);
    } else {
      setFilteredIngredients([]);
      setShowDropdown(false);
    }
  }, [searchText, items]);

  const addItem = useCallback(() => {
    if (searchText.trim() && !items.some(item => item.name === searchText.trim())) {
      const newItem = { name: searchText.trim(), quantity: 1 };
      const newItems = [...items, newItem];
      setItems(newItems);
      setSearchText('');
      setShowDropdown(false);
      
      // Check for milestones
      if (newItems.length === 5 || newItems.length === 10 || newItems.length === 15) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
      }
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [searchText, items]);

  const selectIngredient = useCallback((ingredient: string) => {
    setSearchText(ingredient);
    setShowDropdown(false);
  }, []);

  const removeItem = useCallback((itemName: string) => {
    setItems(prev => prev.filter(i => i.name !== itemName));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const categorizeItems = useCallback(() => {
    const categories = {
      grains: ['rice', 'wheat', 'oats', 'quinoa', 'barley', 'corn', 'pasta', 'bread'],
      veggies: ['tomato', 'onion', 'potato', 'carrot', 'spinach', 'lettuce', 'broccoli', 'cucumber'],
      spices: ['cumin', 'turmeric', 'chili', 'garam masala', 'coriander', 'cardamom', 'pepper'],
      others: []
    };

    const result = { grains: 0, veggies: 0, spices: 0, others: 0 };

    items.forEach(item => {
      const name = item.name.toLowerCase();
      if (categories.grains.some(g => name.includes(g))) result.grains++;
      else if (categories.veggies.some(v => name.includes(v))) result.veggies++;
      else if (categories.spices.some(s => name.includes(s))) result.spices++;
      else result.others++;
    });

    return result;
  }, [items]);

  const categorizedData = useMemo(() => categorizeItems(), [categorizeItems]);

  const setPantry = () => {
    const environmentContext = {
      availability: items.map(item => item.name),
      season: 'monsoon'
    };
    fetch('http://10.20.2.95:5000/nudging/store_environment_context', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ environmentContext }),
    })
      .then(response => response.json())
      .then(result => {
        console.log('Storage result:', result);
        AsyncStorage.setItem('pantryItems', JSON.stringify(items));
        Alert.alert('Success', 'Pantry set successfully!');
      })
      .catch(error => {
        console.error('Error storing pantry:', error);
        Alert.alert('Error', 'Failed to set pantry.');
      });
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      {/* Top Bar Header */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2933" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.pageTitle}>My Pantry</Text>
        </View>
        <View style={styles.rightPlaceholder} />
      </View>

      {/* Main Container */}
      <View style={styles.mainContainer}>
      {/* Animated Shopping Bag */}
      <View style={styles.bagContainer}>
      <TouchableOpacity
        onPress={() => setBagExpanded(!bagExpanded)}
        style={styles.bagTouchable}
      >
        <MotiView
          animate={{ scale: 1 }}
          transition={{ type: 'timing', duration: 200 }}
          style={styles.bagWrapper}
        >
          <Ionicons
            name={items.length > 10 ? "bag" : items.length > 5 ? "bag-handle" : "bag-handle-outline"}
            size={40}
            color="#FF6B00"
          />
          {items.length > 0 && (
            <View style={styles.bagBadge}>
              <Text style={styles.bagBadgeText}>{items.length}</Text>
            </View>
          )}
        </MotiView>
      </TouchableOpacity>

      {/* Celebration Effect */}
      <AnimatePresence>
        {showCelebration && (
          <MotiView
            from={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'timing', duration: 400 }}
            style={{
              position: 'absolute',
              top: 80,
              left: '50%',
              marginLeft: -50,
              backgroundColor: '#10B981',
              padding: 16,
              borderRadius: 12,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 10,
            }}
          >
            <Ionicons name="sparkles" size={24} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700', marginTop: 4 }}>
              {items.length === 5 ? 'Great start!' : items.length === 10 ? 'Halfway there!' : 'Pantry master!'}
            </Text>
            <Text style={{ color: '#FFFFFF', fontSize: 12, marginTop: 2 }}>
              {items.length} ingredients collected
            </Text>
          </MotiView>
        )}
      </AnimatePresence>
    </View>

      {/* Bag Expanded Preview */}
      <AnimatePresence>
        {bagExpanded && (
          <MotiView
            from={{ height: 0, opacity: 0 }}
            animate={{ height: 120, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'timing', duration: 250 }}
            style={styles.bagPreview}
          >
            <Text style={styles.previewTitle}>Pantry Summary</Text>
            <Text style={styles.previewText}>
              You have {items.length} items in your pantry
            </Text>
            <View style={styles.categoryRow}>
              {categorizedData.grains > 0 && <Text style={styles.categoryText}>🍚 {categorizedData.grains} grains</Text>}
              {categorizedData.veggies > 0 && <Text style={styles.categoryText}>🥕 {categorizedData.veggies} veggies</Text>}
              {categorizedData.spices > 0 && <Text style={styles.categoryText}>🌶️ {categorizedData.spices} spices</Text>}
              {categorizedData.others > 0 && <Text style={styles.categoryText}>🧂 {categorizedData.others} others</Text>}
            </View>
          </MotiView>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Add Item Section */}
        <MotiView
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'timing', duration: 300 }}
          style={styles.addItemSection}
        >
          <Text style={styles.addItemTitle}>Add new item</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Search for ingredients..."
              value={searchText}
              onChangeText={setSearchText}
              onFocus={() => { searchText.length > 0 && setShowDropdown(true); }}
              onBlur={() => {}}
            />

            {/* Dropdown */}
            <AnimatePresence>
              {showDropdown && filteredIngredients.length > 0 && (
                <MotiView
                  from={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: 'timing', duration: 150 }}
                  style={styles.dropdownContainer}
                >
                  <ScrollView
                    style={styles.dropdownScrollView}
                    showsVerticalScrollIndicator={false}
                  >
                    {filteredIngredients.slice(0, 10).map((item, index) => (
                      <TouchableOpacity
                        key={item}
                        style={styles.dropdownItem}
                        onPress={() => selectIngredient(item)}
                      >
                        <Text style={styles.dropdownItemText}>{item}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </MotiView>
                )}
              </AnimatePresence>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.addButton}
                onPress={addItem}
                disabled={!searchText.trim()}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setSearchText('');
                  setShowDropdown(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </MotiView>

          {items.length === 0 && !searchText && (
            <MotiView
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'timing', duration: 400 }}
              style={styles.emptyState}
            >
              <MotiView
                animate={{ scale: [1, 1.02, 1] }}
                transition={{
                  type: 'timing',
                  duration: 3000,
                  repeat: Infinity,
                  repeatReverse: true
                }}
              >
                <Ionicons name="bag-handle-outline" size={80} color="#6B7280" />
              </MotiView>
              <Text style={styles.emptyStateTitle}>Your pantry bag is empty!</Text>
              <Text style={styles.emptyStateText}>Start filling it with delicious ingredients for your next meal.</Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={() => {/* Focus the input */}}
              >
                <Ionicons name="add" size={30} color="#FFFFFF" />
              </TouchableOpacity>
            </MotiView>
          )}

          {items.length > 0 && (
            <View style={styles.ingredientsSection}>
              <Text style={styles.ingredientsTitle}>Your Ingredients</Text>
              <View style={styles.ingredientsContainer}>
                {items.map((item, index) => (
                  <MotiView
                    key={item.name}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'timing', duration: 300, delay: Math.min(index * 50, 300) }}
                  >
                    <View style={styles.ingredientItem}>
                      <TouchableOpacity
                        onPress={() => removeItem(item.name)}
                        style={styles.ingredientButton}
                      >
                        <MaterialCommunityIcons name="food-apple" size={16} color="#FF6B00" style={{ marginRight: 5 }} />
                        <Text style={styles.ingredientText}>{item.name}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => removeItem(item.name)}
                        style={styles.removeIngredientButton}
                      >
                        <MaterialCommunityIcons name="close" size={12} color="#1F2933" />
                      </TouchableOpacity>
                    </View>
                  </MotiView>
                ))}
              </View>
            </View>
          )}

          {items.length > 0 && (
            <MotiView
              animate={{ opacity: 1, transform: [{ translateY: 0 }] }}
              transition={{ type: 'timing', duration: 250 }}
              style={styles.buttonContainer}
            >
              <TouchableOpacity onPress={setPantry} style={styles.smallButton}>
                <Text style={styles.smallButtonText}>Set Pantry</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.push('/LogMeal')} style={[styles.smallButton, { backgroundColor: '#4CAF50' }]}>
                <Text style={styles.smallButtonText}>Enter Meals</Text>
              </TouchableOpacity>
            </MotiView>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  mainContainer: {
    flex: 1,
  },
  headerContainer: {
    backgroundColor: '#f8f9fa',
  },
  mainContent: {
    flex: 1,
    padding: 20,
  },
  addItemSection: {
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5
  },
  addItemTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10
  },
  inputContainer: {
    position: 'relative'
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF'
  },
  dropdownContainer: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    maxHeight: 200,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5
  },
  dropdownScrollView: {
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  dropdownItemText: {
    fontSize: 16
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 10
  },
  addButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginRight: 10
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  },
  cancelButton: {
    backgroundColor: '#6B7280',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 50
  },
  emptyStateTitle: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 20,
    marginTop: 20
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 30
  },
  emptyStateButton: {
    backgroundColor: '#FF6B00',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center'
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FF6B00',
  },
  rightPlaceholder: {
    width: 50,
  },
  bagContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  bagTouchable: {
    position: 'relative',
  },
  bagWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bagBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF6B00',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  bagBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  bagPreview: {
    backgroundColor: '#F8FAFC',
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2933',
    marginBottom: 8,
  },
  previewText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryText: {
    fontSize: 12,
    color: '#374151',
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 10,
  },
  smallButton: {
    backgroundColor: '#FF6B00',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  smallButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  ingredientsSection: {
    marginTop: 20,
  },
  ingredientsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2933',
    marginBottom: 15,
  },
  ingredientsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  ingredientItem: {
    position: 'relative',
    margin: 5,
  },
  ingredientButton: {
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 30,
  },
  ingredientText: {
    color: '#1F2933',
    fontSize: 14,
  },
  removeIngredientButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Pantry;
