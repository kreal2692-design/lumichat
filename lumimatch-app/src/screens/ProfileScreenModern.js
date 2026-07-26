import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Modal,
  TextInput,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { DEMO_MODE, DEMO_USER, addDemoPost } from '../data/demoData';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../theme';
import ModernButton from '../components/ModernButton';

export default function ProfileScreenModern({ navigation }) {
  const [user, setUser] = useState(DEMO_USER);
  const [activeTab, setActiveTab] = useState('posts'); // posts, reels, saved
  const [stats, setStats] = useState({
    posts: 18,
    followers: 2847,
    following: 432,
    likes: 12500,
  });
  const [createPostModal, setCreatePostModal] = useState(false);
  const [postText, setPostText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [myPosts, setMyPosts] = useState([]);
  const [isSubscriberOnly, setIsSubscriberOnly] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    if (DEMO_MODE) {
      setUser(DEMO_USER);
    }
  };

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('İzin Gerekli', 'Galeriye erişim izni gerekiyor');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Hata', 'Resim seçilemedi');
    }
  };

  const createPost = async () => {
    if (!postText.trim() && !selectedImage) {
      Alert.alert('Uyarı', 'Lütfen bir metin veya resim ekleyin');
      return;
    }

    const newPost = {
      user: {
        id: user.id,
        display_name: user.display_name,
        avatar: user.avatar_url,
        is_verified: true,
      },
      content: postText,
      media: selectedImage ? [{ type: 'image', url: selectedImage }] : [],
      hashtags: [],
      is_subscriber_only: isSubscriberOnly,
    };

    if (DEMO_MODE) {
      addDemoPost(newPost);
      setMyPosts([newPost, ...myPosts]);
    }

    const message = isSubscriberOnly 
      ? 'Gönderiniz sadece aboneleriniz tarafından görülebilir! 🔒' 
      : 'Gönderiniz paylaşıldı! ✨';
    
    Alert.alert('Başarılı', message);
    setPostText('');
    setSelectedImage(null);
    setIsSubscriberOnly(false);
    setCreatePostModal(false);
  };

  const renderStatCard = (value, label, icon) => (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{formatNumber(value)}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Cover */}
        <View style={styles.coverSection}>
          <LinearGradient
            colors={[COLORS.primary.purple, COLORS.primary.pink, COLORS.primary.blue]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.coverGradient}
          />
          
          {/* Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity 
              style={styles.topBarBtn}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.topBarIcon}>←</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.topBarBtn}>
              <Text style={styles.topBarIcon}>⚙️</Text>
            </TouchableOpacity>
          </View>

          {/* Profile Avatar */}
          <View style={styles.avatarContainer}>
            <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
            <LinearGradient
              colors={[COLORS.primary.blue, COLORS.primary.purple]}
              style={styles.avatarBorder}
            />
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedIcon}>✓</Text>
            </View>
          </View>
        </View>

        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <Text style={styles.displayName}>{user.display_name || 'Jay'}</Text>
          <Text style={styles.username}>@{user.display_name?.toLowerCase().replace(' ', '_')}</Text>
          
          {/* Bio */}
          <Text style={styles.bio}>
            💡 Creator & Developer {'\n'}
            🎨 Design Enthusiast {'\n'}
            📍 Istanbul, Turkey
          </Text>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            {renderStatCard(stats.posts, 'Gönderiler', '📸')}
            {renderStatCard(stats.followers, 'Takipçi', '👥')}
            {renderStatCard(stats.following, 'Takip', '➕')}
            {renderStatCard(stats.likes, 'Beğeni', '❤️')}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            <ModernButton
              title="Profili Düzenle"
              variant="outline"
              size="medium"
              onPress={() => Alert.alert('Profili Düzenle', 'Yakında...')}
              style={{ flex: 1 }}
            />
            <ModernButton
              title="Paylaş"
              variant="primary"
              size="medium"
              icon="📤"
              onPress={() => Alert.alert('Profil Paylaş', 'Yakında...')}
              style={{ flex: 1 }}
            />
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'posts' && styles.tabActive]}
            onPress={() => setActiveTab('posts')}
          >
            <Text style={styles.tabIcon}>📋</Text>
            <Text style={[styles.tabText, activeTab === 'posts' && styles.tabTextActive]}>
              Gönderiler
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'reels' && styles.tabActive]}
            onPress={() => setActiveTab('reels')}
          >
            <Text style={styles.tabIcon}>🎬</Text>
            <Text style={[styles.tabText, activeTab === 'reels' && styles.tabTextActive]}>
              Reels
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'saved' && styles.tabActive]}
            onPress={() => setActiveTab('saved')}
          >
            <Text style={styles.tabIcon}>💾</Text>
            <Text style={[styles.tabText, activeTab === 'saved' && styles.tabTextActive]}>
              Kaydedilenler
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'posts' && (
            <>
              {/* Create Post Button */}
              <TouchableOpacity 
                style={styles.createPostCard}
                onPress={() => setCreatePostModal(true)}
              >
                <LinearGradient
                  colors={[COLORS.primary.purple, COLORS.primary.pink]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.createPostGradient}
                >
                  <Text style={styles.createPostIcon}>➕</Text>
                  <Text style={styles.createPostText}>Yeni Gönderi Oluştur</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Posts Grid */}
              {myPosts.length > 0 ? (
                <View style={styles.postsGrid}>
                  {myPosts.map((post, index) => (
                    <TouchableOpacity 
                      key={index}
                      style={styles.postCard}
                      activeOpacity={0.8}
                    >
                      {post.media && post.media.length > 0 ? (
                        <Image source={{ uri: post.media[0].url }} style={styles.postImage} />
                      ) : (
                        <View style={styles.postTextCard}>
                          <Text style={styles.postTextContent} numberOfLines={4}>
                            {post.content}
                          </Text>
                        </View>
                      )}
                      {post.is_subscriber_only && (
                        <View style={styles.subscriberBadgeSmall}>
                          <Text style={styles.subscriberBadgeIcon}>🔒</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>📸</Text>
                  <Text style={styles.emptyTitle}>Henüz gönderi yok</Text>
                  <Text style={styles.emptySubtitle}>İlk gönderinizi paylaşarak başlayın</Text>
                </View>
              )}
            </>
          )}

          {activeTab === 'reels' && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🎬</Text>
              <Text style={styles.emptyTitle}>Henüz Reels yok</Text>
              <Text style={styles.emptySubtitle}>İlk Reels'inizi oluşturun</Text>
            </View>
          )}

          {activeTab === 'saved' && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>💾</Text>
              <Text style={styles.emptyTitle}>Kaydedilen içerik yok</Text>
              <Text style={styles.emptySubtitle}>Beğendiğiniz içerikleri kaydedin</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Create Post Modal */}
      <Modal
        visible={createPostModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCreatePostModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                onPress={() => {
                  setCreatePostModal(false);
                  setPostText('');
                  setSelectedImage(null);
                  setIsSubscriberOnly(false);
                }}
              >
                <Text style={styles.modalCloseText}>İptal</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Yeni Gönderi</Text>
              <TouchableOpacity 
                onPress={createPost}
                disabled={!postText.trim() && !selectedImage}
              >
                <Text style={[
                  styles.modalPostText,
                  (!postText.trim() && !selectedImage) && styles.modalPostTextDisabled
                ]}>
                  Paylaş
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {/* User Info */}
              <View style={styles.modalUserRow}>
                <Image source={{ uri: user.avatar_url }} style={styles.modalAvatar} />
                <View>
                  <Text style={styles.modalUserName}>{user.display_name}</Text>
                  <Text style={styles.modalUsername}>@{user.display_name?.toLowerCase()}</Text>
                </View>
              </View>

              {/* Text Input */}
              <TextInput
                style={styles.postInput}
                placeholder="Ne düşünüyorsun?"
                placeholderTextColor={COLORS.text.tertiary}
                value={postText}
                onChangeText={setPostText}
                multiline
                maxLength={500}
                autoFocus
              />

              {/* Image Preview */}
              {selectedImage && (
                <View style={styles.imagePreview}>
                  <Image source={{ uri: selectedImage }} style={styles.previewImage} />
                  <TouchableOpacity 
                    style={styles.removeImageBtn}
                    onPress={() => setSelectedImage(null)}
                  >
                    <Text style={styles.removeImageIcon}>✕</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Subscriber Toggle */}
              <View style={styles.subscriberToggle}>
                <View style={styles.subscriberInfo}>
                  <Text style={styles.subscriberTitle}>🔒 Abonelere Özel</Text>
                  <Text style={styles.subscriberSubtitle}>
                    {isSubscriberOnly ? 'Sadece aboneler görecek' : 'Herkes görebilir'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.toggle, isSubscriberOnly && styles.toggleActive]}
                  onPress={() => setIsSubscriberOnly(!isSubscriberOnly)}
                >
                  <View style={[styles.toggleKnob, isSubscriberOnly && styles.toggleKnobActive]} />
                </TouchableOpacity>
              </View>

              {/* Actions */}
              <View style={styles.postActions}>
                <TouchableOpacity style={styles.postActionBtn} onPress={pickImage}>
                  <Text style={styles.postActionIcon}>📷</Text>
                  <Text style={styles.postActionText}>Fotoğraf</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.postActionBtn}>
                  <Text style={styles.postActionIcon}>🎥</Text>
                  <Text style={styles.postActionText}>Video</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.postActionBtn}>
                  <Text style={styles.postActionIcon}>😊</Text>
                  <Text style={styles.postActionText}>Emoji</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
  },

  // Cover Section
  coverSection: {
    height: 280,
    position: 'relative',
  },
  coverGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: 50,
  },
  topBarBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  topBarIcon: {
    fontSize: 18,
    color: COLORS.text.inverse,
  },

  // Avatar
  avatarContainer: {
    position: 'absolute',
    bottom: -60,
    left: SPACING.lg,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: COLORS.background.primary,
  },
  avatarBorder: {
    position: 'absolute',
    width: 132,
    height: 132,
    borderRadius: 66,
    left: -6,
    top: -6,
    zIndex: -1,
  },
  verifiedBadge: {
    position: 'absolute',
    right: 0,
    bottom: 5,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary.blue,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.background.primary,
  },
  verifiedIcon: {
    fontSize: 14,
    color: COLORS.text.inverse,
    fontWeight: '800',
  },

  // Profile Info
  profileInfo: {
    padding: SPACING.lg,
    paddingTop: 70,
  },
  displayName: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  username: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    marginBottom: SPACING.md,
  },
  bio: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.primary,
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
    borderRadius: 16,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  statIcon: {
    fontSize: 20,
    marginBottom: SPACING.xs,
  },
  statValue: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.text.tertiary,
  },

  // Actions
  actionsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },

  // Tabs
  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.background.secondary,
    marginHorizontal: SPACING.lg,
    borderRadius: 12,
    padding: 4,
    marginBottom: SPACING.lg,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: SPACING.sm,
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: COLORS.primary.purple,
  },
  tabIcon: {
    fontSize: 16,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  tabTextActive: {
    color: COLORS.text.inverse,
    fontWeight: '700',
  },

  // Tab Content
  tabContent: {
    paddingHorizontal: SPACING.lg,
  },

  // Create Post Card
  createPostCard: {
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
    ...SHADOWS.medium,
  },
  createPostGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.lg,
  },
  createPostIcon: {
    fontSize: 22,
    color: COLORS.text.inverse,
  },
  createPostText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.inverse,
  },

  // Posts Grid
  postsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  postCard: {
    width: '31.5%',
    aspectRatio: 0.8,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.background.secondary,
    position: 'relative',
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  postTextCard: {
    width: '100%',
    height: '100%',
    padding: SPACING.sm,
    justifyContent: 'center',
    backgroundColor: COLORS.background.tertiary,
  },
  postTextContent: {
    fontSize: 11,
    color: COLORS.text.primary,
    textAlign: 'center',
    lineHeight: 16,
  },
  subscriberBadgeSmall: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subscriberBadgeIcon: {
    fontSize: 12,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl * 2,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.lg,
    opacity: 0.5,
  },
  emptyTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.tertiary,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: 100,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  modalCloseText: {
    fontSize: 16,
    color: COLORS.text.secondary,
    fontWeight: '600',
  },
  modalTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
  },
  modalPostText: {
    fontSize: 16,
    color: COLORS.primary.blue,
    fontWeight: '700',
  },
  modalPostTextDisabled: {
    opacity: 0.4,
  },
  modalContent: {
    flex: 1,
  },
  modalUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.lg,
  },
  modalAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  modalUserName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  modalUsername: {
    fontSize: 13,
    color: COLORS.text.secondary,
  },
  postInput: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: 16,
    padding: SPACING.lg,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    color: COLORS.text.primary,
    fontSize: 16,
    minHeight: 150,
    textAlignVertical: 'top',
  },
  imagePreview: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 300,
    borderRadius: 16,
  },
  removeImageBtn: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageIcon: {
    fontSize: 18,
    color: COLORS.text.inverse,
  },
  subscriberToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background.secondary,
    padding: SPACING.lg,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderRadius: 16,
  },
  subscriberInfo: {
    flex: 1,
  },
  subscriberTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  subscriberSubtitle: {
    fontSize: 13,
    color: COLORS.text.secondary,
  },
  toggle: {
    width: 52,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.background.tertiary,
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: COLORS.primary.purple,
  },
  toggleKnob: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.text.inverse,
  },
  toggleKnobActive: {
    transform: [{ translateX: 22 }],
  },
  postActions: {
    flexDirection: 'row',
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  postActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.background.secondary,
    paddingVertical: SPACING.md,
    borderRadius: 12,
  },
  postActionIcon: {
    fontSize: 18,
  },
  postActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
});
