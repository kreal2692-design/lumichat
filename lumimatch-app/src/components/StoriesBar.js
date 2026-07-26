/**
 * 📖 STORIES BAR - Instagram/Twitter-style Stories
 * 
 * Features:
 * - Circular avatars with gradient borders
 * - Active indicator for live stories
 * - Horizontal scroll
 * - Smooth animations
 * 
 * @author LumiMatch Architecture Team
 * @version 3.0.0
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

/**
 * Single Story Avatar Component
 */
const StoryAvatar = ({ user, onPress, isFirst }) => {
  const hasActiveStory = user.has_active_story || user.is_online;
  
  return (
    <TouchableOpacity
      style={[styles.storyContainer, isFirst && styles.firstStory]}
      onPress={() => onPress(user)}
      activeOpacity={0.7}
    >
      {/* Gradient Border for Active Stories */}
      {hasActiveStory ? (
        <LinearGradient
          colors={['#f09433', '#e6683c', '#dc2743', '#cc2366', '#bc1888']}
          style={styles.storyBorder}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.storyInnerBorder}>
            <Image
              source={{ uri: user.avatar_url || user.avatar }}
              style={styles.storyAvatar}
            />
            
            {/* Live indicator */}
            {user.is_live && (
              <View style={styles.liveIndicator}>
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            )}
          </View>
        </LinearGradient>
      ) : (
        <View style={styles.storyBorderInactive}>
          <View style={styles.storyInnerBorder}>
            <Image
              source={{ uri: user.avatar_url || user.avatar }}
              style={styles.storyAvatar}
            />
          </View>
        </View>
      )}
      
      {/* Username */}
      <Text style={styles.storyUsername} numberOfLines={1}>
        {user.display_name || user.username}
      </Text>
      
      {/* Premium Badge */}
      {user.is_premium && (
        <View style={styles.premiumBadge}>
          <Text style={styles.premiumIcon}>👑</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

/**
 * Stories Bar Component
 */
export default function StoriesBar({ users = [], onStoryPress, onAddStory }) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
      >
        {/* Add Your Story Button */}
        {onAddStory && (
          <TouchableOpacity
            style={styles.addStoryContainer}
            onPress={onAddStory}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.addStoryGradient}
            >
              <Text style={styles.addStoryIcon}>➕</Text>
            </LinearGradient>
            <Text style={styles.addStoryText}>Ekle</Text>
          </TouchableOpacity>
        )}
        
        {/* Story Avatars */}
        {users.map((user, index) => (
          <StoryAvatar
            key={user.id}
            user={user}
            onPress={onStoryPress}
            isFirst={index === 0 && !onAddStory}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 16,
  },
  
  // Add Story Button
  addStoryContainer: {
    alignItems: 'center',
    width: 72,
  },
  addStoryGradient: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    // Shadow for depth
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  addStoryIcon: {
    fontSize: 28,
    color: '#ffffff',
  },
  addStoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  
  // Story Avatar
  storyContainer: {
    alignItems: 'center',
    width: 72,
  },
  firstStory: {
    // Optional: Add special styling for first story
  },
  storyBorder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    padding: 3,
    marginBottom: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyBorderInactive: {
    width: 72,
    height: 72,
    borderRadius: 36,
    padding: 3,
    marginBottom: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  storyInnerBorder: {
    width: '100%',
    height: '100%',
    borderRadius: 33,
    padding: 2,
    backgroundColor: '#1a1f2e', // Dark background
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  storyUsername: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    width: 72,
  },
  
  // Live Indicator
  liveIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#ff006e',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#1a1f2e',
  },
  liveText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  
  // Premium Badge
  premiumBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#ffd700',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1a1f2e',
    shadowColor: '#ffd700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  premiumIcon: {
    fontSize: 10,
  },
});
