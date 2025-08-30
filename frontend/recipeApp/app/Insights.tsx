import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, Alert } from 'react-native';
import { Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import KeyInsights from './components/insights/KeyInsights';
import ModernApproach from './components/insights/ModernApproach';
import HeritageAlternative from './components/insights/HeritageAlternative';
import SimpleSwaps from './components/insights/SimpleSwaps';
import GeneralSummary from './components/insights/GeneralSummary';

const { width } = Dimensions.get('window');

const Insights = () => {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = () => {
    fetch('http://10.20.1.20:5000/insights')
      .then(response => response.json())
      .then(data => {
        setInsights(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching insights:', error);
        Alert.alert('Error', 'Failed to fetch insights.');
        setLoading(false);
      });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading insights...</Text>
      </View>
    );
  }

  if (!insights) {
    return (
      <View style={styles.container}>
        <Text>No insights available.</Text>
      </View>
    );
  }

  const pages = [
    { component: KeyInsights, data: insights.key_insight },
    { component: ModernApproach, data: insights.modern_approach },
    { component: HeritageAlternative, data: insights.heritage_alternative },
    { component: SimpleSwaps, data: insights.simple_swap },
    { component: GeneralSummary, data: insights.general_summary },
  ];

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.page}>
      <item.component data={item.data} />
    </View>
  );

  const onMomentumScrollEnd = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < pages.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      router.back();
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      flatListRef.current?.scrollToIndex({ index: currentIndex - 1 });
    }
  };

  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {pages.map((_, index) => (
        <View key={index} style={[styles.dot, index === currentIndex && styles.activeDot]} />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {renderDots()}
      <FlatList
        ref={flatListRef}
        data={pages}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        keyExtractor={(_, index) => index.toString()}
      />
      <View style={styles.buttonContainer}>
        <Button mode="outlined" onPress={handleBack} disabled={currentIndex === 0} style={styles.button}>
          Back
        </Button>
        <Button mode="contained" onPress={handleNext} style={styles.button}>
          {currentIndex === pages.length - 1 ? 'Finish' : 'Next'}
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7F9',
  },
  page: {
    width,
    flex: 1,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ccc',
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#FF6B00',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 10,
  },
});

export default Insights;