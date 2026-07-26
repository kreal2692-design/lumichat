import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import StoriesBar from '../components/StoriesBar';
import Colors from '../theme/colors';
import Spacing from '../theme/spacing';
import Typography from '../theme/typography';

const { width } = Dimensions.get('window');

export default function FeedScreenModern({ navigation }) {
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('forYou');
  const [activeUsers, setActiveUsers] = useState([]);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadData();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadData = () => {
    // Demo data
    setPosts([
      {
        id: '1',
        user: {
          id: 'u1',
          avatar: 'https://i.pravatar.cc/150?img=1',
          display_name: 'Emma Wilson',
          username: 'emma_w',
          is_verified: true,
        },
        content: 'Yeni içeriklerim çok yakında! 🎬✨ Takipte kalın!',
        media: [{ url: 'https://picsum.photos/400/500?random=1', type: 'image' }],
        likes_count: 234,
        comments_count: 12,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        isLiked: false,
      },
      {
        id: '2',
        user: {
          id: 'u2',
          avatar: 'https://i.pravatar.cc/150?img=5',
          display_name: 'Sofia Garcia',
          username: 'sofia_g',
          is_verified: true,
        },
        content: 'Bugün harika bir gün! ☀️💕',
        likes_count: 156,
        comments_count: 8,
        created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        isLiked: true,
      },
    ]);

    setActiveUsers([
      {
        id: 'user-1',
        username: 'zeynep_ay',
        display_name: 'Zeynep',
        avatar: 'https://i.pravatar.cc/150?img=1',
        has_active_story: true,
        is_online: true,
        is_live: false,
      },
      {
        id: 'user-2',
        username: 'mehmet_k',
        display_name: 'Mehmet',
        avatar: 'https://i.pravatar.cc/150?img=12',
        has_active_story: true,
        is_online: true,
        is_live: true,
      },
    ]);
  };

  const handleLike = (postId) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isLiked: !post.isLiked,
          likes_count: post.isLiked ? post.likes_count - 1 : post.likes_count + 1,
        };
      }
      return post;
    }));
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const postDate = new Date(timestamp);
    const diff = Math.floor((now - postDate) / 1000);

    if (diff < 60) return 'Az önce';
    if (diff < 3600) return `${Math.floor(diff / 60)}dk`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}sa`;
    return `${Math.floor(diff / 86400)}g`;
  };

  const renderPost = ({ item: post }) => (
    <View style={styles.postCard}>
      {/* User Header */}
      <View style={styles.postHeader}>
        <TouchableOpacity style={styles.userRow}>
          <Image source={{ uri: post.user.avatar }} style={styles.avatar} />
          <View style={styles.userInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.displayName}>{post.user.display_name}</Text>
              {post.user.is_verified && (
                <LinearGradient
                  colors={[Colors.accent.blue, Colors.accent.purple]}
                  style={styles.verifiedBadge}
                >
                  <Text style={styles.verified}>✓</Text>
                </LinearGradient>
              )}
            </View>
            <Text style={styles.username}>
              @{post.user.username} · {formatTime(post.created_at)}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.moreBtn}>
          <Text style={styles.moreIcon}>⋯</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {post.content && (
        <Text style={styles.contentText}>{post.content}</Text>
      )}

      {/* Media */}
      {post.media && post.media.length > 0 && (
        <View style={styles.mediaContainer}>
          <Image 
            source={{ uri: post.media[0].url }}
            style={styles.postMedia}
            resizeMode="cover"
          />
        </View>
      )}

      {/* Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionCount}>{post.comments_count}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionBtn}
          onPress={() => handleLike(post.id)}
        >
          <Text style={styles.actionIcon}>{post.isLiked ? '❤️' : '🤍'}</Text>
          <Text style={[styles.actionCount, post.isLiked && styles.actionCountActive]}>
            {post.likes_count}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionIcon}>🔁</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionIcon}>📤</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionIcon}>🔖</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Keşfet</Text>
        <TouchableOpacity style={styles.createBtn}>
          <Text style={styles.createIcon}>✏️</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {['forYou', 'following', 'trending'].map((tab) => {
          const labels = { forYou: 'Senin İçin', following: 'Takip', trending: 'Trendler' };
          const isActive = selectedTab === tab;
          
          return (
            <TouchableOpacity
              key={tab}
              style={styles.tab}
              onPress={() => setSelectedTab(tab)}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {labels[tab]}
              </Text>
              {isActive && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Stories */}
      <View style={styles.storiesContainer}>
        <StoriesBar 
          users={activeUsers}
          onStoryPress={() => {}}
          onAddStory={() => {}}
        />
      </View>

      {/* Feed */}
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.feedContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadData();
                setTimeout(() => setRefreshing(false), 1000);
              }}
              tintColor={Colors.accent.blue}
            />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: 50,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.subtle,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: Spacing.radius.md,
    backgroundColor: Colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: Colors.text.primary,
  },
  headerTitle: {
    ...Typography.styles.h3,
    color: Colors.text.primary,
  },
  createBtn: {
    width: 40,
    height: 40,
    borderRadius: Spacing.radius.md,
    backgroundColor: Colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createIcon: {
    fontSize: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.subtle,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    position: 'relative',
  },
  tabText: {
    ...Typography.styles.label,
    color: Colors.text.tertiary,
  },
  tabTextActive: {
    color: Colors.text.primary,
    fontWeight: Typography.weight.bold,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    width: '60%',
    backgroundColor: Colors.accent.blue,
    borderRadius: 2,
  },
  storiesContainer: {
    backgroundColor: Colors.background.primary,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.subtle,
  },
  feedContent: {
    paddingVertical: Spacing.sm,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border.subtle,
    marginHorizontal: Spacing.md,
  },
  postCard: {
    backgroundColor: Colors.background.primary,
    padding: Spacing.md,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.gap.sm,
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background.secondary,
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  displayName: {
    ...Typography.styles.label,
    color: Colors.text.primary,
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
  username: {
    ...Typography.styles.caption,
    color: Colors.text.secondary,
  },
  moreBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreIcon: {
    fontSize: 20,
    color: Colors.text.tertiary,
  },
  contentText: {
    ...Typography.styles.body,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    lineHeight: 22,
  },
  mediaContainer: {
    borderRadius: Spacing.radius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  postMedia: {
    width: '100%',
    aspectRatio: 4/5,
    backgroundColor: Colors.background.secondary,
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionIcon: {
    fontSize: 20,
  },
  actionCount: {
    ...Typography.styles.caption,
    color: Colors.text.secondary,
  },
  actionCountActive: {
    color: Colors.accent.pink,
    fontWeight: Typography.weight.bold,
  },
});
