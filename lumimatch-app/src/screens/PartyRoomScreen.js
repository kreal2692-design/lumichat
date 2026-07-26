import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Modal,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DEMO_MODE, DEMO_USER, DEMO_CREATORS } from '../data/demoData';
import GiftAnimation from '../components/GiftAnimation';

const { width, height } = Dimensions.get('window');

// Demo Creators for Party Room Testing
const DEMO_PARTY_CREATORS = DEMO_CREATORS.slice(0, 3).map((creator, index) => ({
  id: creator.id,
  name: creator.name || creator.display_name,
  avatar: creator.avatar || creator.avatar_url,
  followers: creator.followers || creator.subscriber_count || 0,
  vip: creator.is_verified,
  isOnline: true,
}));

// Parti Odası Verileri
const PARTY_ROOM = {
  id: 'room-1',
  name: '★DENİZ YILDIZI★',
  host: {
    id: 'creator-1',
    name: 'Seyda',
    avatar: 'https://i.pravatar.cc/300?img=5',
    followers: 991,
    vip: true,
  },
  category: 'Music',
  participants: 40,
  likes: 4800000,
  gifts: [],
};

// Koltuk durumları - Demo Creators ile
const INITIAL_SEATS = [
  // Host (sol üst) - Demo Creator 1
  { id: 1, user: DEMO_PARTY_CREATORS[0] || PARTY_ROOM.host, isHost: true, isMuted: false },
  
  // Demo Creators
  { id: 2, user: DEMO_PARTY_CREATORS[1] || { name: 'Elif', avatar: 'https://i.pravatar.cc/100?img=9', followers: 17500, vip: true }, isMuted: false },
  { id: 3, user: DEMO_PARTY_CREATORS[2] || { name: 'Zeynep', avatar: 'https://i.pravatar.cc/100?img=20', followers: 292800, vip: true }, isMuted: false },
  { id: 4, user: { name: 'HAYAL', avatar: 'https://i.pravatar.cc/100?img=47', followers: 292800, vip: true }, isMuted: false },
  
  // İkinci sıra
  { id: 5, user: { name: 'Anel', avatar: 'https://i.pravatar.cc/100?img=23', followers: 238400 }, isMuted: false },
  { id: 6, user: { name: 'KABU', avatar: 'https://i.pravatar.cc/100?img=33', followers: 1360 }, isMuted: false },
  { id: 7, user: { name: 'Derin', avatar: 'https://i.pravatar.cc/100?img=20', followers: 1360 }, isMuted: false },
  { id: 8, user: { name: 'Asu', avatar: 'https://i.pravatar.cc/100?img=44', followers: 15 }, isMuted: false },
  
  // Üçüncü sıra
  { id: 9, user: { name: 'LEYDI', avatar: 'https://i.pravatar.cc/100?img=10', followers: 1892 }, isMuted: false },
  { id: 10, user: null, isEmpty: true }, // Boş koltuk
  { id: 11, user: null, isEmpty: true },
  { id: 12, user: { name: 'Derya', avatar: 'https://i.pravatar.cc/100?img=25', followers: 1360 }, isMuted: false },
  
  // Dördüncü sıra
  { id: 13, user: { name: 'Abdullah', avatar: 'https://i.pravatar.cc/100?img=15', followers: 15 }, isMuted: false },
  { id: 14, user: null, isEmpty: true },
  { id: 15, user: { name: 'karadayi', avatar: 'https://i.pravatar.cc/100?img=8', followers: 15 }, isMuted: false },
  { id: 16, user: { name: 'лэлвел', avatar: 'https://i.pravatar.cc/100?img=30', followers: 0 }, isMuted: false },
];

// Mesajlar
const INITIAL_MESSAGES = [
  { id: 1, user: 'U13859354', text: 'Zaten Kabul Edildi', vip: false },
  { id: 2, user: 'Seyda', text: 'Davet için teşekkürler @', vip: true, highlight: true },
];

// Hediyeler (PartyRoom için)
const PARTY_GIFTS = [
  { id: 1, name: 'Gül', emoji: '🌹', price: 5, color: '#FF1744' },
  { id: 2, name: 'Kalp', emoji: '❤️', price: 10, color: '#E91E63' },
  { id: 3, name: 'Yıldız', emoji: '⭐', price: 15, color: '#FFC107' },
  { id: 4, name: 'Jeton', emoji: '💎', price: 50, color: '#00BCD4' },
  { id: 5, name: 'Taç', emoji: '👑', price: 100, color: '#FFD700' },
  { id: 6, name: 'Roket', emoji: '🚀', price: 150, color: '#2196F3' },
];

