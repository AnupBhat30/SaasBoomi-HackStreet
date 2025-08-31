import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { TextInput, Button, Chip } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeInUp, SlideInRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface RecipeCoordinatorProps {
  onCreatePlan: (mealIdea: string) => void;
  loading: boolean;
}

const RecipeCoordinator: React.FC<RecipeCoordinatorProps> = ({ onCreatePlan, loading }) => {
  const [mealIdea, setMealIdea] = useState('');
  const [selectedSuggestion, setSelectedSuggestion] = useState('');

  const mealSuggestions = [
    'Rajma Chawal',
    'Dal Tadka with Roti',
    'Palak Paneer',
    'Vegetable Biryani',
    'Chole Bhature',
    'Aloo Gobi',
    'Masoor Dal',
    'Paneer Butter Masala'
  ];

  const handleCreatePlan = () => {
    const finalMealIdea = selectedSuggestion || mealIdea;
    if (finalMealIdea.trim()) {
      onCreatePlan(finalMealIdea.trim());
    }
  };

  const handleSuggestionSelect = (suggestion: string) => {
    setSelectedSuggestion(suggestion);
    setMealIdea(suggestion);
  };

  return (
    <Animated.View entering={FadeInUp.delay(300)} style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#FF6B00', '#FFA366']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerCard}
      >
        <MaterialIcons name="auto-fix-high" size={32} color="#FFF" />
        <Text style={styles.headerTitle}>AI Recipe Coordinator</Text>
        <Text style={styles.headerSubtitle}>
          Transform any recipe to work for your entire family&apos;s health needs
        </Text>
      </LinearGradient>

      {/* Recipe Input Section */}
      <View style={styles.inputSection}>
        <Text style={styles.sectionTitle}>What would you like to cook today?</Text>
        <Text style={styles.sectionDescription}>
          Enter a recipe name or dish you&apos;d like to make for the family
        </Text>

        <TextInput
          label="Recipe or dish name"
          value={mealIdea}
          onChangeText={setMealIdea}
          mode="outlined"
          style={styles.input}
          placeholder="e.g., Rajma Chawal, Palak Paneer, Biryani..."
          right={mealIdea ? <TextInput.Icon icon="close" onPress={() => {setMealIdea(''); setSelectedSuggestion('');}} /> : undefined}
        />

        {/* Quick Suggestions */}
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>Popular Family Recipes</Text>
          <View style={styles.chipContainer}>
            {mealSuggestions.map((suggestion, index) => (
              <Chip
                key={index}
                selected={selectedSuggestion === suggestion}
                onPress={() => handleSuggestionSelect(suggestion)}
                style={[
                  styles.suggestionChip,
                  selectedSuggestion === suggestion && styles.selectedChip
                ]}
                textStyle={selectedSuggestion === suggestion ? styles.selectedChipText : styles.chipText}
              >
                {suggestion}
              </Chip>
            ))}
          </View>
        </View>

        {/* Action Button */}
        <Button
          mode="contained"
          onPress={handleCreatePlan}
          loading={loading}
          disabled={loading || (!mealIdea.trim() && !selectedSuggestion)}
          style={styles.createButton}
          contentStyle={styles.createButtonContent}
        >
          {loading ? 'Creating Coordinated Plan...' : 'Create Family Plan'}
        </Button>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <MaterialIcons name="lightbulb" size={20} color="#FF6B00" />
            <Text style={styles.infoTitle}>How it works</Text>
          </View>
          <Text style={styles.infoText}>
            Our AI analyzes your family&apos;s health profiles and suggests recipe modifications, 
            portion sizes, and cooking instructions that address everyone&apos;s unique nutritional needs 
            in one coordinated meal.
          </Text>
          
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <MaterialIcons name="check-circle" size={16} color="#4CAF50" />
              <Text style={styles.benefitText}>Personalized modifications for each member</Text>
            </View>
            <View style={styles.benefitItem}>
              <MaterialIcons name="check-circle" size={16} color="#4CAF50" />
              <Text style={styles.benefitText}>Specific portion recommendations</Text>
            </View>
            <View style={styles.benefitItem}>
              <MaterialIcons name="check-circle" size={16} color="#4CAF50" />
              <Text style={styles.benefitText}>One cooking session for multiple needs</Text>
            </View>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  headerCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF',
    marginTop: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 20,
  },
  inputSection: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2933',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  input: {
    marginBottom: 20,
    backgroundColor: '#FFF',
  },
  suggestionsContainer: {
    marginBottom: 24,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  suggestionChip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
  },
  selectedChip: {
    backgroundColor: '#FF6B00',
  },
  chipText: {
    color: '#374151',
    fontSize: 12,
  },
  selectedChipText: {
    color: '#FFF',
    fontSize: 12,
  },
  createButton: {
    marginBottom: 20,
    backgroundColor: '#FF6B00',
  },
  createButtonContent: {
    paddingVertical: 8,
  },
  infoCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B00',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2933',
    marginLeft: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 12,
  },
  benefitsList: {
    marginTop: 4,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  benefitText: {
    fontSize: 12,
    color: '#374151',
    marginLeft: 8,
    flex: 1,
  },
});

export default RecipeCoordinator;
