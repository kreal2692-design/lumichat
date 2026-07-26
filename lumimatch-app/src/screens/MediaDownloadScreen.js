import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';

const MediaDownloadScreen = ({ navigation, route }) => {
  const { mediaUrl, mediaType, title } = route.params || {};
  
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  const requestPermissions = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'İzin Gerekli',
          'Medya kaydetmek için depolama izni gereklidir.',
          [{ text: 'Tamam' }]
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Permission error:', error);
      Alert.alert('Hata', 'İzin alınırken bir sorun oluştu. Bu özellik emülatörde çalışmayabilir.');
      return false;
    }
  };

  const downloadMedia = async () => {
    if (!mediaUrl) {
      Alert.alert('Hata', 'İndirme linki bulunamadı.');
      return;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setDownloading(true);
    setProgress(0);

    try {
      const fileName = `LumiMatch_${Date.now()}.${mediaType === 'video' ? 'mp4' : 'jpg'}`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      // Download with progress
      const downloadResumable = FileSystem.createDownloadResumable(
        mediaUrl,
        fileUri,
        {},
        (downloadProgress) => {
          const progressPercent =
            downloadProgress.totalBytesWritten /
            downloadProgress.totalBytesExpectedToWrite;
          setProgress(Math.round(progressPercent * 100));
        }
      );

      const { uri } = await downloadResumable.downloadAsync();

      // Galeriye kaydet
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync('LumiMatch', asset, false);

      setDownloading(false);
      
      Alert.alert(
        'İndirme Başarılı! 🎉',
        'Medya galerinize kaydedildi.',
        [
          { text: 'Tamam', onPress: () => navigation.goBack() },
          {
            text: 'Paylaş',
            onPress: () => shareMedia(uri)
          }
        ]
      );
    } catch (error) {
      console.error('İndirme hatası:', error);
      setDownloading(false);
      Alert.alert('Hata', 'İndirme sırasında bir sorun oluştu. Lütfen tekrar deneyin.');
    }
  };

  const shareMedia = async (uri) => {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: mediaType === 'video' ? 'video/mp4' : 'image/jpeg',
          dialogTitle: 'Medyayı Paylaş',
        });
      } else {
        Alert.alert('Hata', 'Paylaşım özelliği bu cihazda desteklenmiyor.');
      }
    } catch (error) {
      console.error('Paylaşım hatası:', error);
      Alert.alert('Hata', 'Paylaşım sırasında bir sorun oluştu.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Medya İndir</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Media Info */}
        <View style={styles.infoCard}>
          <Text style={styles.mediaIcon}>
            {mediaType === 'video' ? '🎥' : '📸'}
          </Text>
          <Text style={styles.mediaTitle}>{title || 'İsimsiz Medya'}</Text>
          <Text style={styles.mediaType}>
            {mediaType === 'video' ? 'Video' : 'Görsel'}
          </Text>
        </View>

        {/* Download Options */}
        <View style={styles.optionsCard}>
          <TouchableOpacity
            style={[
              styles.downloadButton,
              downloading && styles.downloadButtonDisabled
            ]}
            onPress={downloadMedia}
            disabled={downloading}
          >
            {downloading ? (
              <View style={styles.downloadingContainer}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.downloadButtonText}>
                  İndiriliyor... {progress}%
                </Text>
              </View>
            ) : (
              <>
                <Text style={styles.downloadIcon}>⬇️</Text>
                <Text style={styles.downloadButtonText}>Galeriye Kaydet</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shareButton}
            onPress={() => shareMedia(mediaUrl)}
            disabled={downloading}
          >
            <Text style={styles.shareIcon}>📤</Text>
            <Text style={styles.shareButtonText}>Paylaş</Text>
          </TouchableOpacity>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>💾</Text>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoItemTitle}>Nereye Kaydedilir?</Text>
              <Text style={styles.infoItemText}>
                Medya, cihazınızın galerisinde "LumiMatch" albümüne kaydedilir.
              </Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>📱</Text>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoItemTitle}>Cihaz Depolama</Text>
              <Text style={styles.infoItemText}>
                İndirilen medya cihazınızın hafızasında yer kaplar. Yeterli 
                depolama alanınız olduğundan emin olun.
              </Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>⚖️</Text>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoItemTitle}>Telif Hakları</Text>
              <Text style={styles.infoItemText}>
                İndirdiğiniz içerikleri yalnızca kişisel kullanım için saklayın. 
                İçerik üreticisinin izni olmadan paylaşmayın.
              </Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>🔒</Text>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoItemTitle}>Gizlilik</Text>
              <Text style={styles.infoItemText}>
                İndirilen medya cihazınızın galerisinde saklanır ve yalnızca 
                siz erişebilirsiniz.
              </Text>
            </View>
          </View>
        </View>

        {/* Warning */}
        <View style={styles.warningCard}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <Text style={styles.warningText}>
            Bu özellik yalnızca kendi oluşturduğunuz içerikler veya içerik 
            üreticisinin izin verdiği medyalar için kullanılmalıdır. 
            İzinsiz içerik paylaşımı yasaklanmıştır.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0f17',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  infoCard: {
    margin: 20,
    padding: 30,
    backgroundColor: '#1e293b',
    borderRadius: 16,
    alignItems: 'center',
  },
  mediaIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  mediaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
    textAlign: 'center',
  },
  mediaType: {
    fontSize: 14,
    color: '#94a3b8',
  },
  optionsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  downloadButton: {
    backgroundColor: '#7c3aed',
    padding: 18,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  downloadButtonDisabled: {
    opacity: 0.6,
  },
  downloadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  downloadIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  shareButton: {
    backgroundColor: '#334155',
    padding: 18,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoItemTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  infoItemText: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 18,
  },
  warningCard: {
    margin: 20,
    marginTop: 0,
    padding: 15,
    backgroundColor: '#422006',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#854d0e',
    flexDirection: 'row',
  },
  warningIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#fbbf24',
    lineHeight: 18,
  },
});

export default MediaDownloadScreen;
