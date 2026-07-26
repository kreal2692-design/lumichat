import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// Mock data
const PHOTOS = [
  'https://picsum.photos/400/500?random=1',
  'https://picsum.photos/400/500?random=2',
  'https://picsum.photos/400/500?random=3',
  'https://picsum.photos/400/500?random=4',
];

const VIDEOS = [
  { id: 1, thumbnail: 'https://picsum.photos/200/300?random=5', duration: '0:15' },
  { id: 2, thumbnail: 'https://picsum.photos/200/300?random=6', duration: '0:23' },
];

export default function VideoMatchDetailScreen({ route, navigation }) {
  const { user } = route.params;
  const [selectedTab, setSelectedTab] = useState('photos'); // photos | videos

  const handleVideoCall = () => {
    navigation.navigate('VideoCall', { 
      creator: user,
      cost: user.pricing?.videoCall?.pricePerMinute || 50 
    });
  };

  const handleMessage = () => {
    navigation.navigate('Chat', { 
      creator: user,
      cost: user.pricing?.message?.pricePerMessage || 10 
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View style={styles.headerImage}>
          <Image source={{ uri: user.avatar }} style={styles.profileImage} />
          
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>

          {/* Online Status */}
          <View style={styles.onlineStatus}>
            <Text style={styles.onlineText}>offline</Text>
          </View>

          {/* More Options */}
          <TouchableOpacity style={styles.moreBtn}>
            <Text style={styles.moreIcon}>⋮</Text>
          </TouchableOpacity>
        </View>

        {/* User Info Card */}
        <View style={styles.infoCard}>
          <LinearGradient
            colors={['#2ecc71', '#27ae60']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.infoGradient}
          >
            <View style={styles.infoHeader}>
              <Text style={styles.infoFlag}>🇹🇷</Text>
              <Text style={styles.infoName}>{user.name}</Text>
              <Text style={styles.infoAge}>{user.age}</Text>
              <Text style={styles.infoCountry}>Turkey</Text>
            </View>

            <Text style={styles.infoBio}>
              {user.bio || 'merhaba ben Esma 24 yaşında sarışın 162 boy güzel erkekler arasın'}
            </Text>
          </LinearGradient>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'photos' && styles.tabActive]}
            onPress={() => setSelectedTab('photos')}
          >
            <Text style={[styles.tabText, selectedTab === 'photos' && styles.tabTextActive]}>
              Fotoğraf
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, selectedTab === 'videos' && styles.tabActive]}
            onPress={() => setSelectedTab('videos')}
          >
            <Text style={[styles.tabText, selectedTab === 'videos' && styles.tabTextActive]}>
              Video
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tab}>
            <Text style={styles.tabText}>İzlenim</Text>
          </TouchableOpacity>
        </View>

        {/* Photos Grid */}
        {selectedTab === 'photos' && (
          <View style={styles.photosGrid}>
            {PHOTOS.map((photo, index) => (
              <View key={index} style={styles.photoItem}>
                <Image source={{ uri: photo }} style={styles.photoImage} />
              </View>
            ))}
          </View>
        )}

        {/* Videos Grid */}
        {selectedTab === 'videos' && (
          <View style={styles.videosGrid}>
            {VIDEOS.map((video) => (
              <TouchableOpacity key={video.id} style={styles.videoItem}>
                <Image source={{ uri: video.thumbnail }} style={styles.videoThumbnail} />
                <View style={styles.videoPlayIcon}>
                  <Text style={styles.videoPlayText}>▶</Text>
                </View>
                <View style={styles.videoDuration}>
                  <Text style={styles.videoDurationText}>{video.duration}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.messageBtn}
          onPress={handleMessage}
        >
          <View style={styles.messageBtnCircle}>
            <Text style={styles.messageBtnIcon}>💬</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.videoCallBtn}
          onPress={handleVideoCall}
        >
          <LinearGradient
            colors={['#ffffff', '#f0f0f0']}
            style={styles.videoCallBtnGradient}
          >
            <Text style={styles.videoCallBtnIcon}>📹</Text>
            <Text style={styles.videoCallBtnText}>Video Ara</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },

  // Header Image
  headerImage: {
    width: width,
    height: height * 0.5,
    position: 'relative',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: '#ffffff',
  },
  onlineStatus: {
    position: 'absolute',
    top: 100,
    left: 16,
    backgroundColor: '#95a5a6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  onlineText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  moreBtn: {
    position: 'absolute',
    top: 50,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreIcon: {
    fontSize: 20,
    color: '#ffffff',
  },

  // Info Card
  infoCard: {
    margin: 16,
    marginTop: -40,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  infoGradient: {
    padding: 20,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  infoFlag: {
    fontSize: 24,
  },
  infoName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  infoAge: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  infoCountry: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  infoBio: {
    fontSize: 14,
    lineHeight: 20,
    color: '#ffffff',
  },

  // Tabs
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#a9b6c7',
  },
  tabTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },

  // Photos Grid
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
  },
  photoItem: {
    width: (width - 40) / 2,
    aspectRatio: 0.75,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1a1f2e',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },

  // Videos Grid
  videosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
  },
  videoItem: {
    width: (width - 40) / 2,
    aspectRatio: 0.75,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1a1f2e',
    position: 'relative',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  videoPlayIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -25 }],
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlayText: {
    fontSize: 20,
    color: '#ffffff',
  },
  videoDuration: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  videoDurationText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },

  // Action Bar
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 32,
    backgroundColor: '#1a1f2e',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    gap: 12,
  },
  messageBtn: {
    width: 56,
    height: 56,
  },
  messageBtnCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    backgroundColor: 'rgba(255,193,7,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffc107',
  },
  messageBtnIcon: {
    fontSize: 24,
  },
  videoCallBtn: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  videoCallBtnGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  videoCallBtnIcon: {
    fontSize: 24,
  },
  videoCallBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000000',
  },
});
