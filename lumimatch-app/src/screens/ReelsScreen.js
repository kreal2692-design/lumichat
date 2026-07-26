import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
  TextInput,
  ScrollView,
  Platform,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DEMO_CREATORS, DEMO_USER, followCreator, isFollowing } from '../data/demoData';
import { logError, logInfo, logSuccess } from '../utils/errorLogger';

const { width, height } = Dimensions.get('window');
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0;
const SAFE_AREA_TOP = STATUSBAR_HEIGHT + 10;
const SAFE_AREA_BOTTOM = Platform.OS === 'ios' ? 34 : 20;

// Demo Reels Data
const DEMO_REELS = [
  {
    id: 'reel-1',
    creator: DEMO_CREATORS[0],
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail: DEMO_CREATORS[0].avatar,
    description: 'İngilizce, Urduca\n🇬🇧 🇵🇰 🇸🇬 Singapore',
    likes: 5,
    comments: 1,
    is_liked: false,
  },
  {
    id: 'reel-2',
    creator: DEMO_CREATORS[1],
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnail: DEMO_CREATORS[1].avatar,
    description: 'Türkçe, İngilizce\n🇹🇷 🇺🇸',
    likes: 8920,
    comments: 445,
    is_liked: true,
  },
  {
    id: 'reel-3',
    creator: DEMO_CREATORS[2],
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: DEMO_CREATORS[2].avatar,
    description: 'Almanca, Fransızca\n🇩🇪 🇫🇷',
    likes: 15600,
    comments: 1203,
    is_liked: false,
  },
];

