import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet,
  ScrollView
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeInUp, SlideInRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface FamilyMember {
  name: string;
  role: string;
  BMI: number;
  gender: 'Male' | 'Female';
  health_conditions: string[];
  health_goals: string[];
  access_to_kitchen: string;
  stress_level: string;
  meal_source: string;
}

interface MealModification {
  member_name: string;
  modification_details: string;
  reason: string;
  portion_size: string;
}

interface CoordinatedMeal {
  meal_name: string;
  base_ingredients: string[];
  unified_prep_steps: string[];
  modifications: MealModification[];
  serving_instructions: string;
}

interface DailyPlan {
  date: string;
  main_meal_plan: CoordinatedMeal;
  suggested_other_meals: Record<string, string>;
}

interface CoordinatedMealPlanProps {
  plan: DailyPlan;
  familyMembers: FamilyMember[];
}

const CoordinatedMealPlan: React.FC<CoordinatedMealPlanProps> = ({ plan, familyMembers }) => {
  const meal = plan.main_meal_plan;

  const getMemberIcon = (memberName: string) => {
    const member = familyMembers.find(m => m.name === memberName);
    return member?.gender === 'Male' ? 'man' : 'woman';
  };

  const getMemberColor = (memberName: string) => {
    const member = familyMembers.find(m => m.name === memberName);
    return member?.gender === 'Male' ? '#2196F3' : '#E91E63';
  };

  return (
    <Animated.View entering={FadeInUp.delay(400)} style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#4CAF50', '#66BB6A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerCard}
      >
        <MaterialIcons name="restaurant-menu" size={32} color="#FFF" />
        <Text style={styles.headerTitle}>Coordinated Meal Plan</Text>
        <Text style={styles.mealName}>{meal.meal_name}</Text>
        <Text style={styles.headerSubtitle}>
          One recipe, customized for everyone&apos;s health needs
        </Text>
      </LinearGradient>

      {/* Base Recipe Section */}
      <Animated.View entering={SlideInRight.delay(500)} style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="list" size={24} color="#FF6B00" />
          <Text style={styles.sectionTitle}>Base Ingredients</Text>
        </View>
        <View style={styles.ingredientsList}>
          {meal.base_ingredients.map((ingredient, index) => (
            <View key={index} style={styles.ingredientItem}>
              <MaterialIcons name="fiber-manual-record" size={8} color="#4CAF50" />
              <Text style={styles.ingredientText}>{ingredient}</Text>
            </View>
          ))}
        </View>
      </Animated.View>

      {/* Cooking Steps */}
      <Animated.View entering={SlideInRight.delay(600)} style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="local-fire-department" size={24} color="#FF5722" />
          <Text style={styles.sectionTitle}>Unified Cooking Steps</Text>
        </View>
        <View style={styles.stepsList}>
          {meal.unified_prep_steps.map((step, index) => (
            <View key={index} style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>
      </Animated.View>

      {/* Family Modifications */}
      <Animated.View entering={SlideInRight.delay(700)} style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="tune" size={24} color="#9C27B0" />
          <Text style={styles.sectionTitle}>Member-Specific Modifications</Text>
        </View>
        <Text style={styles.sectionDescription}>
          Personalized adjustments for each family member&apos;s health needs
        </Text>
        
        <View style={styles.modificationsList}>
          {meal.modifications.map((modification, index) => (
            <View key={index} style={styles.modificationCard}>
              <View style={styles.modificationHeader}>
                <View style={styles.memberInfo}>
                  <MaterialIcons 
                    name={getMemberIcon(modification.member_name) as any} 
                    size={24} 
                    color={getMemberColor(modification.member_name)} 
                  />
                  <Text style={styles.memberName}>{modification.member_name}</Text>
                </View>
                <View style={[styles.portionBadge, { backgroundColor: getMemberColor(modification.member_name) + '20' }]}>
                  <Text style={[styles.portionText, { color: getMemberColor(modification.member_name) }]}>
                    {modification.portion_size}
                  </Text>
                </View>
              </View>
              
              <View style={styles.modificationContent}>
                <View style={styles.modificationDetail}>
                  <MaterialIcons name="edit" size={16} color="#FF6B00" />
                  <Text style={styles.modificationLabel}>Modification:</Text>
                  <Text style={styles.modificationText}>{modification.modification_details}</Text>
                </View>
                
                <View style={styles.reasonDetail}>
                  <MaterialIcons name="info" size={16} color="#4CAF50" />
                  <Text style={styles.reasonLabel}>Reason:</Text>
                  <Text style={styles.reasonText}>{modification.reason}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </Animated.View>

      {/* Serving Instructions */}
      <Animated.View entering={SlideInRight.delay(800)} style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="dining" size={24} color="#FF9800" />
          <Text style={styles.sectionTitle}>Final Serving Instructions</Text>
        </View>
        <View style={styles.servingCard}>
          <Text style={styles.servingText}>{meal.serving_instructions}</Text>
        </View>
      </Animated.View>

      {/* Other Meal Suggestions */}
      {Object.keys(plan.suggested_other_meals).length > 0 && (
        <Animated.View entering={SlideInRight.delay(900)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="more-time" size={24} color="#607D8B" />
            <Text style={styles.sectionTitle}>Other Meal Suggestions</Text>
          </View>
          <View style={styles.otherMealsList}>
            {Object.entries(plan.suggested_other_meals).map(([mealType, suggestion]) => (
              <View key={mealType} style={styles.otherMealItem}>
                <Text style={styles.otherMealType}>{mealType}:</Text>
                <Text style={styles.otherMealText}>{suggestion}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
      )}

      {/* Success Message */}
      <Animated.View entering={SlideInRight.delay(1000)} style={styles.successCard}>
        <MaterialIcons name="celebration" size={24} color="#4CAF50" />
        <Text style={styles.successText}>
          Perfect! You&apos;re all set to cook one meal that serves everyone&apos;s unique health needs.
        </Text>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 30,
  },
  headerCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginTop: 8,
    textAlign: 'center',
  },
  mealName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
    marginTop: 4,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
    textAlign: 'center',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2933',
    marginLeft: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  ingredientsList: {
    marginTop: 8,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingLeft: 8,
  },
  ingredientText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
  },
  stepsList: {
    marginTop: 8,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF6B00',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  stepText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
    lineHeight: 20,
  },
  modificationsList: {
    marginTop: 8,
  },
  modificationCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B00',
  },
  modificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2933',
    marginLeft: 8,
  },
  portionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  portionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modificationContent: {
    marginTop: 8,
  },
  modificationDetail: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  modificationLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 6,
    marginRight: 8,
  },
  modificationText: {
    fontSize: 13,
    color: '#1F2933',
    flex: 1,
    lineHeight: 18,
  },
  reasonDetail: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  reasonLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 6,
    marginRight: 8,
  },
  reasonText: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  servingCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },
  servingText: {
    fontSize: 14,
    color: '#F57C00',
    lineHeight: 20,
    fontWeight: '500',
  },
  otherMealsList: {
    marginTop: 8,
  },
  otherMealItem: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  otherMealType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2933',
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  otherMealText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  successCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  successText: {
    fontSize: 14,
    color: '#2E7D32',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
    fontWeight: '500',
  },
});

export default CoordinatedMealPlan;
