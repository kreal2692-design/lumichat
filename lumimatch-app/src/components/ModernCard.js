import React from 'react';
import { TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../theme/colors';
import Spacing from '../theme/spacing';
import Shadows from '../theme/shadows';

export default function ModernCard({ 
  children, 
  onPress, 
  gradient = null,
  style = {},
  activeOpacity = 0.7,
  elevation = 'md',
}) {
  const scaleAnim = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      tension: 100,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
    }).start();
  };

  const content = (
    <Animated.View
      style={[
        styles.card,
        Shadows.card[elevation],
        style,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      {children}
    </Animated.View>
  );

  if (gradient) {
    return (
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={activeOpacity}
        style={styles.touchable}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.gradientCard, Shadows.card[elevation], style]}
          >
            {children}
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    );
  }

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={activeOpacity}
        style={styles.touchable}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  touchable: {
    width: '100%',
  },
  card: {
    backgroundColor: Colors.background.secondary,
    borderRadius: Spacing.radius.xl,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
    overflow: 'hidden',
  },
  gradientCard: {
    borderRadius: Spacing.radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
});
