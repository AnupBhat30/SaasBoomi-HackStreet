import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Dimensions } from 'react-native'
import React, { useState, useEffect } from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { MotiView } from 'moti'

interface HeritageAlternativeProps {
  data: string;
}

interface Insight {
  headline: string;
  explanation: string;
  icon: string;
  badge?: string;
}

interface ProcessedData {
  primaryMessage: string;
  insights: Insight[];
}

const HeritageAlternative: React.FC<HeritageAlternativeProps> = ({ data }) => {
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [expandedCards, setExpandedCards] = useState<{ [key: number]: boolean }>({});

  const processText = (text: string): ProcessedData => {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).map(s => s.trim());
    const insights = sentences.slice(1, 7).map((sentence) => {
      const words = sentence.split(' ');
      const isShort = words.length <= 20;
      const headline = isShort ? (sentence.endsWith('.') || sentence.endsWith('!') || sentence.endsWith('?') ? sentence : sentence + '.') : `Tip: ${words.slice(0, 8).join(' ')}...`;
      const explanation = sentence;
      const icon = getIcon(headline);
      const badge = getBadge(headline);
      return { headline, explanation, icon, badge };
    });
    const primaryMessage = sentences[0] || 'No primary message';
    return { primaryMessage, insights };
  };

  const getIcon = (headline: string): string => {
    const lower = headline.toLowerCase();
    if (lower.includes('protein')) return 'food-steak';
    if (lower.includes('fiber')) return 'leaf';
    if (lower.includes('processed')) return 'food-off';
    if (lower.includes('tech') || lower.includes('smart')) return 'cellphone-cog';
    if (lower.includes('exercise') || lower.includes('kettlebell')) return 'dumbbell';
    if (lower.includes('oats') || lower.includes('shake')) return 'blender';
    return 'lightbulb-on';
  };

  const getBadge = (headline: string): string | undefined => {
    const lower = headline.toLowerCase();
    if (lower.includes('protein')) return 'High Protein';
    if (lower.includes('fiber')) return 'Fiber Rich';
    if (lower.includes('quick')) return 'Quick Prep';
    if (lower.includes('modern')) return 'Innovative';
    return undefined;
  };

  const toggleExpand = (index: number) => {
    setExpandedCards(prev => ({ ...prev, [index]: !prev[index] }));
  };

  useEffect(() => {
    if (data) {
      setProcessedData(processText(data));
    }
  }, [data]);

  const renderCard = ({ item, index }: { item: Insight; index: number }) => {
    const isExpanded = expandedCards[index];

    return (
      <MotiView
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'timing', duration: 500, delay: index * 100 }}
        style={styles.card}
      >
        <TouchableOpacity onPress={() => toggleExpand(index)} style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name={item.icon as any} size={32} color={heritageColors.primary} />
            {item.badge && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>
            )}
          </View>
          <Text style={styles.headline}>{item.headline}</Text>
          {isExpanded && (
            <MotiView
              from={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ type: 'timing', duration: 300 }}
            >
              <Text style={styles.explanation}>{item.explanation}</Text>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionText}>Try it now</Text>
              </TouchableOpacity>
            </MotiView>
          )}
        </TouchableOpacity>
      </MotiView>
    );
  };

  if (!processedData) {
    return (
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Heritage Alternative</Text>
        <Text style={styles.content}>{data}</Text>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <MotiView
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 500 }}
        style={styles.header}
      >
        <MaterialCommunityIcons name="leaf" size={40} color={heritageColors.primary} />
        <Text style={styles.title}>Heritage Alternative</Text>
        <Text style={styles.subtitle}>Traditional wisdom meets modern nutrition</Text>
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

      {/* Cards Grid */}
      <FlatList
        data={processedData.insights}
        renderItem={renderCard}
        keyExtractor={(item, index) => index.toString()}
        numColumns={2}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const { width } = Dimensions.get('window');
const heritageColors = {
  primary: '#8B4513',
  secondary: '#A0522D',
  bg: '#F5F5DC',
  card: '#FFFFFF',
  textPrimary: '#1F2933',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  accent1: '#228B22',
  accent2: '#32CD32',
  accent3: '#8FBC8F',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: heritageColors.bg,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: heritageColors.textPrimary,
    marginTop: 8,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: heritageColors.textSecondary,
    textAlign: 'center',
  },
  primaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: heritageColors.primary,
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
  grid: {
    paddingBottom: 20,
  },
  card: {
    flex: 1,
    margin: 8,
    backgroundColor: heritageColors.card,
    borderRadius: 20,
    padding: 16,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    height: 250,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    backgroundColor: heritageColors.accent1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  headline: {
    fontSize: 16,
    fontWeight: '600',
    color: heritageColors.textPrimary,
    marginBottom: 8,
    flex: 1,
  },
  explanation: {
    fontSize: 14,
    lineHeight: 20,
    color: heritageColors.textSecondary,
    marginBottom: 12,
  },
  actionButton: {
    backgroundColor: heritageColors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
  },
});

export default HeritageAlternative