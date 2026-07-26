/**
 * 🎥 LIVE STREAM MANAGER - Production-Grade Singleton
 * 
 * Features:
 * - Lifecycle-aware stream management
 * - Crash-proof initialization
 * - Memory leak prevention
 * - Permission handling with graceful fallbacks
 * - Auto-cleanup on unmount
 * 
 * @author LumiMatch Architecture Team
 * @version 3.0.0
 */

import { AppState, Alert, Linking } from 'react-native';
import { Camera } from 'expo-camera';
import streamingService from './streamingService';
import { logError, logInfo, logSuccess, logWarning } from '../utils/errorLogger';

class LiveStreamManager {
  static instance = null;
  
  constructor() {
    this.currentStream = null;
    this.isStreaming = false;
    this.permissions = {
      camera: null,
      microphone: null,
    };
    this.subscriptions = new Map();
    this.appStateSubscription = null;
    this.cleanupCallbacks = [];
    
    // Bind methods to prevent context loss
    this.handleAppStateChange = this.handleAppStateChange.bind(this);
  }
  
  /**
   * Singleton getInstance
   */
  static getInstance() {
    if (!LiveStreamManager.instance) {
      LiveStreamManager.instance = new LiveStreamManager();
    }
    return LiveStreamManager.instance;
  }
  
