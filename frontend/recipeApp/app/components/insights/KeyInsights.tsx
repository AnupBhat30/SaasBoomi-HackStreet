import { View, Text, StyleSheet, ScrollView } from 'react-native'
import React, { useState, useEffect } from 'react'
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

  const processText = (text: string): ProcessedData => {
    const sentences = text.split(/\.(?!\d)/).filter(s => s.trim().length > 0).map(s => s.trim());
    const insights = sentences.slice(1, 6).map((sentence) => {
      const words = sentence.split(' ');
      const isShort = words.length <= 15;
      const headline = isShort ? (sentence.endsWith('.') ? sentence : sentence + '.') : `Key Insight: ${words.slice(0, 5).join(' ')}.`;
      const explanation = sentence;
      const icon = getIcon(headline);
      return { headline, explanation, icon };
    });
    const primaryMessage = sentences[0] || 'No primary message';
    return { primaryMessage, insights };
  };

  const highlightText = (text: string): React.ReactElement[] => {
    const conditions = ['diabetes', 'hypertension', 'obesity', 'heart disease', 'cancer', 'asthma'];
    const conditionRegex = new RegExp(`(${conditions.join('|')})`, 'gi');
    const parts = text.split(conditionRegex);
    return parts.map((part, index) => {
      if (conditions.some(cond => part.toLowerCase() === cond.toLowerCase())) {
        return <Text key={index} style={{ color: 'red', fontWeight: 'bold' }}>{part}</Text>;
      } else {
        return <Text key={index}>{part}</Text>;
      }
    });
  };

  const getIcon = (headline: string): string => {
    const lower = headline.toLowerCase();
    if (lower.includes('bmi')) return 'scale-bathroom';
    if (lower.includes('sodium')) return 'shaker';
    if (lower.includes('protein') || lower.includes('fiber')) return 'food-steak';
    if (lower.includes('processed')) return 'food-off';
    if (lower.includes('paneer') || lower.includes('dal')) return 'check-circle';
    return 'lightbulb-on';
  };

  useEffect(() => {
    if (data) {
      setProcessedData(processText(data));
    }
  }, [data]);

  if (!processedData) {
    return (
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Key Insights</Text>
        <>{highlightText(data)}</>
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
            <>{highlightText(insight.headline)}</>
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