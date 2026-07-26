import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DEMO_MODE, DEMO_USER } from '../data/demoData';

export default function EnhancedSettingsScreen({ navigation }) {
  const [settings, setSettings] = useState({
    // Privacy
    showOnlineStatus: true,
    allowMessages: true,
    showLastSeen: true,
    privateAccount: false,
    
    // Notifications
    pushEnabled: true,
    emailNotifications: true,
    messageNotifications: true,
    liveNotifications: true,
    postLikeNotifications: false,
    
    // Content
    safeMode: true,
    adultContent: false,
    explicitLanguage: false,
    
    // App
    language: 'tr',
    theme: 'dark',
    autoPlay: true,
    dataSaver: false,
  });

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const renderSection = (title, icon) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionIcon}>{icon}</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  const renderToggle = (label, key, description) => (
    <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingLabel}>{label}</Text>
        {description && (
          <Text style={styles.settingDesc}>{description}</Text>
        )}
      </View>
      <Switch
        value={settings[key]}
        onValueChange={() => toggleSetting(key)}
        trackColor={{ false: '#3e3e3e', true: '#00d9ff' }}
        thumbColor={settings[key] ? '#ffffff' : '#f4f3f4'}
      />
    </View>
  );

  const renderButton = (label, onPress, icon, color = '#00d9ff') => (
    <TouchableOpacity
      style={[styles.actionButton, { borderColor: color + '40' }]}
      onPress={onPress}
    >
      <Text style={styles.actionIcon}>{icon}</Text>
      <Text style={[styles.actionLabel, { color }]}>{label}</Text>
      <Text style={styles.actionArrow}>›</Text>
    </TouchableOpacity>
  );

  const handleDeleteAccount = () => {
    Alert.alert(
      'Hesabı Sil',
      'Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Başarılı', 'Hesabınız silinecek. Hoşça kalın!');
          },
        },
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert('Önbellek Temizlendi', '250 MB alan boşaltıldı');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#0a0e1a', '#1a1f2e']} style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Ayarlar</Text>

        <TouchableOpacity
          style={styles.saveBtn}
          onPress={() => Alert.alert('Kaydedildi', 'Ayarlarınız güncellendi')}
        >
          <Text style={styles.saveText}>Kaydet</Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Privacy Settings */}
        {renderSection('Gizlilik', '🔒')}
        <View style={styles.section}>
          {renderToggle('Çevrimiçi Durumunu Göster', 'showOnlineStatus', 'Diğerleri senin çevrimiçi olduğunu görsün')}
          {renderToggle('Son Görülme', 'showLastSeen', 'Son görülme zamanını paylaş')}
          {renderToggle('Mesajlara İzin Ver', 'allowMessages', 'Herkes sana mesaj gönderebilsin')}
          {renderToggle('Özel Hesap', 'privateAccount', 'Sadece takipçilerin içeriklerini görsün')}
        </View>

        {/* Notification Settings */}
        {renderSection('Bildirimler', '🔔')}
        <View style={styles.section}>
          {renderToggle('Push Bildirimleri', 'pushEnabled', 'Telefon bildirimleri')}
          {renderToggle('Email Bildirimleri', 'emailNotifications', 'Önemli güncellemeler email ile gelsin')}
          {renderToggle('Mesaj Bildirimleri', 'messageNotifications', 'Yeni mesaj geldiğinde bildir')}
          {renderToggle('Canlı Yayın Bildirimleri', 'liveNotifications', 'Takip ettiklerin yayına başladığında')}
          {renderToggle('Beğeni Bildirimleri', 'postLikeNotifications', 'Gönderilerine beğeni gelince')}
        </View>

        {/* Content Settings */}
        {renderSection('İçerik', '🎭')}
        <View style={styles.section}>
          {renderToggle('Güvenli Mod', 'safeMode', 'Hassas içerikleri filtrele')}
          {renderToggle('Yetişkin İçerik', 'adultContent', '18+ içerikleri göster (18 yaş+)')}
          {renderToggle('Küfür Filtresi Kapat', 'explicitLanguage', 'Küfürlü içerikler gösterilsin')}
        </View>

        {/* App Settings */}
        {renderSection('Uygulama', '⚙️')}
        <View style={styles.section}>
          {renderToggle('Otomatik Oynat', 'autoPlay', 'Videolar otomatik başlasın')}
          {renderToggle('Veri Tasarrufu', 'dataSaver', 'Düşük kalitede yükle')}
          
          {renderButton('Dil Seçimi', () => Alert.alert('Dil', 'Türkçe'), '🌍')}
          {renderButton('Tema', () => Alert.alert('Tema', 'Karanlık Mod'), '🎨')}
        </View>

        {/* Account Management */}
        {renderSection('Hesap Yönetimi', '👤')}
        <View style={styles.section}>
          {renderButton('Şifre Değiştir', () => Alert.alert('Şifre Değiştir', 'Yeni şifrenizi girin'), '🔑')}
          {renderButton('Email Değiştir', () => Alert.alert('Email', 'Yeni email adresinizi girin'), '📧')}
          {renderButton('Telefon Numarası', () => Alert.alert('Telefon', '+90 --- --- -- --'), '📱')}
          {renderButton('İki Faktörlü Doğrulama', () => Alert.alert('2FA', 'Ekstra güvenlik ekle'), '🛡️', '#2ecc71')}
        </View>

        {/* Blocked & Reported */}
        {renderSection('Engelleme & Şikayet', '🚫')}
        <View style={styles.section}>
          {renderButton('Engellenen Kullanıcılar', () => navigation.navigate('ReportBlock'), '🚫', '#ff6b6b')}
          {renderButton('Şikayetlerim', () => Alert.alert('Şikayetler', '0 aktif şikayet'), '📋')}
        </View>

        {/* Support & Legal */}
        {renderSection('Destek & Yasal', 'ℹ️')}
        <View style={styles.section}>
          {renderButton('Yardım Merkezi', () => Alert.alert('Yardım', 'help.lumimatch.app'), '❓')}
          {renderButton('Gizlilik Politikası', () => Alert.alert('Gizlilik Politikası', 'privacy.lumimatch.app'), '📄')}
          {renderButton('Kullanım Koşulları', () => Alert.alert('Koşullar', 'terms.lumimatch.app'), '📜')}
          {renderButton('Topluluk Kuralları', () => Alert.alert('Kurallar', 'community.lumimatch.app'), '👥')}
        </View>

        {/* Data & Storage */}
        {renderSection('Veri & Depolama', '💾')}
        <View style={styles.section}>
          {renderButton('Önbelleği Temizle', handleClearCache, '🗑️')}
          {renderButton('İndirilen Medyalar', () => Alert.alert('Medyalar', '150 MB'), '📦')}
          {renderButton('Veri Kullanımı', () => Alert.alert('Veri', 'Bu ay: 1.2 GB'), '📊')}
        </View>

        {/* About */}
        {renderSection('Hakkında', 'ℹ️')}
        <View style={styles.section}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Versiyon</Text>
            <Text style={styles.infoValue}>2.5.0 (Backend Integration)</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Build</Text>
            <Text style={styles.infoValue}>24</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mode</Text>
            <Text style={styles.infoValue}>{DEMO_MODE ? 'Demo' : 'Production'}</Text>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => {
            Alert.alert('Çıkış Yap', 'Çıkış yapmak istediğinize emin misiniz?', [
              { text: 'İptal', style: 'cancel' },
              {
                text: 'Çıkış Yap',
                style: 'destructive',
                onPress: () => navigation.replace('Auth'),
              },
            ]);
          }}
        >
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutText}>Çıkış Yap</Text>
        </TouchableOpacity>

        {/* Delete Account */}
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={handleDeleteAccount}
        >
          <Text style={styles.deleteIcon}>⚠️</Text>
          <Text style={styles.deleteText}>Hesabı Sil</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2026 LumiMatch. Tüm hakları saklıdır.
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
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: '#ffffff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(0,217,255,0.2)',
  },
  saveText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00d9ff',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 12,
  },
  sectionIcon: {
    fontSize: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  section: {
    backgroundColor: 'rgba(26,31,46,0.6)',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  settingDesc: {
    fontSize: 12,
    color: '#a9b6c7',
    lineHeight: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
    borderWidth: 1,
  },
  actionIcon: {
    fontSize: 20,
  },
  actionLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  actionArrow: {
    fontSize: 24,
    color: '#a9b6c7',
    fontWeight: '300',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  infoLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  infoValue: {
    fontSize: 15,
    color: '#a9b6c7',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,107,107,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.3)',
  },
  logoutIcon: {
    fontSize: 20,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ff6b6b',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,71,87,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,71,87,0.3)',
  },
  deleteIcon: {
    fontSize: 20,
  },
  deleteText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ff4757',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 12,
    color: '#5a6a7e',
  },
});
