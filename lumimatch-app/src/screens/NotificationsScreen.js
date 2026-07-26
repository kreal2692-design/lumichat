import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../App';
import { DEMO_MODE, DEMO_NOTIFICATIONS } from '../data/demoData';

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    loadNotifications();
    markAllAsRead();
  }, []);

  const loadNotifications = async () => {
    // Demo Mode: Sahte veri kullan
    if (DEMO_MODE) {
      setNotifications(DEMO_NOTIFICATIONS);
      return;
    }

    // Normal mod: Supabase'den yükle
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
    }
  };

  const markAllAsRead = async () => {
    if (DEMO_MODE) return; // Demo modda işlem yapma

    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'gift': return '🎁';
      case 'friend_request': return '👥';
      case 'message': return '💬';
      case 'stream_live': return '📺';
      case 'badge': return '🏆';
      case 'like': return '❤️';
      case 'comment': return '💭';
      default: return '🔔';
    }
  };

  const handleNotificationPress = (notification) => {
    switch (notification.type) {
      case 'friend_request':
        navigation.navigate('Friends');
        break;
      case 'message':
        navigation.navigate('Chat', { friendId: notification.related_id });
        break;
      case 'stream_live':
        navigation.navigate('StreamViewer', { streamId: notification.related_id });
        break;
      case 'badge':
        navigation.navigate('Stats');
        break;
      default:
        break;
    }
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Şimdi';
    if (minutes < 60) return `${minutes} dakika önce`;
    if (hours < 24) return `${hours} saat önce`;
    return `${days} gün önce`;
  };

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={[styles.notificationCard, !item.is_read && styles.notificationCardUnread]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.notificationIcon}>
        <Text style={styles.notificationEmoji}>
          {getNotificationIcon(item.type)}
        </Text>
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        <Text style={styles.notificationTime}>{getTimeAgo(item.created_at)}</Text>
      </View>
      {!item.is_read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Bildirimler</Text>
        <View style={styles.backBtn} />
      </View>

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyText}>Henüz bildirim yok</Text>
          </View>
        }
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  backBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#ffffff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  listContent: {
    padding: 20,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10,20,30,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.15)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  notificationCardUnread: {
    backgroundColor: 'rgba(0,229,255,0.05)',
    borderColor: 'rgba(0,229,255,0.3)',
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,229,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationEmoji: {
    fontSize: 24,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 13,
    color: '#a9b6c7',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 11,
    color: '#5a6a7e',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00e5ff',
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#a9b6c7',
  },
});