  /**
   * Initialize stream with full crash protection
   */
  async initialize(userId, streamTitle, description = '', category = 'general') {
    try {
      logInfo('LiveStreamManager', 'Initializing stream...', { userId, streamTitle });
      
      // Step 1: Check if already streaming
      if (this.isStreaming) {
        logWarning('LiveStreamManager', 'Already streaming');
        throw new Error('Already in live stream');
      }
      
      // Step 2: Request and verify permissions
      const permissionsGranted = await this.requestPermissions();
      if (!permissionsGranted) {
        throw new Error('Permissions not granted');
      }
      
      // Step 3: Start stream via streamingService
      const stream = await streamingService.startLiveStream(
        userId,
        streamTitle,
        description,
        category
      );
      
      if (!stream || !stream.id) {
        throw new Error('Failed to create stream record');
      }
      
      this.currentStream = stream;
      this.isStreaming = true;
      
      // Step 4: Setup app state listener (background handling)
      this.setupAppStateListener();
      
      // Step 5: Setup Realtime subscriptions
      await this.setupRealtimeSubscriptions(stream.id);
      
      logSuccess('LiveStreamManager', 'Stream initialized', stream.id);
      
      return {
        success: true,
        stream,
      };
      
    } catch (error) {
      logError('LiveStreamManager', 'Initialization failed', error);
      
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
   * With graceful error handling and user guidance
   */
  async requestPermissions() {
    try {
      logInfo('LiveStreamManager', 'Requesting permissions...');
      
      // Check current permission status first
      const cameraStatus = await Camera.getCameraPermissionsAsync();
      const micStatus = await Camera.getMicrophonePermissionsAsync();
      
      // If already granted, return true
      if (cameraStatus.granted && micStatus.granted) {
        this.permissions.camera = 'granted';
        this.permissions.microphone = 'granted';
        logSuccess('LiveStreamManager', 'Permissions already granted');
        return true;
      }
      
      // Request permissions
      const cameraRequest = await Camera.requestCameraPermissionsAsync();
      const micRequest = await Camera.requestMicrophonePermissionsAsync();
      
      this.permissions.camera = cameraRequest.status;
      this.permissions.microphone = micRequest.status;
      
      // Check if both granted
      if (cameraRequest.granted && micRequest.granted) {
        logSuccess('LiveStreamManager', 'Permissions granted');
        return true;
      }
      
      // Handle denial
      logWarning('LiveStreamManager', 'Permissions denied', {
        camera: cameraRequest.status,
        mic: micRequest.status,
      });
      
      // Show user guidance
      Alert.alert(
        'İzin Gerekli',
        'Canlı yayın yapabilmek için kamera ve mikrofon izni vermeniz gerekiyor.',
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
      logError('LiveStreamManager', 'Permission request failed', error);
      
      // Never crash - return false on error
      Alert.alert(
        'Hata',
        'İzin kontrolü sırasında bir hata oluştu. Lütfen uygulamayı yeniden başlatın.',
        [{ text: 'Tamam' }]
      );
      
      return false;
    }
  }
  
  /**
   * Setup app state listener
   * Automatically end stream if app goes to background
   */
  setupAppStateListener() {
    try {
      // Remove existing listener if any
      if (this.appStateSubscription) {
        this.appStateSubscription.remove();
      }
      
      this.appStateSubscription = AppState.addEventListener(
        'change',
        this.handleAppStateChange
      );
      
      logInfo('LiveStreamManager', 'AppState listener added');
    } catch (error) {
      logError('LiveStreamManager', 'AppState listener setup failed', error);
    }
  }
  
  /**
   * Handle app state changes
   */
  handleAppStateChange(nextAppState) {
    try {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        if (this.isStreaming) {
          logWarning('LiveStreamManager', 'App backgrounded during stream');
          
          // Auto-end stream
          Alert.alert(
            'Yayın Sonlandırıldı',
            'Uygulama arka plana alındığı için yayın otomatik olarak sonlandırıldı.',
            [{ text: 'Tamam' }]
          );
          
          this.endStream();
        }
      }
    } catch (error) {
      logError('LiveStreamManager', 'AppState change handler failed', error);
    }
  }
  
  /**
   * Setup Realtime subscriptions
   */
  async setupRealtimeSubscriptions(streamId) {
    try {
      logInfo('LiveStreamManager', 'Setting up subscriptions...', streamId);
      
      // Note: Actual subscription callbacks should be passed from the component
      // This is just the infrastructure
      
      // Store streamId for later use
      this.streamId = streamId;
      
      logSuccess('LiveStreamManager', 'Subscriptions ready');
    } catch (error) {
      logError('LiveStreamManager', 'Subscription setup failed', error);
    }
  }
  
  /**
   * End stream
   */
  async endStream(userId) {
    try {
      if (!this.isStreaming || !this.currentStream) {
        logWarning('LiveStreamManager', 'No active stream to end');
        return { success: false, error: 'No active stream' };
      }
      
      logInfo('LiveStreamManager', 'Ending stream...', this.currentStream.id);
      
      // End stream via streamingService
      const result = await streamingService.endLiveStream(
        this.currentStream.id,
        userId
      );
      
      // Cleanup
      await this.cleanup();
      
      logSuccess('LiveStreamManager', 'Stream ended', result);
      
      return { success: true, result };
      
    } catch (error) {
      logError('LiveStreamManager', 'End stream failed', error);
      
      // Still cleanup even on error
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
      logInfo('LiveStreamManager', 'Cleaning up...');
      
      // Reset state
      this.isStreaming = false;
      this.currentStream = null;
      this.streamId = null;
      
      // Remove app state listener
      if (this.appStateSubscription) {
        this.appStateSubscription.remove();
        this.appStateSubscription = null;
      }
      
      // Unsubscribe all Realtime subscriptions
      streamingService.unsubscribeAll();
      this.subscriptions.clear();
      
      // Run cleanup callbacks
      for (const callback of this.cleanupCallbacks) {
        try {
          await callback();
        } catch (error) {
          logError('LiveStreamManager', 'Cleanup callback failed', error);
        }
      }
      this.cleanupCallbacks = [];
      
      logSuccess('LiveStreamManager', 'Cleanup complete');
      
    } catch (error) {
      logError('LiveStreamManager', 'Cleanup failed', error);
    }
  }
  
  /**
   * Get current stream info
   */
  getCurrentStream() {
    return this.currentStream;
  }
  
  /**
   * Check if currently streaming
   */
  getIsStreaming() {
    return this.isStreaming;
  }
  
  /**
   * Get permission status
   */
  getPermissions() {
    return this.permissions;
  }
}

// Export singleton instance
export default LiveStreamManager.getInstance();
