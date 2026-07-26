import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Animated,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, CameraType } from 'expo-camera';
import { supabase, useUser } from '../../App';
import streamingService from '../services/streamingService';
import LiveStreamManager from '../services/LiveStreamManager';
import GiftAnimationQueue from '../components/GiftAnimationQueue';
import { logError, logInfo, logSuccess } from '../utils/errorLogger';

export default function StreamBroadcastScreen({ navigation }) {
  const { user } = useUser(); // Real Supabase user
  const [isLive, setIsLive] = useState(false);
  const [streamTitle, setStreamTitle] = useState('');
  const [currentStream, setCurrentStream] = useState(null);
  const [viewerCount, setViewerCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [gifts, setGifts] = useState([]);
  const [earnings, setEarnings] = useState(0);
  
  // Camera states (managed by LiveStreamManager now)
  const [isCameraReady, setIsCameraReady] = useState(false);
  const cameraRef = useRef(null);

  useEffect(() => {
    // Cleanup on unmount - CRITICAL for memory leak prevention
    return () => {
      LiveStreamManager.cleanup();
    };
  }, []);

  useEffect(() => {
    if (isLive && currentStream) {
      // Subscribe to comments
      streamingService.subscribeToComments(currentStream.id, (comment) => {
        setComments(prev => [...prev, comment]);
      });

      // Subscribe to gifts - Transform to GiftAnimationQueue format
      streamingService.subscribeToGifts(currentStream.id, (gift) => {
        // Add to gifts array for animation
        setGifts(prev => [...prev, {
          id: gift.id,
          name: gift.gift_name,
          emoji: gift.gift_emoji || '🎁',
          price: gift.gift_value,
          senderName: gift.sender_username || 'Anonymous',
          animation: gift.gift_type || 'heart', // Lottie animation name
        }]);
        
        // Update earnings (70% host commission)
        setEarnings(prev => prev + Math.floor(gift.gift_value * 0.7));
      });

      // Subscribe to viewer count
      streamingService.subscribeToViewerCount(currentStream.id, (count) => {
        setViewerCount(count);
      });

      return () => {
        streamingService.unsubscribeAll();
      };
    }
  }, [isLive, currentStream]);

  /**
   * ✅ CRASH-PROOF Stream Start with LiveStreamManager
   * No more crashes on permission denial!
   */
  const handleStartStream = async () => {
    if (!streamTitle.trim()) {
      Alert.alert('Uyarı', 'Lütfen yayın başlığı girin');
      return;
    }

    if (!user) {
      Alert.alert('Hata', 'Kullanıcı oturumu bulunamadı');
      return;
    }

    try {
      logInfo('StreamBroadcast', 'Initializing stream with LiveStreamManager...');
      
      // ✅ Use LiveStreamManager singleton - handles permissions, lifecycle, crashes
      const result = await LiveStreamManager.initialize(
        user.id,
        streamTitle,
        '',
        'general'
      );

      if (result.success) {
        setCurrentStream(result.stream);
        setIsLive(true);
        setViewerCount(0);
        setEarnings(0);
        setGifts([]); // Reset gifts for new stream
        
        Alert.alert('Başarılı', 'Yayın başladı! 🎉');
        logSuccess('StreamBroadcast', 'Stream started', result.stream.id);
      } else {
        // Graceful error handling - NO CRASH
        Alert.alert(
          'Yayın Başlatılamadı',
          result.error || 'Bir hata oluştu. Lütfen tekrar deneyin.',
          [{ text: 'Tamam' }]
        );
        logError('StreamBroadcast', 'Stream initialization failed', result.error);
      }
    } catch (error) {
      // Fallback error handler
      logError('StreamBroadcast', 'Start stream crashed', error);
      Alert.alert('Hata', 'Beklenmeyen bir hata oluştu. Lütfen uygulamayı yeniden başlatın.');
    }
  };

  /**
   * ✅ CRASH-PROOF Stream End with LiveStreamManager
   */
  const handleEndStream = () => {
    Alert.alert(
      'Yayını Bitir',
      `Toplam kazanç: ${earnings}💎 elmas\nYayını bitirmek istediğine emin misin?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Bitir',
          style: 'destructive',
          onPress: async () => {
            try {
              // ✅ Use LiveStreamManager for clean shutdown
              const result = await LiveStreamManager.endStream(user.id);
              
              if (result.success) {
                logSuccess('StreamBroadcast', 'Stream ended gracefully', result.result);
              } else {
                logError('StreamBroadcast', 'Stream end failed', result.error);
              }
              
              setIsLive(false);
              setCurrentStream(null);
              navigation.goBack();
            } catch (error) {
              logError('StreamBroadcast', 'End stream exception', error);
              // Still navigate back to prevent stuck UI
              navigation.goBack();
            }
          },
        },
      ]
    );
  };

  const renderGiftAnimation = ({ item }) => (
    <Animated.View style={styles.giftAnimation}>
      <Text style={styles.giftEmoji}>{item.emoji}</Text>
      <Text style={styles.giftSender}>{item.sender}</Text>
    </Animated.View>
  );

  /**
   * ✅ Check permissions using LiveStreamManager
   */
  const permissions = LiveStreamManager.getPermissions();
  const hasPermission = permissions.camera === 'granted' && permissions.microphone === 'granted';

  if (!isLive) {
    // Setup Screen
    return (
      <LinearGradient
        colors={['#0b0f17', '#1a1f2e', '#0b0f17']}
        style={styles.container}
      >
        <View style={styles.setupContainer}>
          <TouchableOpacity 
            style={styles.closeBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>

          <Text style={styles.setupTitle}>Canlı Yayın Başlat</Text>

          <View style={styles.previewContainer}>
            {hasPermission ? (
              <Camera
                ref={cameraRef}
                style={styles.preview}
                facing="front"
                onCameraReady={() => {
                  setIsCameraReady(true);
                  logSuccess('StreamBroadcast', 'Camera preview ready');
                }}
                onMountError={(error) => {
                  logError('StreamBroadcast', 'Camera mount error', error);
                }}
              />
            ) : (
              <LinearGradient
                colors={['#ff006e', '#8338ec']}
                style={styles.preview}
              >
                <Text style={styles.previewText}>📹</Text>
                <Text style={styles.previewSubtext}>
                  Kamera iznini "Başlat" butonuna basarak verebilirsiniz
                </Text>
              </LinearGradient>
            )}
          </View>

          <View style={styles.setupForm}>
            <Text style={styles.inputLabel}>Yayın Başlığı</Text>
            <TextInput
              style={styles.input}
              value={streamTitle}
              onChangeText={setStreamTitle}
              placeholder="Örn: Gece Sohbeti 🌙"
              placeholderTextColor="#5a6a7e"
              maxLength={50}
            />

            <View style={styles.infoBox}>
              <Text style={styles.infoIcon}>ℹ️</Text>
              <Text style={styles.infoText}>
                Yayın başlatmak için 10 jeton gerekir. Aldığın hediyelerin %70'i sana gelir!
              </Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.startBtn}
            onPress={handleStartStream}
          >
            <LinearGradient
              colors={['#ff006e', '#d90429']}
              style={styles.startGradient}
            >
              <Text style={styles.startBtnText}>🎬 Yayını Başlat</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  // Live Broadcasting Screen
  return (
    <View style={styles.container}>
      {/* Camera View - Real Camera */}
      {hasPermission ? (
        <Camera
          ref={cameraRef}
          style={styles.cameraView}
          facing="front"
        />
      ) : (
        <LinearGradient
          colors={['#ff006e', '#8338ec', '#3a86ff']}
          style={styles.cameraView}
        >
          <Text style={styles.mockCamera}>📹 Kamera Kullanılamıyor</Text>
        </LinearGradient>
      )}

      {/* Live Overlay */}
      <View style={styles.overlay}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <View style={styles.liveIndicatorLarge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>CANLI</Text>
            <View style={styles.viewerBadge}>
              <Text style={styles.viewerIcon}>👁️</Text>
              <Text style={styles.viewerCount}>{viewerCount}</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.endBtn}
            onPress={handleEndStream}
          >
            <Text style={styles.endBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Comments Section */}
        <ScrollView 
          style={styles.commentsContainer}
          contentContainerStyle={styles.commentsContent}
        >
          {comments.map((comment, index) => (
            <View key={index} style={styles.commentBubble}>
              <Text style={styles.commentUser}>{comment.user}: </Text>
              <Text style={styles.commentText}>{comment.text}</Text>
            </View>
          ))}
        </ScrollView>

        {/* ✅ GIFT ANIMATIONS - TikTok-style with Lottie */}
        <GiftAnimationQueue 
          gifts={gifts} 
          maxConcurrent={3}
        />

        {/* Bottom Bar */}
        <View style={styles.bottomBar}>
          <View style={styles.earningsDisplay}>
            <Text style={styles.earningsIcon}>💎</Text>
            <Text style={styles.earningsText}>{earnings} Jeton</Text>
          </View>

          <View style={styles.streamInfo}>
            <Text style={styles.streamTitleText}>{streamTitle}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  setupContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
  },
  closeBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  closeIcon: {
    fontSize: 24,
    color: '#ffffff',
  },
  setupTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
    marginVertical: 24,
  },
  previewContainer: {
    marginBottom: 32,
  },
  preview: {
    height: 300,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: '#000000',
  },
  previewText: {
    fontSize: 64,
    marginBottom: 8,
  },
  previewSubtext: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  setupForm: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#a9b6c7',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 16,
  },
  infoBox: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'rgba(255,0,110,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,0,110,0.3)',
    borderRadius: 12,
    padding: 16,
  },
  infoIcon: {
    fontSize: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#ff006e',
    lineHeight: 20,
  },
  startBtn: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  startGradient: {
    padding: 20,
    alignItems: 'center',
  },
  startBtnText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
  },
  cameraView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mockCamera: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: '700',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
  },
  liveIndicatorLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,0,0,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ffffff',
  },
  liveText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
  viewerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 4,
  },
  viewerIcon: {
    fontSize: 12,
  },
  viewerCount: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  endBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  endBtnText: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: '700',
  },
  commentsContainer: {
    maxHeight: 300,
    paddingHorizontal: 16,
  },
  commentsContent: {
    gap: 8,
  },
  commentBubble: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  commentUser: {
    color: '#ff006e',
    fontSize: 14,
    fontWeight: '700',
  },
  commentText: {
    color: '#ffffff',
    fontSize: 14,
  },
  giftsContainer: {
    position: 'absolute',
    right: 16,
    top: '30%',
    gap: 12,
  },
  giftItem: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    minWidth: 60,
  },
  giftEmoji: {
    fontSize: 32,
  },
  giftSender: {
    color: '#ffffff',
    fontSize: 10,
    marginTop: 4,
  },
  bottomBar: {
    padding: 16,
    paddingBottom: 32,
  },
  earningsDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,229,255,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 12,
    alignSelf: 'center',
  },
  earningsIcon: {
    fontSize: 20,
  },
  earningsText: {
    color: '#00e5ff',
    fontSize: 16,
    fontWeight: '900',
  },
  streamInfo: {
    alignItems: 'center',
  },
  streamTitleText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
