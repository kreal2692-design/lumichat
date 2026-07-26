import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase, useUser } from '../../App';
import streamingService from '../services/streamingService';

export default function LiveStreamScreen({ navigation }) {
  const { user } = useUser(); // Real user
  const [activeTab, setActiveTab] = useState('live'); // live | following
  const [liveStreams, setLiveStreams] = useState([]);
  const [followingStreams, setFollowingStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [popularStreamers, setPopularStreamers] = useState([]);

  useEffect(() => {
    loadLiveStreams();
    loadPopularStreamers();
  }, []);

  const loadPopularStreamers = async () => {
    try {
      // Get popular streamers from Supabase
      const { data, error } = await supabase
        .from('users')
        .select('id, username, display_name, avatar_url')
        .eq('is_verified', true)
        .limit(6);

      if (error) throw error;

      const popular = (data || []).map((creator, index) => ({
        id: creator.id,
        name: creator.display_name || creator.username,
        avatar: creator.avatar_url || `https://i.pravatar.cc/400?u=${creator.id}`,
        isLive: false, // Will be updated by presence check
        viewers: 0,
      }));

      setPopularStreamers(popular);
    } catch (error) {
      console.error('Failed to load popular streamers:', error);
      setPopularStreamers([]);
    }
  };

  const loadLiveStreams = async () => {
    setLoading(true);
    try {
      // Use streamingService to fetch live streams
      const streams = await streamingService.getActiveLiveStreams(20);
      
      // Transform to match expected format
      const formattedStreams = streams.map(stream => ({
        ...stream,
        streamer: {
          username: stream.streamer?.username || 'Unknown',
          display_name: stream.streamer?.display_name || 'Unknown',
          avatar: stream.streamer?.avatar_url || `https://i.pravatar.cc/400?u=${stream.streamer_id}`,
          is_premium: stream.streamer?.is_verified || false,
        }
      }));

      setLiveStreams(formattedStreams);
      setLoading(false);
    } catch (error) {
      console.error('Error loading streams:', error);
      setLiveStreams([]);
      setLoading(false);
    }
  };

  const handleStartStream = () => {
    navigation.navigate('StreamBroadcast');
  };

  const handleJoinStream = (streamId) => {
    navigation.navigate('StreamViewer', { streamId });
  };

  // Popüler Yayıncılar Carousel
  const renderPopularStreamer = ({ item }) => (
    <TouchableOpacity
      style={styles.popularStreamerItem}
      onPress={() => item.isLive && handleJoinStream(`live-${item.id}`)}
      activeOpacity={0.7}
    >
      <View style={[
        styles.popularStreamerAvatarContainer,
        item.isLive && styles.popularStreamerLive
      ]}>
        <Image 
          source={{ uri: item.avatar }} 
          style={styles.popularStreamerAvatar}
        />
        {item.isLive && (
          <View style={styles.popularStreamerLiveBadge}>
            <Text style={styles.popularStreamerLiveText}>CANLI</Text>
          </View>
        )}
      </View>
      <Text style={styles.popularStreamerName} numberOfLines={1}>
        {item.name}
      </Text>
      {item.isLive && (
        <Text style={styles.popularStreamerViewers}>
          👁️ {item.viewers}
        </Text>
      )}
    </TouchableOpacity>
  );

  // Skeleton Loading Component
  const renderSkeletonCard = () => (
    <View style={styles.streamCard}>
      <View style={styles.skeletonThumbnail}>
        <LinearGradient
          colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.skeletonGradient}
        />
      </View>
      <View style={styles.streamInfo}>
        <View style={styles.skeletonTextLine} />
        <View style={[styles.skeletonTextLine, { width: '60%', marginTop: 8 }]} />
      </View>
    </View>
  );

  const renderStreamCard = ({ item }) => (
    <TouchableOpacity
      style={styles.streamCard}
      onPress={() => handleJoinStream(item.id)}
      activeOpacity={0.9}
    >
      {/* Thumbnail/Preview - Gerçek avatar/preview kullan */}
      <View style={styles.thumbnail}>
        <Image 
          source={{ uri: item.streamer.avatar || 'https://picsum.photos/400/300?random=' + item.id }} 
          style={styles.thumbnailImage}
          resizeMode="cover"
        />
        
        {/* Bottom Gradient Overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.85)']}
          style={styles.thumbnailOverlay}
        >
          {/* Streamer Info - Bottom Left */}
          <View style={styles.thumbnailBottomInfo}>
            <Text style={styles.streamerNameCard} numberOfLines={1}>
              {item.streamer.display_name || item.streamer.username}
              {item.streamer.is_premium && ' 👑'}
            </Text>
            <Text style={styles.streamTitleCard} numberOfLines={1}>
              {item.title}
            </Text>
          </View>
        </LinearGradient>

        {/* Live Indicator - Top Left */}
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>CANLI</Text>
        </View>

        {/* Viewer Badge - Top Right */}
        <View style={styles.viewerBadge}>
          <Text style={styles.viewerIcon}>👁️</Text>
          <Text style={styles.viewerCount}>{item.viewer_count}</Text>
        </View>
      </View>
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
        <Text style={styles.headerTitle}>Canlı Yayınlar</Text>
        <TouchableOpacity 
          style={styles.startStreamBtn}
          onPress={handleStartStream}
        >
          <Text style={styles.startStreamIcon}>📹</Text>
        </TouchableOpacity>
      </View>

      {/* Popüler Yayıncılar Carousel (Instagram Stories tarzı) */}
      {popularStreamers.length > 0 && (
        <View style={styles.popularStreamersContainer}>
          <FlatList
            data={popularStreamers}
            renderItem={renderPopularStreamer}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.popularStreamersList}
          />
        </View>
      )}

      {/* Modern Tab Bar (Underline Indicator) */}
      <View style={styles.modernTabs}>
        <TouchableOpacity
          style={styles.modernTab}
          onPress={() => setActiveTab('live')}
          activeOpacity={0.7}
        >
          <Text style={[styles.modernTabText, activeTab === 'live' && styles.modernTabTextActive]}>
            Canlı Yayınlar
          </Text>
          {activeTab === 'live' && <View style={styles.modernTabIndicator} />}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.modernTab}
          onPress={() => setActiveTab('following')}
          activeOpacity={0.7}
        >
          <Text style={[styles.modernTabText, activeTab === 'following' && styles.modernTabTextActive]}>
            Takip Edilenler
          </Text>
          {activeTab === 'following' && <View style={styles.modernTabIndicator} />}
        </TouchableOpacity>
      </View>

      {/* Live Streams Grid */}
      {loading ? (
        <FlatList
          data={[1, 2, 3, 4]}
          renderItem={renderSkeletonCard}
          keyExtractor={(item) => `skeleton-${item}`}
          numColumns={2}
          contentContainerStyle={styles.streamGrid}
          columnWrapperStyle={styles.streamRow}
        />
      ) : (
        <FlatList
          data={activeTab === 'live' ? liveStreams : followingStreams}
          renderItem={renderStreamCard}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.streamGrid}
          columnWrapperStyle={styles.streamRow}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📺</Text>
              <Text style={styles.emptyText}>
                {activeTab === 'live' 
                  ? 'Henüz canlı yayın yok'
                  : 'Takip ettiğin kimse yayında değil'}
              </Text>
              <TouchableOpacity 
                style={styles.emptyBtn}
                onPress={handleStartStream}
              >
                <Text style={styles.emptyBtnText}>İlk Yayını Sen Başlat! 🚀</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
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
  startStreamBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,0,110,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  startStreamIcon: {
    fontSize: 24,
  },
  // Popüler Yayıncılar Carousel Styles
  popularStreamersContainer: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  popularStreamersList: {
    paddingHorizontal: 20,
    gap: 16,
  },
  popularStreamerItem: {
    alignItems: 'center',
    width: 72,
  },
  popularStreamerAvatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 8,
    position: 'relative',
  },
  popularStreamerLive: {
    borderWidth: 3,
    borderColor: '#ff006e',
    shadowColor: '#ff006e',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
  popularStreamerAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
  },
  popularStreamerLiveBadge: {
    position: 'absolute',
    bottom: -4,
    left: '50%',
    transform: [{ translateX: -22 }],
    backgroundColor: '#ff006e',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#0b0f17',
  },
  popularStreamerLiveText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#ffffff',
  },
  popularStreamerName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 2,
  },
  popularStreamerViewers: {
    fontSize: 10,
    color: '#a9b6c7',
  },
  // Modern Tab Bar Styles
  modernTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 32,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  modernTab: {
    paddingBottom: 12,
    position: 'relative',
  },
  modernTabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6b7785',
  },
  modernTabTextActive: {
    color: '#ff006e',
    fontWeight: '700',
  },
  modernTabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#ff006e',
    borderRadius: 2,
  },
  // Skeleton Loading Styles
  skeletonThumbnail: {
    height: 220,
    backgroundColor: 'rgba(255,255,255,0.03)',
    overflow: 'hidden',
  },
  skeletonGradient: {
    flex: 1,
  },
  skeletonTextLine: {
    height: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 4,
    width: '80%',
  },
  streamInfo: {
    padding: 12,
  },
  streamGrid: {
    padding: 20,
    paddingTop: 16,
  },
  streamRow: {
    gap: 12,
    marginBottom: 12,
  },
  streamCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(10,20,30,0.5)',
  },
  thumbnail: {
    height: 220,
    position: 'relative',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    justifyContent: 'flex-end',
    padding: 12,
  },
  thumbnailBottomInfo: {
    gap: 4,
  },
  streamerNameCard: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  streamTitleCard: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  liveIndicator: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,0,0,0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
  },
  liveText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  viewerBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  viewerIcon: {
    fontSize: 11,
  },
  viewerCount: {
    color: '#ffffff',
    fontSize: 11,
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
    marginBottom: 24,
  },
  emptyBtn: {
    backgroundColor: 'rgba(255,0,110,0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyBtnText: {
    color: '#ff006e',
    fontSize: 16,
    fontWeight: '700',
  },
});
