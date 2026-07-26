import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../theme/colors';
import Spacing from '../theme/spacing';
import Typography from '../theme/typography';

export default function ChatHistoryScreenModern({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState([
    {
      id: '1',
      user: {
        id: 'u1',
        name: 'Emma Wilson',
        avatar: 'https://i.pravatar.cc/150?img=1',
        is_online: true,
      },
      lastMessage: 'Merhaba! Nasılsın? 😊',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      unreadCount: 2,
      isTyping: false,
      isPinned: true,
    },
    {
      id: '2',
      user: {
        id: 'u2',
        name: 'Sofia Garcia',
        avatar: 'https://i.pravatar.cc/150?img=5',
        is_online: true,
      },
      lastMessage: 'Görüşürüz! 👋',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      unreadCount: 0,
      isTyping: true,
      isPinned: false,
    },
    {
      id: '3',
      user: {
        id: 'u3',
        name: 'David Kim',
        avatar: 'https://i.pravatar.cc/150?img=13',
        is_online: false,
      },
      lastMessage: 'Teşekkürler! Yarın görüşürüz 🙂',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      unreadCount: 0,
      isTyping: false,
      isPinned: true,
    },
    {
      id: '4',
      user: {
        id: 'u4',
        name: 'Yuki Tanaka',
        avatar: 'https://i.pravatar.cc/150?img=9',
        is_online: false,
      },
      lastMessage: 'Harika bir gün geçir! ☀️',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      unreadCount: 5,
      isTyping: false,
      isPinned: false,
    },
  ]);

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Şimdi';
    if (minutes < 60) return `${minutes}dk`;
    if (hours < 24) return `${hours}sa`;
    if (days < 7) return `${days}g`;
    return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
  };

  const handlePinChat = (chatId) => {
    setChats(chats.map(chat => 
      chat.id === chatId ? { ...chat, isPinned: !chat.isPinned } : chat
    ));
  };

  const handleDeleteChat = (chatId) => {
    setChats(chats.filter(chat => chat.id !== chatId));
  };

  const renderChat = ({ item: chat }) => (
    <TouchableOpacity
      style={[styles.chatItem, chat.isPinned && styles.chatItemPinned]}
      onPress={() => navigation.navigate('Chat', { userId: chat.user.id })}
      activeOpacity={0.7}
    >
      {/* Avatar with Online Status */}
      <View style={styles.avatarContainer}>
        <Image source={{ uri: chat.user.avatar }} style={styles.avatar} />
        {chat.user.is_online && <View style={styles.onlineDot} />}
      </View>

      {/* Chat Info */}
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <View style={styles.nameRow}>
            <Text style={styles.userName} numberOfLines={1}>
              {chat.user.name}
            </Text>
            {chat.isPinned && <Text style={styles.pinIcon}>📌</Text>}
          </View>
          <Text style={styles.timestamp}>{formatTime(chat.timestamp)}</Text>
        </View>

        <View style={styles.messageRow}>
          {chat.isTyping ? (
            <View style={styles.typingIndicator}>
              <View style={styles.typingDot} />
              <View style={styles.typingDot} />
              <View style={styles.typingDot} />
              <Text style={styles.typingText}>yazıyor...</Text>
            </View>
          ) : (
            <Text style={styles.lastMessage} numberOfLines={1}>
              {chat.lastMessage}
            </Text>
          )}
          
          {chat.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>
                {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Sohbetler</Text>
          <Text style={styles.headerSubtitle}>{chats.length} sohbet</Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerBtn}>
            <Text style={styles.headerIcon}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn}>
            <Text style={styles.headerIcon}>⋯</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Ara..."
            placeholderTextColor={Colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Chat List */}
      <FlatList
        data={chats.filter(chat => 
          chat.user.name.toLowerCase().includes(searchQuery.toLowerCase())
        )}
        renderItem={renderChat}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.chatList}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyTitle}>Sohbet bulunamadı</Text>
            <Text style={styles.emptyText}>Yeni bir sohbet başlatın</Text>
          </View>
        )}
      />

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => {/* Navigate to new chat */}}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={Colors.accent.gradient.blue}
          style={styles.fabGradient}
        >
          <Text style={styles.fabIcon}>✏️</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: 50,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.subtle,
  },
  headerTitle: {
    ...Typography.styles.h3,
    color: Colors.text.primary,
  },
  headerSubtitle: {
    ...Typography.styles.caption,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.gap.sm,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: Spacing.radius.md,
    backgroundColor: Colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 20,
  },

  // Search
  searchContainer: {
    padding: Spacing.md,
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.subtle,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    borderRadius: Spacing.radius.lg,
    paddingHorizontal: Spacing.md,
    gap: Spacing.gap.sm,
  },
  searchIcon: {
    fontSize: 18,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    ...Typography.styles.body,
    color: Colors.text.primary,
  },
  clearIcon: {
    fontSize: 16,
    color: Colors.text.tertiary,
  },

  // Chat List
  chatList: {
    paddingTop: Spacing.xs,
  },
  chatItem: {
    flexDirection: 'row',
    padding: Spacing.md,
    backgroundColor: Colors.background.primary,
    gap: Spacing.gap.md,
  },
  chatItemPinned: {
    backgroundColor: Colors.interactive.hover,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.background.secondary,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.status.online,
    borderWidth: 2,
    borderColor: Colors.background.primary,
  },
  chatContent: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  userName: {
    ...Typography.styles.label,
    color: Colors.text.primary,
    flex: 1,
  },
  pinIcon: {
    fontSize: 12,
  },
  timestamp: {
    ...Typography.styles.caption,
    color: Colors.text.tertiary,
    fontSize: 11,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.gap.sm,
  },
  lastMessage: {
    ...Typography.styles.bodySmall,
    color: Colors.text.secondary,
    flex: 1,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  typingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.accent.blue,
  },
  typingText: {
    ...Typography.styles.caption,
    color: Colors.accent.blue,
    fontStyle: 'italic',
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.accent.blue,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    ...Typography.styles.labelSmall,
    fontSize: 10,
    color: Colors.text.primary,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border.subtle,
    marginLeft: Spacing.md + 56 + Spacing.gap.md,
  },

  // Empty State
  emptyContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  emptyIcon: {
    fontSize: 64,
  },
  emptyTitle: {
    ...Typography.styles.h4,
    color: Colors.text.primary,
  },
  emptyText: {
    ...Typography.styles.body,
    color: Colors.text.secondary,
    textAlign: 'center',
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    borderRadius: 28,
    elevation: 8,
    shadowColor: Colors.accent.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabIcon: {
    fontSize: 24,
  },
});
