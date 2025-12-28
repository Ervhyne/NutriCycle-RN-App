import React, { useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  useWindowDimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { RootStackParamList } from '../navigation/types';

const ONBOARDING_KEY = 'hasSeenOnboarding';

const slides = [
  {
    title: 'Transform Waste',
    description: 'Convert cabbage waste into useful products through AI & IoT.',
    image: require('../../assets/splash1.png'),
  },
  {
    title: 'Sustainable Farming',
    description: 'Support farmers with animal feed and compost made from discarded vegetables.',
    image: require('../../assets/splash2.png'),
  },
  {
    title: 'Smart Monitoring',
    description: 'Track the process with real-time updates and ensure quality results.',
    image: require('../../assets/splash3.png'),
  },
];

export const OnboardingScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const scrollRef = useRef<ScrollView>(null);
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);

  const handleNext = async () => {
    const nextIndex = index + 1;
    if (nextIndex < slides.length) {
      scrollRef.current?.scrollTo({ x: nextIndex * width, animated: true });
      setIndex(nextIndex);
      return;
    }
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const indicatorDots = useMemo(
    () =>
      slides.map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i === index ? styles.dotActive : styles.dotInactive,
          ]}
        />
      )),
    [index],
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={(event) => {
          const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
          if (newIndex !== index) setIndex(newIndex);
        }}
        scrollEventThrottle={16}
        contentContainerStyle={{ alignItems: 'center' }}
      >
        {slides.map((slide) => (
          <View key={slide.title} style={[styles.slide, { width }]}>
            <Image source={slide.image} style={styles.image} resizeMode="contain" />
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.description}>{slide.description}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.dotsContainer}>{indicatorDots}</View>
        <TouchableOpacity style={styles.button} activeOpacity={0.9} onPress={handleNext}>
          <Text style={styles.buttonText}>{index === slides.length - 1 ? 'Get Started' : 'Next'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.creamBackground,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 32,
  },
  image: {
    width: '74%',
    height: 320,
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 18,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: colors.primaryText,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 24,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 12,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 6,
  },
  dotActive: {
    backgroundColor: colors.primary,
  },
  dotInactive: {
    backgroundColor: '#C8DCC3',
  },
  button: {
    backgroundColor: '#1B5E20',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.cardWhite,
    fontSize: 16,
    fontWeight: '700',
  },
});
