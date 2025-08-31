import { View, Text, StyleSheet, ScrollView } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { MotiView } from 'moti'

interface KeyInsightsProps {
  data: string;
}

interface Insight {
  headline: string;
  explanation: string;
  icon: string;
}

interface ProcessedData {
  primaryMessage: string;
  insights: Insight[];
}

const KeyInsights: React.FC<KeyInsightsProps> = ({ data }) => {
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);

  const processText = useCallback((text: string): ProcessedData => {
    if (!text || typeof text !== 'string' || text.trim() === '') {
      return {
        primaryMessage: 'No insights available at the moment',
        insights: []
      };
    }
    
    // Split by periods but preserve the periods and handle edge cases
    const sentences = text.split(/\.(?!\d)/)
      .filter(s => s.trim().length > 0)
      .map(s => s.trim())
      .map(s => s.endsWith('.') ? s : s + '.'); // Ensure each sentence ends with a period
    
    const insights = sentences.slice(1, 4).map((sentence, index) => {
      // Use the complete sentence as both headline and explanation
      // This ensures we don't cut off mid-sentence
      const completeSentence = sentence.endsWith('.') ? sentence : sentence + '.';
      const headline = `Insight ${index + 1}`;
      const explanation = completeSentence;
      const icon = getIcon(completeSentence);
      return { headline, explanation, icon };
    });
    
    // Primary message is the first sentence
    const primaryMessage = sentences[0]?.endsWith('.') ? sentences[0] : (sentences[0] || 'No primary message') + '.';
    
    return { primaryMessage, insights };
  }, []);

  const highlightText = (text: string): React.ReactElement[] => {
    const conditions = ['diabetes', 'hypertension', 'obesity', 'heart disease', 'cancer', 'asthma', 'anemia', 'thyroid', 'overweight', 'bmi'];
    const conditionRegex = new RegExp(`(${conditions.join('|')})`, 'gi');
    const parts = text.split(conditionRegex);
    return parts.map((part, index) => {
      if (conditions.some(cond => part.toLowerCase() === cond.toLowerCase())) {
        return <Text key={index} style={{ color: '#FF6B00', fontWeight: 'bold' }}>{part}</Text>;
      } else {
        return <Text key={index}>{part}</Text>;
      }
    });
  };

  const getIcon = (headline: string): string => {
    const lower = headline.toLowerCase();
    if (lower.includes('bmi') || lower.includes('weight') || lower.includes('overweight')) return 'scale-bathroom';
    if (lower.includes('diabetes') || lower.includes('blood sugar')) return 'medical-bag';
    if (lower.includes('anemia') || lower.includes('iron')) return 'water';
    if (lower.includes('thyroid')) return 'pill';
    if (lower.includes('sodium') || lower.includes('salt')) return 'shaker';
    if (lower.includes('protein') || lower.includes('fiber')) return 'food-steak';
    if (lower.includes('processed') || lower.includes('fast food')) return 'food-off';
    if (lower.includes('paneer') || lower.includes('dal') || lower.includes('chickpeas') || lower.includes('lentil')) return 'check-circle';
    if (lower.includes('energy') || lower.includes('vitam')) return 'lightning-bolt';
    if (lower.includes('sugar') || lower.includes('sweet')) return 'candy';
    return 'lightbulb-on';
  };

  useEffect(() => {
    if (data && typeof data === 'string' && data.trim() !== '') {
      setProcessedData(processText(data));
    } else {
      setProcessedData({
        primaryMessage: 'No insights available at the moment',
        insights: []
      });
    }
  }, [data, processText]);

  if (!processedData) {
    return (
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Key Insights</Text>
        <Text style={styles.subtitle}>Loading insights...</Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <MotiView
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 500 }}
        style={styles.header}
      >
        <MaterialCommunityIcons name="lightbulb-on" size={40} color={colors.primary} />
        <Text style={styles.title}>Key Insights</Text>
        <Text style={styles.subtitle}>Your most important nutrition takeaways for today</Text>
      </MotiView>

      {/* Primary Message */}
      <MotiView
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'timing', duration: 500, delay: 200 }}
        style={styles.primaryCard}
      >
        <MaterialCommunityIcons name="star" size={24} color="#FFFFFF" />
        <Text style={styles.primaryText}>{processedData.primaryMessage}</Text>
      </MotiView>

      {/* Insights */}
      {processedData.insights.map((insight, index) => (
        <MotiView
          key={index}
          from={{ opacity: 0, translateX: -20 }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{ type: 'timing', duration: 500, delay: 400 + index * 100 }}
          style={styles.insightCard}
        >
          <MaterialCommunityIcons name={insight.icon as any} size={32} color={colors.primary} />
          <View style={styles.insightText}>
            <Text style={styles.headline}>{insight.headline}</Text>
            <Text style={styles.content}>
              {highlightText(insight.explanation)}
            </Text>
          </View>
        </MotiView>
      ))}
    </ScrollView>
  );
};

const colors = {
  primary: '#FF6B00',
  bg: '#F6F7F9',
  card: '#FFFFFF',
  textPrimary: '#1F2933',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  success: '#22C55E',
  warning: '#F59E0B',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.bg,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 8,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  primaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  primaryText: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 12,
    fontWeight: '500',
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  insightText: {
    flex: 1,
    marginLeft: 12,
  },
  headline: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textPrimary,
  },
});

export default KeyInsights