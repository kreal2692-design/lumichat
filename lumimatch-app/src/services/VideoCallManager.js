/**
 * 📞 VIDEO CALL MANAGER - Production-Grade Singleton
 * 
 * Features:
 * - Lifecycle-aware call management
 * - Crash-proof initialization
 * - Memory leak prevention
 * - Permission handling with graceful fallbacks
 * - Diamond cost tracking
 * - Auto-cleanup on unmount/background
 * 
 * @author LumiMatch Architecture Team
 * @version 3.0.0
 */

import { AppState, Alert, Linking } from 'react-native';
import { Camera } from 'expo-camera';
import webrtcService from './webrtcService';
import { supabase } from '../../App';
import { logError, logInfo, logSuccess, logWarning } from '../utils/errorLogger';

class VideoCallManager {
  static instance = null;
  
  constructor() {
    this.currentCall = null;
    this.isInCall = false;
    this.callSession = null;
    this.permissions = {
      camera: null,
      microphone: null,
    };
    this.subscriptions = new Map();
    this.appStateSubscription = null;
    this.callTimerRef = null;
    this.diamondTimerRef = null;
    this.cleanupCallbacks = [];
    
    // Call state
    this.callDuration = 0;
    this.diamondsSpent = 0;
    this.pricePerMinute = 50;
    
    // Bind methods
    this.handleAppStateChange = this.handleAppStateChange.bind(this);
  }
  
  /**
   * Singleton getInstance
   */
  static getInstance() {
    if (!VideoCallManager.instance) {
      VideoCallManager.instance = new VideoCallManager();
    }
    return VideoCallManager.instance;
  }
  
  /**
   * Initialize call with full crash protection
   */
  async initialize(userId, callType = 'random', filters = {}) {
    try {
      logInfo('VideoCallManager', 'Initializing call...', { userId, callType, filters });
      
      // Step 1: Check if already in call
      if (this.isInCall) {
        logWarning('VideoCallManager', 'Already in a call');
        throw new Error('Already in a video call');
      }
      
      // Step 2: Request and verify permissions
      const permissionsGranted = await this.requestPermissions();
      if (!permissionsGranted) {
        throw new Error('Permissions not granted');
      }
      
      // Step 3: Check user diamonds
      const hasEnoughDiamonds = await this.checkUserDiamonds(userId);
      if (!hasEnoughDiamonds) {
        throw new Error('Insufficient diamonds');
      }
      
      // Step 4: Find match
      const matchedUser = await this.findMatch(userId, filters);
      if (!matchedUser) {
        throw new Error('No match found');
      }
      
      // Step 5: Create call session
      const session = await this.createCallSession(userId, matchedUser.id, callType);
      
      // Step 6: Initialize WebRTC
      await this.initializeWebRTC(session.id, matchedUser.id);
      
      // Step 7: Setup app state listener
      this.setupAppStateListener();
      
      // Step 8: Start call timer
      this.startCallTimer(userId);
      
      this.isInCall = true;
      this.currentCall = matchedUser;
      this.callSession = session;
      
      logSuccess('VideoCallManager', 'Call initialized', { sessionId: session.id, matchId: matchedUser.id });
      
      return {
        success: true,
        matchedUser,
        session,
      };
      
    } catch (error) {
      logError('VideoCallManager', 'Call initialization failed', error);
      
      // Cleanup on failure
      await this.cleanup();
      
      return {
        success: false,
        error: error.message || 'Unknown error',
      };
    }
  }
  
