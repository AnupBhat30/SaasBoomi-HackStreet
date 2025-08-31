import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Alert, 
  TouchableOpacity, 
  SafeAreaView,
  ScrollView,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, SlideInRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import RecipeCoordinator from './components/family/RecipeCoordinator';
import CoordinatedMealPlan from './components/family/CoordinatedMealPlan';

const { width } = Dimensions.get('window');

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

interface CoordinatedMeal {
  meal_name: string;
  base_ingredients: string[];
  unified_prep_steps: string[];
  modifications: MealModification[];
  serving_instructions: string;
}

interface MealModification {
  member_name: string;
  modification_details: string;
  reason: string;
  portion_size: string;
}

interface DailyPlan {
  date: string;
  main_meal_plan: CoordinatedMeal;
  suggested_other_meals: Record<string, string>;
}

const Family = () => {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [coordinatedPlan, setCoordinatedPlan] = useState<DailyPlan | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchFamilyData();
  }, []);

  const fetchFamilyData = () => {
    // Simulate fetching from family.py backend
    fetch('http://10.20.2.95:5000/family/family')
      .then(response => response.json())
      .then(data => {
        setFamilyMembers(data.family_profiles || []);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching family data:', error);
        // Use fallback data from family.py
        setFamilyMembers([
          {
            name: "Priya", 
            role: "Daughter-in-law", 
            BMI: 22.5, 
            gender: "Female",
            health_conditions: ["Pre-diabetic"],
            health_goals: ["Manage blood sugar", "Weight management"],
            access_to_kitchen: "sometimes", 
            stress_level: "moderate", 
            meal_source: "mixed"
          },
          {
            name: "Arjun", 
            role: "Son", 
            BMI: 19.0, 
            gender: "Male",
            health_conditions: ["Underweight"],
            health_goals: ["Gain healthy weight", "Build muscle"],
            access_to_kitchen: "rarely", 
            stress_level: "low", 
            meal_source: "home_cooked"
          },
          {
            name: "Rajesh", 
            role: "Father", 
            BMI: 27.2, 
            gender: "Male",
            health_conditions: ["Hypertension"],
            health_goals: ["Reduce blood pressure", "Heart health"],
            access_to_kitchen: "always", 
            stress_level: "moderate", 
            meal_source: "home_cooked"
          }
        ]);
        setLoading(false);
      });
  };

  const createCoordinatedPlan = async (mealIdea: string) => {
    setPlanLoading(true);
    try {
      const response = await fetch('http://10.20.2.95:5000/family/create_daily_plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ meal_idea: mealIdea }),
      });

      if (response.ok) {
        const data = await response.json();
        setCoordinatedPlan(data);
      } else {
        throw new Error('Failed to create coordinated plan');
      }
    } catch (error) {
      console.error('Error creating coordinated plan:', error);
      Alert.alert('Error', 'Failed to create coordinated meal plan. Please try again.');
    } finally {
      setPlanLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <MaterialIcons name="family-restroom" size={60} color="#FF6B00" />
          <Text style={styles.loadingText}>Loading family data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2933" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Family Recipe Coordinator</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Family Overview */}
        <FamilyOverview familyMembers={familyMembers} />

        {/* Recipe Coordinator */}
        <RecipeCoordinator 
          onCreatePlan={createCoordinatedPlan}
          loading={planLoading}
        />

        {/* Coordinated Meal Plan */}
        {coordinatedPlan && (
          <CoordinatedMealPlan 
            plan={coordinatedPlan}
            familyMembers={familyMembers}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// Family Overview Component
const FamilyOverview = ({ familyMembers }: { familyMembers: FamilyMember[] }) => {
  const getTotalHealthConditions = () => {
    const allConditions = familyMembers.flatMap(member => member.health_conditions);
    return new Set(allConditions).size;
  };

  const getAverageBMI = () => {
    const totalBMI = familyMembers.reduce((sum, member) => sum + member.BMI, 0);
    return (totalBMI / familyMembers.length).toFixed(1);
  };

  const getMostCommonGoal = () => {
    const allGoals = familyMembers.flatMap(member => member.health_goals);
    const goalCounts = allGoals.reduce((acc, goal) => {
      acc[goal] = (acc[goal] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(goalCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'Healthy lifestyle';
  };

  return (
    <ScrollView style={styles.overviewContainer} showsVerticalScrollIndicator={false}>
      <Animated.View entering={FadeInUp.delay(100)}>
        <LinearGradient
          colors={['#FF6B00', '#FFA366']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.familyHeaderCard}
        >
          <MaterialIcons name="family-restroom" size={48} color="#FFF" />
          <Text style={styles.familyHeaderTitle}>Your Family</Text>
          <Text style={styles.familyHeaderSubtitle}>
            {familyMembers.length} member{familyMembers.length !== 1 ? 's' : ''} tracking their health together
          </Text>
        </LinearGradient>
      </Animated.View>

      <View style={styles.statsGrid}>
        <Animated.View entering={SlideInRight.delay(200)} style={styles.statCard}>
          <MaterialIcons name="people" size={32} color="#4CAF50" />
          <Text style={styles.statNumber}>{familyMembers.length}</Text>
          <Text style={styles.statLabel}>Family Members</Text>
        </Animated.View>

        <Animated.View entering={SlideInRight.delay(300)} style={styles.statCard}>
          <MaterialIcons name="monitor-weight" size={32} color="#2196F3" />
          <Text style={styles.statNumber}>{getAverageBMI()}</Text>
          <Text style={styles.statLabel}>Average BMI</Text>
        </Animated.View>

        <Animated.View entering={SlideInRight.delay(400)} style={styles.statCard}>
          <MaterialIcons name="health-and-safety" size={32} color="#FF9800" />
          <Text style={styles.statNumber}>{getTotalHealthConditions()}</Text>
          <Text style={styles.statLabel}>Health Conditions</Text>
        </Animated.View>

        <Animated.View entering={SlideInRight.delay(500)} style={styles.statCard}>
          <MaterialIcons name="flag" size={32} color="#9C27B0" />
          <Text style={styles.statNumber}>1</Text>
          <Text style={styles.statLabel}>Common Goal</Text>
        </Animated.View>
      </View>

      <Animated.View entering={FadeInUp.delay(600)} style={styles.commonGoalCard}>
        <Text style={styles.commonGoalTitle}>Most Common Goal</Text>
        <Text style={styles.commonGoalText}>{getMostCommonGoal()}</Text>
        <Text style={styles.commonGoalDescription}>
          This goal is shared by multiple family members. Working together makes it easier to achieve!
        </Text>
      </Animated.View>

      <View style={styles.membersList}>
        <Text style={styles.membersListTitle}>Family Members</Text>
        {familyMembers.map((member, index) => (
          <Animated.View 
            key={member.name} 
            entering={SlideInRight.delay(700 + index * 100)}
            style={styles.memberPreviewCard}
          >
            <View style={styles.memberPreviewInfo}>
              <MaterialIcons 
                name={member.gender === 'Male' ? 'man' : 'woman'} 
                size={24} 
                color="#FF6B00" 
              />
              <View style={styles.memberPreviewText}>
                <Text style={styles.memberPreviewName}>{member.name}</Text>
                <Text style={styles.memberPreviewRole}>{member.role}</Text>
              </View>
            </View>
            <View style={styles.memberPreviewBMI}>
              <Text style={styles.memberPreviewBMILabel}>BMI</Text>
              <Text style={styles.memberPreviewBMIValue}>{member.BMI.toFixed(1)}</Text>
            </View>
          </Animated.View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7F9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#6B7280',
    marginTop: 16,
    fontWeight: '500',
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
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2933',
  },
  placeholder: {
    width: 40,
  },
  scrollContainer: {
    flex: 1,
    padding: 20,
  },
  // Family Overview Styles
  overviewContainer: {
    flex: 1,
    padding: 20,
  },
  familyHeaderCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  familyHeaderTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    marginTop: 8,
  },
  familyHeaderSubtitle: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
    textAlign: 'center',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: (width - 60) / 2,
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2933',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  commonGoalCard: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  commonGoalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2933',
    marginBottom: 8,
  },
  commonGoalText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF6B00',
    marginBottom: 8,
  },
  commonGoalDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  membersList: {
    marginBottom: 20,
  },
  membersListTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2933',
    marginBottom: 12,
  },
  memberPreviewCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  memberPreviewInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  memberPreviewText: {
    marginLeft: 12,
  },
  memberPreviewName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2933',
  },
  memberPreviewRole: {
    fontSize: 14,
    color: '#6B7280',
  },
  memberPreviewBMI: {
    alignItems: 'center',
  },
  memberPreviewBMILabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  memberPreviewBMIValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B00',
  },
});

export default Family;
