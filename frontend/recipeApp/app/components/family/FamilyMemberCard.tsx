import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity
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

interface FamilyMemberCardProps {
  member: FamilyMember;
  onDelete: () => void;
}

const FamilyMemberCard: React.FC<FamilyMemberCardProps> = ({ member, onDelete }) => {
  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: 'Underweight', color: '#2196F3' };
    if (bmi < 25) return { category: 'Normal', color: '#4CAF50' };
    if (bmi < 30) return { category: 'Overweight', color: '#FF9800' };
    return { category: 'Obese', color: '#F44336' };
  };

  const getStressLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low': return '#4CAF50';
      case 'moderate': return '#FF9800';
      case 'high': return '#F44336';
      default: return '#6B7280';
    }
  };

  const getKitchenAccessIcon = (access: string) => {
    switch (access.toLowerCase()) {
      case 'always': return 'kitchen';
      case 'rarely': return 'no-meals';
      case 'never': return 'block';
      default: return 'kitchen';
    }
  };

  const bmiInfo = getBMICategory(member.BMI);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Card */}
      <Animated.View entering={FadeInUp.delay(100)}>
        <LinearGradient
          colors={member.gender === 'Male' ? ['#2196F3', '#64B5F6'] : ['#E91E63', '#F06292']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerCard}
        >
          <MaterialIcons 
            name={member.gender === 'Male' ? 'man' : 'woman'} 
            size={48} 
            color="#FFF" 
          />
          <Text style={styles.memberName}>{member.name}</Text>
          <Text style={styles.memberRole}>{member.role}</Text>
          
          <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
            <MaterialIcons name="delete" size={20} color="#FFF" />
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>

      {/* BMI Section */}
      <Animated.View entering={SlideInRight.delay(200)} style={styles.bmiCard}>
        <View style={styles.bmiHeader}>
          <MaterialIcons name="monitor-weight" size={24} color="#FF6B00" />
          <Text style={styles.cardTitle}>Body Mass Index</Text>
        </View>
        <View style={styles.bmiContent}>
          <Text style={[styles.bmiValue, { color: bmiInfo.color }]}>{member.BMI.toFixed(1)}</Text>
          <View style={[styles.bmiBadge, { backgroundColor: bmiInfo.color }]}>
            <Text style={styles.bmiBadgeText}>{bmiInfo.category}</Text>
          </View>
        </View>
        <View style={styles.bmiBar}>
          <View style={styles.bmiBarBackground}>
            <View 
              style={[
                styles.bmiBarFill, 
                { 
                  width: `${Math.min((member.BMI / 40) * 100, 100)}%`,
                  backgroundColor: bmiInfo.color 
                }
              ]} 
            />
          </View>
        </View>
      </Animated.View>

      {/* Health Conditions */}
      <Animated.View entering={SlideInRight.delay(300)} style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialIcons name="health-and-safety" size={24} color="#F44336" />
          <Text style={styles.cardTitle}>Health Conditions</Text>
        </View>
        <View style={styles.tagContainer}>
          {member.health_conditions.length > 0 ? (
            member.health_conditions.map((condition, index) => (
              <View key={index} style={[styles.tag, styles.conditionTag]}>
                <Text style={styles.conditionTagText}>{condition}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No health conditions reported</Text>
          )}
        </View>
      </Animated.View>

      {/* Health Goals */}
      <Animated.View entering={SlideInRight.delay(400)} style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialIcons name="flag" size={24} color="#4CAF50" />
          <Text style={styles.cardTitle}>Health Goals</Text>
        </View>
        <View style={styles.tagContainer}>
          {member.health_goals.length > 0 ? (
            member.health_goals.map((goal, index) => (
              <View key={index} style={[styles.tag, styles.goalTag]}>
                <Text style={styles.goalTagText}>{goal}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No health goals set</Text>
          )}
        </View>
      </Animated.View>

      {/* Lifestyle Information */}
      <Animated.View entering={SlideInRight.delay(500)} style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialIcons name="account-circle" size={24} color="#9C27B0" />
          <Text style={styles.cardTitle}>Lifestyle</Text>
        </View>
        
        <View style={styles.lifestyleGrid}>
          <View style={styles.lifestyleItem}>
            <MaterialIcons 
              name={getKitchenAccessIcon(member.access_to_kitchen)} 
              size={20} 
              color="#FF6B00" 
            />
            <Text style={styles.lifestyleLabel}>Kitchen Access</Text>
            <Text style={styles.lifestyleValue}>{member.access_to_kitchen}</Text>
          </View>

          <View style={styles.lifestyleItem}>
            <MaterialIcons name="psychology" size={20} color={getStressLevelColor(member.stress_level)} />
            <Text style={styles.lifestyleLabel}>Stress Level</Text>
            <Text style={[styles.lifestyleValue, { color: getStressLevelColor(member.stress_level) }]}>
              {member.stress_level}
            </Text>
          </View>

          <View style={styles.lifestyleItem}>
            <MaterialIcons name="restaurant" size={20} color="#FF9800" />
            <Text style={styles.lifestyleLabel}>Meal Source</Text>
            <Text style={styles.lifestyleValue}>{member.meal_source}</Text>
          </View>
        </View>
      </Animated.View>

      {/* Recommendations Card */}
      <Animated.View entering={SlideInRight.delay(600)} style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialIcons name="tips-and-updates" size={24} color="#FF6B00" />
          <Text style={styles.cardTitle}>Personalized Tips</Text>
        </View>
        <View style={styles.recommendationsContainer}>
          {member.health_conditions.includes('Anemia') && (
            <View style={styles.recommendationItem}>
              <MaterialIcons name="lunch-dining" size={16} color="#4CAF50" />
              <Text style={styles.recommendationText}>
                Include iron-rich foods like spinach, lentils, and citrus fruits
              </Text>
            </View>
          )}
          {member.health_conditions.includes('Hypertension') && (
            <View style={styles.recommendationItem}>
              <MaterialIcons name="water-drop" size={16} color="#2196F3" />
              <Text style={styles.recommendationText}>
                Reduce sodium intake and include potassium-rich foods
              </Text>
            </View>
          )}
          {member.health_conditions.includes('Pre-diabetic') && (
            <View style={styles.recommendationItem}>
              <MaterialIcons name="monitor-heart" size={16} color="#FF9800" />
              <Text style={styles.recommendationText}>
                Choose complex carbohydrates and monitor portion sizes
              </Text>
            </View>
          )}
          {member.stress_level === 'high' && (
            <View style={styles.recommendationItem}>
              <MaterialIcons name="self-improvement" size={16} color="#9C27B0" />
              <Text style={styles.recommendationText}>
                Consider stress-reducing activities and regular meal times
              </Text>
            </View>
          )}
          {member.access_to_kitchen === 'rarely' && (
            <View style={styles.recommendationItem}>
              <MaterialIcons name="takeout-dining" size={16} color="#FF5722" />
              <Text style={styles.recommendationText}>
                Focus on healthy take-out options and portable snacks
              </Text>
            </View>
          )}
        </View>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F6F7F9',
  },
  headerCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  memberName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    marginTop: 8,
  },
  memberRole: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
  },
  deleteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
  },
  card: {
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2933',
    marginLeft: 8,
  },
  bmiCard: {
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
  bmiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  bmiContent: {
    alignItems: 'center',
    marginBottom: 16,
  },
  bmiValue: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  bmiBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bmiBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  bmiBar: {
    alignItems: 'center',
  },
  bmiBarBackground: {
    width: '80%',
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  bmiBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  conditionTag: {
    backgroundColor: '#FFF3E0',
  },
  conditionTagText: {
    fontSize: 12,
    color: '#F57C00',
    fontWeight: '500',
  },
  goalTag: {
    backgroundColor: '#E8F5E9',
  },
  goalTagText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  lifestyleGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  lifestyleItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 16,
  },
  lifestyleLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  lifestyleValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2933',
    marginTop: 2,
    textAlign: 'center',
  },
  recommendationsContainer: {
    marginTop: 8,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
    lineHeight: 20,
  },
});

export default FamilyMemberCard;
