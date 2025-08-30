import { Link, Stack } from 'expo-router';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import LottieView from 'lottie-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <ThemedView style={styles.container}>
        <Animated.View entering={FadeIn.duration(500)}>
          <LottieView
            source={{ uri: 'https://assets5.lottiefiles.com/packages/lf20_q5pk6p1k.json' }}
            autoPlay
            loop
            style={styles.animation}
          />
        </Animated.View>
        <ThemedText type="title" style={styles.title}>This screen doesn't exist.</ThemedText>
        <ThemedText style={styles.subtitle}>Looks like you got lost in the kitchen!</ThemedText>
        <Link href="/" style={styles.link}>
          <TouchableOpacity style={styles.button}>
            <ThemedText type="link" style={styles.buttonText}>Go to home screen!</ThemedText>
          </TouchableOpacity>
        </Link>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F6F7F9',
  },
  animation: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2933',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 30,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  button: {
    backgroundColor: '#FF6B00',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
