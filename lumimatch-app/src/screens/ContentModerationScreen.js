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
import { supabase } from '../../App';

export default function ContentModerationScreen({ navigation }) {
  const [aiModerationEnabled, setAiModerationEnabled] = useState(true);
  const [autoBlurEnabled, setAutoBlurEnabled] = useState(true);
  const [ageVerified, setAgeVerified] = useState(false);

  const handleAgeVerification = () => {
    Alert.alert(
      'Yaş Doğrulama',
      '18 yaşından büyük olduğunu onaylıyor musun?',
      [
        { text: 'Hayır', style: 'cancel' },
        {
          text: 'Evet, 18+',
          onPress: () => {
            setAgeVerified(true);
            Alert.alert('✓ Doğrulandı', 'Yaş doğrulaması tamamlandı');
          },
        },
      ]
    );
  };

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
          <Text style={styles.headerTitle}>İçerik Moderasyonu</Text>
          <View style={styles.backBtn} />
        </View>

        {/* Age Verification Card */}
        {!ageVerified ? (
          <View style={styles.warningCard}>
            <Text style={styles.warningIcon}>🔞</Text>
            <Text style={styles.warningTitle}>Yaş Doğrulama Gerekli</Text>
            <Text style={styles.warningText}>
              +18 içeriği görüntülemek için yaşınızı doğrulamalısınız
            </Text>
            <TouchableOpacity 
              style={styles.verifyBtn}
              onPress={handleAgeVerification}
            >
              <LinearGradient
                colors={['#ff006e', '#d90429']}
                style={styles.verifyGradient}
              >
                <Text style={styles.verifyText}>18+ Yaş Doğrula</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.verifiedCard}>
            <Text style={styles.verifiedIcon}>✓</Text>
            <Text style={styles.verifiedText}>Yaş Doğrulandı (18+)</Text>
          </View>
        )}

        {/* AI Moderation Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>🤖</Text>
          <Text style={styles.infoTitle}>AI İçerik Moderasyonu</Text>
          <Text style={styles.infoText}>
            Yapay zeka ile otomatik içerik kontrolü yapıyoruz:
          </Text>
          
          <View style={styles.rulesList}>
            <View style={styles.ruleItem}>
              <Text style={styles.ruleIcon}>✓</Text>
              <Text style={styles.ruleText}>
                <Text style={styles.bold}>Kısmi Çıplaklık:</Text> İZİNLİ (Bikini, mayo, iç çamaşırı)
              </Text>
            </View>

            <View style={styles.ruleItem}>
              <Text style={styles.ruleIcon}>✗</Text>
              <Text style={styles.ruleText}>
                <Text style={styles.bold}>Tam Çıplaklık:</Text> YASAK (Ücretsiz içerikte)
              </Text>
            </View>

            <View style={styles.ruleItem}>
              <Text style={styles.ruleIcon}>🔒</Text>
              <Text style={styles.ruleText}>
                <Text style={styles.bold}>Tam Çıplaklık:</Text> Sadece abone özel içerikte izinli
              </Text>
            </View>

            <View style={styles.ruleItem}>
              <Text style={styles.ruleIcon}>🚫</Text>
              <Text style={styles.ruleText}>
                <Text style={styles.bold}>Yasadışı İçerik:</Text> Kesinlikle yasak
              </Text>
            </View>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.settingsCard}>
          <Text style={styles.sectionTitle}>Moderasyon Ayarları</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>AI Moderasyon</Text>
              <Text style={styles.settingDesc}>
                Otomatik içerik kontrolü aktif
              </Text>
            </View>
            <Switch
              value={aiModerationEnabled}
              onValueChange={setAiModerationEnabled}
              trackColor={{ false: '#3a4a5e', true: '#00e5ff' }}
              thumbColor={aiModerationEnabled ? '#ffffff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Otomatik Bulanıklaştırma</Text>
              <Text style={styles.settingDesc}>
                Uygunsuz içeriği otomatik bulanıklaştır
              </Text>
            </View>
            <Switch
              value={autoBlurEnabled}
              onValueChange={setAutoBlurEnabled}
              trackColor={{ false: '#3a4a5e', true: '#00e5ff' }}
              thumbColor={autoBlurEnabled ? '#ffffff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Content Types */}
        <View style={styles.contentTypesCard}>
          <Text style={styles.sectionTitle}>İçerik Kategorileri</Text>

          <View style={styles.categoryItem}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryIcon}>🟢</Text>
              <Text style={styles.categoryTitle}>Genel İzleyici (Herkes)</Text>
            </View>
            <Text style={styles.categoryDesc}>
              Kısmi çıplaklık, mayo, bikini içerikler izinli
            </Text>
          </View>

          <View style={styles.categoryItem}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryIcon}>🟡</Text>
              <Text style={styles.categoryTitle}>18+ (Yaş Doğrulamalı)</Text>
            </View>
            <Text style={styles.categoryDesc}>
              Kısmi çıplaklık ve erotik içerik
            </Text>
          </View>

          <View style={styles.categoryItem}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryIcon}>🔴</Text>
              <Text style={styles.categoryTitle}>Sadece Aboneler</Text>
            </View>
            <Text style={styles.categoryDesc}>
              Tam çıplaklık sadece ödenen abonelik ile
            </Text>
          </View>
        </View>

        {/* Report Button */}
        <TouchableOpacity 
          style={styles.reportBtn}
          onPress={() => Alert.alert('Rapor Et', 'İçerik raporlama formu açılacak')}
        >
          <Text style={styles.reportText}>🚨 Uygunsuz İçerik Bildir</Text>
        </TouchableOpacity>

        {/* Safety Note */}
        <View style={styles.safetyNote}>
          <Text style={styles.safetyText}>
            🛡️ Güvenliğiniz bizim için önemli. AI moderasyon 7/24 aktif.
          </Text>
        </View>
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
  warningCard: {
    backgroundColor: 'rgba(255,0,110,0.1)',
    borderWidth: 2,
    borderColor: '#ff006e',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
  },
  warningIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  warningTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ff006e',
    marginBottom: 12,
  },
  warningText: {
    fontSize: 15,
    color: '#a9b6c7',
    textAlign: 'center',
    marginBottom: 24,
  },
  verifyBtn: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  verifyGradient: {
    padding: 16,
    alignItems: 'center',
  },
  verifyText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
  },
  verifiedCard: {
    backgroundColor: 'rgba(46,204,113,0.1)',
    borderWidth: 1,
    borderColor: '#2ecc71',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  verifiedIcon: {
    fontSize: 24,
    marginRight: 12,
    color: '#2ecc71',
  },
  verifiedText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2ecc71',
  },
  infoCard: {
    backgroundColor: 'rgba(10,20,30,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.25)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
  },
  infoIcon: {
    fontSize: 48,
    marginBottom: 12,
    textAlign: 'center',
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#a9b6c7',
    marginBottom: 16,
    textAlign: 'center',
  },
  rulesList: {
    gap: 12,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  ruleIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  ruleText: {
    flex: 1,
    fontSize: 14,
    color: '#a9b6c7',
    lineHeight: 20,
  },
  bold: {
    fontWeight: '700',
    color: '#ffffff',
  },
  settingsCard: {
    backgroundColor: 'rgba(10,20,30,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.25)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  settingDesc: {
    fontSize: 13,
    color: '#a9b6c7',
  },
  contentTypesCard: {
    backgroundColor: 'rgba(10,20,30,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.25)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
  },
  categoryItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  categoryDesc: {
    fontSize: 13,
    color: '#a9b6c7',
    marginLeft: 28,
  },
  reportBtn: {
    backgroundColor: 'rgba(255,0,0,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,0,0,0.3)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  reportText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ff4444',
    textAlign: 'center',
  },
  safetyNote: {
    backgroundColor: 'rgba(0,229,255,0.05)',
    borderRadius: 12,
    padding: 16,
  },
  safetyText: {
    fontSize: 13,
    color: '#00e5ff',
    textAlign: 'center',
  },
});
