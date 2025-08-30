import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Image } from 'react-native';
import React, { useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

// Dummy data for recipes
const dummyRecipes = [
  { id: '1', title: 'Chicken Biryani', image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=300', heritage: 'Indian', likes: 120 },
  { id: '2', title: 'Sushi Rolls', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=300', heritage: 'Japanese', likes: 95 },
  { id: '3', title: 'Pasta Carbonara', image: 'https://images.unsplash.com/photo-1551892376-c73a4e34b8e0?w=300', heritage: 'Italian', likes: 78 },
  { id: '4', title: 'Tacos', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300', heritage: 'Mexican', likes: 110 },
];

const RecipeCard = ({ item, index }: { item: any, index: number }) => (
  <Animated.View entering={FadeInUp.delay(index * 100)} style={styles.card}>
    <Image source={{ uri: item.image }} style={styles.cardImage} />
    <Text style={styles.cardTitle}>{item.title}</Text>
    <Text style={styles.cardHeritage}>{item.heritage}</Text>
    <View style={styles.cardFooter}>
      <TouchableOpacity onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
        <MaterialIcons name="favorite-border" size={20} color="#FF6B00" />
      </TouchableOpacity>
      <Text style={styles.likes}>{item.likes} likes</Text>
    </View>
  </Animated.View>
);

export default function ExploreScreen() {
  const [search, setSearch] = useState('');
  const [filteredRecipes, setFilteredRecipes] = useState(dummyRecipes);

  const handleSearch = (text: string) => {
    setSearch(text);
    const filtered = dummyRecipes.filter(recipe =>
      recipe.title.toLowerCase().includes(text.toLowerCase()) ||
      recipe.heritage.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredRecipes(filtered);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Explore Recipes</Text>
      <TextInput
        style={styles.searchBar}
        placeholder="Search by name or heritage..."
        value={search}
        onChangeText={handleSearch}
      />
      <FlatList
        data={filteredRecipes}
        renderItem={({ item, index }) => <RecipeCard item={item} index={index} />}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7F9',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2933',
    marginBottom: 20,
  },
  searchBar: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 15,
    margin: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  cardImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2933',
    textAlign: 'center',
    marginBottom: 5,
  },
  cardHeritage: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  likes: {
    fontSize: 12,
    color: '#6B7280',
  },
});
