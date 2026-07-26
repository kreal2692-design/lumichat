import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../theme/colors';
import Spacing from '../theme/spacing';

export default function LoadingSpinner({ size = 'md', color = Colors.accent.blue }) {
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const rotate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const sizes = {
    sm: 24,
    md: 40,
    lg: 56,
  };

  const spinnerSize = sizes[size];

  return (
    <Animated.View style={[styles.spinner, { width: spinnerSize, height: spinnerSize, transform: [{ rotate }] }]}>
      <LinearGradient
        colors={[color, 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  spinner: {
    borderRadius: 999,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    borderRadius: 999,
  },
});
