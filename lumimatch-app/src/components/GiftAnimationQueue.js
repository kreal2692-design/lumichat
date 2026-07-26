/**
 * 🎁 GIFT ANIMATION QUEUE - TikTok-style Gift System
 * 
 * Enterprise-grade Lottie animation queue with:
 * - Performance optimization (max 3 concurrent)
 * - Memory leak prevention
 * - Smooth transitions
 * - Auto-cleanup
 * 
 * @author LumiMatch Architecture Team
 * @version 3.0.0
 */

import React, { useEffect, useRef, useState, memo } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// Gift animation catalog (Lottie animations)
const GIFT_ANIMATIONS = {
  rose: require('../../assets/lottie/rose.json'),
  heart: require('../../assets/lottie/heart.json'),
  diamond: require('../../assets/lottie/diamond.json'),
  crown: require('../../assets/lottie/crown.json'),
  star: require('../../assets/lottie/star.json'),
  rocket: require('../../assets/lottie/rocket.json'),
  fire: require('../../assets/lottie/fire.json'),
  money: require('../../assets/lottie/money.json'),
};

// Gift configuration with pricing
export const GIFT_CATALOG = [
  { id: 'rose', name: '🌹 Gül', emoji: '🌹', price: 10, animation: 'rose' },
  { id: 'heart', name: '❤️ Kalp', emoji: '❤️', price: 20, animation: 'heart' },
  { id: 'diamond', name: '💎 Elmas', emoji: '💎', price: 50, animation: 'diamond' },
  { id: 'crown', name: '👑 Taç', emoji: '👑', price: 100, animation: 'crown' },
  { id: 'star', name: '⭐ Yıldız', emoji: '⭐', price: 30, animation: 'star' },
  { id: 'rocket', name: '🚀 Roket', emoji: '🚀', price: 150, animation: 'rocket' },
  { id: 'fire', name: '🔥 Ateş', emoji: '🔥', price: 40, animation: 'fire' },
  { id: 'money', name: '💰 Para', emoji: '💰', price: 200, animation: 'money' },
];

/**
 * Single Gift Animation Component
 * Renders one Lottie animation with sender info
 */
const GiftAnimation = memo(({ gift, onFinish, index }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  
  const lottieRef = useRef(null);
  
  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
    ]).start();
    
    // Play Lottie animation
    if (lottieRef.current) {
      lottieRef.current.play();
    }
    
    // Auto-remove after duration
    const timer = setTimeout(() => {
      // Exit animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -50,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onFinish();
      });
    }, 3000); // Show for 3 seconds
    
    return () => {
      clearTimeout(timer);
    };
  }, []);
  
  // Get animation source (fallback to emoji if Lottie not found)
  const getAnimationSource = () => {
    try {
      return GIFT_ANIMATIONS[gift.animation] || null;
    } catch {
      return null;
    }
  };
  
  const animationSource = getAnimationSource();
  
  return (
    <Animated.View
      style={[
        styles.giftContainer,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
          bottom: 200 + (index * 80), // Stack vertically
        },
      ]}
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.6)']}
        style={styles.giftBanner}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        {/* Lottie Animation or Emoji Fallback */}
        <View style={styles.animationContainer}>
          {animationSource ? (
            <LottieView
              ref={lottieRef}
              source={animationSource}
              style={styles.lottieAnimation}
              loop={false}
              autoPlay={false}
            />
          ) : (
            <Text style={styles.giftEmojiFallback}>{gift.emoji}</Text>
          )}
        </View>
        
        {/* Gift Info */}
        <View style={styles.giftInfo}>
          <Text style={styles.senderName} numberOfLines={1}>
            {gift.senderName}
          </Text>
          <Text style={styles.giftName}>
            {gift.name} <Text style={styles.giftPrice}>({gift.price}💎)</Text>
          </Text>
        </View>
        
        {/* Sparkle Effect */}
        <View style={styles.sparkleEffect}>
          <Text style={styles.sparkle}>✨</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
});

/**
 * Gift Animation Queue Component
 * Manages multiple gift animations with performance optimization
 */
export default function GiftAnimationQueue({ gifts = [], maxConcurrent = 3 }) {
  const [activeGifts, setActiveGifts] = useState([]);
  const queueRef = useRef([...gifts]);
  
  useEffect(() => {
    // Update queue when new gifts arrive
    queueRef.current = [...gifts];
    processQueue();
  }, [gifts]);
  
  const processQueue = () => {
    // Don't exceed max concurrent animations
    if (activeGifts.length >= maxConcurrent) return;
    
    // Get next gift from queue
    if (queueRef.current.length === 0) return;
    
    const nextGift = queueRef.current.shift();
    const giftWithId = {
      ...nextGift,
      uniqueId: `${nextGift.id}-${Date.now()}-${Math.random()}`,
    };
    
    setActiveGifts(prev => [...prev, giftWithId]);
  };
  
  const handleGiftFinish = (giftId) => {
    setActiveGifts(prev => prev.filter(g => g.uniqueId !== giftId));
    // Process next gift in queue
    setTimeout(processQueue, 100);
  };
  
  return (
    <View style={styles.queueContainer} pointerEvents="none">
      {activeGifts.map((gift, index) => (
        <GiftAnimation
          key={gift.uniqueId}
          gift={gift}
          index={index}
          onFinish={() => handleGiftFinish(gift.uniqueId)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  queueContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  giftContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
  },
  giftBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    gap: 12,
    // Glassmorphism effect
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    // Shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  animationContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 30,
  },
  lottieAnimation: {
    width: 50,
    height: 50,
  },
  giftEmojiFallback: {
    fontSize: 36,
  },
  giftInfo: {
    flex: 1,
    gap: 2,
  },
  senderName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  giftName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffd700', // Gold color
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  giftPrice: {
    fontSize: 11,
    color: '#00e5ff',
  },
  sparkleEffect: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  sparkle: {
    fontSize: 24,
    // Pulsing animation would be added via Animated.loop
  },
});