export default function PartyRoomScreen({ navigation, route }) {
  const { room } = route.params || { room: PARTY_ROOM };
  
  const [seats, setSeats] = useState(INITIAL_SEATS);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [activeAnimations, setActiveAnimations] = useState([]);

  const handleSeatPress = (seat) => {
    if (seat.isEmpty) {
      // Boş koltuğa otur
      Alert.alert('Koltuğa Otur', 'Bu koltuğa oturmak istiyor musun?', [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Otur',
          onPress: () => {
            const newSeats = [...seats];
            const seatIndex = newSeats.findIndex(s => s.id === seat.id);
            newSeats[seatIndex] = {
              ...seat,
              user: {
                name: DEMO_USER.display_name,
                avatar: DEMO_USER.avatar_url,
                followers: 0,
              },
              isEmpty: false,
            };
            setSeats(newSeats);
            
            // Mesaj ekle
            setMessages(prev => [
              ...prev,
              {
                id: Date.now(),
                user: DEMO_USER.display_name,
                text: 'Koltuğa oturdum! 👋',
                isMe: true,
              },
            ]);
          },
        },
      ]);
    } else {
      // Kullanıcı profiline git
      setSelectedSeat(seat);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    setMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        user: DEMO_USER.display_name,
        text: newMessage.trim(),
        isMe: true,
      },
    ]);
    setNewMessage('');
  };

  const handleSendGift = (gift) => {
    setShowGiftModal(false);

    // Animasyon göster
    const giftWithColor = {
      ...gift,
      color: gift.color,
    };

    const animationId = Date.now();
    setActiveAnimations(prev => [
      ...prev,
      { id: animationId, gift: giftWithColor, style: 'corner' },
    ]);

    // Mesaj ekle
    setMessages(prev => [
      ...prev,
      {
        id: animationId,
        user: DEMO_USER.display_name,
        text: `${gift.emoji} hediye gönderdi!`,
        isGift: true,
      },
    ]);

    setTimeout(() => {
      setActiveAnimations(prev => prev.filter(anim => anim.id !== animationId));
    }, 3000);
  };

  const renderSeat = (seat) => {
    const isMe = seat.user?.name === DEMO_USER.display_name;
    
    if (seat.isEmpty) {
      return (
        <TouchableOpacity
          key={seat.id}
          style={styles.seat}
          onPress={() => handleSeatPress(seat)}
        >
          <View style={styles.emptySeat}>
            <Text style={styles.emptySeatIcon}>+</Text>
          </View>
          {seat.user && (
            <View style={styles.seatMicBadge}>
              <Text style={styles.micIcon}>🎤</Text>
              <Text style={styles.seatFollowers}>0</Text>
            </View>
          )}
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        key={seat.id}
        style={styles.seat}
        onPress={() => handleSeatPress(seat)}
      >
        {/* Avatar Frame */}
        <View style={[styles.seatAvatarFrame, seat.isHost && styles.hostFrame]}>
          {seat.user.vip && (
            <View style={styles.vipBadge}>
              <Text style={styles.vipText}>VIP</Text>
            </View>
          )}
          <Image source={{ uri: seat.user.avatar }} style={styles.seatAvatar} />
          
          {/* Rozet (Takipçi sayısı) */}
          {seat.user.followers >= 1000 && (
            <View style={styles.followerBadge}>
              <Text style={styles.followerText}>
                {seat.user.followers >= 1000000
                  ? `${(seat.user.followers / 1000000).toFixed(1)}M`
                  : seat.user.followers >= 1000
                  ? `${(seat.user.followers / 1000).toFixed(seat.user.followers >= 10000 ? 0 : 1)}K`
                  : seat.user.followers}
              </Text>
            </View>
          )}
        </View>

        {/* Name */}
        <Text style={styles.seatName} numberOfLines={1}>
          {seat.isHost && '★'}
          {seat.user.name}
        </Text>

        {/* Mic Status */}
        {!seat.isMuted && (
          <View style={styles.micIndicator}>
            <Text style={styles.micIcon}>🎤</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderMessage = (msg) => (
    <View key={msg.id} style={[styles.message, msg.isGift && styles.messageGift]}>
      <Text style={[styles.messageUser, msg.isMe && styles.messageUserMe]}>
        {msg.user}:
      </Text>
      <Text style={styles.messageText}>{msg.text}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1f2e', '#0a0e1a', '#000000']}
        style={styles.background}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>

          <View style={styles.roomInfo}>
            <Image source={{ uri: room.host.avatar }} style={styles.roomAvatar} />
            <View>
              <Text style={styles.roomName}>{room.name}</Text>
              <View style={styles.roomStats}>
                <Text style={styles.roomStat}>👁️ {room.participants}</Text>
                <Text style={styles.roomStat}>🎁 {room.likes >= 1000000 ? `${(room.likes / 1000000).toFixed(1)}M` : `${Math.floor(room.likes / 1000)}K`}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.moreBtn}>
            <Text style={styles.moreBtnIcon}>⋯</Text>
          </TouchableOpacity>
        </View>

        {/* Seats Grid (4x4) */}
        <View style={styles.seatsContainer}>
          <View style={styles.seatsGrid}>
            {seats.map(seat => renderSeat(seat))}
          </View>
        </View>

        {/* Messages */}
        <View style={styles.messagesContainer}>
          <ScrollView
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.slice(-10).map(renderMessage)}
          </ScrollView>
        </View>

        {/* Bottom Bar */}
        <View style={styles.bottomBar}>
          <TextInput
            style={styles.messageInput}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Lütfen girin..."
            placeholderTextColor="#5a6a7e"
            onSubmitEditing={handleSendMessage}
            returnKeyType="send"
          />

          <TouchableOpacity
            style={styles.micBtn}
            onPress={() => setIsMuted(!isMuted)}
          >
            <Text style={styles.micBtnIcon}>{isMuted ? '🔇' : '🎤'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.emojiBtn}>
            <Text style={styles.emojiBtnIcon}>😊</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.giftBtn}
            onPress={() => setShowGiftModal(true)}
          >
            <LinearGradient
              colors={['#ff006e', '#ff4d94']}
              style={styles.giftBtnGradient}
            >
              <Text style={styles.giftBtnIcon}>🎁</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.gridBtn}>
            <Text style={styles.gridBtnIcon}>⊞</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Gift Modal */}
      <Modal
        visible={showGiftModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowGiftModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.giftModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Hediye Gönder 🎁</Text>
              <TouchableOpacity onPress={() => setShowGiftModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.giftsGrid}>
              {PARTY_GIFTS.map(gift => (
                <TouchableOpacity
                  key={gift.id}
                  style={styles.giftCard}
                  onPress={() => handleSendGift(gift)}
                >
                  <Text style={styles.giftEmoji}>{gift.emoji}</Text>
                  <Text style={styles.giftName}>{gift.name}</Text>
                  <View style={styles.giftPriceContainer}>
                    <Text style={styles.giftPriceIcon}>💎</Text>
                    <Text style={styles.giftPriceText}>{gift.price}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Gift Animations */}
      {activeAnimations.map(animation => (
        <GiftAnimation
          key={animation.id}
          gift={animation.gift}
          style={animation.style}
          onComplete={() => {
            setActiveAnimations(prev => prev.filter(anim => anim.id !== animation.id));
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  background: {
    flex: 1,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 18,
    color: '#ffffff',
  },
  roomInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    gap: 10,
  },
  roomAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#ff006e',
  },
  roomName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  roomStats: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 2,
  },
  roomStat: {
    fontSize: 11,
    color: '#a9b6c7',
  },
  moreBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreBtnIcon: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: '700',
  },

  // Seats Grid
  seatsContainer: {
    flex: 1,
    padding: 16,
  },
  seatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  seat: {
    width: '23%',
    marginBottom: 16,
    alignItems: 'center',
  },
  seatAvatarFrame: {
    width: 70,
    height: 70,
    borderRadius: 35,
    padding: 3,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    position: 'relative',
  },
  hostFrame: {
    borderColor: '#ff006e',
    borderWidth: 3,
  },
  vipBadge: {
    position: 'absolute',
    top: -5,
    left: -5,
    backgroundColor: '#FFD700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    zIndex: 10,
  },
  vipText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#000000',
  },
  seatAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
  },
  followerBadge: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    transform: [{ translateX: -20 }],
    backgroundColor: '#ff006e',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 40,
    alignItems: 'center',
  },
  followerText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  seatName: {
    marginTop: 10,
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
    maxWidth: 70,
    textAlign: 'center',
  },
  micIndicator: {
    position: 'absolute',
    bottom: 24,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,217,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  micIcon: {
    fontSize: 10,
  },
  emptySeat: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptySeatIcon: {
    fontSize: 28,
    color: 'rgba(255,255,255,0.3)',
    fontWeight: '300',
  },

  // Messages
  messagesContainer: {
    height: 120,
    paddingHorizontal: 16,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    gap: 6,
  },
  message: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    alignSelf: 'flex-start',
    maxWidth: '85%',
  },
  messageGift: {
    backgroundColor: 'rgba(255,0,110,0.2)',
  },
  messageUser: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00d9ff',
    marginRight: 4,
  },
  messageUserMe: {
    color: '#2ecc71',
  },
  messageText: {
    fontSize: 12,
    color: '#ffffff',
    flex: 1,
  },

  // Bottom Bar
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 24,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  messageInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    color: '#ffffff',
    fontSize: 13,
  },
  micBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  micBtnIcon: {
    fontSize: 18,
  },
  emojiBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiBtnIcon: {
    fontSize: 20,
  },
  giftBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  giftBtnGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  giftBtnIcon: {
    fontSize: 20,
  },
  gridBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,217,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridBtnIcon: {
    fontSize: 20,
    color: '#00d9ff',
  },

  // Gift Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  giftModal: {
    backgroundColor: '#0a0e1a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
    maxHeight: height * 0.6,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  modalClose: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: '300',
  },
  giftsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 16,
  },
  giftCard: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  giftEmoji: {
    fontSize: 40,
    marginBottom: 6,
  },
  giftName: {
    fontSize: 11,
    color: '#ffffff',
    marginBottom: 4,
    fontWeight: '600',
  },
  giftPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,217,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  giftPriceIcon: {
    fontSize: 10,
  },
  giftPriceText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#00d9ff',
  },
});
