import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native'
import React, { useRef, useState } from 'react'
import { Ionicons } from '@expo/vector-icons'

interface Swap {
  mealType: string;
  current: string;
  alternative: string;
  reasoning: string;
  hasRecipe?: boolean;
  currentImage?: string;
  alternativeImage?: string;
}

interface SimpleSwapsProps {
  data: Swap[] | any;
}

const SimpleSwaps: React.FC<SimpleSwapsProps> = ({ data }) => {
  // Handle different data types and empty arrays
  if (!data || (Array.isArray(data) && data.length === 0)) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Simple Swaps</Text>
        <View style={styles.emptyState}>
          <Ionicons name="leaf-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No Swaps Available</Text>
          <Text style={styles.emptySubtitle}>
            We&apos;ll provide personalized food swaps based on your meal logs soon!
          </Text>
        </View>
      </View>
    );
  }

  // If data is a string, convert it to meaningful swaps
  let swapsArray: Swap[] = [];
  if (typeof data === 'string' && data.trim() !== '') {
    // Parse string data into meaningful swaps
    swapsArray = [
      {
        mealType: 'General',
        current: 'Current Foods',
        alternative: 'Healthier Options',
        reasoning: data,
        hasRecipe: false
      }
    ];
  } else if (Array.isArray(data)) {
    swapsArray = data;
  }

  // Group swaps by meal type
  const grouped = swapsArray.reduce((acc, swap) => {
    if (!acc[swap.mealType]) acc[swap.mealType] = [];
    acc[swap.mealType].push(swap);
    return acc;
  }, {} as Record<string, Swap[]>);

  // Meal type icons
  const mealIcons: Record<string, string> = {
    Breakfast: 'sunny',
    Lunch: 'restaurant',
    Snacks: 'pizza',
    Dinner: 'moon',
  };

  const SwapCard = ({ swap }: { swap: Swap }) => {
    const [expanded, setExpanded] = useState(false);
    const arrowAnim = useRef(new Animated.Value(0)).current;

    const animateArrow = () => {
      Animated.timing(arrowAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        Animated.timing(arrowAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    };

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          setExpanded(!expanded);
          animateArrow();
        }}
      >
        <View style={styles.swapRow}>
          <View style={styles.foodBlock}>
            <Text style={styles.foodName}>{swap.current}</Text>
            {swap.currentImage ? (
              <Ionicons name="image" size={20} color="gray" />
            ) : (
              <Ionicons name="fast-food" size={20} color="gray" />
            )}
          </View>
          <Animated.View
            style={[
              styles.arrow,
              {
                transform: [
                  {
                    scale: arrowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.2],
                    }),
                  },
                ],
              },
            ]}
          >
            <Ionicons name="arrow-forward" size={24} color="#007AFF" />
          </Animated.View>
          <View style={styles.altBlock}>
            <Text style={styles.altName}>{swap.alternative}</Text>
            {swap.alternativeImage ? (
              <Ionicons name="image" size={20} color="green" />
            ) : (
              <Ionicons name="leaf" size={20} color="green" />
            )}
            {swap.hasRecipe && (
              <TouchableOpacity style={styles.recipeBtn}>
                <Text style={styles.recipeBtnText}>View Recipe</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <Text style={styles.reasoning}>{swap.reasoning}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Simple Swaps</Text>
      <Text style={styles.subtitle}>Smart alternatives for healthier eating</Text>
      {Object.keys(grouped).length > 0 ? (
        Object.keys(grouped).map((mealType) => (
          <View key={mealType} style={styles.section}>
            <View style={styles.header}>
              <Ionicons
                name={(mealIcons[mealType] as any) || 'help'}
                size={24}
                color="#FF6B00"
              />
              <Text style={styles.headerText}>{mealType.charAt(0).toUpperCase() + mealType.slice(1)}</Text>
            </View>
            {grouped[mealType].map((swap, index) => (
              <SwapCard key={index} swap={swap} />
            ))}
          </View>
        ))
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="leaf-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No Swaps Available</Text>
          <Text style={styles.emptySubtitle}>
            We&apos;ll provide personalized food swaps based on your meal logs soon!
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F6F7F9',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
    color: '#1F2933',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2933',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 32,
  },
  section: {
    marginBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  swapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  foodBlock: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 10,
  },
  foodName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  arrow: {
    marginHorizontal: 10,
  },
  altBlock: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#e0f7e0',
    borderRadius: 8,
    padding: 10,
  },
  altName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2d5a2d',
  },
  recipeBtn: {
    marginTop: 5,
    backgroundColor: '#007AFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  recipeBtnText: {
    color: '#fff',
    fontSize: 12,
  },
  reasoning: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
    marginTop: 10,
  },
});

export default SimpleSwaps