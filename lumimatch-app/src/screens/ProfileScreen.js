import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Dimensions,
  Modal,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../App';
import { DEMO_MODE, DEMO_USER, addDemoPost } from '../data/demoData';
import { logError, logInfo, logSuccess } from '../utils/errorLogger';

const { width } = Dimensions.get('window');

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(DEMO_USER);
  const [activeTab, setActiveTab] = useState('posts'); // posts, reels, about
  const [stats, setStats] = useState({
    posts: 18,
    followers: 18,
    personality: 'INTJ',
  });
  const [createPostModal, setCreatePostModal] = useState(false);
  const [postText, setPostText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [myPosts, setMyPosts] = useState([]);
  const [isSubscriberOnly, setIsSubscriberOnly] = useState(false); // Abonelere özel toggle

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      logInfo('ProfileScreen', 'Loading user profile...');
      
      if (DEMO_MODE) {
        setUser(DEMO_USER);
        logInfo('ProfileScreen', 'Demo mode - using DEMO_USER');
        return;
      }
      // Backend integration için
    } catch (error) {
      logError('ProfileScreen', 'Failed to load profile', error);
    }
  };

  const openCreatePostModal = () => {
    try {
      setCreatePostModal(true);
      setIsSubscriberOnly(false); // Reset toggle when opening
      logInfo('ProfileScreen', 'Create post modal opened');
    } catch (error) {
      logError('ProfileScreen', 'Failed to open create post modal', error);
    }
  };

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
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
        logSuccess('ProfileScreen', 'Image selected');
      }
    } catch (error) {
      logError('ProfileScreen', 'Failed to pick image', error);
      Alert.alert('Hata', 'Resim seçilemedi');
    }
  };

  const createPost = async () => {
    try {
      if (!postText.trim() && !selectedImage) {
        Alert.alert('Uyarı', 'Lütfen bir metin veya resim ekleyin');
        return;
      }

      const newPost = {
        user: {
          id: user.id,
          display_name: user.display_name,
          avatar: user.avatar_url,
          is_verified: false,
        },
        content: postText,
        media: selectedImage ? [{ type: 'image', url: selectedImage }] : [],
        hashtags: [],
        is_subscriber_only: isSubscriberOnly, // Abonelere özel flag
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
      setIsSubscriberOnly(false); // Reset toggle
      setCreatePostModal(false);
      logSuccess('ProfileScreen', `Post created - Subscriber only: ${isSubscriberOnly}`);
    } catch (error) {
      logError('ProfileScreen', 'Failed to create post', error);
      Alert.alert('Hata', 'Gönderi paylaşılamadı');
    }
  };

  const handleEditProfile = () => {
    try {
      Alert.alert('Profili Düzenle', 'Profil düzenleme ekranı yakında eklenecek');
      logInfo('ProfileScreen', 'Edit profile pressed');
    } catch (error) {
      logError('ProfileScreen', 'Failed to handle edit profile', error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section with Profile Image */}
        <View style={styles.heroSection}>
          <Image 
            source={{ uri: user.avatar_url }}
            style={styles.heroBg}
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
            style={styles.heroGradient}
          />

          {/* Top Navigation */}
          <View style={styles.topNav}>
            <TouchableOpacity 
              style={styles.topNavBtn}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.topNavIcon}>←</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.editBtn}
              onPress={handleEditProfile}
            >
              <Text style={styles.editIcon}>✏️</Text>
            </TouchableOpacity>
          </View>

          {/* Profile Info */}
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user.display_name || 'Jay'}</Text>
            
            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>🇹🇷</Text>
                <Text style={styles.statLabel}>Türkçe</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.posts}</Text>
                <Text style={styles.statIcon}>👤</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.followers}</Text>
                <Text style={styles.statIcon}>❤️</Text>
              </View>
              <View style={styles.personalityBadge}>
                <Text style={styles.personalityIcon}>🔷</Text>
                <Text style={styles.personalityText}>
                  {stats.personality} Tigli bekleniyor😊
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'posts' && styles.tabActive]}
            onPress={() => setActiveTab('posts')}
          >
            <Text style={[styles.tabText, activeTab === 'posts' && styles.tabTextActive]}>
              Anlar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'reels' && styles.tabActive]}
            onPress={() => setActiveTab('reels')}
          >
            <Text style={[styles.tabText, activeTab === 'reels' && styles.tabTextActive]}>
              Reels
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'about' && styles.tabActive]}
            onPress={() => setActiveTab('about')}
          >
            <Text style={[styles.tabText, activeTab === 'about' && styles.tabTextActive]}>
              Albüm
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'posts' && (
          <View style={styles.tabContent}>
            {/* Create Post Button */}
            <TouchableOpacity 
              style={styles.createPostBtn}
              onPress={openCreatePostModal}
            >
              <LinearGradient
                colors={['#8338ec', '#6a1fb0']}
                style={styles.createPostGradient}
              >
                <Text style={styles.createPostIcon}>➕</Text>
                <Text style={styles.createPostText}>Yeni Gönderi Oluştur</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* My Posts Grid */}
            {myPosts.length > 0 ? (
              <View style={styles.postsGrid}>
                {myPosts.map((post, index) => (
                  <TouchableOpacity 
                    key={index}
                    style={styles.postItem}
                    onPress={() => navigation.navigate('Feed')}
                  >
                    {post.media && post.media.length > 0 ? (
                      <Image 
                        source={{ uri: post.media[0].url }}
                        style={styles.postImage}
                      />
                    ) : (
                      <View style={styles.postTextOnly}>
                        <Text style={styles.postTextContent} numberOfLines={3}>
                          {post.content}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📸</Text>
                <Text style={styles.emptyText}>Henüz gönderi yok</Text>
                <Text style={styles.emptySubtext}>İlk gönderinizi paylaşın!</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'reels' && (
          <View style={styles.tabContent}>
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📹</Text>
              <Text style={styles.emptyText}>Henüz Reels yok</Text>
              <Text style={styles.emptySubtext}>İlk Reels'inizi oluşturun!</Text>
            </View>
          </View>
        )}

        {activeTab === 'about' && (
          <View style={styles.tabContent}>
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📷</Text>
              <Text style={styles.emptyText}>Albüm boş</Text>
              <Text style={styles.emptySubtext}>Fotoğraflarınızı ekleyin!</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Create Post Modal */}
      <Modal
        visible={createPostModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCreatePostModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.createPostModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Yeni Gönderi</Text>
              <TouchableOpacity 
                style={styles.modalCloseBtn}
                onPress={() => {
                  setCreatePostModal(false);
                  setPostText('');
                  setSelectedImage(null);
                  setIsSubscriberOnly(false); // Reset toggle
                }}
              >
                <Text style={styles.modalCloseIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {/* User Info */}
              <View style={styles.modalUserInfo}>
                <Image 
                  source={{ uri: user.avatar_url }}
                  style={styles.modalUserAvatar}
                />
                <Text style={styles.modalUserName}>{user.display_name}</Text>
              </View>

              {/* Text Input */}
              <TextInput
                style={styles.postInput}
                placeholder="Ne düşünüyorsun?"
                placeholderTextColor="#999999"
                value={postText}
                onChangeText={setPostText}
                multiline
                maxLength={500}
                autoFocus
              />

              {/* Selected Image Preview */}
              {selectedImage && (
                <View style={styles.imagePreviewContainer}>
                  <Image 
                    source={{ uri: selectedImage }}
                    style={styles.imagePreview}
                  />
                  <TouchableOpacity 
                    style={styles.removeImageBtn}
                    onPress={() => setSelectedImage(null)}
                  >
                    <Text style={styles.removeImageIcon}>✕</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Add Image Button */}
              {!selectedImage && (
                <TouchableOpacity 
                  style={styles.addImageBtn}
                  onPress={pickImage}
                >
                  <Text style={styles.addImageIcon}>📷</Text>
                  <Text style={styles.addImageText}>Fotoğraf Ekle</Text>
                </TouchableOpacity>
              )}

              {/* Subscriber Only Toggle */}
              <View style={styles.subscriberToggleContainer}>
                <TouchableOpacity 
                  style={styles.subscriberToggle}
                  onPress={() => setIsSubscriberOnly(!isSubscriberOnly)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.toggleSwitch,
                    isSubscriberOnly && styles.toggleSwitchActive
                  ]}>
                    <View style={[
                      styles.toggleKnob,
                      isSubscriberOnly && styles.toggleKnobActive
                    ]} />
                  </View>
                  <View style={styles.subscriberToggleText}>
                    <Text style={styles.subscriberLabel}>
                      🔒 Abonelere Özel
                    </Text>
                    <Text style={styles.subscriberSubtext}>
                      {isSubscriberOnly 
                        ? 'Sadece aboneleriniz görecek' 
                        : 'Herkes görebilir'}
                    </Text>
                  </View>
                </TouchableOpacity>
                
                {/* Visual Confirmation Badge */}
                {isSubscriberOnly && (
                  <View style={styles.subscriberBadge}>
                    <Text style={styles.subscriberBadgeIcon}>🔒</Text>
                    <Text style={styles.subscriberBadgeText}>ABONELERİNİZE ÖZEL</Text>
                  </View>
                )}
              </View>
            </ScrollView>

            {/* Post Button */}
            <TouchableOpacity 
              style={[styles.postBtn, (!postText.trim() && !selectedImage) && styles.postBtnDisabled]}
              onPress={createPost}
              disabled={!postText.trim() && !selectedImage}
            >
              <LinearGradient
                colors={['#8338ec', '#6a1fb0']}
                style={styles.postBtnGradient}
              >
                <Text style={styles.postBtnText}>Paylaş</Text>
              </LinearGradient>
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
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },

  // Hero Section - Full Profile Image
  heroSection: {
    position: 'relative',
    height: 480,
  },
  heroBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 480,
    width: '100%',
  },
  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 480,
  },

  // Top Navigation
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    zIndex: 10,
  },
  topNavBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topNavIcon: {
    fontSize: 20,
    color: '#ffffff',
  },
  editBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(128,128,128,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIcon: {
    fontSize: 18,
  },

  // Profile Info
  profileInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    zIndex: 10,
  },
  userName: {
    fontSize: 36,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 12,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statIcon: {
    fontSize: 16,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  personalityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  personalityIcon: {
    fontSize: 14,
  },
  personalityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },

  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 20,
    paddingVertical: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 3,
    borderBottomColor: '#8338ec',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666666',
  },
  tabTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },

  // Tab Content
  tabContent: {
    padding: 20,
  },

  // Create Post Button
  createPostBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  createPostGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  createPostIcon: {
    fontSize: 20,
    color: '#ffffff',
  },
  createPostText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },

  // Posts Grid
  postsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  postItem: {
    width: (width - 56) / 3,
    aspectRatio: 4 / 5,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  postTextOnly: {
    width: '100%',
    height: '100%',
    padding: 8,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
  },
  postTextContent: {
    fontSize: 11,
    color: '#ffffff',
    textAlign: 'center',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666666',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  createPostModal: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalCloseIcon: {
    fontSize: 24,
    color: '#ffffff',
  },
  modalContent: {
    maxHeight: 500,
  },
  modalUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 20,
  },
  modalUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  modalUserName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  postInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    color: '#ffffff',
    fontSize: 15,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  imagePreviewContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: 300,
    borderRadius: 16,
  },
  removeImageBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageIcon: {
    fontSize: 18,
    color: '#ffffff',
  },
  addImageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 16,
    paddingVertical: 16,
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#3a3a3a',
    borderStyle: 'dashed',
  },
  addImageIcon: {
    fontSize: 24,
  },
  addImageText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  postBtn: {
    margin: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  postBtnDisabled: {
    opacity: 0.5,
  },
  postBtnGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  postBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },

  // Subscriber Only Toggle
  subscriberToggleContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  subscriberToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 16,
  },
  toggleSwitch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3a3a3a',
    justifyContent: 'center',
    padding: 2,
  },
  toggleSwitchActive: {
    backgroundColor: '#8338ec',
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignSelf: 'flex-start',
  },
  toggleKnobActive: {
    alignSelf: 'flex-end',
  },
  subscriberToggleText: {
    flex: 1,
  },
  subscriberLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  subscriberSubtext: {
    fontSize: 12,
    color: '#999999',
  },
  subscriberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
    backgroundColor: 'rgba(131,56,236,0.2)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8338ec',
  },
  subscriberBadgeIcon: {
    fontSize: 16,
  },
  subscriberBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8338ec',
    letterSpacing: 0.5,
  },
});
