import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'

interface GeneralSummaryProps {
  data: string[];
}

const GeneralSummary: React.FC<GeneralSummaryProps> = ({ data }) => {
  const [completed, setCompleted] = useState<boolean[]>(data.map(() => false));

  const toggleCompleted = (index: number) => {
    const newCompleted = [...completed];
    newCompleted[index] = !newCompleted[index];
    setCompleted(newCompleted);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>General Summary</Text>
      <Text style={styles.description}>Tap if you have performed these steps</Text>
      {data.map((item, index) => (
        <TouchableOpacity key={index} onPress={() => toggleCompleted(index)} style={styles.itemContainer}>
          <Text style={[styles.item, completed[index] && styles.completed]}>
            {completed[index] ? '[x] ' : '[ ] '}{index + 1}. {item}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: 'gray',
  },
  itemContainer: {
    marginBottom: 10,
  },
  item: {
    fontSize: 16,
    lineHeight: 24,
  },
  completed: {
    textDecorationLine: 'line-through',
    color: 'gray',
  },
});

export default GeneralSummary