import { io } from 'socket.io-client';

const SOCKET_URL = 'https://lumimatch.net'; // Production
// const SOCKET_URL = 'http://localhost:3000'; // Development

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(userId) {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
      this.isConnected = true;
      
      // Kullanıcıyı online olarak işaretle
      if (userId) {
        this.socket.emit('userOnline', userId);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Eşleşme başlat
  startMatching(data) {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }
    this.socket.emit('startMatch', data);
  }

  // Eşleşme iptal et
  cancelMatching() {
    if (this.socket?.connected) {
      this.socket.emit('cancelMatch');
    }
  }

  // WebRTC signaling
  sendOffer(roomName, offer) {
    this.socket.emit('offer', { roomName, offer });
  }

  sendAnswer(roomName, answer) {
    this.socket.emit('answer', { roomName, answer });
  }

  sendIceCandidate(roomName, candidate) {
    this.socket.emit('iceCandidate', { roomName, candidate });
  }

  // Chat mesajı gönder
  sendMessage(roomName, message) {
    this.socket.emit('message', { roomName, message });
  }

  // Next (yeni eşleşme)
  nextMatch(roomName) {
    this.socket.emit('next', { roomName });
  }

  // Event dinleyicileri
  onMatched(callback) {
    this.socket?.on('matched', callback);
  }

  onOffer(callback) {
    this.socket?.on('offer', callback);
  }

  onAnswer(callback) {
    this.socket?.on('answer', callback);
  }

  onIceCandidate(callback) {
    this.socket?.on('iceCandidate', callback);
  }

  onMessage(callback) {
    this.socket?.on('message', callback);
  }

  onPartnerDisconnected(callback) {
    this.socket?.on('partnerDisconnected', callback);
  }

  onTyping(callback) {
    this.socket?.on('typing', callback);
  }

  // Event dinleyicilerini kaldır
  off(event, callback) {
    this.socket?.off(event, callback);
  }
}

export default new SocketService();
