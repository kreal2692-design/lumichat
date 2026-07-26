import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../theme/colors';
import Spacing from '../theme/spacing';
import Typography from '../theme/typography';
import Shadows from '../theme/shadows';

export default function ModernButton({
  title,
  onPress,
  variant = 'gradient', // gradient, solid, outline, ghost
  size = 'md', // sm, md, lg
  gradient = Colors.accent.gradient.blue,
  icon = null,
  loading = false,
  disabled = false,
  style = {},
  textStyle = {},
}) {
  const scaleAnim = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
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

  const sizes = {
    sm: { paddingVertical: 10, paddingHorizontal: 16, fontSize: 13 },
    md: { paddingVertical: 14, paddingHorizontal: 24, fontSize: 15 },
    lg: { paddingVertical: 16, paddingHorizontal: 32, fontSize: 16 },
  };

  const currentSize = sizes[size];

  if (variant === 'gradient') {
    return (
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.9}
        style={[styles.touchable, style]}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <LinearGradient
            colors={disabled ? ['#4B5563', '#4B5563'] : gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.gradientButton,
              {
                paddingVertical: currentSize.paddingVertical,
                paddingHorizontal: currentSize.paddingHorizontal,
              },
              disabled && styles.disabled,
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                {icon && <Text style={styles.icon}>{icon}</Text>}
                <Text
                  style={[
                    styles.text,
                    { fontSize: currentSize.fontSize },
                    textStyle,
                  ]}
                >
                  {title}
                </Text>
              </>
            )}
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    );
  }

  if (variant === 'solid') {
    return (
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={[styles.touchable, style]}
      >
        <Animated.View
          style={[
            styles.solidButton,
            {
              paddingVertical: currentSize.paddingVertical,
              paddingHorizontal: currentSize.paddingHorizontal,
            },
            disabled && styles.disabled,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              {icon && <Text style={styles.icon}>{icon}</Text>}
              <Text
                style={[
                  styles.text,
                  { fontSize: currentSize.fontSize },
                  textStyle,
                ]}
              >
                {title}
              </Text>
            </>
          )}
        </Animated.View>
      </TouchableOpacity>
    );
  }

  if (variant === 'outline') {
    return (
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.7}
        style={[styles.touchable, style]}
      >
        <Animated.View
          style={[
            styles.outlineButton,
            {
              paddingVertical: currentSize.paddingVertical,
              paddingHorizontal: currentSize.paddingHorizontal,
            },
            disabled && styles.disabled,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          {loading ? (
            <ActivityIndicator color={Colors.accent.blue} />
          ) : (
            <>
              {icon && <Text style={styles.icon}>{icon}</Text>}
              <Text
                style={[
                  styles.outlineText,
                  { fontSize: currentSize.fontSize },
                  textStyle,
                ]}
              >
                {title}
              </Text>
            </>
          )}
        </Animated.View>
      </TouchableOpacity>
    );
  }

  // Ghost variant
  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={0.6}
      style={[styles.touchable, style]}
    >
      <Animated.View
        style={[
          styles.ghostButton,
          {
            paddingVertical: currentSize.paddingVertical,
            paddingHorizontal: currentSize.paddingHorizontal,
          },
          disabled && styles.disabled,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={Colors.accent.blue} />
        ) : (
          <>
            {icon && <Text style={styles.icon}>{icon}</Text>}
            <Text
              style={[
                styles.ghostText,
                { fontSize: currentSize.fontSize },
                textStyle,
              ]}
            >
              {title}
            </Text>
          </>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchable: {
    width: '100%',
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Spacing.radius.xl,
    gap: Spacing.gap.sm,
    ...Shadows.button,
  },
  solidButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent.blue,
    borderRadius: Spacing.radius.xl,
    gap: Spacing.gap.sm,
  },
  outlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderRadius: Spacing.radius.xl,
    borderWidth: 2,
    borderColor: Colors.accent.blue,
    gap: Spacing.gap.sm,
  },
  ghostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.interactive.hover,
    borderRadius: Spacing.radius.xl,
    gap: Spacing.gap.sm,
  },
  text: {
    color: Colors.text.primary,
    fontWeight: Typography.weight.bold,
  },
  outlineText: {
    color: Colors.accent.blue,
    fontWeight: Typography.weight.bold,
  },
  ghostText: {
    color: Colors.text.secondary,
    fontWeight: Typography.weight.semibold,
  },
  icon: {
    fontSize: 18,
  },
  disabled: {
    opacity: 0.5,
  },
});
