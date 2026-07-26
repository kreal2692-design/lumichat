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

const { width, height } = Dimensions.get('window');

// TikTok/Buzu Kır style hediye animasyonları
export default function GiftAnimation({ gift, onComplete, style = 'full' }) {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(height)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Particle animations
  const particles = Array.from({ length: 20 }, () => ({
    translateX: useRef(new Animated.Value(0)).current,
    translateY: useRef(new Animated.Value(0)).current,
    opacity: useRef(new Animated.Value(1)).current,
    scale: useRef(new Animated.Value(1)).current,
  }));

  useEffect(() => {
    if (style === 'full') {
      // Full screen animation (TikTok style)
      runFullAnimation();
    } else if (style === 'corner') {
      // Corner notification (subtle)
      runCornerAnimation();
    } else {
      // Floating animation (bubbles)
      runFloatingAnimation();
    }
  }, []);

  const runFullAnimation = () => {
    // Main gift animation sequence
    Animated.sequence([
      // 1. Enter from bottom
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: height / 2 - 150,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      
      // 2. Pulse effect
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        { iterations: 2 }
      ),
      
      // 3. Rotate
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      
      // 4. Exit
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.5,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -200,
          duration: 400,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => onComplete && onComplete());

    // Particle burst animation
    particles.forEach((particle, index) => {
      const angle = (index / particles.length) * Math.PI * 2;
      const distance = 100 + Math.random() * 50;
      const duration = 800 + Math.random() * 400;

      Animated.parallel([
        Animated.timing(particle.translateX, {
          toValue: Math.cos(angle) * distance,
          duration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(particle.translateY, {
          toValue: Math.sin(angle) * distance,
          duration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(particle.opacity, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(particle.scale, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const runCornerAnimation = () => {
    // Subtle corner notification
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 80,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: -20,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(2000),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: 100,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => onComplete && onComplete());
  };

  const runFloatingAnimation = () => {
    // Floating bubbles (like Live stream gifts)
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -height,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(translateX, {
              toValue: 30,
              duration: 1000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(translateX, {
              toValue: -30,
              duration: 1000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          { iterations: 2 }
        ),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => onComplete && onComplete());
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (style === 'corner') {
    return (
      <Animated.View
        style={[
          styles.cornerContainer,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateX },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={[gift.color + '40', gift.color + 'FF', gift.color + '40']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cornerGradient}
        >
          <Text style={styles.cornerEmoji}>{gift.emoji}</Text>
          <View style={styles.cornerInfo}>
            <Text style={styles.cornerName}>{gift.name}</Text>
            <Text style={styles.cornerSender}>Senden</Text>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  }

  if (style === 'floating') {
    return (
      <Animated.View
        style={[
          styles.floatingContainer,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY },
              { translateX },
            ],
          },
        ]}
      >
        <View style={styles.floatingBubble}>
          <Text style={styles.floatingEmoji}>{gift.emoji}</Text>
        </View>
      </Animated.View>
    );
  }

  // Full screen animation (default)
  return (
    <View style={styles.fullContainer}>
      {/* Particles */}
      {particles.map((particle, index) => (
        <Animated.View
          key={index}
          style={[
            styles.particle,
            {
              opacity: particle.opacity,
              transform: [
                { translateX: particle.translateX },
                { translateY: particle.translateY },
                { scale: particle.scale },
              ],
            },
          ]}
        >
          <Text style={styles.particleText}>✨</Text>
        </Animated.View>
      ))}

      {/* Main Gift */}
      <Animated.View
        style={[
          styles.giftContainer,
          {
            opacity: fadeAnim,
            transform: [
              { scale: Animated.multiply(scaleAnim, pulseAnim) },
              { translateY },
              { rotate: spin },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={[
            gift.color + '00',
            gift.color + '40',
            gift.color + 'FF',
            gift.color + '40',
            gift.color + '00',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.giftGlow}
        >
          <View style={styles.giftInner}>
            <Text style={styles.giftEmoji}>{gift.emoji}</Text>
          </View>
        </LinearGradient>

        <View style={styles.giftInfo}>
          <Text style={styles.giftName}>{gift.name}</Text>
          <View style={styles.giftPrice}>
            <Text style={styles.giftPriceIcon}>💎</Text>
            <Text style={styles.giftPriceText}>{gift.price}</Text>
          </View>
        </View>
      </Animated.View>

      {/* Overlay Effects */}
      <Animated.View
        style={[
          styles.ringEffect,
          {
            opacity: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.3],
            }),
            transform: [
              { scale: scaleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 2],
              })},
            ],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // Full Screen Animation
  fullContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  giftContainer: {
    alignItems: 'center',
  },
  giftGlow: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 20,
  },
  giftInner: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  giftEmoji: {
    fontSize: 100,
  },
  giftInfo: {
    marginTop: 24,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  giftName: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 8,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  giftPrice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  giftPriceIcon: {
    fontSize: 20,
  },
  giftPriceText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#00d9ff',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  ringEffect: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 4,
    borderColor: '#ffffff',
  },

  // Particles
  particle: {
    position: 'absolute',
    top: height / 2,
    left: width / 2,
  },
  particleText: {
    fontSize: 24,
  },

  // Corner Animation
  cornerContainer: {
    position: 'absolute',
    top: 100,
    right: 20,
    zIndex: 1000,
  },
  cornerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  cornerEmoji: {
    fontSize: 40,
  },
  cornerInfo: {
    gap: 2,
  },
  cornerName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  cornerSender: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
  },

  // Floating Animation
  floatingContainer: {
    position: 'absolute',
    left: width * 0.1 + Math.random() * width * 0.3,
    bottom: -100,
  },
  floatingBubble: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  floatingEmoji: {
    fontSize: 36,
  },
});
