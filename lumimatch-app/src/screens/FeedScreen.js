import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  TextInput,
  Modal,
  Animated,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DEMO_MODE, DEMO_USER, DEMO_POSTS, canViewPost, isSubscribedTo, followCreator } from '../data/demoData';
import StoriesBar from '../components/StoriesBar';
import { logError, logInfo, logSuccess } from '../utils/errorLogger';
import Colors from '../theme/colors';
import Spacing from '../theme/spacing';
import Typography from '../theme/typography';
import Shadows from '../theme/shadows';

const { width, height } = Dimensions.get('window');

export default function FeedScreen({ navigation }) {
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [showTranslation, setShowTranslation] = useState({});
  const [activeUsers, setActiveUsers] = useState([]);
  const [selectedTab, setSelectedTab] = useState('forYou'); // forYou, following, trending
  
  // Animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    loadPosts();
    loadActiveUsers();
    
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [selectedTab]);

  const loadActiveUsers = () => {
    try {
      // Demo active/online users for Stories Bar
      const demoActiveUsers = [
        {
          id: 'user-1',
          username: 'zeynep_ay',
          display_name: 'Zeynep',
          avatar: 'https://i.pravatar.cc/150?img=1',
          avatar_url: 'https://i.pravatar.cc/150?img=1',
          has_active_story: true,
          is_online: true,
          is_live: false,
          is_premium: true,
        },
        {
          id: 'user-2',
          username: 'mehmet_k',
          display_name: 'Mehmet',
          avatar: 'https://i.pravatar.cc/150?img=12',
          avatar_url: 'https://i.pravatar.cc/150?img=12',
          has_active_story: true,
          is_online: true,
          is_live: true, // Live streaming now!
          is_premium: false,
        },
        {
          id: 'user-3',
          username: 'ayse_d',
          display_name: 'Ayşe',
          avatar: 'https://i.pravatar.cc/150?img=5',
          avatar_url: 'https://i.pravatar.cc/150?img=5',
          has_active_story: true,
          is_online: true,
          is_live: false,
          is_premium: true,
        },
        {
          id: 'user-4',
          username: 'can_y',
          display_name: 'Can',
          avatar: 'https://i.pravatar.cc/150?img=15',
          avatar_url: 'https://i.pravatar.cc/150?img=15',
          has_active_story: false,
          is_online: true,
          is_live: false,
          is_premium: false,
        },
        {
          id: 'user-5',
          username: 'elif_s',
          display_name: 'Elif',
          avatar: 'https://i.pravatar.cc/150?img=9',
          avatar_url: 'https://i.pravatar.cc/150?img=9',
          has_active_story: true,
          is_online: true,
          is_live: false,
          is_premium: true,
        },
      ];
      
      setActiveUsers(demoActiveUsers);
      logSuccess('Active users loaded for Stories');
    } catch (error) {
      logError('Failed to load active users', error);
    }
  };

  const handleStoryPress = (user) => {
    try {
      if (user.is_live) {
        // Navigate to live stream
        Alert.alert(
          '🔴 Canlı Yayın',
          `${user.display_name} şu anda canlı yayında! Katılmak ister misiniz?`,
          [
            { text: 'İptal', style: 'cancel' },
            { 
              text: 'Katıl', 
              onPress: () => {
                // TODO: Navigate to LiveStreamScreen
                Alert.alert('Yakında', 'Canlı yayına katılma özelliği yakında!');
              }
            },
          ]
        );
      } else {
        // Navigate to profile or story viewer
        Alert.alert('Hikaye', `${user.display_name} kullanıcısının hikayesi görüntüleniyor...`);
        // TODO: Navigate to StoryViewer or Profile
      }
      logInfo('Story pressed:', user.username);
    } catch (error) {
      logError('Story press failed', error);
    }
  };

  const handleAddStory = () => {
    try {
      Alert.alert(
        'Hikaye Ekle',
        'Yeni bir hikaye paylaşmak ister misiniz?',
        [
          { text: 'İptal', style: 'cancel' },
          { text: 'Fotoğraf Çek', onPress: () => Alert.alert('Yakında', 'Hikaye ekleme özelliği yakında!') },
          { text: 'Galeriden Seç', onPress: () => Alert.alert('Yakında', 'Hikaye ekleme özelliği yakında!') },
        ]
      );
      logInfo('Add story pressed');
    } catch (error) {
      logError('Add story failed', error);
    }
  };

  const loadPosts = async () => {
    try {
      if (DEMO_MODE) {
        // Demo modda fake posts + location/flags ekle
        const enhancedPosts = DEMO_POSTS.map(post => ({
          ...post,
          user: {
            ...post.user,
            location: post.user.id === 'creator-1' ? 'İstanbul, Türkiye' :
                     post.user.id === 'creator-2' ? 'Ankara, Türkiye' :
                     post.user.id === 'creator-3' ? 'İzmir, Türkiye' :
                     post.user.id === 'creator-4' ? 'Antalya, Türkiye' :
                     'Bursa, Türkiye',
            languages: ['tr', 'us', 'de'], // Türkçe, İngilizce, Almanca
          },
        }));
        setPosts(enhancedPosts);
        logSuccess('Feed yüklendi');
        return;
      }
      // TODO: Backend'den postları çek
    } catch (error) {
      logError('Feed yüklenemedi', error);
      Alert.alert('Hata', 'Gönderiler yüklenirken hata oluştu');
    }
  };

  const handleLike = (postId) => {
    try {
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
      logInfo('Beğeni güncellendi');
    } catch (error) {
      logError('Beğeni hatası', error);
    }
  };

  const handleComment = (post) => {
    try {
      setSelectedPost(post);
      setCommentModalVisible(true);
      logInfo('Yorum modalı açıldı');
    } catch (error) {
      logError('Yorum modal hatası', error);
    }
  };

  const sendComment = () => {
    try {
      if (!commentText.trim()) return;
      
      Alert.alert('Yorum Gönderildi', 'Yorumun başarıyla eklendi!');
      setCommentText('');
      setCommentModalVisible(false);
      logSuccess('Yorum gönderildi');
    } catch (error) {
      logError('Yorum gönderme hatası', error);
      Alert.alert('Hata', 'Yorum gönderilemedi');
    }
  };

  const handleReport = (post) => {
    try {
      Alert.alert(
        'Gönderiyi Bildir',
        'Bu gönderiyi neden bildirmek istiyorsunuz?',
        [
          { text: 'Spam', onPress: () => {
            Alert.alert('Bildirildi', 'Gönderi spam olarak bildirildi');
            logInfo('Gönderi spam olarak bildirildi');
          }},
          { text: 'Uygunsuz İçerik', onPress: () => {
            Alert.alert('Bildirildi', 'Gönderi uygunsuz içerik olarak bildirildi');
            logInfo('Gönderi uygunsuz olarak bildirildi');
          }},
          { text: 'İptal', style: 'cancel' },
        ]
      );
    } catch (error) {
      logError('Bildirme hatası', error);
    }
  };

  const handleSubscribe = (post) => {
    try {
      Alert.alert(
        'Abonelik',
        `${post.user.display_name} kullanıcısına abone olmak ister misiniz?`,
        [
          {
            text: 'Abone Ol',
            onPress: () => {
              // Demo modda takip et = abone ol
              followCreator(post.user.id);
              Alert.alert('Başarılı', `${post.user.display_name} kullanıcısına abone oldunuz! 🎉`);
              // Feed'i yenile
              loadPosts();
              logSuccess('Abonelik başarılı:', post.user.id);
            },
          },
          { text: 'İptal', style: 'cancel' },
        ]
      );
    } catch (error) {
      logError('Abonelik hatası', error);
      Alert.alert('Hata', 'Abonelik işlemi başarısız');
    }
  };

  const toggleTranslation = (postId) => {
    try {
      setShowTranslation(prev => ({
        ...prev,
        [postId]: !prev[postId],
      }));
      logInfo('Çeviri gösterildi');
    } catch (error) {
      logError('Çeviri hatası', error);
    }
  };

  const getCountryFlag = (code) => {
    const flags = {
      tr: '🇹🇷',
      us: '🇺🇸',
      de: '🇩🇪',
      fr: '🇫🇷',
      es: '🇪🇸',
      it: '🇮🇹',
      ru: '🇷🇺',
      jp: '🇯🇵',
      kr: '🇰🇷',
      cn: '🇨🇳',
    };
    return flags[code] || '🌍';
  };

  const renderPost = ({ item: post }) => (
    <View style={styles.postContainer}>
      {/* Modal-style Card */}
      <View style={styles.modalCard}>
        {/* Header with Title */}
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Arkadaş Anları</Text>
        </View>

        {/* User Info */}
        <TouchableOpacity 
          style={styles.userInfo}
          onPress={() => {
            try {
              if (post.user.is_creator) {
                navigation.navigate('CreatorProfile', { creator: post.user });
              }
            } catch (error) {
              logError('Profil açma hatası', error);
            }
          }}
        >
          <Image source={{ uri: post.user.avatar }} style={styles.userAvatar} />
          <View style={styles.userDetails}>
            <View style={styles.userNameRow}>
              <Text style={styles.userName}>{post.user.display_name}</Text>
              {post.user.is_verified && <Text style={styles.verifiedBadge}>🔥</Text>}
            </View>
            
            {/* Location & Language Flags */}
            <View style={styles.locationRow}>
              <Text style={styles.locationIcon}>🌐</Text>
              <Text style={styles.locationText}>İngilizce, İspanyolca, İspanyolca</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.menuBtnRound}
            onPress={() => handleReport(post)}
          >
            <Text style={styles.menuIconRound}>⊙</Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Content Text */}
        {post.content && (
          <View style={styles.contentContainer}>
            <Text 
              style={[
                styles.postContent,
                post.is_subscriber_only && !canViewPost(post) && styles.postContentBlurred
              ]}
              numberOfLines={post.is_subscriber_only && !canViewPost(post) ? 2 : undefined}
            >
              {post.is_subscriber_only && !canViewPost(post) 
                ? '🔒 Bu içerik sadece abonelere özeldir...' 
                : post.content}
            </Text>
            
            {/* Çeviriyi Gör Button - only if user can view */}
            {canViewPost(post) && (
              <>
                <TouchableOpacity 
                  style={styles.translationBtn}
                  onPress={() => toggleTranslation(post.id)}
                >
                  <Text style={styles.translationBtnText}>
                    📝 {showTranslation[post.id] ? 'Orijinali Gör' : 'Çeviriyi Gör'} ›
                  </Text>
                </TouchableOpacity>

                {/* Translation (when toggled) */}
                {showTranslation[post.id] && (
                  <View style={styles.translationBox}>
                    <Text style={styles.translationText}>
                      {/* Fake translation for demo */}
                      {post.content.length > 50 
                        ? "Hello babe, ready for the world! 😅⚽🔥" 
                        : "Amazing content! Check it out 💕"}
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>
        )}

        {/* Media - Portrait Oriented (rounded corners) */}
        {post.media && post.media.length > 0 && (
          <View style={styles.mediaContainer}>
            {post.media[0].type === 'image' ? (
              <Image 
                source={{ uri: post.media[0].url }}
                style={styles.postImage}
                resizeMode="cover"
                blurRadius={post.is_subscriber_only && !canViewPost(post) ? 20 : 0}
              />
            ) : (
              <View style={styles.videoPlaceholder}>
                <Text style={styles.playIcon}>▶</Text>
                <Image 
                  source={{ uri: post.media[0].thumbnail || post.media[0].url }}
                  style={styles.postImage}
                  resizeMode="cover"
                  blurRadius={post.is_subscriber_only && !canViewPost(post) ? 20 : 0}
                />
              </View>
            )}
            
            {/* Subscriber Only Overlay */}
            {post.is_subscriber_only && !canViewPost(post) && (
              <View style={styles.subscriberOverlay}>
                <Text style={styles.subscriberOverlayIcon}>🔒</Text>
                <Text style={styles.subscriberOverlayTitle}>Abonelere Özel İçerik</Text>
                <Text style={styles.subscriberOverlayText}>
                  Bu içeriği görmek için {post.user.display_name} kullanıcısına abone olmalısınız
                </Text>
                <TouchableOpacity 
                  style={styles.subscribeButton}
                  onPress={() => handleSubscribe(post)}
                >
                  <LinearGradient
                    colors={['#8338ec', '#6a1fb0']}
                    style={styles.subscribeGradient}
                  >
                    <Text style={styles.subscribeButtonText}>Abone Ol</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Action Bar - Like + Comment + Report */}
        <View style={styles.actionsBar}>
          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={() => handleLike(post.id)}
            disabled={post.is_subscriber_only && !canViewPost(post)}
          >
            <Text style={styles.likeIcon}>{post.isLiked ? '❤️' : '🤍'}</Text>
            <Text style={styles.likeCount}>{post.likes_count || 17}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.commentBtn}
            onPress={() => canViewPost(post) ? handleComment(post) : handleSubscribe(post)}
          >
            <Text style={styles.commentBtnIcon}>💬</Text>
            <Text style={styles.commentBtnText}>
              {canViewPost(post) ? 'Yorum Yap' : 'Abone Ol'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.reportBtn}
            onPress={() => handleReport(post)}
          >
            <Text style={styles.reportIcon}>⚠️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const formatTime = (timestamp) => {
    const now = new Date();
    const postDate = new Date(timestamp);
    const diff = Math.floor((now - postDate) / 1000); // seconds

    if (diff < 60) return 'Az önce';
    if (diff < 3600) return `${Math.floor(diff / 60)} dakika önce`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} saat önce`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} gün önce`;
    return postDate.toLocaleDateString('tr-TR');
  };

  return (
    <View style={styles.container}>
      {/* Modern Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Keşfet</Text>
        <TouchableOpacity onPress={() => {/* TODO: Create Post */}} style={styles.createBtn}>
          <Text style={styles.createIcon}>✏️</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Selector - X/Twitter style */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'forYou' && styles.tabActive]}
          onPress={() => setSelectedTab('forYou')}
        >
          <Text style={[styles.tabText, selectedTab === 'forYou' && styles.tabTextActive]}>
            Senin İçin
          </Text>
          {selectedTab === 'forYou' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === 'following' && styles.tabActive]}
          onPress={() => setSelectedTab('following')}
        >
          <Text style={[styles.tabText, selectedTab === 'following' && styles.tabTextActive]}>
            Takip Edilenler
          </Text>
          {selectedTab === 'following' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === 'trending' && styles.tabActive]}
          onPress={() => setSelectedTab('trending')}
        >
          <Text style={[styles.tabText, selectedTab === 'trending' && styles.tabTextActive]}>
            Trendler
          </Text>
          {selectedTab === 'trending' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
      </View>

      {/* Stories Bar */}
      <View style={styles.storiesBarContainer}>
        <StoriesBar 
          users={activeUsers}
          onStoryPress={handleStoryPress}
          onAddStory={handleAddStory}
        />
      </View>

      {/* Feed */}
      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        {posts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📱</Text>
            <Text style={styles.emptyTitle}>Henüz gönderi yok</Text>
            <Text style={styles.emptyText}>Arkadaşlarını takip et ve içeriklerini keşfet!</Text>
          </View>
        ) : (
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
                  loadPosts();
                  loadActiveUsers();
                  setTimeout(() => setRefreshing(false), 1000);
                }}
                tintColor={Colors.accent.blue}
                colors={[Colors.accent.blue]}
              />
            }
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.postSeparator} />}
          />
        )}
      </Animated.View>

      {/* Comment Modal */}
      <Modal
        visible={commentModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCommentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.commentModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Yorum Yap</Text>
              <TouchableOpacity 
                style={styles.modalCloseBtn}
                onPress={() => setCommentModalVisible(false)}
              >
                <Text style={styles.modalCloseIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedPost && (
              <View style={styles.selectedPostPreview}>
                <Image 
                  source={{ uri: selectedPost.user.avatar }}
                  style={styles.previewAvatar}
                />
                <Text style={styles.previewUserName}>{selectedPost.user.display_name}</Text>
              </View>
            )}

            <TextInput
              style={styles.commentInput}
              placeholder="Yorumunu yaz..."
              placeholderTextColor="#999999"
              value={commentText}
              onChangeText={setCommentText}
              multiline
              maxLength={500}
              autoFocus
            />

            <TouchableOpacity 
              style={[styles.sendCommentBtn, !commentText.trim() && styles.sendCommentBtnDisabled]}
              onPress={sendComment}
              disabled={!commentText.trim()}
            >
              <Text style={styles.sendCommentBtnText}>Gönder</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Black background like in image
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  backButton: {
    fontSize: 28,
    color: '#00d9ff',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
  },
  headerSpacer: {
    width: 28,
  },
  storiesBarContainer: {
    backgroundColor: 'rgba(0,0,0,0.95)',
    paddingVertical: 12,
  },
  feedContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // Post Container - Fixed height issue
  postContainer: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },

  // Modal Card Style
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    width: '100%',
    overflow: 'hidden',
    marginBottom: 16,
  },

  // Card Header
  cardHeader: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000000',
  },
  
  // User Info
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  userAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#f0f0f0',
  },
  userDetails: {
    flex: 1,
    gap: 4,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000000',
  },
  verifiedBadge: {
    fontSize: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationIcon: {
    fontSize: 13,
  },
  locationText: {
    fontSize: 12,
    color: '#666666',
  },
  menuBtnRound: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIconRound: {
    fontSize: 18,
    color: '#000000',
    fontWeight: '700',
  },
  
  // Content with Translation
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  postContent: {
    fontSize: 14,
    lineHeight: 20,
    color: '#000000',
    marginBottom: 8,
  },
  postContentBlurred: {
    color: '#999999',
    fontStyle: 'italic',
  },
  translationBtn: {
    alignSelf: 'flex-start',
  },
  translationBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333333',
  },
  translationBox: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  translationText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#666666',
  },
  
  // Media - Portrait orientation with rounded corners
  mediaContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 0.75, // Portrait ratio
    maxHeight: 440,
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  videoPlaceholder: {
    position: 'relative',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 64,
    color: '#ffffff',
    position: 'absolute',
    zIndex: 10,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  
  // Subscriber Only Overlay
  subscriberOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 16,
    borderRadius: 12,
  },
  subscriberOverlayIcon: {
    fontSize: 56,
  },
  subscriberOverlayTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
  },
  subscriberOverlayText: {
    fontSize: 15,
    color: '#cccccc',
    textAlign: 'center',
    lineHeight: 22,
  },
  subscribeButton: {
    marginTop: 8,
    borderRadius: 24,
    overflow: 'hidden',
    minWidth: 200,
  },
  subscribeGradient: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  subscribeButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  
  // Action Bar - Like + Comment + Report
  actionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  likeIcon: {
    fontSize: 22,
  },
  likeCount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
  commentBtn: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  commentBtnIcon: {
    fontSize: 18,
  },
  commentBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  reportBtn: {
    padding: 8,
  },
  reportIcon: {
    fontSize: 20,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  commentModal: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalCloseIcon: {
    fontSize: 24,
    color: '#000000',
  },
  selectedPostPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
  },
  previewAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  previewUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  commentInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    color: '#000000',
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  sendCommentBtn: {
    backgroundColor: '#00a8ff',
    marginHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  sendCommentBtnDisabled: {
    opacity: 0.5,
  },
  sendCommentBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
});
