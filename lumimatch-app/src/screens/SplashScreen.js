import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();
  }, []);

  return (
    <LinearGradient
      colors={['#07131a', '#0b0f17', '#07131a']} // Web sitendeki gradient
      style={styles.container}
    >
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Animated.View style={[
          styles.logoContainer,
          {
            opacity: glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.6, 1],
            }),
          },
        ]}>
          <LinearGradient
            colors={['#00e5ff', '#7b2ff7', '#ff006e']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoGradient}
          >
            <Text style={styles.logo}>💬</Text>
          </LinearGradient>
        </Animated.View>
        
        <Text style={styles.title}>LumiMatch</Text>
        <Text style={styles.subtitle}>Anında Bağlan, Keşfet, Eğlen</Text>
        
        <View style={styles.features}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>⚡</Text>
            <Text style={styles.featureText}>Hızlı</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🌍</Text>
            <Text style={styles.featureText}>Global</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🔒</Text>
            <Text style={styles.featureText}>Güvenli</Text>
          </View>
        </View>

        <Animated.View style={[styles.loaderDots, { opacity: glowAnim }]}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </Animated.View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoGradient: {
    width: 120,
    height: 120,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00e5ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  logo: {
    fontSize: 60,
  },
  title: {
    fontSize: 52,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 18,
    color: '#00e5ff',
    marginBottom: 40,
    fontWeight: '500',
  },
  features: {
    flexDirection: 'row',
    gap: 32,
    marginBottom: 40,
  },
  featureItem: {
    alignItems: 'center',
    gap: 6,
  },
  featureIcon: {
    fontSize: 28,
  },
  featureText: {
    fontSize: 13,
    color: '#a9b6c7',
    fontWeight: '600',
  },
  loaderDots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00e5ff',
  },
});