  /**
   * Request camera and microphone permissions
   */
  async requestPermissions() {
    try {
      logInfo('VideoCallManager', 'Requesting permissions...');
      
      // Check current status
      const cameraStatus = await Camera.getCameraPermissionsAsync();
      const micStatus = await Camera.getMicrophonePermissionsAsync();
      
      // If already granted
      if (cameraStatus.granted && micStatus.granted) {
        this.permissions.camera = 'granted';
        this.permissions.microphone = 'granted';
        logSuccess('VideoCallManager', 'Permissions already granted');
        return true;
      }
      
      // Request permissions
      const cameraRequest = await Camera.requestCameraPermissionsAsync();
      const micRequest = await Camera.requestMicrophonePermissionsAsync();
      
      this.permissions.camera = cameraRequest.status;
      this.permissions.microphone = micRequest.status;
      
      // Check if both granted
      if (cameraRequest.granted && micRequest.granted) {
        logSuccess('VideoCallManager', 'Permissions granted');
        return true;
      }
      
      // Handle denial
      logWarning('VideoCallManager', 'Permissions denied', {
        camera: cameraRequest.status,
        mic: micRequest.status,
      });
      
      // Show user guidance
      Alert.alert(
        'İzin Gerekli',
        'Görüntülü arama yapabilmek için kamera ve mikrofon izni vermeniz gerekiyor.',
        [
          {
            text: 'Ayarlar',
            onPress: () => Linking.openSettings(),
          },
          {
            text: 'İptal',
            style: 'cancel',
          },
        ]
      );
      
      return false;
      
    } catch (error) {
      logError('VideoCallManager', 'Permission request failed', error);
      
      Alert.alert(
        'Hata',
        'İzin kontrolü sırasında bir hata oluştu. Lütfen uygulamayı yeniden başlatın.',
        [{ text: 'Tamam' }]
      );
      
      return false;
    }
  }
  
