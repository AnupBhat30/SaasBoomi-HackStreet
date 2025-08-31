import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Dimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeInUp, SlideInRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Circle } from 'react-native-progress';

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

interface FamilyInsightsProps {
  familyMembers: FamilyMember[];
}

const FamilyInsights: React.FC<FamilyInsightsProps> = ({ familyMembers }) => {
  // Analysis functions
  const getHealthInsights = () => {
    const totalMembers = familyMembers.length;
    const averageBMI = familyMembers.reduce((sum, member) => sum + member.BMI, 0) / totalMembers;
    
    const allConditions = familyMembers.flatMap(member => member.health_conditions);
    const conditionCounts = allConditions.reduce((acc, condition) => {
      acc[condition] = (acc[condition] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostCommonCondition = Object.entries(conditionCounts)
      .sort(([,a], [,b]) => b - a)[0];

    const kitchenAccessStats = familyMembers.reduce((acc, member) => {
      acc[member.access_to_kitchen] = (acc[member.access_to_kitchen] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const stressLevelStats = familyMembers.reduce((acc, member) => {
      acc[member.stress_level] = (acc[member.stress_level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalMembers,
      averageBMI,
      mostCommonCondition,
      kitchenAccessStats,
      stressLevelStats,
      totalConditions: allConditions.length
    };
  };

  const getFamilyRecommendations = () => {
    const insights = getHealthInsights();
    const recommendations = [];

    // BMI-based recommendations
    if (insights.averageBMI > 25) {
      recommendations.push({
        icon: 'monitor-weight',
        color: '#FF9800',
        title: 'Weight Management Focus',
        description: 'Family average BMI is above normal range. Consider portion control and regular physical activity for the whole family.',
        priority: 'high'
      });
    }

    // Condition-based recommendations
    if (insights.mostCommonCondition) {
      const [condition, count] = insights.mostCommonCondition;
      let conditionRecommendation = '';
      
      switch (condition.toLowerCase()) {
        case 'hypertension':
          conditionRecommendation = 'Focus on low-sodium meals and DASH diet principles for the whole family.';
          break;
        case 'diabetes':
        case 'pre-diabetic':
          conditionRecommendation = 'Emphasize complex carbohydrates and regular meal timing for better blood sugar control.';
          break;
        case 'anemia':
          conditionRecommendation = 'Include more iron-rich foods like leafy greens, lentils, and vitamin C sources.';
          break;
        default:
          conditionRecommendation = `Consider consulting healthcare providers about managing ${condition} through nutrition.`;
      }

      recommendations.push({
        icon: 'health-and-safety',
        color: '#F44336',
        title: `${condition} Management`,
        description: `${count} family member${count > 1 ? 's' : ''} affected. ${conditionRecommendation}`,
        priority: 'high'
      });
    }

    // Kitchen access recommendations
    const limitedKitchenAccess = insights.kitchenAccessStats.rarely || 0;
    if (limitedKitchenAccess > 0) {
      recommendations.push({
        icon: 'kitchen',
        color: '#FF5722',
        title: 'Kitchen Access Challenge',
        description: `${limitedKitchenAccess} member${limitedKitchenAccess > 1 ? 's' : ''} have limited kitchen access. Focus on healthy grab-and-go options and meal prep.`,
        priority: 'medium'
      });
    }

    // Stress level recommendations
    const highStress = insights.stressLevelStats.high || 0;
    if (highStress > 0) {
      recommendations.push({
        icon: 'psychology',
        color: '#9C27B0',
        title: 'Stress Management',
        description: `${highStress} member${highStress > 1 ? 's' : ''} experiencing high stress. Consider stress-reducing foods and regular meal times.`,
        priority: 'medium'
      });
    }

    // General family recommendations
    recommendations.push({
      icon: 'restaurant',
      color: '#4CAF50',
      title: 'Family Meal Planning',
      description: 'Plan coordinated meals that address everyone&apos;s health needs while bringing the family together.',
      priority: 'low'
    });

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
    });
  };

  const getBMIDistribution = () => {
    const distribution = { underweight: 0, normal: 0, overweight: 0, obese: 0 };
    
    familyMembers.forEach(member => {
      if (member.BMI < 18.5) distribution.underweight++;
      else if (member.BMI < 25) distribution.normal++;
      else if (member.BMI < 30) distribution.overweight++;
      else distribution.obese++;
    });

    return distribution;
  };

  const insights = getHealthInsights();
  const recommendations = getFamilyRecommendations();
  const bmiDistribution = getBMIDistribution();

  const getBMIColor = (bmi: number) => {
    if (bmi < 18.5) return '#2196F3';
    if (bmi < 25) return '#4CAF50';
    if (bmi < 30) return '#FF9800';
    return '#F44336';
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <Animated.View entering={FadeInUp.delay(100)}>
        <LinearGradient
          colors={['#4CAF50', '#66BB6A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerCard}
        >
          <MaterialIcons name="insights" size={32} color="#FFF" />
          <Text style={styles.headerTitle}>Family Health Insights</Text>
          <Text style={styles.headerSubtitle}>
            Comprehensive analysis of your family&apos;s health patterns
          </Text>
        </LinearGradient>
      </Animated.View>

      {/* Overview Stats */}
      <View style={styles.statsContainer}>
        <Animated.View entering={SlideInRight.delay(200)} style={styles.statCard}>
          <MaterialIcons name="people" size={24} color="#4CAF50" />
          <Text style={styles.statNumber}>{insights.totalMembers}</Text>
          <Text style={styles.statLabel}>Family Members</Text>
        </Animated.View>

        <Animated.View entering={SlideInRight.delay(250)} style={styles.statCard}>
          <MaterialIcons name="monitor-weight" size={24} color={getBMIColor(insights.averageBMI)} />
          <Text style={[styles.statNumber, { color: getBMIColor(insights.averageBMI) }]}>
            {insights.averageBMI.toFixed(1)}
          </Text>
          <Text style={styles.statLabel}>Average BMI</Text>
        </Animated.View>

        <Animated.View entering={SlideInRight.delay(300)} style={styles.statCard}>
          <MaterialIcons name="health-and-safety" size={24} color="#FF9800" />
          <Text style={styles.statNumber}>{insights.totalConditions}</Text>
          <Text style={styles.statLabel}>Health Conditions</Text>
        </Animated.View>
      </View>

      {/* BMI Distribution */}
      <Animated.View entering={SlideInRight.delay(350)} style={styles.card}>
        <Text style={styles.cardTitle}>BMI Distribution</Text>
        <View style={styles.bmiDistributionContainer}>
          {Object.entries(bmiDistribution).map(([category, count]) => {
            const colors = {
              underweight: '#2196F3',
              normal: '#4CAF50',
              overweight: '#FF9800',
              obese: '#F44336'
            };
            
            return (
              <View key={category} style={styles.bmiDistributionItem}>
                <Circle
                  size={60}
                  thickness={6}
                  progress={count / insights.totalMembers}
                  color={colors[category as keyof typeof colors]}
                  unfilledColor="#E5E7EB"
                  borderWidth={0}
                  showsText={false}
                />
                <Text style={styles.bmiCategoryCount}>{count}</Text>
                <Text style={styles.bmiCategoryLabel}>{category}</Text>
              </View>
            );
          })}
        </View>
      </Animated.View>

      {/* Family Members Overview */}
      <Animated.View entering={SlideInRight.delay(400)} style={styles.card}>
        <Text style={styles.cardTitle}>Family Health Overview</Text>
        <View style={styles.membersOverview}>
          {familyMembers.map((member, index) => (
            <View key={member.name} style={styles.memberOverviewItem}>
              <View style={styles.memberOverviewHeader}>
                <MaterialIcons 
                  name={member.gender === 'Male' ? 'man' : 'woman'} 
                  size={20} 
                  color="#FF6B00" 
                />
                <Text style={styles.memberOverviewName}>{member.name}</Text>
                <Text style={[styles.memberOverviewBMI, { color: getBMIColor(member.BMI) }]}>
                  BMI: {member.BMI.toFixed(1)}
                </Text>
              </View>
              <View style={styles.memberOverviewDetails}>
                <Text style={styles.memberOverviewConditions}>
                  {member.health_conditions.length > 0 
                    ? member.health_conditions.slice(0, 2).join(', ') + 
                      (member.health_conditions.length > 2 ? '...' : '')
                    : 'No health conditions'
                  }
                </Text>
              </View>
            </View>
          ))}
        </View>
      </Animated.View>

      {/* Recommendations */}
      <Animated.View entering={SlideInRight.delay(450)} style={styles.card}>
        <Text style={styles.cardTitle}>Personalized Recommendations</Text>
        <View style={styles.recommendationsContainer}>
          {recommendations.map((rec, index) => (
            <View key={index} style={styles.recommendationItem}>
              <View style={[styles.recommendationIcon, { backgroundColor: rec.color + '20' }]}>
                <MaterialIcons name={rec.icon as any} size={20} color={rec.color} />
              </View>
              <View style={styles.recommendationContent}>
                <Text style={styles.recommendationTitle}>{rec.title}</Text>
                <Text style={styles.recommendationDescription}>{rec.description}</Text>
              </View>
              <View style={[
                styles.priorityBadge, 
                { backgroundColor: rec.priority === 'high' ? '#F44336' : rec.priority === 'medium' ? '#FF9800' : '#4CAF50' }
              ]}>
                <Text style={styles.priorityText}>{rec.priority}</Text>
              </View>
            </View>
          ))}
        </View>
      </Animated.View>

      {/* Health Goals Summary */}
      <Animated.View entering={SlideInRight.delay(500)} style={styles.card}>
        <Text style={styles.cardTitle}>Family Health Goals</Text>
        <View style={styles.goalsContainer}>
          {(() => {
            const allGoals = familyMembers.flatMap(member => member.health_goals);
            const goalCounts = allGoals.reduce((acc, goal) => {
              acc[goal] = (acc[goal] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);

            return Object.entries(goalCounts)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([goal, count]) => (
                <View key={goal} style={styles.goalItem}>
                  <Text style={styles.goalText}>{goal}</Text>
                  <View style={styles.goalCount}>
                    <Text style={styles.goalCountText}>{count}</Text>
                  </View>
                </View>
              ));
          })()}
        </View>
      </Animated.View>

      <View style={styles.bottomSpacing} />
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
  },
  headerTitle: {
    fontSize: 20,
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
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: (width - 60) / 3,
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2933',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
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
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2933',
    marginBottom: 16,
  },
  bmiDistributionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bmiDistributionItem: {
    alignItems: 'center',
    flex: 1,
  },
  bmiCategoryCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2933',
    marginTop: 8,
  },
  bmiCategoryLabel: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  membersOverview: {
    marginTop: 8,
  },
  memberOverviewItem: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  memberOverviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  memberOverviewName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2933',
    marginLeft: 8,
    flex: 1,
  },
  memberOverviewBMI: {
    fontSize: 12,
    fontWeight: '500',
  },
  memberOverviewDetails: {
    marginLeft: 28,
  },
  memberOverviewConditions: {
    fontSize: 12,
    color: '#6B7280',
  },
  recommendationsContainer: {
    marginTop: 8,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  recommendationIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recommendationContent: {
    flex: 1,
    marginRight: 8,
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2933',
    marginBottom: 2,
  },
  recommendationDescription: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  goalsContainer: {
    marginTop: 8,
  },
  goalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  goalText: {
    fontSize: 14,
    color: '#1F2933',
    flex: 1,
  },
  goalCount: {
    backgroundColor: '#FF6B00',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
  },
  goalCountText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 20,
  },
});

export default FamilyInsights;
