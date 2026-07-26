/**
 * WebRTC Service - Peer-to-Peer Video Call Management
 * Handles WebRTC connections, signaling, and stream management
 */

import { supabase } from '../../App';
import { logError, logInfo, logSuccess, logWarning } from '../utils/errorLogger';

class WebRTCService {
  constructor() {
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.sessionId = null;
    this.currentUserId = null;
    this.isInitialized = false;
    
    // WebRTC Configuration
    this.configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },
      ],
    };
    
    // Callbacks
    this.onRemoteStream = null;
    this.onConnectionStateChange = null;
    this.onIceCandidate = null;
  }

  /**
   * Initialize WebRTC with local media stream
   */
  async initialize(localStream, userId, sessionId) {
    try {
      logInfo('WebRTC', 'Initializing WebRTC service...');
      
      this.localStream = localStream;
      this.currentUserId = userId;
      this.sessionId = sessionId;
      
      // Create peer connection
      this.peerConnection = new RTCPeerConnection(this.configuration);
      
      // Add local stream tracks to peer connection
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          this.peerConnection.addTrack(track, this.localStream);
        });
      }
      
      // Handle remote stream
      this.peerConnection.ontrack = (event) => {
        logInfo('WebRTC', 'Remote track received');
        if (event.streams && event.streams[0]) {
          this.remoteStream = event.streams[0];
          if (this.onRemoteStream) {
            this.onRemoteStream(this.remoteStream);
          }
        }
      };
      
      // Handle ICE candidates
      this.peerConnection.onicecandidate = async (event) => {
        if (event.candidate) {
          logInfo('WebRTC', 'ICE candidate generated');
          if (this.onIceCandidate) {
            this.onIceCandidate(event.candidate);
          }
          // Send ICE candidate to remote peer via Supabase
          await this.sendSignal('ice_candidate', {
            candidate: event.candidate.toJSON(),
          });
        }
      };
      
      // Handle connection state changes
      this.peerConnection.onconnectionstatechange = () => {
        const state = this.peerConnection.connectionState;
        logInfo('WebRTC', `Connection state: ${state}`);
        
        if (this.onConnectionStateChange) {
          this.onConnectionStateChange(state);
        }
        
        if (state === 'failed' || state === 'disconnected') {
          logWarning('WebRTC', 'Connection failed or disconnected');
        }
        
        if (state === 'connected') {
          logSuccess('WebRTC', 'Peer connection established');
        }
      };
      
      this.isInitialized = true;
      logSuccess('WebRTC', 'WebRTC service initialized');
      
      return true;
    } catch (error) {
      logError('WebRTC', 'Failed to initialize', error);
      throw error;
    }
  }

  /**
   * Create and send offer to remote peer
   */
  async createOffer(remotePeerId) {
    try {
      logInfo('WebRTC', 'Creating offer...');
      
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      
      await this.peerConnection.setLocalDescription(offer);
      
      // Send offer via Supabase signaling
      await this.sendSignal('offer', {
        sdp: offer.sdp,
        type: offer.type,
      }, remotePeerId);
      
      logSuccess('WebRTC', 'Offer created and sent');
      return offer;
    } catch (error) {
      logError('WebRTC', 'Failed to create offer', error);
      throw error;
    }
  }

  /**
   * Handle received offer and create answer
   */
  async handleOffer(offerData, remotePeerId) {
    try {
      logInfo('WebRTC', 'Handling offer...');
      
      const offer = new RTCSessionDescription({
        type: 'offer',
        sdp: offerData.sdp,
      });
      
      await this.peerConnection.setRemoteDescription(offer);
      
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      
      // Send answer via Supabase signaling
      await this.sendSignal('answer', {
        sdp: answer.sdp,
        type: answer.type,
      }, remotePeerId);
      
      logSuccess('WebRTC', 'Answer created and sent');
      return answer;
    } catch (error) {
      logError('WebRTC', 'Failed to handle offer', error);
      throw error;
    }
  }

  /**
   * Handle received answer
   */
  async handleAnswer(answerData) {
    try {
      logInfo('WebRTC', 'Handling answer...');
      
      const answer = new RTCSessionDescription({
        type: 'answer',
        sdp: answerData.sdp,
      });
      
      await this.peerConnection.setRemoteDescription(answer);
      
      logSuccess('WebRTC', 'Answer received and set');
    } catch (error) {
      logError('WebRTC', 'Failed to handle answer', error);
      throw error;
    }
  }

  /**
   * Handle received ICE candidate
   */
  async handleIceCandidate(candidateData) {
    try {
      const candidate = new RTCIceCandidate(candidateData.candidate);
      await this.peerConnection.addIceCandidate(candidate);
      logInfo('WebRTC', 'ICE candidate added');
    } catch (error) {
      logError('WebRTC', 'Failed to add ICE candidate', error);
    }
  }

  /**
   * Send signaling data via Supabase
   */
  async sendSignal(signalType, signalData, toUserId = null) {
    try {
      if (!this.sessionId) {
        throw new Error('Session ID not set');
      }
      
      const { error } = await supabase
        .from('webrtc_signals')
        .insert({
          session_id: this.sessionId,
          from_user_id: this.currentUserId,
          to_user_id: toUserId,
          signal_type: signalType,
          signal_data: signalData,
        });
      
      if (error) throw error;
      
      logInfo('WebRTC', `Signal sent: ${signalType}`);
    } catch (error) {
      logError('WebRTC', `Failed to send signal: ${signalType}`, error);
      throw error;
    }
  }

  /**
   * Subscribe to incoming signals
   */
  subscribeToSignals(callback) {
    try {
      logInfo('WebRTC', 'Subscribing to signals...');
      
      const subscription = supabase
        .channel(`webrtc_session_${this.sessionId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'webrtc_signals',
            filter: `to_user_id=eq.${this.currentUserId}`,
          },
          (payload) => {
            logInfo('WebRTC', 'Signal received', payload.new);
            callback(payload.new);
          }
        )
        .subscribe();
      
      logSuccess('WebRTC', 'Subscribed to signals');
      return subscription;
    } catch (error) {
      logError('WebRTC', 'Failed to subscribe to signals', error);
      throw error;
    }
  }

  /**
   * Toggle audio (mute/unmute)
   */
  toggleAudio(enabled) {
    try {
      if (this.localStream) {
        this.localStream.getAudioTracks().forEach(track => {
          track.enabled = enabled;
        });
        logInfo('WebRTC', `Audio ${enabled ? 'enabled' : 'disabled'}`);
        return true;
      }
      return false;
    } catch (error) {
      logError('WebRTC', 'Failed to toggle audio', error);
      return false;
    }
  }

  /**
   * Toggle video (show/hide)
   */
  toggleVideo(enabled) {
    try {
      if (this.localStream) {
        this.localStream.getVideoTracks().forEach(track => {
          track.enabled = enabled;
        });
        logInfo('WebRTC', `Video ${enabled ? 'enabled' : 'disabled'}`);
        return true;
      }
      return false;
    } catch (error) {
      logError('WebRTC', 'Failed to toggle video', error);
      return false;
    }
  }

  /**
   * Switch camera (front/back)
   */
  async switchCamera() {
    try {
      if (this.localStream) {
        const videoTrack = this.localStream.getVideoTracks()[0];
        if (videoTrack) {
          // Toggle camera facing mode
          const currentFacingMode = videoTrack.getSettings().facingMode;
          const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
          
          await videoTrack.applyConstraints({
            facingMode: newFacingMode,
          });
          
          logInfo('WebRTC', `Camera switched to ${newFacingMode}`);
          return true;
        }
      }
      return false;
    } catch (error) {
      logError('WebRTC', 'Failed to switch camera', error);
      return false;
    }
  }

  /**
   * Get connection statistics
   */
  async getStats() {
    try {
      if (this.peerConnection) {
        const stats = await this.peerConnection.getStats();
        return stats;
      }
      return null;
    } catch (error) {
      logError('WebRTC', 'Failed to get stats', error);
      return null;
    }
  }

  /**
   * Clean up and close connection
   */
  async cleanup() {
    try {
      logInfo('WebRTC', 'Cleaning up WebRTC service...');
      
      // Stop local stream tracks
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          track.stop();
        });
        this.localStream = null;
      }
      
      // Close peer connection
      if (this.peerConnection) {
        this.peerConnection.close();
        this.peerConnection = null;
      }
      
      // Reset state
      this.remoteStream = null;
      this.sessionId = null;
      this.currentUserId = null;
      this.isInitialized = false;
      
      logSuccess('WebRTC', 'WebRTC service cleaned up');
    } catch (error) {
      logError('WebRTC', 'Failed to cleanup', error);
    }
  }
}

// Export singleton instance
export default new WebRTCService();
