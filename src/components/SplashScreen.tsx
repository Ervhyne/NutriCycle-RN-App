import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Image, Easing } from 'react-native';
import { colors } from '../theme/colors';

const LOGO = require('../../assets/Logo.png');

type Props = {
  visible?: boolean;
  onHidden?: () => void;
};

export default function SplashScreen({ visible = true, onHidden }: Props) {
  const spin = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const [mounted, setMounted] = useState(visible);

  const sparkleAnims = useRef(
    new Array(6).fill(0).map(() => ({ scale: new Animated.Value(0), opacity: new Animated.Value(0) }))
  ).current;

  useEffect(() => {
    setMounted(true);
    const spinLoop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1400,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    spinLoop.start();

    // sparkles: staggered pulse animations
    const sparkleAnimsSeq = sparkleAnims.map((s, idx) => (
      Animated.loop(
        Animated.sequence([
          Animated.delay(idx * 120),
          Animated.parallel([
            Animated.timing(s.scale, { toValue: 1.2, duration: 380, useNativeDriver: true }),
            Animated.timing(s.opacity, { toValue: 1, duration: 380, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(s.scale, { toValue: 0.6, duration: 420, useNativeDriver: true }),
            Animated.timing(s.opacity, { toValue: 0, duration: 420, useNativeDriver: true }),
          ]),
          Animated.delay(600),
        ])
      )
    ));

    sparkleAnimsSeq.forEach((a) => a.start());

    return () => {
      spinLoop.stop();
      sparkleAnimsSeq.forEach((a) => a.stop());
    };
  }, [spin, sparkleAnims]);

  // handle visible -> false fade out
  useEffect(() => {
    if (visible) {
      opacity.setValue(1);
      setMounted(true);
      return;
    }

    Animated.timing(opacity, {
      toValue: 0,
      duration: 280,
      useNativeDriver: true,
    }).start(() => {
      setMounted(false);
      onHidden?.();
    });
  }, [visible, opacity, onHidden]);

  if (!mounted) return null;

  const spinInterpolate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // positions for sparkles around the logo
  const sparklePositions = [
    { top: -8, left: 30 },
    { top: 10, right: -6 },
    { bottom: 10, right: -8 },
    { bottom: -6, left: 28 },
    { top: 32, left: -10 },
    { top: -4, right: 32 },
  ];

  return (
    <Animated.View style={[styles.container, { opacity }]} pointerEvents="none">
      <View style={styles.logoContainer}>
        <Animated.View style={[styles.logoCircle, { transform: [{ rotate: spinInterpolate }] }]}>
          <Image source={LOGO} style={styles.logo} resizeMode="contain" />
        </Animated.View>
        {sparkleAnims.map((s, i) => (
          <Animated.View
            key={`s-${i}`}
            style={[
              styles.sparkle,
              sparklePositions[i],
              {
                transform: [{ scale: s.scale }],
                opacity: s.opacity,
              },
            ]}
          />
        ))}
      </View>

      <Text style={styles.brand}>NutriCycle</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.creamBackground,
    zIndex: 9999,
  },
  logoContainer: {
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  logo: {
    width: 140,
    height: 140,
  },
  sparkle: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFD54F',
    opacity: 0,
    elevation: 6,
  },
  brand: {
    marginTop: 24,
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
});