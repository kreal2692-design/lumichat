import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../App';
import { DEMO_MODE, DEMO_STORIES, DEMO_CREATORS } from '../data/demoData';

const { width, height } = Dimensions.get('window');

export default function StoryScreen({ navigation }) {
  const [stories, setStories] = useState([]);
  const [viewingStory, setViewingStory] = useState(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    // Demo Mode: Sahte veri kullan
    if (DEMO_MODE) {
      const grouped = {};
      DEMO_STORIES.forEach(story => {
        const creator = DEMO_CREATORS.find(c => c.id === story.creator_id);
        const userId = story.creator_id;
        if (!grouped[userId]) {
          grouped[userId] = {
            user: { 
              username: creator.username, 
              is_premium: creator.is_verified 
            },
            stories: [],
          };
        }
        grouped[userId].stories.push({
          ...story,
          content: '🎉 Demo Story',
          type: 'text'
        });
      });
      setStories(Object.values(grouped));
      return;
    }

    // Normal mod: Supabase'den yükle
    try {
      const { data, error } = await supabase
        .from('stories')
        .select(`
          *,
          user:users(username, is_premium)
        `)
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Group by user
      const grouped = {};
      data?.forEach(story => {
        const userId = story.user_id;
        if (!grouped[userId]) {
          grouped[userId] = {
            user: story.user,
            stories: [],
          };
        }
        grouped[userId].stories.push(story);
      });

      setStories(Object.values(grouped));
    } catch (error) {
      console.error('Error loading stories:', error);
      setStories([]);
    }
  };

  const handleViewStory = (storyGroup) => {
    setViewingStory(storyGroup);
    setCurrentStoryIndex(0);
  };

  const handleNextStory = () => {
    if (viewingStory && currentStoryIndex < viewingStory.stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
    } else {
      setViewingStory(null);
      setCurrentStoryIndex(0);
    }
  };

  const handlePrevStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
    }
  };

  const handleCreateStory = () => {
    navigation.navigate('CreateStory');
  };

  const renderStoryCircle = ({ item }) => (
    <TouchableOpacity
      style={styles.storyCircle}
      onPress={() => handleViewStory(item)}
    >
      <LinearGradient
        colors={['#ff006e', '#8338ec', '#3a86ff']}
        style={styles.storyGradient}
      >
        <View style={styles.storyAvatar}>
          <Text style={styles.storyAvatarText}>
            {item.user.username.charAt(0).toUpperCase()}
          </Text>
        </View>
      </LinearGradient>
      <Text style={styles.storyUsername} numberOfLines={1}>
        {item.user.username}
      </Text>
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
        <Text style={styles.headerTitle}>Hikayeler</Text>
        <TouchableOpacity 
          style={styles.addBtn}
          onPress={handleCreateStory}
        >
          <Text style={styles.addIcon}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Stories List */}
      <FlatList
        data={stories}
        renderItem={renderStoryCircle}
        keyExtractor={(item, index) => index.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.storiesList}
      />

      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📸</Text>
        <Text style={styles.emptyText}>
          Arkadaşlarının hikayelerini gör veya kendin paylaş!
        </Text>
        <TouchableOpacity 
          style={styles.createBtn}
          onPress={handleCreateStory}
        >
          <LinearGradient
            colors={['#ff006e', '#d90429']}
            style={styles.createGradient}
          >
            <Text style={styles.createBtnText}>+ Hikaye Oluştur</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Story Viewer Modal */}
      <Modal
        visible={!!viewingStory}
        transparent
        animationType="fade"
        onRequestClose={() => setViewingStory(null)}
      >
        {viewingStory && (
          <View style={styles.storyViewer}>
            <TouchableOpacity 
              style={styles.closeViewer}
              onPress={() => setViewingStory(null)}
            >
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>

            {/* Progress Bars */}
            <View style={styles.progressContainer}>
              {viewingStory.stories.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.progressBar,
                    index === currentStoryIndex && styles.progressBarActive,
                    index < currentStoryIndex && styles.progressBarCompleted,
                  ]}
                />
              ))}
            </View>

            {/* Story Content */}
            <TouchableOpacity 
              style={styles.storyContent}
              activeOpacity={1}
              onPress={(e) => {
                const { locationX } = e.nativeEvent;
                if (locationX < width / 2) {
                  handlePrevStory();
                } else {
                  handleNextStory();
                }
              }}
            >
              <LinearGradient
                colors={['#ff006e', '#8338ec', '#3a86ff']}
                style={styles.storyBackground}
              >
                <Text style={styles.storyText}>
                  {viewingStory.stories[currentStoryIndex]?.content}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* User Info */}
            <View style={styles.storyHeader}>
              <View style={styles.storyUser}>
                <View style={styles.storyUserAvatar}>
                  <Text style={styles.storyUserAvatarText}>
                    {viewingStory.user.username.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text style={styles.storyUsername}>
                    {viewingStory.user.username}
                  </Text>
                  <Text style={styles.storyTime}>2 saat önce</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </Modal>
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
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,0,110,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIcon: {
    fontSize: 32,
    color: '#ff006e',
    fontWeight: '300',
  },
  storiesList: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  storyCircle: {
    alignItems: 'center',
    marginRight: 16,
    width: 80,
  },
  storyGradient: {
    width: 76,
    height: 76,
    borderRadius: 38,
    padding: 3,
    marginBottom: 8,
  },
  storyAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#0b0f17',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyAvatarText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
  },
  storyUsername: {
    fontSize: 12,
    color: '#a9b6c7',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#a9b6c7',
    textAlign: 'center',
    marginBottom: 32,
  },
  createBtn: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  createGradient: {
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  createBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  storyViewer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  closeViewer: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 24,
    color: '#ffffff',
  },
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingTop: 50,
    gap: 4,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 5,
  },
  progressBar: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 1.5,
  },
  progressBarActive: {
    backgroundColor: '#ffffff',
  },
  progressBarCompleted: {
    backgroundColor: '#ffffff',
  },
  storyContent: {
    flex: 1,
  },
  storyBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyText: {
    fontSize: 48,
    color: '#ffffff',
    fontWeight: '700',
    textAlign: 'center',
  },
  storyHeader: {
    position: 'absolute',
    top: 70,
    left: 20,
    right: 80,
  },
  storyUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  storyUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyUserAvatarText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
  },
  storyTime: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
});
