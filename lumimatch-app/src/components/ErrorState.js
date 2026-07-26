import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ModernButton from './ModernButton';
import Colors from '../theme/colors';
import Spacing from '../theme/spacing';
import Typography from '../theme/typography';

export default function ErrorState({
  icon = '⚠️',
  title = 'Bir hata oluştu',
  description = 'Lütfen tekrar deneyin',
  onRetry,
  retryLabel = 'Tekrar Dene',
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      
      {onRetry && (
        <ModernButton
          title={retryLabel}
          onPress={onRetry}
          variant="gradient"
          size="md"
          style={styles.button}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  icon: {
    fontSize: 64,
    marginBottom: Spacing.sm,
  },
  title: {
    ...Typography.styles.h4,
    color: Colors.error,
    textAlign: 'center',
  },
  description: {
    ...Typography.styles.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    maxWidth: 300,
  },
  button: {
    marginTop: Spacing.md,
    minWidth: 200,
  },
});
