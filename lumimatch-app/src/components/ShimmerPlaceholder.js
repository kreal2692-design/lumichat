import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../theme/colors';
import Spacing from '../theme/spacing';

export default function ShimmerPlaceholder({ 
  width = '100%', 
  height = 20, 
  borderRadius = Spacing.radius.sm,
  style = {},
}) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View 
      style={[
        styles.shimmer,
        { width, height, borderRadius, opacity },
        style,
      ]}
    >
      <LinearGradient
        colors={[Colors.shimmer, Colors.background.secondary, Colors.shimmer]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      />
    </Animated.View>
  );
}

// Pre-built shimmer patterns
export function PostShimmer() {
  return (
    <View style={styles.postShimmer}>
      <View style={styles.postHeader}>
        <ShimmerPlaceholder width={44} height={44} borderRadius={22} />
        <View style={styles.postInfo}>
          <ShimmerPlaceholder width={120} height={14} />
          <ShimmerPlaceholder width={80} height={12} style={{ marginTop: 4 }} />
        </View>
      </View>
      <ShimmerPlaceholder width="100%" height={16} style={{ marginTop: 12 }} />
      <ShimmerPlaceholder width="80%" height={16} style={{ marginTop: 4 }} />
      <ShimmerPlaceholder width="100%" height={200} borderRadius={Spacing.radius.lg} style={{ marginTop: 12 }} />
    </View>
  );
}

export function UserCardShimmer() {
  return (
    <View style={styles.userCardShimmer}>
      <ShimmerPlaceholder width="100%" height={240} borderRadius={Spacing.radius.xl} />
    </View>
  );
}

const styles = StyleSheet.create({
  shimmer: {
    backgroundColor: Colors.background.secondary,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
  },
  postShimmer: {
    padding: Spacing.md,
    backgroundColor: Colors.background.primary,
  },
  postHeader: {
    flexDirection: 'row',
    gap: Spacing.gap.md,
  },
  postInfo: {
    flex: 1,
  },
  userCardShimmer: {
    width: '48%',
    marginBottom: Spacing.md,
  },
});
