import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../theme/colors';
import Spacing from '../theme/spacing';
import Typography from '../theme/typography';

const { width, height } = Dimensions.get('window');

export default function ReelsScreenModern({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reels, setReels] = useState([
    {
      id: '1',
      user: {
        id: 'u1',
        avatar: 'https://i.pravatar.cc/150?img=1',
        username: 'emma_wilson',
        is_verified: true,
      },
      video: 'https://picsum.photos/1080/1920?random=1',
      thumbnail: 'https://picsum.photos/1080/1920?random=1',
      description: 'Yeni içeriğim! 🔥✨ #reels #viral',
      music: 'Trending Sound • Emma Wilson',
      likes: 12500,
      comments: 234,
      shares: 89,
      isLiked: false,
      isFollowing: false,
    },
    {
      id: '2',
      user: {
        id: 'u2',
        avatar: 'https://i.pravatar.cc/150?img=5',
        username: 'sofia_garcia',
        is_verified: true,
      },
      video: 'https://picsum.photos/1080/1920?random=2',
      thumbnail: 'https://picsum.photos/1080/1920?random=2',
      description: 'Bugün harika bir gün! ☀️💕',
      music: 'Original Audio • Sofia Garcia',
      likes: 8900,
      comments: 156,
      shares: 45,
      isLiked: true,
      isFollowing: true,
    },
    {
      id: '3',
      user: {
        id: 'u3',
        avatar: 'https://i.pravatar.cc/150?img=9',
        username: 'yuki_tanaka',
        is_verified: false,
      },
      video: 'https://picsum.photos/1080/1920?random=3',
      thumbnail: 'https://picsum.photos/1080/1920?random=3',
      description: 'Dance challenge 💃🎵 #dance',
      music: 'Trending Dance Mix • DJ ProSound',
      likes: 15600,
      comments: 389,
      shares: 123,
      isLiked: false,
      isFollowing: false,
    },
  ]);

  const handleLike = (reelId) => {
    setReels(reels.map(reel => {
      if (reel.id === reelId) {
        return {
          ...reel,
          isLiked: !reel.isLiked,
          likes: reel.isLiked ? reel.likes - 1 : reel.likes + 1,
        };
      }
      return reel;
    }));
  };

  const handleFollow = (reelId) => {
    setReels(reels.map(reel => {
      if (reel.id === reelId) {
        return {
          ...reel,
          isFollowing: !reel.isFollowing,
        };
      }
      return reel;
    }));
  };

  const formatCount = (count) => {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count.toString();
  };

  const renderReel = ({ item: reel, index }) => (
    <View style={styles.reelContainer}>
      {/* Video/Image Background */}
      <Image 
        source={{ uri: reel.thumbnail }}
        style={styles.video}
        resizeMode="cover"
      />

      {/* Top Overlay - Header */}
      <LinearGradient
        colors={['rgba(0,0,0,0.6)', 'transparent']}
        style={styles.topGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Reels</Text>
          <TouchableOpacity>
            <Text style={styles.cameraIcon}>📷</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Bottom Overlay - Info & Actions */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.bottomGradient}
      >
        <View style={styles.contentContainer}>
          {/* Left Side - User Info */}
          <View style={styles.leftContent}>
            {/* User Header */}
            <TouchableOpacity style={styles.userRow}>
              <Image source={{ uri: reel.user.avatar }} style={styles.avatar} />
              <Text style={styles.username}>@{reel.user.username}</Text>
              {reel.user.is_verified && (
                <LinearGradient
                  colors={[Colors.accent.blue, Colors.accent.purple]}
                  style={styles.verifiedBadge}
                >
                  <Text style={styles.verified}>✓</Text>
                </LinearGradient>
              )}
              {!reel.isFollowing && (
                <TouchableOpacity 
                  style={styles.followBtn}
                  onPress={() => handleFollow(reel.id)}
                >
                  <Text style={styles.followText}>Takip Et</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>

            {/* Description */}
            <Text style={styles.description} numberOfLines={2}>
              {reel.description}
            </Text>

            {/* Music */}
            <TouchableOpacity style={styles.musicRow}>
              <Text style={styles.musicIcon}>🎵</Text>
              <Text style={styles.musicText} numberOfLines={1}>
                {reel.music}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Right Side - Action Buttons */}
          <View style={styles.actionsContainer}>
            {/* Like */}
            <TouchableOpacity 
              style={styles.actionBtn}
              onPress={() => handleLike(reel.id)}
            >
              <View style={[styles.actionCircle, reel.isLiked && styles.actionCircleActive]}>
                <Text style={styles.actionIcon}>
                  {reel.isLiked ? '❤️' : '🤍'}
                </Text>
              </View>
              <Text style={styles.actionCount}>{formatCount(reel.likes)}</Text>
            </TouchableOpacity>

            {/* Comment */}
            <TouchableOpacity style={styles.actionBtn}>
              <View style={styles.actionCircle}>
                <Text style={styles.actionIcon}>💬</Text>
              </View>
              <Text style={styles.actionCount}>{formatCount(reel.comments)}</Text>
            </TouchableOpacity>

            {/* Share */}
            <TouchableOpacity style={styles.actionBtn}>
              <View style={styles.actionCircle}>
                <Text style={styles.actionIcon}>📤</Text>
              </View>
              <Text style={styles.actionCount}>{formatCount(reel.shares)}</Text>
            </TouchableOpacity>

            {/* More */}
            <TouchableOpacity style={styles.actionBtn}>
              <View style={styles.actionCircle}>
                <Text style={styles.actionIcon}>⋯</Text>
              </View>
            </TouchableOpacity>

            {/* Music Disc */}
            <TouchableOpacity style={styles.musicDisc}>
              <Image 
                source={{ uri: reel.user.avatar }}
                style={styles.musicDiscImage}
              />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Double Tap to Like (overlay) */}
      <View style={styles.doubleTapArea} pointerEvents="box-only" />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" hidden />
      
      <FlatList
        data={reels}
        renderItem={renderReel}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={height}
        decelerationRate="fast"
        onScroll={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.y / height);
          setCurrentIndex(index);
        }}
        scrollEventThrottle={16}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  reelContainer: {
    width: width,
    height: height,
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.background.secondary,
  },
  
  // Top Gradient & Header
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 40,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  backIcon: {
    fontSize: 28,
    color: Colors.text.primary,
  },
  headerTitle: {
    ...Typography.styles.h4,
    color: Colors.text.primary,
  },
  cameraIcon: {
    fontSize: 24,
  },

  // Bottom Gradient & Content
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 100,
    paddingBottom: 20,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingBottom: 20,
  },

  // Left Content
  leftContent: {
    flex: 1,
    gap: Spacing.sm,
    paddingRight: Spacing.md,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.gap.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: Colors.text.primary,
  },
  username: {
    ...Typography.styles.label,
    color: Colors.text.primary,
    fontSize: 14,
  },
  verifiedBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verified: {
    fontSize: 10,
    color: Colors.text.primary,
  },
  followBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Colors.text.primary,
    marginLeft: 'auto',
  },
  followText: {
    ...Typography.styles.label,
    fontSize: 12,
    color: Colors.text.primary,
  },
  description: {
    ...Typography.styles.body,
    color: Colors.text.primary,
    lineHeight: 20,
  },
  musicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  musicIcon: {
    fontSize: 16,
  },
  musicText: {
    ...Typography.styles.caption,
    color: Colors.text.primary,
    flex: 1,
  },

  // Right Actions
  actionsContainer: {
    alignItems: 'center',
    gap: Spacing.lg,
  },
  actionBtn: {
    alignItems: 'center',
    gap: 4,
  },
  actionCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  actionCircleActive: {
    backgroundColor: 'rgba(255, 47, 146, 0.3)',
  },
  actionIcon: {
    fontSize: 24,
  },
  actionCount: {
    ...Typography.styles.caption,
    color: Colors.text.primary,
    fontSize: 11,
    fontWeight: Typography.weight.bold,
  },
  musicDisc: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.sm,
    borderWidth: 2,
    borderColor: Colors.text.primary,
  },
  musicDiscImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },

  // Double Tap Area
  doubleTapArea: {
    ...StyleSheet.absoluteFillObject,
  },
});
