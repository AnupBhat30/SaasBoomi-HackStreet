import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, SafeAreaView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Load ingredients from JSON file
const INGREDIENTS_DATA = require('../ingredients.json');

const Pantry = () => {
  const [items, setItems] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filteredIngredients, setFilteredIngredients] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
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
        !items.includes(ingredient) // Don't show already added items
      );
      setFilteredIngredients(filtered);
      setShowDropdown(true);
    } else {
      setFilteredIngredients([]);
      setShowDropdown(false);
    }
  }, [searchText, items]);

  const addItem = () => {
    if (searchText.trim() && !items.includes(searchText.trim())) {
      setItems([...items, searchText.trim()]);
      setSearchText('');
      setShowDropdown(false);
    }
  };

  const selectIngredient = (ingredient: string) => {
    setSearchText(ingredient);
    setShowDropdown(false);
  };

  const removeItem = (item: string) => {
    setItems(items.filter(i => i !== item));
  };

  const setPantry = () => {
    const environmentContext = {
      availability: items,
      season: 'monsoon'
    };
    fetch('http://10.20.1.20:5000/store_environment_context', {
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F6F7F9' }}>
      <View style={{ flex: 1, padding: 20 }}>
        {/* Header with Back Button */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 15 }}>
            <Ionicons name="arrow-back" size={24} color="#1F2933" />
          </TouchableOpacity>
          <Text style={{ fontSize: 24, fontWeight: 'bold' }}>My Pantry</Text>
        </View>
        
        {items.length > 0 && <Text style={{ fontSize: 16, marginBottom: 20 }}>{items.length} items stored</Text>}
        
        {/* Add Item Section */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 10 }}>Add new item</Text>
          <View style={{ position: 'relative' }}>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#D1D5DB',
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                backgroundColor: '#FFFFFF'
              }}
              placeholder="Search for ingredients..."
              value={searchText}
              onChangeText={setSearchText}
              onFocus={() => searchText.length > 0 && setShowDropdown(true)}
            />
            
            {/* Dropdown */}
            {showDropdown && filteredIngredients.length > 0 && (
              <View style={{
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
              }}>
                <FlatList
                  data={filteredIngredients.slice(0, 10)} // Limit to 10 suggestions
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={{
                        padding: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: '#F3F4F6'
                      }}
                      onPress={() => selectIngredient(item)}
                    >
                      <Text style={{ fontSize: 16 }}>{item}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}
          </View>
          
          <View style={{ flexDirection: 'row', marginTop: 10 }}>
            <TouchableOpacity
              style={{
                backgroundColor: '#3B82F6',
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 8,
                marginRight: 10
              }}
              onPress={addItem}
              disabled={!searchText.trim()}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>Add</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                backgroundColor: '#6B7280',
                paddingVertical: 10,
                paddingHorizontal: 20,
                borderRadius: 8
              }}
              onPress={() => {
                setSearchText('');
                setShowDropdown(false);
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>

        {items.length === 0 && !searchText && (
          <View style={{ alignItems: 'center', marginTop: 50 }}>
            <Text style={{ fontSize: 18, color: '#6B7280', marginBottom: 20 }}>No items currently..</Text>
            <TouchableOpacity
              style={{
                backgroundColor: '#3B82F6',
                width: 60,
                height: 60,
                borderRadius: 30,
                justifyContent: 'center',
                alignItems: 'center'
              }}
              onPress={() => {/* Focus the input */}}
            >
              <Ionicons name="add" size={30} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}
        
        {items.length > 0 && (
          <FlatList
            data={items}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#FFFFFF',
                padding: 15,
                marginBottom: 10,
                borderRadius: 8,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2
              }}>
                <Text style={{ fontSize: 16 }}>{item}</Text>
                <TouchableOpacity onPress={() => removeItem(item)}>
                  <Ionicons name="remove-circle" size={24} color="#EF4444" />
                </TouchableOpacity>
              </View>
            )}
          />
        )}
        
        {items.length > 0 && (
          <View>
            <TouchableOpacity onPress={setPantry} style={{ backgroundColor: '#FF6B00', padding: 15, borderRadius: 16, marginTop: 20, alignItems: 'center' }}>
              <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>Set Pantry</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => router.push('/LogMeal')} style={{ backgroundColor: '#4CAF50', padding: 15, borderRadius: 16, marginTop: 10, alignItems: 'center' }}>
              <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>Enter Your Meals</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Pantry;
