import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, CameraType } from 'expo-camera';
import { supabase, useUser } from '../../App';
import VideoCallManager from '../services/VideoCallManager';
import webrtcService from '../services/webrtcService';
import { logError, logInfo, logWarning, logSuccess } from '../utils/errorLogger';

const { width, height } = Dimensions.get('window');

export default function VideoCallScreen({ route, navigation }) {
  const { user } = useUser(); // Real Supabase user
  const { genderFilter, countryFilter, ageFilter } = route.params || {};
  
  const [isSearching, setIsSearching] = useState(true);
  const [matchedUser, setMatchedUser] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const [diamondsSpent, setDiamondsSpent] = useState(0);
  const [isInCall, setIsInCall] = useState(false);
  const [remoteStreamUrl, setRemoteStreamUrl] = useState(null);
  
  // Camera states
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraType, setCameraType] = useState(CameraType.front);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  
  const cameraRef = useRef(null);
  const durationIntervalRef = useRef(null);

  useEffect(() => {
    initializeCall();
    
    // Cleanup on unmount - CRITICAL
    return () => {
      VideoCallManager.cleanup();
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, []);

  /**
   * ✅ CRASH-PROOF Call Initialization with VideoCallManager
   */
  const initializeCall = async () => {
    try {
      logInfo('VideoCall', 'Initializing call with VideoCallManager...');
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      setIsSearching(true);

      // ✅ Use VideoCallManager singleton - handles everything!
      const result = await VideoCallManager.initialize(
        user.id,
        'random',
        { genderFilter, countryFilter, ageFilter }
      );

      if (result.success) {
        setMatchedUser(result.matchedUser);
        setIsInCall(true);
        setIsSearching(false);
        
        // Setup WebRTC callbacks
        setupWebRTCCallbacks();
        
        // Start UI duration tracker
        startDurationTracker();
        
        logSuccess('VideoCall', 'Call initialized successfully');
      } else {
        // Graceful error - NO CRASH
        setIsSearching(false);
        
        if (result.error === 'Permissions not granted') {
          // Already handled by VideoCallManager with dialog
          navigation.goBack();
        } else if (result.error === 'Insufficient diamonds') {
          // Already handled by VideoCallManager with dialog
          navigation.goBack();
        } else if (result.error === 'No match found') {
          // Already handled by VideoCallManager with dialog
          navigation.goBack();
        } else {
          Alert.alert(
            'Bağlantı Hatası',
            'Görüşme başlatılırken bir hata oluştu. Lütfen tekrar deneyin.',
            [{ text: 'Tamam', onPress: () => navigation.goBack() }]
          );
        }
      }
      
    } catch (error) {
      logError('VideoCall', 'Initialize failed', error);
      Alert.alert(
        'Hata',
        'Görüntülü arama başlatılırken bir hata oluştu.',
        [{ text: 'Tamam', onPress: () => navigation.goBack() }]
      );
    }
  };

  /**
   * Setup WebRTC callbacks for remote stream
   */
  const setupWebRTCCallbacks = () => {
    webrtcService.onRemoteStream = (stream) => {
      logInfo('VideoCall', 'Remote stream received');
      setRemoteStreamUrl(stream);
    };
    
    webrtcService.onConnectionStateChange = (state) => {
      logInfo('VideoCall', `Connection state: ${state}`);
      if (state === 'disconnected' || state === 'failed') {
        Alert.alert(
          'Bağlantı Kesildi',
          'Görüşme bağlantısı kesildi.',
          [{ text: 'Tamam', onPress: () => endCall() }]
        );
      }
    };
  };

  /**
   * Start duration tracker for UI updates
   */
  const startDurationTracker = () => {
    // Update UI every second
    durationIntervalRef.current = setInterval(() => {
      const callInfo = VideoCallManager.getCurrentCall();
      setCallDuration(callInfo.duration);
      setDiamondsSpent(callInfo.cost);
    }, 1000);
  };

  /**
   * ✅ CRASH-PROOF Next User
   */
  const nextUser = async () => {
    try {
      // End current call
      await VideoCallManager.endCall();
      
      // Reset states
      setCallDuration(0);
      setDiamondsSpent(0);
      setIsInCall(false);
      setMatchedUser(null);
      setRemoteStreamUrl(null);
      
      // Find new match
      await initializeCall();
    } catch (error) {
      logError('VideoCall', 'Next user failed', error);
      navigation.goBack();
    }
  };

  /**
   * ✅ CRASH-PROOF End Call
   */
  const endCall = async () => {
    try {
      const result = await VideoCallManager.endCall();
      
      if (result.success) {
        logSuccess('VideoCall', 'Call ended', { duration: result.duration, cost: result.cost });
      }
    } catch (error) {
      logError('VideoCall', 'End call exception', error);
    } finally {
      // Always navigate back
      navigation.goBack();
    }
  };

  const toggleCamera = () => {
    setCameraType(current => 
      current === CameraType.back ? CameraType.front : CameraType.back
    );
    VideoCallManager.switchCamera();
  };

  const toggleVideo = () => {
    const newState = !isVideoEnabled;
    setIsVideoEnabled(newState);
    VideoCallManager.toggleVideo(newState);
  };

  const toggleMute = () => {
    const newState = !isMuted;
    setIsMuted(newState);
    VideoCallManager.toggleAudio(!newState);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * ✅ Check permissions from VideoCallManager
   */
  const permissions = VideoCallManager.getPermissions();
  const hasPermission = permissions.camera === 'granted' && permissions.microphone === 'granted';

  // Permission Denied UI - Simplified (handled by VideoCallManager)
  if (!hasPermission && !isSearching) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#0b0f17', '#1a1f2e']}
          style={styles.gradient}
        >
          <View style={styles.permissionContainer}>
            <Text style={styles.permissionIcon}>🎥</Text>
            <Text style={styles.permissionTitle}>Kamera İzni Reddedildi</Text>
            <Text style={styles.permissionText}>
              VideoCallManager izinleri yönetti. Bu ekrana ulaşmamalıydınız.
            </Text>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.cancelBtnText}>Geri Dön</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

  // Searching UI
  if (isSearching || !matchedUser) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#0b0f17', '#1a1f2e']}
          style={styles.gradient}
        >
          <View style={styles.searchingContainer}>
            <View style={styles.radarContainer}>
              <View style={styles.radarPulse1} />
              <View style={styles.radarPulse2} />
              <View style={styles.radarPulse3} />
              <View style={styles.radarCenter}>
                <Text style={styles.radarIcon}>📡</Text>
              </View>
            </View>
            
            <ActivityIndicator size="large" color="#00d9ff" style={{ marginTop: 24 }} />
            <Text style={styles.searchingText}>Eşleşme aranıyor...</Text>
            <Text style={styles.searchingSubtext}>
              {genderFilter && genderFilter !== 'Tümü' ? `${genderFilter} filtresi aktif` : 'Tüm kullanıcılar'}
            </Text>
            <Text style={styles.searchingTip}>💡 Sabırlı olun, en uygun eşleşmeyi buluyoruz</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  // Video Call UI
  return (
    <View style={styles.container}>
      {/* Remote User Video */}
      <View style={styles.remoteVideo}>
        {remoteStreamUrl ? (
          <Text style={styles.remoteVideoText}>🎥 Uzak Kamera</Text>
        ) : (
          <Image 
            source={{ uri: matchedUser.avatar }}
            style={styles.remoteVideoPlaceholder}
            resizeMode="cover"
          />
        )}
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.7)']}
          style={styles.remoteVideoOverlay}
        />
      </View>

      {/* Local User Video */}
      <View style={styles.localVideo}>
        {hasPermission === true && isVideoEnabled ? (
          <Camera
            ref={cameraRef}
            style={styles.camera}
            facing={cameraType === CameraType.front ? 'front' : 'back'}
            onCameraReady={() => setIsCameraReady(true)}
          />
        ) : (
          <View style={styles.videoDisabled}>
            <Text style={styles.videoDisabledIcon}>📷</Text>
            <Text style={styles.videoDisabledText}>Video Kapalı</Text>
          </View>
        )}
      </View>

      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.userInfo}>
          <View style={styles.userAvatar}>
            <Image source={{ uri: matchedUser.avatar }} style={styles.userAvatarImg} />
            <View style={styles.onlineIndicator} />
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{matchedUser.name}</Text>
            <Text style={styles.userStatus}>🟢 Canlı</Text>
          </View>
        </View>
        
        <View style={styles.callStats}>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>⏱️</Text>
            <Text style={styles.statText}>{formatTime(callDuration)}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>💎</Text>
            <Text style={styles.statText}>{diamondsSpent}</Text>
          </View>
        </View>
      </View>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        <TouchableOpacity 
          style={[styles.controlBtn, isMuted && styles.controlBtnActive]}
          onPress={toggleMute}
        >
          <Text style={styles.controlIcon}>{isMuted ? '🔇' : '🔊'}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.controlBtn, !isVideoEnabled && styles.controlBtnActive]}
          onPress={toggleVideo}
        >
          <Text style={styles.controlIcon}>{isVideoEnabled ? '📹' : '📷'}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.controlBtn}
          onPress={toggleCamera}
        >
          <Text style={styles.controlIcon}>🔄</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.controlBtn, styles.endCallBtn]}
          onPress={endCall}
        >
          <Text style={styles.controlIcon}>❌</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.controlBtn}
          onPress={nextUser}
        >
          <Text style={styles.controlIcon}>⏭️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  gradient: {
    flex: 1,
  },
  remoteVideo: {
    flex: 1,
    position: 'relative',
  },
  remoteVideoPlaceholder: {
    width: '100%',
    height: '100%',
  },
  remoteVideoText: {
    fontSize: 24,
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 200,
  },
  remoteVideoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  localVideo: {
    position: 'absolute',
    top: 80,
    right: 20,
    width: 120,
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#00d9ff',
    backgroundColor: '#1a1f2e',
  },
  camera: {
    flex: 1,
  },
  videoDisabled: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1f2e',
  },
  videoDisabledIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  videoDisabledText: {
    fontSize: 11,
    color: '#ffffff',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userAvatar: {
    position: 'relative',
  },
  userAvatarImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#00d9ff',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#2ecc71',
    borderWidth: 2,
    borderColor: '#000000',
  },
  userDetails: {
    gap: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  userStatus: {
    fontSize: 12,
    color: '#2ecc71',
  },
  callStats: {
    gap: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statIcon: {
    fontSize: 14,
  },
  statText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  controlBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlBtnActive: {
    backgroundColor: '#ff006e',
  },
  controlIcon: {
    fontSize: 24,
  },
  endCallBtn: {
    backgroundColor: '#ff006e',
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  permissionIcon: {
    fontSize: 80,
    marginBottom: 24,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 15,
    color: '#a9b6c7',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  settingsBtn: {
    width: '100%',
    marginBottom: 12,
  },
  settingsBtnGradient: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  settingsBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  cancelBtn: {
    width: '100%',
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#a9b6c7',
  },
  searchingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 30,
  },
  radarContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  radarPulse1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: 'rgba(0,217,255,0.3)',
    backgroundColor: 'rgba(0,217,255,0.05)',
  },
  radarPulse2: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: 'rgba(0,217,255,0.5)',
    backgroundColor: 'rgba(0,217,255,0.1)',
  },
  radarPulse3: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: 'rgba(0,217,255,0.8)',
    backgroundColor: 'rgba(0,217,255,0.2)',
  },
  radarCenter: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#00d9ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radarIcon: {
    fontSize: 32,
  },
  searchingText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 16,
    textAlign: 'center',
  },
  searchingSubtext: {
    fontSize: 14,
    color: '#a9b6c7',
    textAlign: 'center',
  },
  searchingTip: {
    fontSize: 13,
    color: '#00d9ff',
    textAlign: 'center',
    marginTop: 8,
  },
});