export default function ReelsScreen({ navigation }) {
  const [reels, setReels] = useState(DEMO_REELS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  
  // Modal states
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentText, setCommentText] = useState('');

  const handleLike = (reelId) => {
    try {
      setReels(reels.map(reel => {
        if (reel.id === reelId) {
          return {
            ...reel,
            is_liked: !reel.is_liked,
            likes: reel.is_liked ? reel.likes - 1 : reel.likes + 1,
          };
        }
        return reel;
      }));
      logInfo('ReelsScreen', 'Like toggled');
    } catch (error) {
      logError('ReelsScreen', 'Failed to toggle like', error);
    }
  };

  const handleFollow = (creator) => {
    try {
      if (isFollowing(creator.id)) {
        Alert.alert('Takiptesin', `Zaten ${creator.display_name} kullanıcısını takip ediyorsun`);
      } else {
        followCreator(creator.id);
        Alert.alert('Başarılı', `${creator.display_name} kullanıcısını takip etmeye başladın! 🎉`);
        logSuccess('ReelsScreen', 'Followed creator');
      }
    } catch (error) {
      logError('ReelsScreen', 'Failed to follow', error);
      Alert.alert('Hata', 'Takip işlemi başarısız');
    }
  };

  const handleComment = () => {
    try {
      setShowCommentModal(true);
      logInfo('ReelsScreen', 'Comment modal opened');
    } catch (error) {
      logError('ReelsScreen', 'Failed to open comment modal', error);
    }
  };

  const sendComment = () => {
    try {
      if (!commentText.trim()) return;
      Alert.alert('Yorum Gönderildi', 'Yorumun başarıyla eklendi!');
      setCommentText('');
      setShowCommentModal(false);
      logSuccess('ReelsScreen', 'Comment sent');
    } catch (error) {
      logError('ReelsScreen', 'Failed to send comment', error);
    }
  };

  const handleMessage = (creator) => {
    try {
      navigation.navigate('Chat', { creator });
      logInfo('ReelsScreen', 'Navigated to chat');
    } catch (error) {
      logError('ReelsScreen', 'Failed to navigate to chat', error);
    }
  };

  const renderReel = ({ item: reel }) => (
    <View style={styles.reelContainer}>
      {/* Video Background - Full Screen with overflow:hidden */}
      <View style={styles.videoWrapper}>
        <Image 
          source={{ uri: reel.thumbnail }}
          style={styles.videoBackground}
          blurRadius={10}
        />
        <Image 
          source={{ uri: reel.thumbnail }}
          style={styles.videoMain}
          resizeMode="cover"
        />
      </View>

      {/* Top Header - Dynamic Safe Area */}
      <View style={[styles.topHeader, { top: SAFE_AREA_TOP }]}>
        <Text style={styles.headerTitle}>Reels</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.headerIcon}>🔔</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.headerIcon}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Right Side Actions - Micro-interactions */}
      <View style={[styles.rightActions, { bottom: 160 + SAFE_AREA_BOTTOM }]}>
        {/* Follow Button */}
        {!isFollowing(reel.creator.id) && (
          <TouchableOpacity 
            style={styles.followActionBtn}
            onPress={() => handleFollow(reel.creator)}
            activeOpacity={0.8}
          >
            <View style={styles.followIconCircle}>
              <Text style={styles.followIcon}>➕</Text>
            </View>
            <Text style={styles.followText}>Takip Et</Text>
          </TouchableOpacity>
        )}

        {/* Like Button - Animated */}
        <TouchableOpacity 
          style={styles.actionBtn}
          onPress={() => handleLike(reel.id)}
          activeOpacity={0.8}
        >
          <View style={[styles.actionIconContainer, reel.is_liked && styles.actionIconLiked]}>
            <Text style={styles.actionIcon}>{reel.is_liked ? '❤️' : '🤍'}</Text>
          </View>
          <Text style={styles.actionCount}>{reel.likes}</Text>
        </TouchableOpacity>

        {/* Comment Button */}
        <TouchableOpacity 
          style={styles.actionBtn}
          onPress={handleComment}
          activeOpacity={0.8}
        >
          <View style={styles.actionIconContainer}>
            <Text style={styles.actionIcon}>💬</Text>
          </View>
          <Text style={styles.actionCount}>{reel.comments}</Text>
        </TouchableOpacity>

        {/* Message Button - Gradient Shadow */}
        <TouchableOpacity 
          style={styles.messageBtn}
          onPress={() => handleMessage(reel.creator)}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#8b5cf6', '#6d28d9']}
            style={styles.messageBtnGradient}
          >
            <Text style={styles.messageBtnIcon}>💬</Text>
          </LinearGradient>
          <Text style={styles.messageBtnText}>Mesaj</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Info - With Shadow for Readability */}
      <View style={[styles.bottomInfo, { bottom: 80 + SAFE_AREA_BOTTOM }]}>
        <View style={styles.bottomShadow} />
        <View style={styles.creatorInfo}>
          <TouchableOpacity 
            style={styles.creatorAvatarContainer}
            onPress={() => navigation.navigate('CreatorProfile', { creator: reel.creator })}
            activeOpacity={0.8}
          >
            <Image 
              source={{ uri: reel.creator.avatar }}
              style={styles.creatorAvatar}
            />
          </TouchableOpacity>
          <View style={styles.creatorDetails}>
            <View style={styles.creatorNameRow}>
              <Text style={styles.creatorName}>{reel.creator.display_name}</Text>
              {reel.creator.is_verified && <Text style={styles.verifiedBadge}>❤️</Text>}
            </View>
            <Text style={styles.creatorLocation}>{reel.description}</Text>
          </View>
          <TouchableOpacity 
            style={styles.moreBtn}
            onPress={() => navigation.navigate('CreatorProfile', { creator: reel.creator })}
            activeOpacity={0.8}
          >
            <Text style={styles.moreIcon}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* CapCut Watermark */}
      <View style={[styles.watermark, { bottom: 24 + SAFE_AREA_BOTTOM }]}>
        <Text style={styles.watermarkText}>CapCut</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={reels}
        renderItem={renderReel}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.y / height);
          setCurrentIndex(index);
        }}
        snapToInterval={height}
        decelerationRate="fast"
      />

      {/* Comment Modal */}
      <Modal
        visible={showCommentModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCommentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.commentModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Yorumlar</Text>
              <TouchableOpacity 
                style={styles.modalCloseBtn}
                onPress={() => setShowCommentModal(false)}
              >
                <Text style={styles.modalCloseIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.commentsContainer}>
              <Text style={styles.noCommentsText}>Henüz yorum yok. İlk yorumu sen yap!</Text>
            </ScrollView>

            <View style={styles.commentInputContainer}>
              <TextInput
                style={styles.commentInput}
                placeholder="Yorum yaz..."
                placeholderTextColor="#999999"
                value={commentText}
                onChangeText={setCommentText}
                maxLength={200}
              />
              <TouchableOpacity 
                style={[styles.sendBtn, !commentText.trim() && styles.sendBtnDisabled]}
                onPress={sendComment}
                disabled={!commentText.trim()}
              >
                <Text style={styles.sendBtnText}>Gönder</Text>
              </TouchableOpacity>
            </View>
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
  reelContainer: {
    width,
    height,
    position: 'relative',
    overflow: 'hidden', // CRITICAL: Vertical overflow fix
  },
  videoWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    width,
    height,
    overflow: 'hidden', // Prevent video spillover
  },
  videoBackground: {
    position: 'absolute',
    width,
    height,
  },
  videoMain: {
    width,
    height,
  },

  // Top Header - Dynamic Safe Area
  topHeader: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    // Micro-interaction shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  headerIcon: {
    fontSize: 18,
  },

  // Right Actions - Vertical Stack with Micro-interactions
  rightActions: {
    position: 'absolute',
    right: 12,
    gap: 24,
    alignItems: 'center',
    zIndex: 10,
  },
  followActionBtn: {
    alignItems: 'center',
    gap: 6,
  },
  followIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,0,110,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    // Micro-interaction glow
    shadowColor: '#ff006e',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },
  followIcon: {
    fontSize: 24,
    color: '#ffffff',
  },
  followText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  actionBtn: {
    alignItems: 'center',
    gap: 6,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    // Micro-interaction
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  actionIconLiked: {
    backgroundColor: 'rgba(255,0,110,0.2)',
    // Like animation glow
    shadowColor: '#ff006e',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  actionIcon: {
    fontSize: 28,
  },
  actionCount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  messageBtn: {
    alignItems: 'center',
    gap: 6,
  },
  messageBtnGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    // Gradient glow
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
  messageBtnIcon: {
    fontSize: 26,
  },
  messageBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  // Bottom Info - With Upward Gradient Shadow
  bottomInfo: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    zIndex: 10,
  },
  bottomShadow: {
    position: 'absolute',
    bottom: -20,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: 'transparent',
    // Upward gradient effect (pseudo with shadow)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -20 },
    shadowOpacity: 0.8,
    shadowRadius: 40,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    backdropFilter: 'blur(10px)', // Modern blur effect (web)
  },
  creatorAvatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  creatorAvatar: {
    width: '100%',
    height: '100%',
  },
  creatorDetails: {
    flex: 1,
  },
  creatorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  creatorName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  verifiedBadge: {
    fontSize: 14,
  },
  creatorLocation: {
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.9,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  moreBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreIcon: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: '700',
  },

  // Watermark
  watermark: {
    position: 'absolute',
    left: 16,
    zIndex: 10,
  },
  watermarkText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  commentModal: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
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
  commentsContainer: {
    maxHeight: 300,
    padding: 20,
  },
  noCommentsText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    paddingVertical: 40,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#ffffff',
    fontSize: 14,
  },
  sendBtn: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  sendBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});