  /**
   * Check user has enough diamonds
   */
  async checkUserDiamonds(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('diamonds')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      
      const userDiamonds = data?.diamonds || 0;
      
      if (userDiamonds < this.pricePerMinute) {
        Alert.alert(
          'Yetersiz Elmas 💎',
          `Görüşme başlatmak için en az ${this.pricePerMinute}💎 elmasa ihtiyacınız var.\n\nMevcut elmasınız: ${userDiamonds}💎`,
          [{ text: 'Tamam' }]
        );
        return false;
      }
      
      // Confirm paid call
      return new Promise((resolve) => {
        Alert.alert(
          '💰 Ücretli Görüşme',
          `Görüşme başladığında dakikada ${this.pricePerMinute}💎 elmas harcanacak.\n\nMevcut elmasınız: ${userDiamonds}💎\n\nDevam etmek istiyor musunuz?`,
          [
            { 
              text: 'İptal', 
              onPress: () => resolve(false),
              style: 'cancel',
            },
            { 
              text: 'Başlat', 
              onPress: () => resolve(true),
            },
          ]
        );
      });
      
    } catch (error) {
      logError('VideoCallManager', 'Diamond check failed', error);
      return false;
    }
  }
  
  /**
   * Find match based on filters
   */
  async findMatch(userId, filters = {}) {
    try {
      logInfo('VideoCallManager', 'Finding match...', filters);
      
      const { genderFilter, countryFilter } = filters;
      
      // Find available users
      let query = supabase
        .from('user_presence')
        .select(`
          user_id,
          users!inner(id, username, display_name, avatar_url, gender, country)
        `)
        .eq('status', 'online')
        .neq('user_id', userId);
      
      if (genderFilter && genderFilter !== 'Tümü' && genderFilter !== 'Her İkisi') {
        const targetGender = genderFilter === 'Erkek' ? 'male' : 'female';
        query = query.eq('users.gender', targetGender);
      }
      
      if (countryFilter) {
        query = query.eq('users.country', countryFilter);
      }
      
      const { data: availableUsers, error } = await query.limit(20);
      
      if (error) throw error;
      
      if (!availableUsers || availableUsers.length === 0) {
        Alert.alert(
          'Kullanıcı Bulunamadı',
          'Şu anda uygun kullanıcı bulunamadı. Lütfen daha sonra tekrar deneyin.',
          [{ text: 'Tamam' }]
        );
        return null;
      }
      
      // Pick random user
      const randomUser = availableUsers[Math.floor(Math.random() * availableUsers.length)];
      const matched = randomUser.users;
      
      logSuccess('VideoCallManager', 'Match found', matched.id);
      
      return {
        id: matched.id,
        name: matched.display_name || matched.username,
        avatar: matched.avatar_url || `https://i.pravatar.cc/400?u=${matched.id}`,
        gender: matched.gender,
        country: matched.country,
      };
      
    } catch (error) {
      logError('VideoCallManager', 'Match finding failed', error);
      return null;
    }
  }
  
  /**
   * Create call session in database
   */
  async createCallSession(callerId, calleeId, callType) {
    try {
      const { data: session, error } = await supabase
        .from('video_call_sessions')
        .insert({
          caller_id: callerId,
          callee_id: calleeId,
          status: 'active',
          call_type: callType,
          connected_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) throw error;
      
      logSuccess('VideoCallManager', 'Call session created', session.id);
      return session;
      
    } catch (error) {
      logError('VideoCallManager', 'Session creation failed', error);
      throw error;
    }
  }
  
  /**
   * Initialize WebRTC connection
   */
  async initializeWebRTC(sessionId, remoteUserId) {
    try {
      logInfo('VideoCallManager', 'Initializing WebRTC...');
      
      // Initialize WebRTC service
      await webrtcService.initialize(null, remoteUserId, sessionId);
      
      // Set up callbacks
      webrtcService.onConnectionStateChange = (state) => {
        logInfo('VideoCallManager', `WebRTC state: ${state}`);
        if (state === 'connected') {
          this.isInCall = true;
        } else if (state === 'disconnected' || state === 'failed') {
          this.handleDisconnect();
        }
      };
      
      // Create offer
      await webrtcService.createOffer(remoteUserId);
      
      logSuccess('VideoCallManager', 'WebRTC initialized');
      
    } catch (error) {
      logError('VideoCallManager', 'WebRTC initialization failed', error);
      throw error;
    }
  }
  
  /**
   * Setup app state listener
   */
  setupAppStateListener() {
    try {
      if (this.appStateSubscription) {
        this.appStateSubscription.remove();
      }
      
      this.appStateSubscription = AppState.addEventListener(
        'change',
        this.handleAppStateChange
      );
      
      logInfo('VideoCallManager', 'AppState listener added');
    } catch (error) {
      logError('VideoCallManager', 'AppState listener setup failed', error);
    }
  }
  
  /**
   * Handle app state changes
   */
  handleAppStateChange(nextAppState) {
    try {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        if (this.isInCall) {
          logWarning('VideoCallManager', 'App backgrounded during call');
          
          Alert.alert(
            'Görüşme Sonlandırıldı',
            'Uygulama arka plana alındığı için görüşme otomatik olarak sonlandırıldı.',
            [{ text: 'Tamam' }]
          );
          
          this.endCall();
        }
      }
    } catch (error) {
      logError('VideoCallManager', 'AppState change handler failed', error);
    }
  }
  
  /**
   * Start call timer and diamond deduction
   */
  startCallTimer(userId) {
    // Reset counters
    this.callDuration = 0;
    this.diamondsSpent = 0;
    
    // Increment duration every second
    this.callTimerRef = setInterval(() => {
      this.callDuration += 1;
    }, 1000);
    
    // Deduct diamonds every minute
    this.diamondTimerRef = setInterval(async () => {
      try {
        const { data: userData } = await supabase
          .from('users')
          .select('diamonds')
          .eq('id', userId)
          .single();
        
        if (!userData || userData.diamonds < this.pricePerMinute) {
          Alert.alert(
            'Elmas Bitti',
            'Elmaslarınız tükendi. Görüşme sonlandırıldı.',
            [{ text: 'Tamam' }]
          );
          this.endCall();
          return;
        }
        
        // Deduct diamonds
        await supabase
          .from('users')
          .update({ diamonds: userData.diamonds - this.pricePerMinute })
          .eq('id', userId);
        
        this.diamondsSpent += this.pricePerMinute;
        
        logInfo('VideoCallManager', `Deducted ${this.pricePerMinute} diamonds`, {
          total: this.diamondsSpent,
        });
        
      } catch (error) {
        logError('VideoCallManager', 'Diamond deduction failed', error);
      }
    }, 60000); // Every minute
  }
  
  /**
   * Handle disconnect
   */
  handleDisconnect() {
    logWarning('VideoCallManager', 'Call disconnected');
    this.endCall();
  }
  
  /**
   * End call
   */
  async endCall() {
    try {
      if (!this.callSession) {
        logWarning('VideoCallManager', 'No active call to end');
        return { success: false, error: 'No active call' };
      }
      
      logInfo('VideoCallManager', 'Ending call...', {
        sessionId: this.callSession.id,
        duration: this.callDuration,
        cost: this.diamondsSpent,
      });
      
      // Update session
      await supabase
        .from('video_call_sessions')
        .update({
          status: 'ended',
          ended_at: new Date().toISOString(),
          duration: this.callDuration,
          total_cost: this.diamondsSpent,
        })
        .eq('id', this.callSession.id);
      
      // Cleanup
      await this.cleanup();
      
      logSuccess('VideoCallManager', 'Call ended');
      
      return { success: true, duration: this.callDuration, cost: this.diamondsSpent };
      
    } catch (error) {
      logError('VideoCallManager', 'End call failed', error);
      
      // Still cleanup
      await this.cleanup();
      
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Add cleanup callback
   */
  onCleanup(callback) {
    if (typeof callback === 'function') {
      this.cleanupCallbacks.push(callback);
    }
  }
  
  /**
   * Cleanup - Memory leak prevention
   */
  async cleanup() {
    try {
      logInfo('VideoCallManager', 'Cleaning up...');
      
      // Clear timers
      if (this.callTimerRef) {
        clearInterval(this.callTimerRef);
        this.callTimerRef = null;
      }
      
      if (this.diamondTimerRef) {
        clearInterval(this.diamondTimerRef);
        this.diamondTimerRef = null;
      }
      
      // Remove app state listener
      if (this.appStateSubscription) {
        this.appStateSubscription.remove();
        this.appStateSubscription = null;
      }
      
      // Cleanup WebRTC
      webrtcService.cleanup();
      
      // Reset state
      this.isInCall = false;
      this.currentCall = null;
      this.callSession = null;
      this.callDuration = 0;
      this.diamondsSpent = 0;
      
      // Clear subscriptions
      this.subscriptions.clear();
      
      // Run cleanup callbacks
      for (const callback of this.cleanupCallbacks) {
        try {
          await callback();
        } catch (error) {
          logError('VideoCallManager', 'Cleanup callback failed', error);
        }
      }
      this.cleanupCallbacks = [];
      
      logSuccess('VideoCallManager', 'Cleanup complete');
      
    } catch (error) {
      logError('VideoCallManager', 'Cleanup failed', error);
    }
  }
  
  /**
   * Get current call info
   */
  getCurrentCall() {
    return {
      call: this.currentCall,
      session: this.callSession,
      duration: this.callDuration,
      cost: this.diamondsSpent,
      isInCall: this.isInCall,
    };
  }
  
  /**
   * Get permissions
   */
  getPermissions() {
    return this.permissions;
  }
  
  /**
   * Toggle video
   */
  toggleVideo(enabled) {
    webrtcService.toggleVideo(enabled);
  }
  
  /**
   * Toggle audio
   */
  toggleAudio(enabled) {
    webrtcService.toggleAudio(enabled);
  }
  
  /**
   * Switch camera
   */
  switchCamera() {
    webrtcService.switchCamera();
  }
}

// Export singleton instance
export default VideoCallManager.getInstance();
