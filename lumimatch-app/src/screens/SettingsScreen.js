import React, { useState, useEffect } from 'react';
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
import { supabase } from '../../App';
import { restorePurchase } from '../utils/premiumMiddleware';

export default function SettingsScreen({ navigation }) {
  const [settings, setSettings] = useState({
    notifications: true,
    messageNotifications: true,
    giftNotifications: true,
    streamNotifications: true,
    soundEffects: true,
    vibration: true,
    videoQuality: 'high', // low, medium, high
    autoPlayVideos: true,
    dataSaver: false,
    showOnlineStatus: true,
    allowFriendRequests: true,
    showGender: true,
    showAge: true,
    language: 'tr', // tr, en
    theme: 'dark', // dark, light, auto
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      if (data) setSettings(data.settings);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          settings: newSettings,
        });
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesaptan çıkmak istediğine emin misin?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut();
          },
        },
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Önbelleği Temizle',
      'Tüm önbellek verilerini temizlemek istediğine emin misin?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Temizle',
          onPress: () => {
            Alert.alert('Başarılı', 'Önbellek temizlendi');
          },
        },
      ]
    );
  };

  const handleRestorePurchase = async () => {
    await restorePurchase();
  };

  const SettingRow = ({ icon, title, subtitle, children }) => (
    <View style={styles.settingRow}>
      <View style={styles.settingLeft}>
        <Text style={styles.settingIcon}>{icon}</Text>
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {children}
    </View>
  );

  return (
    <LinearGradient
      colors={['#0b0f17', '#1a1f2e', '#0b0f17']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ayarlar</Text>
          <View style={styles.backBtn} />
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔔 Bildirimler</Text>
          
          <SettingRow 
            icon="🔔"
            title="Tüm Bildirimler"
            subtitle="Ana bildirim ayarı"
          >
            <Switch
              value={settings.notifications}
              onValueChange={(v) => updateSetting('notifications', v)}
              trackColor={{ false: '#3e4a5e', true: '#00e5ff' }}
              thumbColor="#ffffff"
            />
          </SettingRow>

          <SettingRow 
            icon="💬"
            title="Mesaj Bildirimleri"
            subtitle="Yeni mesajlar için bildirim"
          >
            <Switch
              value={settings.messageNotifications}
              onValueChange={(v) => updateSetting('messageNotifications', v)}
              trackColor={{ false: '#3e4a5e', true: '#00e5ff' }}
              thumbColor="#ffffff"
              disabled={!settings.notifications}
            />
          </SettingRow>

          <SettingRow 
            icon="🎁"
            title="Hediye Bildirimleri"
            subtitle="Hediye aldığında bildirim"
          >
            <Switch
              value={settings.giftNotifications}
              onValueChange={(v) => updateSetting('giftNotifications', v)}
              trackColor={{ false: '#3e4a5e', true: '#00e5ff' }}
              thumbColor="#ffffff"
              disabled={!settings.notifications}
            />
          </SettingRow>

          <SettingRow 
            icon="📺"
            title="Canlı Yayın Bildirimleri"
            subtitle="Takip ettiklerinden bildirim"
          >
            <Switch
              value={settings.streamNotifications}
              onValueChange={(v) => updateSetting('streamNotifications', v)}
              trackColor={{ false: '#3e4a5e', true: '#00e5ff' }}
              thumbColor="#ffffff"
              disabled={!settings.notifications}
            />
          </SettingRow>
        </View>

        {/* Video & Sound Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎬 Video & Ses</Text>
          
          <SettingRow 
            icon="🔊"
            title="Ses Efektleri"
            subtitle="Uygulama içi sesler"
          >
            <Switch
              value={settings.soundEffects}
              onValueChange={(v) => updateSetting('soundEffects', v)}
              trackColor={{ false: '#3e4a5e', true: '#00e5ff' }}
              thumbColor="#ffffff"
            />
          </SettingRow>

          <SettingRow 
            icon="📳"
            title="Titreşim"
            subtitle="Bildirim titreşimleri"
          >
            <Switch
              value={settings.vibration}
              onValueChange={(v) => updateSetting('vibration', v)}
              trackColor={{ false: '#3e4a5e', true: '#00e5ff' }}
              thumbColor="#ffffff"
            />
          </SettingRow>

          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🎥</Text>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Video Kalitesi</Text>
                <Text style={styles.settingSubtitle}>
                  {settings.videoQuality === 'high' ? 'Yüksek' : 
                   settings.videoQuality === 'medium' ? 'Orta' : 'Düşük'}
                </Text>
              </View>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <SettingRow 
            icon="📡"
            title="Veri Tasarrufu"
            subtitle="Düşük veri kullanımı"
          >
            <Switch
              value={settings.dataSaver}
              onValueChange={(v) => updateSetting('dataSaver', v)}
              trackColor={{ false: '#3e4a5e', true: '#00e5ff' }}
              thumbColor="#ffffff"
            />
          </SettingRow>
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔒 Gizlilik</Text>
          
          <SettingRow 
            icon="🟢"
            title="Çevrimiçi Durumu Göster"
            subtitle="Online/offline durumun görünsün"
          >
            <Switch
              value={settings.showOnlineStatus}
              onValueChange={(v) => updateSetting('showOnlineStatus', v)}
              trackColor={{ false: '#3e4a5e', true: '#00e5ff' }}
              thumbColor="#ffffff"
            />
          </SettingRow>

          <SettingRow 
            icon="👥"
            title="Arkadaşlık İstekleri"
            subtitle="Herkes istek gönderebilsin"
          >
            <Switch
              value={settings.allowFriendRequests}
              onValueChange={(v) => updateSetting('allowFriendRequests', v)}
              trackColor={{ false: '#3e4a5e', true: '#00e5ff' }}
              thumbColor="#ffffff"
            />
          </SettingRow>

          <TouchableOpacity 
            style={styles.settingRow}
            onPress={() => navigation.navigate('BlockedUsers')}
          >
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🚫</Text>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Engellenler</Text>
                <Text style={styles.settingSubtitle}>Engellenen kullanıcılar</Text>
              </View>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Uygulama</Text>
          
          <TouchableOpacity 
            style={styles.settingRow}
            onPress={() => navigation.navigate('CreatorCenter')}
          >
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>👑</Text>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>İçerik Oluşturucu Merkezi</Text>
                <Text style={styles.settingSubtitle}>Creator Dashboard & Stats</Text>
              </View>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingRow}
            onPress={() => navigation.navigate('EventCenter')}
          >
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🎉</Text>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Etkinlik Merkezi</Text>
                <Text style={styles.settingSubtitle}>Event Hub & Challenges</Text>
              </View>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🌍</Text>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Dil</Text>
                <Text style={styles.settingSubtitle}>
                  {settings.language === 'tr' ? 'Türkçe' : 'English'}
                </Text>
              </View>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🎨</Text>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Tema</Text>
                <Text style={styles.settingSubtitle}>
                  {settings.theme === 'dark' ? 'Koyu' : 
                   settings.theme === 'light' ? 'Açık' : 'Otomatik'}
                </Text>
              </View>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingRow}
            onPress={handleClearCache}
          >
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🗑️</Text>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Önbelleği Temizle</Text>
                <Text style={styles.settingSubtitle}>Geçici dosyaları sil</Text>
              </View>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingRow}
            onPress={handleRestorePurchase}
          >
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>💳</Text>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Satın Almaları Geri Yükle</Text>
                <Text style={styles.settingSubtitle}>Premium üyeliği geri yükle</Text>
              </View>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ Hakkında</Text>
          
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>📋</Text>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Kullanım Koşulları</Text>
              </View>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🔐</Text>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Gizlilik Politikası</Text>
              </View>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>📱</Text>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Versiyon</Text>
                <Text style={styles.settingSubtitle}>v1.3.0</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutBtn}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>🚪 Çıkış Yap</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#a9b6c7',
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(10,20,30,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.15)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#a9b6c7',
  },
  arrow: {
    fontSize: 20,
    color: '#a9b6c7',
  },
  logoutBtn: {
    backgroundColor: 'rgba(255,71,87,0.1)',
    borderWidth: 1,
    borderColor: '#ff4757',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ff4757',
  },
});
