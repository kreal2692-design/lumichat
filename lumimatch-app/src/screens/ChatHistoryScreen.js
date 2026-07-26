import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../App';
import { DEMO_MODE, DEMO_CREATORS, DEMO_MESSAGES, DEMO_USER } from '../data/demoData';

// DM History / Chat List Screen
export default function ChatHistoryScreen({ navigation }) {
  const [conversations, setConversations] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    setLoading(true);
    
    try {
      if (DEMO_MODE) {
        // Demo mode - DEMO_MESSAGES'dan konuşma listesi oluştur
        const chatList = createDemoChatList();
        setConversations(chatList);
      } else {
        // Real mode - Backend'den konuşmaları çek
        const { data: { user } } = await supabase.auth.getUser();
        
        const { data, error } = await supabase
          .from('messages')
          .select(`
            *,
            sender:sender_id(id, username, avatar_url, is_online),
            receiver:receiver_id(id, username, avatar_url, is_online)
          `)
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Group by conversation partner
        const grouped = groupMessagesByPartner(data, user.id);
        setConversations(grouped);
      }
    } catch (error) {
      console.error('❌ Error loading conversations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const createDemoChatList = () => {
    // DEMO_MESSAGES'dan unique creator'ları bul
    const uniquePartners = new Map();
    
    DEMO_MESSAGES.forEach(msg => {
      const partnerId = msg.from === DEMO_USER.id ? msg.to : msg.from;
      const partnerMsg = msg.from === DEMO_USER.id ? msg : msg;
      
      if (!uniquePartners.has(partnerId) || 
          new Date(partnerMsg.timestamp) > new Date(uniquePartners.get(partnerId).lastMessage.timestamp)) {
        const creator = DEMO_CREATORS.find(c => c.id === partnerId);
        
        if (creator) {
          uniquePartners.set(partnerId, {
            id: partnerId,
            partner: {
              id: creator.id,
              username: creator.name || creator.display_name,
              avatar_url: creator.avatar || creator.avatar_url,
              is_online: creator.is_online || Math.random() > 0.5,
              is_verified: creator.is_verified,
            },
            lastMessage: {
              text: msg.message,
              timestamp: msg.timestamp,
              isFromMe: msg.from === DEMO_USER.id,
              read: msg.read,
            },
            unreadCount: msg.read ? 0 : 1,
          });
        }
      }
    });
    
    // Map'i array'e çevir ve tarihe göre sırala
    return Array.from(uniquePartners.values())
      .sort((a, b) => new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp));
  };

  const groupMessagesByPartner = (messages, userId) => {
    const grouped = new Map();
    
    messages.forEach(msg => {
      const partnerId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
      const partner = msg.sender_id === userId ? msg.receiver : msg.sender;
      
      if (!grouped.has(partnerId)) {
        grouped.set(partnerId, {
          id: partnerId,
          partner: partner,
          lastMessage: {
            text: msg.text,
            timestamp: msg.created_at,
            isFromMe: msg.sender_id === userId,
            read: msg.read,
          },
          unreadCount: 0,
        });
      }
      
      if (!msg.read && msg.sender_id !== userId) {
        grouped.get(partnerId).unreadCount++;
      }
    });
    
    return Array.from(grouped.values())
      .sort((a, b) => new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp));
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadConversations();
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const diffMinutes = Math.floor(diff / 60000);
    const diffHours = Math.floor(diff / 3600000);
    const diffDays = Math.floor(diff / 86400000);
    
    if (diffMinutes < 1) return 'Şimdi';
    if (diffMinutes < 60) return `${diffMinutes}dk`;
    if (diffHours < 24) return `${diffHours}s`;
    if (diffDays < 7) return `${diffDays}g`;
    
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  };

  const renderConversation = ({ item }) => (
    <TouchableOpacity
      style={styles.conversationCard}
      onPress={() => navigation.navigate('Chat', {
        friendId: item.partner.id,
        friend: item.partner,
      })}
      activeOpacity={0.7}
    >
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <Image 
          source={{ uri: item.partner.avatar_url }}
          style={styles.avatar}
        />
        {item.partner.is_online && (
          <View style={styles.onlineDot} />
        )}
        {item.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>
              {item.unreadCount > 9 ? '9+' : item.unreadCount}
            </Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.nameContainer}>
            <Text style={styles.username}>{item.partner.username}</Text>
            {item.partner.is_verified && (
              <Text style={styles.verifiedBadge}>✓</Text>
            )}
          </View>
          <Text style={styles.timestamp}>
            {formatTime(item.lastMessage.timestamp)}
          </Text>
        </View>

        <View style={styles.bottomRow}>
          <Text 
            style={[
              styles.lastMessage,
              !item.lastMessage.read && !item.lastMessage.isFromMe && styles.unreadMessage
            ]}
            numberOfLines={1}
          >
            {item.lastMessage.isFromMe && '  Siz: '}
            {item.lastMessage.text}
          </Text>
          {!item.lastMessage.read && !item.lastMessage.isFromMe && (
            <View style={styles.unreadIndicator} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>💬</Text>
      <Text style={styles.emptyTitle}>Henüz Mesaj Yok</Text>
      <Text style={styles.emptySubtitle}>
        Birisiyle sohbet başlattığınızda burada görünecek
      </Text>
      <TouchableOpacity 
        style={styles.exploreBtn}
        onPress={() => navigation.navigate('Home')}
      >
        <LinearGradient
          colors={['#00d9ff', '#0099cc']}
          style={styles.exploreBtnGradient}
        >
          <Text style={styles.exploreBtnText}>Keşfet</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient
      colors={['#0b0f17', '#1a1f2e', '#0b0f17']}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sohbetler</Text>
        <TouchableOpacity 
          style={styles.newChatBtn}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.newChatIcon}>✎</Text>
        </TouchableOpacity>
      </View>

      {/* Conversations List */}
      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          conversations.length === 0 && styles.listContentEmpty
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#00d9ff"
            colors={['#00d9ff']}
          />
        }
        ListEmptyComponent={!loading && renderEmpty}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: '#ffffff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
  },
  newChatBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00d9ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  newChatIcon: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: '700',
  },

  // List
  listContent: {
    padding: 16,
  },
  listContentEmpty: {
    flex: 1,
    justifyContent: 'center',
  },

  // Conversation Card
  conversationCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(10,20,30,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.15)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: 'rgba(0,217,255,0.3)',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#2ecc71',
    borderWidth: 2,
    borderColor: '#0a141e',
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ff006e',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: '#0a141e',
  },
  unreadText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#ffffff',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  username: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  verifiedBadge: {
    fontSize: 14,
    color: '#00d9ff',
  },
  timestamp: {
    fontSize: 12,
    color: '#a9b6c7',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    color: '#a9b6c7',
  },
  unreadMessage: {
    fontWeight: '600',
    color: '#ffffff',
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00d9ff',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#a9b6c7',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  exploreBtn: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  exploreBtnGradient: {
    paddingHorizontal: 40,
    paddingVertical: 14,
  },
  exploreBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
});
