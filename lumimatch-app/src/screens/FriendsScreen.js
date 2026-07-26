import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../App';

export default function FriendsScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('friends'); // friends | requests | search
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    loadFriends();
    loadRequests();
  }, []);

  const loadFriends = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('friendships')
        .select('*, friend:users!friendships_friend_id_fkey(*)')
        .eq('user_id', user.id)
        .eq('status', 'accepted');

      if (error) throw error;
      setFriends(data || []);
    } catch (error) {
      console.error('Error loading friends:', error);
      // Demo data
      setFriends([
        { id: 1, friend: { username: 'Demo User 1', is_online: true } },
        { id: 2, friend: { username: 'Demo User 2', is_online: false } },
      ]);
    }
  };

  const loadRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('friendships')
        .select('*, requester:users!friendships_user_id_fkey(*)')
        .eq('friend_id', user.id)
        .eq('status', 'pending');

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error loading requests:', error);
      // Demo data
      setRequests([
        { id: 3, requester: { username: 'Demo User 3' } },
      ]);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .ilike('username', `%${searchQuery}%`)
        .limit(20);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching:', error);
      setSearchResults([
        { id: 4, username: 'Demo Search Result' },
      ]);
    }
  };

  const handleAddFriend = async (userId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('friendships')
        .insert({
          user_id: user.id,
          friend_id: userId,
          status: 'pending',
        });

      if (error) throw error;
      Alert.alert('Başarılı', 'Arkadaşlık isteği gönderildi!');
    } catch (error) {
      console.error('Error adding friend:', error);
      Alert.alert('Demo Modu', 'Arkadaş ekleme demo modda çalışmıyor');
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (error) throw error;
      Alert.alert('Başarılı', 'Arkadaşlık isteği kabul edildi!');
      loadFriends();
      loadRequests();
    } catch (error) {
      console.error('Error accepting request:', error);
      Alert.alert('Demo Modu', 'İstek kabul demo modda çalışmıyor');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', requestId);

      if (error) throw error;
      loadRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      Alert.alert('Demo Modu', 'İstek reddetme demo modda çalışmıyor');
    }
  };

  const renderFriendItem = ({ item }) => (
    <TouchableOpacity
      style={styles.friendCard}
      onPress={() => navigation.navigate('Chat', { friendId: item.friend.id })}
    >
      <View style={styles.friendAvatar}>
        <Text style={styles.friendAvatarText}>
          {item.friend.username.charAt(0).toUpperCase()}
        </Text>
        {item.friend.is_online && <View style={styles.onlineDot} />}
      </View>
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{item.friend.username}</Text>
        <Text style={styles.friendStatus}>
          {item.friend.is_online ? '🟢 Çevrimiçi' : '⚫ Çevrimdışı'}
        </Text>
      </View>
      <TouchableOpacity style={styles.chatBtn}>
        <Text style={styles.chatIcon}>💬</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderRequestItem = ({ item }) => (
    <View style={styles.requestCard}>
      <View style={styles.friendAvatar}>
        <Text style={styles.friendAvatarText}>
          {item.requester.username.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{item.requester.username}</Text>
        <Text style={styles.requestTime}>Arkadaşlık isteği</Text>
      </View>
      <View style={styles.requestActions}>
        <TouchableOpacity
          style={styles.acceptBtn}
          onPress={() => handleAcceptRequest(item.id)}
        >
          <Text style={styles.acceptText}>✓</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.rejectBtn}
          onPress={() => handleRejectRequest(item.id)}
        >
          <Text style={styles.rejectText}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSearchItem = ({ item }) => (
    <View style={styles.searchCard}>
      <View style={styles.friendAvatar}>
        <Text style={styles.friendAvatarText}>
          {item.username.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{item.username}</Text>
      </View>
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => handleAddFriend(item.id)}
      >
        <Text style={styles.addText}>+ Ekle</Text>
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
        <Text style={styles.headerTitle}>Arkadaşlar</Text>
        <View style={styles.backBtn} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'friends' && styles.tabActive]}
          onPress={() => setActiveTab('friends')}
        >
          <Text style={[styles.tabText, activeTab === 'friends' && styles.tabTextActive]}>
            Arkadaşlar ({friends.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'requests' && styles.tabActive]}
          onPress={() => setActiveTab('requests')}
        >
          <Text style={[styles.tabText, activeTab === 'requests' && styles.tabTextActive]}>
            İstekler ({requests.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'search' && styles.tabActive]}
          onPress={() => setActiveTab('search')}
        >
          <Text style={[styles.tabText, activeTab === 'search' && styles.tabTextActive]}>
            Ara
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'search' && (
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Kullanıcı adı ara..."
              placeholderTextColor="#5a6a7e"
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
              <Text style={styles.searchBtnText}>🔍</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <FlatList
        data={
          activeTab === 'friends' ? friends :
          activeTab === 'requests' ? requests :
          searchResults
        }
        renderItem={
          activeTab === 'friends' ? renderFriendItem :
          activeTab === 'requests' ? renderRequestItem :
          renderSearchItem
        }
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>
              {activeTab === 'friends' ? '👥' : 
               activeTab === 'requests' ? '📬' : '🔍'}
            </Text>
            <Text style={styles.emptyText}>
              {activeTab === 'friends' ? 'Henüz arkadaşın yok' :
               activeTab === 'requests' ? 'Bekleyen istek yok' :
               'Kullanıcı ara'}
            </Text>
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
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: 'rgba(0,229,255,0.15)',
  },
  tabText: {
    fontSize: 14,
    color: '#a9b6c7',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#00e5ff',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
    color: '#ffffff',
    fontSize: 16,
  },
  searchBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#00e5ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBtnText: {
    fontSize: 20,
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10,20,30,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.25)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10,20,30,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,193,7,0.25)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  searchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10,20,30,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  friendAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,229,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  friendAvatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#00e5ff',
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
    borderColor: '#0b0f17',
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  friendStatus: {
    fontSize: 12,
    color: '#a9b6c7',
  },
  requestTime: {
    fontSize: 12,
    color: '#ffc107',
  },
  chatBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,229,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatIcon: {
    fontSize: 20,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(46,204,113,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptText: {
    fontSize: 20,
    color: '#2ecc71',
    fontWeight: '700',
  },
  rejectBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,71,87,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectText: {
    fontSize: 20,
    color: '#ff4757',
    fontWeight: '700',
  },
  addBtn: {
    backgroundColor: 'rgba(0,229,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addText: {
    color: '#00e5ff',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
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
