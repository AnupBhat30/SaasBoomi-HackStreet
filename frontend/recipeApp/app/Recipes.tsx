import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView,
  Image,
  Alert,
  FlatList,
  Modal,
  Dimensions
} from 'react-native';
import { TextInput, Button, Chip } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, SlideInRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface Recipe {
  id: string;
  title?: string;
  name?: string;
  description?: string;
  ingredients?: string[] | any[];
  instructions?: string[] | any[];
  cuisine?: string;
  cookingTime?: string;
  cooking_time?: string;
  prep_time?: string;
  difficulty?: string;
  image?: string;
  tags?: string[];
  category?: string;
  servings?: number;
  nutrition?: any;
  [key: string]: any; // For flexible JSON structure
}

interface AIRecommendation {
  name: string;
  description: string;
  ingredients: string[];
  whyRecommended: string;
  nutritionalBenefits: string;
  heritageSiginificance: string;
  preparationTime: string;
  difficulty: string;
}

const Recipes = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);
  const [jsonRecipes, setJsonRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [recipesLoading, setRecipesLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const router = useRouter();

  const popularSearches = [
    'Healthy breakfast', 'Quick dinner', 'High protein', 'Low carb',
    'Comfort food', 'Vegetarian', 'South Indian', 'North Indian'
  ];

  useEffect(() => {
    fetchJsonRecipes();
  }, []);

  const fetchJsonRecipes = async () => {
    try {
      const response = await fetch('http://10.20.2.95:5000/family/recipes/all');
      if (response.ok) {
        const data = await response.json();
        setJsonRecipes(data.recipes || []);
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setRecipesLoading(false);
    }
  };

  const getAIRecommendations = async (query: string) => {
    setLoading(true);
    try {
      const response = await fetch('http://10.20.2.95:5000/family/recipes/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query: query,
          userId: 'default',
          preferences: {
            dietary: 'Balanced',
            nutritional: 'General health',
            region: 'Pan-Indian'
          }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiRecommendations(data.recommendations || []);
      } else {
        Alert.alert('Error', 'Failed to get recipe recommendations');
      }
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
      Alert.alert('Error', 'Failed to connect to recommendation service');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      getAIRecommendations(searchQuery.trim());
    }
  };

  const handleQuickSearch = (query: string) => {
    setSearchQuery(query);
    getAIRecommendations(query);
  };

  const renderAIRecommendation = ({ item, index }: { item: AIRecommendation; index: number }) => (
    <Animated.View 
      entering={SlideInRight.delay(index * 100)} 
      style={styles.aiRecommendationCard}
    >
      <LinearGradient
        colors={['#FF6B00', '#FFA366']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.aiCardHeader}
      >
        <MaterialIcons name="auto-awesome" size={20} color="#FFF" />
        <Text style={styles.aiCardHeaderText}>AI Recommended</Text>
      </LinearGradient>
      
      <View style={styles.aiCardContent}>
        <Text style={styles.aiRecipeName}>{item.name}</Text>
        <Text style={styles.aiRecipeDescription}>{item.description}</Text>
        
        <View style={styles.aiRecipeDetails}>
          <View style={styles.aiDetailItem}>
            <MaterialIcons name="schedule" size={16} color="#FF6B00" />
            <Text style={styles.aiDetailText}>{item.preparationTime}</Text>
          </View>
          <View style={styles.aiDetailItem}>
            <MaterialIcons name="bar-chart" size={16} color="#FF6B00" />
            <Text style={styles.aiDetailText}>{item.difficulty}</Text>
          </View>
        </View>

        <Text style={styles.aiSectionTitle}>Why Recommended:</Text>
        <Text style={styles.aiSectionText}>{item.whyRecommended}</Text>

        <Text style={styles.aiSectionTitle}>Nutritional Benefits:</Text>
        <Text style={styles.aiSectionText}>{item.nutritionalBenefits}</Text>

        {item.heritageSiginificance && (
          <>
            <Text style={styles.aiSectionTitle}>Heritage:</Text>
            <Text style={styles.aiSectionText}>{item.heritageSiginificance}</Text>
          </>
        )}

        <View style={styles.aiIngredientsContainer}>
          <Text style={styles.aiSectionTitle}>Key Ingredients:</Text>
          <View style={styles.aiIngredientsWrap}>
            {item.ingredients?.slice(0, 4).map((ingredient, idx) => (
              <View key={idx} style={styles.aiIngredientChip}>
                <Text style={styles.aiIngredientText}>{ingredient}</Text>
              </View>
            ))}
            {item.ingredients?.length > 4 && (
              <Text style={styles.aiMoreText}>+{item.ingredients.length - 4} more</Text>
            )}
          </View>
        </View>
      </View>
    </Animated.View>
  );

  const openRecipeModal = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setShowRecipeModal(true);
  };

  const getRecipeTitle = (recipe: Recipe) => {
    return recipe.TranslatedRecipeName || recipe.title || recipe.name || 'Untitled Recipe';
  };

  const getRecipeTime = (recipe: Recipe) => {
    if (recipe.TotalTimeInMins) return `${recipe.TotalTimeInMins} mins`;
    if (recipe.cookingTime) return recipe.cookingTime;
    if (recipe.cooking_time) return recipe.cooking_time;
    if (recipe.prep_time) return recipe.prep_time;
    return null;
  };

  const getRecipeCuisine = (recipe: Recipe) => {
    return recipe.Cuisine || recipe.cuisine || null;
  };

  const renderJsonRecipe = ({ item, index }: { item: Recipe; index: number }) => (
    <Animated.View 
      entering={SlideInRight.delay(200 + index * 50)} 
      style={styles.recipeCard}
    >
      <TouchableOpacity 
        style={styles.recipeCardTouchable} 
        activeOpacity={0.8}
        onPress={() => openRecipeModal(item)}
      >
        <View style={styles.recipeImageContainer}>
          <LinearGradient
            colors={['#FF6B00', '#FFA366']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.recipeImagePlaceholder}
          >
            <MaterialIcons name="restaurant" size={32} color="#FFF" />
          </LinearGradient>
        </View>
        
        <View style={styles.recipeCardContent}>
          <Text style={styles.recipeTitle} numberOfLines={2}>
            {getRecipeTitle(item)}
          </Text>

          <View style={styles.recipeDetails}>
            {getRecipeTime(item) && (
              <View style={styles.recipeDetailItem}>
                <MaterialIcons name="schedule" size={14} color="#6B7280" />
                <Text style={styles.recipeDetailText}>{getRecipeTime(item)}</Text>
              </View>
            )}
            {getRecipeCuisine(item) && (
              <View style={styles.recipeDetailItem}>
                <MaterialIcons name="restaurant" size={14} color="#6B7280" />
                <Text style={styles.recipeDetailText}>{getRecipeCuisine(item)}</Text>
              </View>
            )}
          </View>

          {item.tags && item.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {item.tags.slice(0, 3).map((tag: string, idx: number) => (
                <View key={idx} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
              {item.tags.length > 3 && (
                <Text style={styles.moreTagsText}>+{item.tags.length - 3} more</Text>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2933" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recipes for You</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* AI Search Section */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.searchSection}>
          <LinearGradient
            colors={['#4CAF50', '#66BB6A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.searchHeader}
          >
            <MaterialIcons name="psychology" size={32} color="#FFF" />
            <Text style={styles.searchHeaderTitle}>What would you like to eat?</Text>
            <Text style={styles.searchHeaderSubtitle}>
              Tell our AI what you&apos;re craving and get personalized recipe recommendations
            </Text>
          </LinearGradient>

          <View style={styles.searchInputContainer}>
            <TextInput
              label="Describe what you want to eat..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              mode="outlined"
              style={styles.searchInput}
              placeholder="e.g., Something healthy for breakfast, comfort food for dinner..."
              multiline
              numberOfLines={2}
              right={
                <TextInput.Icon 
                  icon="send" 
                  onPress={handleSearch}
                  disabled={!searchQuery.trim() || loading}
                />
              }
            />

            <Button
              mode="contained"
              onPress={handleSearch}
              loading={loading}
              disabled={loading || !searchQuery.trim()}
              style={styles.searchButton}
              contentStyle={styles.searchButtonContent}
            >
              {loading ? 'Getting Recommendations...' : 'Get AI Recommendations'}
            </Button>

            {/* Quick Search Options */}
            <View style={styles.quickSearchContainer}>
              <Text style={styles.quickSearchTitle}>Popular searches:</Text>
              <View style={styles.quickSearchWrap}>
                {popularSearches.map((search, index) => (
                  <Chip
                    key={index}
                    onPress={() => handleQuickSearch(search)}
                    style={styles.quickSearchChip}
                    textStyle={styles.quickSearchChipText}
                  >
                    {search}
                  </Chip>
                ))}
              </View>
            </View>
          </View>
        </Animated.View>

        {/* AI Recommendations */}
        {aiRecommendations.length > 0 && (
          <Animated.View entering={FadeInUp.delay(300)} style={styles.recommendationsSection}>
            <Text style={styles.sectionTitle}>AI Recommended for You</Text>
            <FlatList
              data={aiRecommendations}
              renderItem={renderAIRecommendation}
              keyExtractor={(_, index) => `ai-${index}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.aiRecommendationsList}
            />
          </Animated.View>
        )}

        {/* All Recipes */}
        <Animated.View entering={FadeInUp.delay(400)} style={styles.allRecipesSection}>
          <Text style={styles.sectionTitle}>
            All Recipes ({jsonRecipes.length})
          </Text>
          {recipesLoading ? (
            <View style={styles.loadingContainer}>
              <MaterialIcons name="restaurant" size={40} color="#FF6B00" />
              <Text style={styles.loadingText}>Loading delicious recipes...</Text>
            </View>
          ) : (
            <FlatList
              data={jsonRecipes}
              renderItem={renderJsonRecipe}
              keyExtractor={(item, index) => item.id || `recipe-${index}`}
              numColumns={2}
              columnWrapperStyle={styles.recipeRow}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          )}
        </Animated.View>
      </ScrollView>

      {/* Recipe Detail Modal */}
      <Modal
        visible={showRecipeModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowRecipeModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          {selectedRecipe && (
            <>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <TouchableOpacity 
                  onPress={() => setShowRecipeModal(false)}
                  style={styles.modalCloseButton}
                >
                  <Ionicons name="close" size={24} color="#1F2933" />
                </TouchableOpacity>
                <Text style={styles.modalHeaderTitle}>Recipe Details</Text>
                <View style={styles.placeholder} />
              </View>

              <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                {/* Recipe Title */}
                <View style={styles.modalRecipeHeader}>
                  <Text style={styles.modalRecipeTitle}>
                    {getRecipeTitle(selectedRecipe)}
                  </Text>
                  
                  <View style={styles.modalRecipeDetails}>
                    {getRecipeTime(selectedRecipe) && (
                      <View style={styles.modalDetailItem}>
                        <MaterialIcons name="schedule" size={16} color="#FF6B00" />
                        <Text style={styles.modalDetailText}>{getRecipeTime(selectedRecipe)}</Text>
                      </View>
                    )}
                    {getRecipeCuisine(selectedRecipe) && (
                      <View style={styles.modalDetailItem}>
                        <MaterialIcons name="restaurant" size={16} color="#FF6B00" />
                        <Text style={styles.modalDetailText}>{getRecipeCuisine(selectedRecipe)}</Text>
                      </View>
                    )}
                  </View>

                  {selectedRecipe.tags && selectedRecipe.tags.length > 0 && (
                    <View style={styles.modalTagsContainer}>
                      {selectedRecipe.tags.map((tag: string, idx: number) => (
                        <View key={idx} style={styles.modalTag}>
                          <Text style={styles.modalTagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                {/* Ingredients */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Ingredients</Text>
                  <View style={styles.modalIngredients}>
                    {selectedRecipe.TranslatedIngredients ? (
                      <Text style={styles.modalIngredientsText}>
                        {selectedRecipe.TranslatedIngredients}
                      </Text>
                    ) : selectedRecipe.ingredients ? (
                      Array.isArray(selectedRecipe.ingredients) ? (
                        selectedRecipe.ingredients.map((ingredient: any, idx: number) => (
                          <Text key={idx} style={styles.modalIngredientItem}>
                            • {typeof ingredient === 'string' ? ingredient : ingredient.name || ingredient}
                          </Text>
                        ))
                      ) : (
                        <Text style={styles.modalIngredientsText}>{selectedRecipe.ingredients}</Text>
                      )
                    ) : (
                      <Text style={styles.modalNoData}>No ingredients available</Text>
                    )}
                  </View>
                </View>

                {/* Instructions */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Instructions</Text>
                  <View style={styles.modalInstructions}>
                    {selectedRecipe.TranslatedInstructions ? (
                      <Text style={styles.modalInstructionsText}>
                        {selectedRecipe.TranslatedInstructions}
                      </Text>
                    ) : selectedRecipe.instructions ? (
                      Array.isArray(selectedRecipe.instructions) ? (
                        selectedRecipe.instructions.map((instruction: any, idx: number) => (
                          <Text key={idx} style={styles.modalInstructionStep}>
                            {idx + 1}. {typeof instruction === 'string' ? instruction : instruction.text || instruction}
                          </Text>
                        ))
                      ) : (
                        <Text style={styles.modalInstructionsText}>{selectedRecipe.instructions}</Text>
                      )
                    ) : (
                      <Text style={styles.modalNoData}>No instructions available</Text>
                    )}
                  </View>
                </View>
              </ScrollView>
            </>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7F9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2933',
  },
  placeholder: {
    width: 40,
  },
  scrollContainer: {
    flex: 1,
  },
  searchSection: {
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchHeader: {
    padding: 24,
    alignItems: 'center',
  },
  searchHeaderTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF',
    marginTop: 8,
    textAlign: 'center',
  },
  searchHeaderSubtitle: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 20,
  },
  searchInputContainer: {
    backgroundColor: '#FFF',
    padding: 20,
  },
  searchInput: {
    marginBottom: 16,
    backgroundColor: '#FFF',
  },
  searchButton: {
    backgroundColor: '#4CAF50',
    marginBottom: 20,
  },
  searchButtonContent: {
    paddingVertical: 8,
  },
  quickSearchContainer: {
    marginTop: 8,
  },
  quickSearchTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 12,
  },
  quickSearchWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  quickSearchChip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#F3F4F6',
  },
  quickSearchChipText: {
    fontSize: 12,
    color: '#374151',
  },
  recommendationsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2933',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  aiRecommendationsList: {
    paddingHorizontal: 20,
  },
  aiRecommendationCard: {
    width: 300,
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginRight: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  aiCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  aiCardHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
    marginLeft: 6,
  },
  aiCardContent: {
    padding: 16,
  },
  aiRecipeName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2933',
    marginBottom: 8,
  },
  aiRecipeDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  aiRecipeDetails: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  aiDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  aiDetailText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  aiSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2933',
    marginTop: 12,
    marginBottom: 4,
  },
  aiSectionText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
  aiIngredientsContainer: {
    marginTop: 12,
  },
  aiIngredientsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  aiIngredientChip: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  aiIngredientText: {
    fontSize: 10,
    color: '#F57C00',
    fontWeight: '500',
  },
  aiMoreText: {
    fontSize: 10,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  allRecipesSection: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
  recipeRow: {
    justifyContent: 'space-between',
  },
  recipeCard: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recipeCardTouchable: {
    flex: 1,
  },
  recipeImageContainer: {
    width: '100%',
    height: 100,
  },
  recipeImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recipeCardContent: {
    padding: 12,
  },
  recipeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2933',
    marginBottom: 4,
    lineHeight: 18,
  },
  recipeDescription: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
    marginBottom: 8,
  },
  recipeDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  recipeDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 4,
  },
  recipeDetailText: {
    fontSize: 10,
    color: '#6B7280',
    marginLeft: 2,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 4,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 9,
    color: '#2E7D32',
    fontWeight: '500',
  },
  moreTagsText: {
    fontSize: 9,
    color: '#6B7280',
    fontStyle: 'italic',
    marginLeft: 4,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F6F7F9',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2933',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalRecipeHeader: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modalRecipeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2933',
    marginBottom: 12,
    lineHeight: 30,
  },
  modalRecipeDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  modalDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  modalDetailText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
  },
  modalTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  modalTag: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  modalTagText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '500',
  },
  modalSection: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2933',
    marginBottom: 12,
  },
  modalIngredients: {
    marginTop: 8,
  },
  modalIngredientsText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
  },
  modalIngredientItem: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 4,
  },
  modalInstructions: {
    marginTop: 8,
  },
  modalInstructionsText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 24,
  },
  modalInstructionStep: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 12,
  },
  modalNoData: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
});

export default Recipes;
