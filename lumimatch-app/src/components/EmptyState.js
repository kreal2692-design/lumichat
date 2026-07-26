import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ModernButton from './ModernButton';
import Colors from '../theme/colors';
import Spacing from '../theme/spacing';
import Typography from '../theme/typography';

export default function EmptyState({
  icon = '📭',
  title = 'İçerik bulunamadı',
  description = 'Henüz gösterilecek bir şey yok',
  actionLabel,
  onAction,
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      
      {actionLabel && onAction && (
        <ModernButton
          title={actionLabel}
          onPress={onAction}
          variant="solid"
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
    color: Colors.text.primary,
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
