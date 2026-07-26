import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { DEMO_MODE, DEMO_USER, addDemoPost } from '../data/demoData';

export default function PostCreateScreen({ navigation }) {
  const [content, setContent] = useState('');
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [isPremium, setIsPremium] = useState(false);
  const [isPPV, setIsPPV] = useState(false);
  const [ppvPrice, setPpvPrice] = useState('50');
  const [hashtags, setHashtags] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('İzin Gerekli', 'Fotoğraf seçmek için galeri erişimi gerekli');
        return false;
      }
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    if (selectedMedia.length >= 10) {
      Alert.alert('Limit', 'En fazla 10 medya ekleyebilirsiniz');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 0.8,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets) {
      const newMedia = result.assets.map(asset => ({
        uri: asset.uri,
        type: asset.type === 'video' ? 'video' : 'image',
        width: asset.width,
        height: asset.height,
      }));
      setSelectedMedia([...selectedMedia, ...newMedia].slice(0, 10));
    }
  };

  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Fotoğraf çekmek için kamera erişimi gerekli');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedMedia([
        ...selectedMedia,
        {
          uri: result.assets[0].uri,
          type: 'image',
          width: result.assets[0].width,
          height: result.assets[0].height,
        },
      ]);
    }
  };

  const removeMedia = (index) => {
    setSelectedMedia(selectedMedia.filter((_, i) => i !== index));
  };

  const handlePost = async () => {
    if (!content.trim() && selectedMedia.length === 0) {
      Alert.alert('Hata', 'En az bir içerik veya medya eklemelisiniz');
      return;
    }

    if (isPPV && (!ppvPrice || parseInt(ppvPrice) < 1)) {
      Alert.alert('Hata', 'PPV içerik için fiyat belirleyin');
      return;
    }

    setIsPosting(true);

    // Demo mode için
    if (DEMO_MODE) {
      const newPost = {
        user: {
          id: DEMO_USER.id,
          display_name: DEMO_USER.display_name,
          avatar: DEMO_USER.avatar_url,
          is_verified: DEMO_USER.is_verified || false,
          is_creator: DEMO_USER.is_creator,
        },
        content: content.trim(),
        media: selectedMedia.map(m => ({
          type: m.type,
          url: m.uri,
        })),
        is_premium: isPremium,
        is_ppv: isPPV,
        ppv_price: isPPV ? parseInt(ppvPrice) : 0,
        hashtags: hashtags
          .split(' ')
          .filter(tag => tag.startsWith('#'))
          .map(tag => tag.slice(1)),
      };

      addDemoPost(newPost);

      setTimeout(() => {
        setIsPosting(false);
        Alert.alert('Başarılı!', 'Gönderiniz paylaşıldı 🎉', [
          { text: 'Tamam', onPress: () => navigation.goBack() },
        ]);
      }, 1000);
      return;
    }

    // Backend için
    try {
      // TODO: Upload media to Supabase Storage
      // TODO: Create post in database
      
      setIsPosting(false);
      Alert.alert('Başarılı!', 'Gönderiniz paylaşıldı 🎉', [
        { text: 'Tamam', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      setIsPosting(false);
      Alert.alert('Hata', 'Gönderi paylaşılamadı');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#0a0e1a', '#1a1f2e']} style={styles.header}>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelText}>İptal</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Yeni Gönderi</Text>

        <TouchableOpacity
          style={[styles.postBtn, (!content.trim() && selectedMedia.length === 0) && styles.postBtnDisabled]}
          onPress={handlePost}
          disabled={isPosting || (!content.trim() && selectedMedia.length === 0)}
        >
          <Text style={styles.postBtnText}>
            {isPosting ? 'Paylaşılıyor...' : 'Paylaş'}
          </Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Info */}
        <View style={styles.userSection}>
          <Image source={{ uri: DEMO_USER.avatar_url }} style={styles.avatar} />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{DEMO_USER.display_name}</Text>
            <Text style={styles.userRole}>
              {DEMO_USER.is_creator ? '✨ İçerik Üreticisi' : '👤 Kullanıcı'}
            </Text>
          </View>
        </View>

        {/* Content Input */}
        <TextInput
          style={styles.contentInput}
          placeholder="Ne düşünüyorsun?"
          placeholderTextColor="#5a6a7e"
          value={content}
          onChangeText={setContent}
          multiline
          maxLength={2000}
          autoFocus
        />

        {/* Media Preview */}
        {selectedMedia.length > 0 && (
          <View style={styles.mediaPreview}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {selectedMedia.map((media, index) => (
                <View key={index} style={styles.mediaItem}>
                  <Image source={{ uri: media.uri }} style={styles.mediaImage} />
                  {media.type === 'video' && (
                    <View style={styles.videoIcon}>
                      <Text style={styles.videoIconText}>▶</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.removeMediaBtn}
                    onPress={() => removeMedia(index)}
                  >
                    <Text style={styles.removeMediaIcon}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
            <Text style={styles.mediaCount}>{selectedMedia.length}/10 medya</Text>
          </View>
        )}

        {/* Hashtags */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Hashtag'ler</Text>
          <TextInput
            style={styles.hashtagInput}
            placeholder="#model #lifestyle #istanbul"
            placeholderTextColor="#5a6a7e"
            value={hashtags}
            onChangeText={setHashtags}
          />
          <Text style={styles.hashtagHelp}>
            Boşlukla ayırın. Örnek: #moda #güzellik
          </Text>
        </View>

        {/* Media Actions */}
        <View style={styles.mediaActions}>
          <TouchableOpacity style={styles.mediaActionBtn} onPress={pickImage}>
            <Text style={styles.mediaActionIcon}>🖼️</Text>
            <Text style={styles.mediaActionText}>Galeri</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.mediaActionBtn} onPress={takePhoto}>
            <Text style={styles.mediaActionIcon}>📷</Text>
            <Text style={styles.mediaActionText}>Kamera</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.mediaActionBtn}
            onPress={() => Alert.alert('Yakında', 'Video yükleme yakında eklenecek')}
          >
            <Text style={styles.mediaActionIcon}>🎥</Text>
            <Text style={styles.mediaActionText}>Video</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.mediaActionBtn}
            onPress={() => Alert.alert('Yakında', 'GIF eklenecek')}
          >
            <Text style={styles.mediaActionIcon}>🎭</Text>
            <Text style={styles.mediaActionText}>GIF</Text>
          </TouchableOpacity>
        </View>

        {/* Creator Options */}
        {DEMO_USER.is_creator && (
          <View style={styles.creatorOptions}>
            <Text style={styles.sectionTitle}>🎨 İçerik Üreticisi Seçenekleri</Text>

            {/* Premium Toggle */}
            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => setIsPremium(!isPremium)}
            >
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>👑 Premium İçerik</Text>
                <Text style={styles.optionDesc}>
                  Sadece aboneler görebilir
                </Text>
              </View>
              <View style={[styles.toggle, isPremium && styles.toggleActive]}>
                <View style={[styles.toggleThumb, isPremium && styles.toggleThumbActive]} />
              </View>
            </TouchableOpacity>

            {/* PPV Toggle */}
            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => setIsPPV(!isPPV)}
            >
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>💎 Pay-Per-View</Text>
                <Text style={styles.optionDesc}>
                  Jeton karşılığı kilidi aç
                </Text>
              </View>
              <View style={[styles.toggle, isPPV && styles.toggleActive]}>
                <View style={[styles.toggleThumb, isPPV && styles.toggleThumbActive]} />
              </View>
            </TouchableOpacity>

            {/* PPV Price */}
            {isPPV && (
              <View style={styles.priceInput}>
                <Text style={styles.priceLabel}>Fiyat (Jeton)</Text>
                <TextInput
                  style={styles.priceField}
                  value={ppvPrice}
                  onChangeText={setPpvPrice}
                  keyboardType="numeric"
                  placeholder="50"
                  placeholderTextColor="#5a6a7e"
                />
              </View>
            )}
          </View>
        )}

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            Paylaşımlarınız topluluğa açık olacak. Uygunsuz içerik paylaşmayın.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  cancelBtn: {
    padding: 4,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ff4757',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  postBtn: {
    backgroundColor: '#00d9ff',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postBtnDisabled: {
    opacity: 0.5,
  },
  postBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
  },
  content: {
    flex: 1,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#00d9ff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 12,
    color: '#a9b6c7',
  },
  contentInput: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#ffffff',
    minHeight: 150,
    textAlignVertical: 'top',
  },
  mediaPreview: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  mediaItem: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginRight: 12,
    position: 'relative',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  videoIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoIconText: {
    fontSize: 16,
    color: '#ffffff',
  },
  removeMediaBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeMediaIcon: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '700',
  },
  mediaCount: {
    fontSize: 12,
    color: '#a9b6c7',
    marginTop: 8,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  hashtagInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#00d9ff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  hashtagHelp: {
    fontSize: 12,
    color: '#a9b6c7',
    marginTop: 6,
  },
  mediaActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  mediaActionBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  mediaActionIcon: {
    fontSize: 24,
  },
  mediaActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  creatorOptions: {
    marginHorizontal: 16,
    backgroundColor: 'rgba(131,56,236,0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(131,56,236,0.3)',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  optionDesc: {
    fontSize: 12,
    color: '#a9b6c7',
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: '#00d9ff',
    alignItems: 'flex-end',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  toggleThumbActive: {
    backgroundColor: '#ffffff',
  },
  priceInput: {
    marginTop: 12,
  },
  priceLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  priceField: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#00d9ff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,217,255,0.1)',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 32,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,217,255,0.3)',
  },
  infoIcon: {
    fontSize: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: '#00d9ff',
  },
});
