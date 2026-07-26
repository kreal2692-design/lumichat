import { mediaDevices, RTCPeerConnection, RTCIceCandidate, RTCSessionDescription } from 'react-native-webrtc';

const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    // Production için TURN server ekle
    // {
    //   urls: 'turn:your-turn-server.com:3478',
    //   username: 'username',
    //   credential: 'password'
    // }
  ],
  iceCandidatePoolSize: 10,
};

class WebRTCService {
  constructor() {
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
  }

  // Local stream başlat (kamera + mikrofon)
  async startLocalStream() {
    try {
      const stream = await mediaDevices.getUserMedia({
        video: {
          width: 1280,
          height: 720,
          frameRate: 30,
          facingMode: 'user', // Ön kamera
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      this.localStream = stream;
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  }

  // Peer connection oluştur
  createPeerConnection() {
    this.peerConnection = new RTCPeerConnection(configuration);

    // Local stream'i peer connection'a ekle
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream);
      });
    }

    return this.peerConnection;
  }

  // Offer oluştur (caller)
  async createOffer() {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    const offer = await this.peerConnection.createOffer({
      offerToReceiveVideo: true,
      offerToReceiveAudio: true,
    });

    await this.peerConnection.setLocalDescription(offer);
    return offer;
  }

  // Offer'ı kabul et ve answer oluştur (callee)
  async createAnswer(offer) {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);

    return answer;
  }

  // Answer'ı set et (caller)
  async setRemoteAnswer(answer) {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  }

  // ICE candidate ekle
  async addIceCandidate(candidate) {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }

    await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  }

  // Mikrofonu aç/kapat
  toggleAudio() {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return audioTrack.enabled;
      }
    }
    return false;
  }

  // Kamerayı aç/kapat
  toggleVideo() {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        return videoTrack.enabled;
      }
    }
    return false;
  }

  // Kamera değiştir (ön/arka)
  async switchCamera() {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        // React Native WebRTC'de _switchCamera internal method
        videoTrack._switchCamera();
      }
    }
  }

  // Bağlantıyı kapat
  closeConnection() {
    // Local stream'i durdur
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    // Remote stream'i temizle
    this.remoteStream = null;

    // Peer connection'ı kapat
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
  }

  // Connection state değişikliklerini dinle
  onConnectionStateChange(callback) {
    if (this.peerConnection) {
      this.peerConnection.onconnectionstatechange = (event) => {
        callback(this.peerConnection.connectionState);
      };
    }
  }

  // ICE candidate event'i
  onIceCandidate(callback) {
    if (this.peerConnection) {
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          callback(event.candidate);
        }
      };
    }
  }

  // Remote stream geldiğinde
  onAddStream(callback) {
    if (this.peerConnection) {
      this.peerConnection.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          this.remoteStream = event.streams[0];
          callback(event.streams[0]);
        }
      };
    }
  }
}

export default new WebRTCService();
