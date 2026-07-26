import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// Şık bahşiş toast notification (Confetti + Glow effect)
export default function TipToast({ amount, creatorName, onComplete }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const translateY = useRef(new Animated.Value(-50)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Confetti particles (15 -> 30 artırıldı)
  const confetti = Array.from({ length: 30 }, () => ({
    translateX: useRef(new Animated.Value(0)).current,
    translateY: useRef(new Animated.Value(0)).current,
    opacity: useRef(new Animated.Value(1)).current,
    rotation: useRef(new Animated.Value(0)).current,
  }));

  useEffect(() => {
    // Main toast animation
    Animated.sequence([
      // Enter
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          tension: 80,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),

      // Glow pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        { iterations: 2 }
      ),

      // Stay
      Animated.delay(1500),

      // Exit
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -100,
          duration: 400,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.5,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => onComplete && onComplete());

    // Confetti burst
    confetti.forEach((particle, index) => {
      const angle = (index / confetti.length) * Math.PI * 2;
      const distance = 80 + Math.random() * 40;
      const duration = 1000 + Math.random() * 500;
      const rotationAmount = Math.random() * 720 - 360;

      Animated.parallel([
        Animated.timing(particle.translateX, {
          toValue: Math.cos(angle) * distance,
          duration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(particle.translateY, {
          toValue: Math.sin(angle) * distance - 30,
          duration,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(particle.opacity, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(particle.rotation, {
          toValue: rotationAmount,
          duration,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, []);

  const glowScale = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1],
  });

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Confetti */}
      {confetti.map((particle, index) => {
        const colors = ['#FFD700', '#FF006E', '#00D9FF', '#2ECC71', '#9B59B6', '#FF4D94'];
        const color = colors[index % colors.length];
        
        return (
          <Animated.View
            key={index}
            style={[
              styles.confettiParticle,
              {
                backgroundColor: color,
                opacity: particle.opacity,
                transform: [
                  { translateX: particle.translateX },
                  { translateY: particle.translateY },
                  {
                    rotate: particle.rotation.interpolate({
                      inputRange: [-360, 360],
                      outputRange: ['-360deg', '360deg'],
                    }),
                  },
                ],
              },
            ]}
          />
        );
      })}

      {/* Toast Container */}
      <Animated.View
        style={[
          styles.toastContainer,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY },
            ],
          },
        ]}
      >
        {/* Glow Effect */}
        <Animated.View
          style={[
            styles.glowEffect,
            {
              opacity: glowOpacity,
              transform: [{ scale: glowScale }],
            },
          ]}
        >
          <LinearGradient
            colors={['rgba(255,0,110,0)', 'rgba(255,0,110,0.3)', 'rgba(255,0,110,0)']}
            style={styles.glowGradient}
          />
        </Animated.View>

        {/* Main Card */}
        <LinearGradient
          colors={['#FF006E', '#FF4D94', '#FF006E']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View style={styles.cardInner}>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>💝</Text>
              <View style={styles.sparkle}>
                <Text style={styles.sparkleText}>✨</Text>
              </View>
            </View>

            {/* Content */}
            <View style={styles.content}>
              <Text style={styles.title}>Bahşiş Gönderildi!</Text>
              <Text style={styles.amount}>{amount}💎</Text>
              <Text style={styles.subtitle}>{creatorName} için</Text>
            </View>

            {/* Success Badge */}
            <View style={styles.badge}>
              <Text style={styles.badgeText}>✓</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },

  // Confetti
  confettiParticle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // Toast
  toastContainer: {
    width: width * 0.85,
    maxWidth: 400,
    position: 'relative',
  },

  // Glow Effect
  glowEffect: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowGradient: {
    width: '110%',
    height: '110%',
    borderRadius: 24,
  },

  // Card
  card: {
    borderRadius: 20,
    padding: 3,
    shadowColor: '#FF006E',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  },
  cardInner: {
    backgroundColor: 'rgba(10,14,26,0.95)',
    borderRadius: 18,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },

  // Icon
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  icon: {
    fontSize: 36,
  },
  sparkle: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
  sparkleText: {
    fontSize: 20,
  },

  // Content
  content: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  amount: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFD700',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#a9b6c7',
  },

  // Badge
  badge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2ECC71',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  badgeText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
  },
});
