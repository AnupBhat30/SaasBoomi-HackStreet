import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { Card, Button } from 'react-native-paper';

const Insights = () => {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Nutrition Insights</Text>

      {insights.key_insight && (
        <Card style={styles.card}>
          <Card.Title title="Key Insight" />
          <Card.Content>
            <Text>{insights.key_insight}</Text>
          </Card.Content>
        </Card>
      )}

      {insights.modern_approach && (
        <Card style={styles.card}>
          <Card.Title title="Modern Approach" />
          <Card.Content>
            <Text>{insights.modern_approach}</Text>
          </Card.Content>
        </Card>
      )}

      {insights.heritage_alternative && (
        <Card style={styles.card}>
          <Card.Title title="Heritage Alternative" />
          <Card.Content>
            <Text>{insights.heritage_alternative}</Text>
          </Card.Content>
        </Card>
      )}

      {insights.simple_swap && insights.simple_swap.length > 0 && (
        <Card style={styles.card}>
          <Card.Title title="Simple Swaps" />
          <Card.Content>
            {insights.simple_swap.map((swap: any, index: number) => (
              <View key={index} style={styles.swapItem}>
                <Text style={styles.swapText}>
                  {swap.mealType}: {swap.current} → {swap.alternative}
                </Text>
                <Text>{swap.reasoning}</Text>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      {insights.general_summary && insights.general_summary.length > 0 && (
        <Card style={styles.card}>
          <Card.Title title="General Summary" />
          <Card.Content>
            {insights.general_summary.map((item: string, index: number) => (
              <Text key={index} style={styles.summaryItem}>
                {index + 1}. {item}
              </Text>
            ))}
          </Card.Content>
        </Card>
      )}

      <Button mode="contained" onPress={fetchInsights} style={styles.button}>
        Refresh Insights
      </Button>
    </ScrollView>
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
    textAlign: 'center',
    marginBottom: 20,
    color: '#1F2933',
  },
  card: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  swapItem: {
    marginBottom: 10,
  },
  swapText: {
    fontWeight: 'bold',
  },
  summaryItem: {
    marginBottom: 5,
  },
  button: {
    marginTop: 20,
    backgroundColor: '#FF6B00',
  },
});

export default Insights;