import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../App';

export default function ReferralScreen({ navigation }) {
  const [referralCode, setReferralCode] = useState('');
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get user referral code
      const { data: userData } = await supabase
        .from('users')
        .select('referral_code')
        .eq('id', user.id)
        .single();
      
      setReferralCode(userData?.referral_code || user.id.slice(0, 8).toUpperCase());

      // Get referral stats
      const { data: referrals } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.id);

      setTotalReferrals(referrals?.length || 0);
      
      const earned = referrals?.reduce((sum, ref) => sum + (ref.reward || 50), 0) || 0;
      setTotalEarned(earned);
    } catch (error) {
      console.error('Error loading referral data:', error);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `🎉 LumiMatch'e katıl ve 50💎 BEDAVA kazan!\n\nReferans kodum: ${referralCode}\n\nBu kod ile kayıt olduğunda ikimiz de 50💎 kazanıyoruz!\n\nhttps://lumimatch.net/ref/${referralCode}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleCopyCode = () => {
    Alert.alert('✓ Kopyalandı', 'Referans kodun kopyalandı!');
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
          <Text style={styles.headerTitle}>Referans Sistemi</Text>
          <View style={styles.backBtn} />
        </View>

        {/* Hero Card */}
        <View style={styles.heroCard}>
          <LinearGradient
            colors={['#ff006e', '#8338ec', '#3a86ff']}
            style={styles.heroGradient}
          >
            <Text style={styles.heroIcon}>🎁</Text>
            <Text style={styles.heroTitle}>Arkadaşını Getir,</Text>
            <Text style={styles.heroTitle}>İkiniz de Kazanın!</Text>
            <Text style={styles.heroSubtitle}>
              Her arkadaşın için 50💎 kazan
            </Text>
          </LinearGradient>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalReferrals}</Text>
            <Text style={styles.statLabel}>Davet Ettiklerim</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalEarned}💎</Text>
            <Text style={styles.statLabel}>Kazandığım</Text>
          </View>
        </View>

        {/* Referral Code */}
        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>Senin Referans Kodun</Text>
          <View style={styles.codeBox}>
            <Text style={styles.codeText}>{referralCode}</Text>
          </View>
          <TouchableOpacity 
            style={styles.copyBtn}
            onPress={handleCopyCode}
          >
            <Text style={styles.copyText}>📋 Kodu Kopyala</Text>
          </TouchableOpacity>
        </View>

        {/* Share Button */}
        <TouchableOpacity 
          style={styles.shareBtn}
          onPress={handleShare}
        >
          <LinearGradient
            colors={['#ff006e', '#d90429']}
            style={styles.shareGradient}
          >
            <Text style={styles.shareText}>🚀 Arkadaşlarına Gönder</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* How it works */}
        <View style={styles.howItWorksCard}>
          <Text style={styles.sectionTitle}>Nasıl Çalışır?</Text>
          
          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Paylaş</Text>
              <Text style={styles.stepText}>
                Referans kodunu arkadaşlarınla paylaş
              </Text>
            </View>
          </View>

          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Kayıt Olsun</Text>
              <Text style={styles.stepText}>
                Arkadaşın kodunla kayıt olsun
              </Text>
            </View>
          </View>

          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>İkiniz de Kazanın!</Text>
              <Text style={styles.stepText}>
                Sen 50💎, arkadaşın 50💎 alır
              </Text>
            </View>
          </View>
        </View>

        {/* Bonus Info */}
        <View style={styles.bonusCard}>
          <Text style={styles.bonusIcon}>⭐</Text>
          <Text style={styles.bonusTitle}>Premium Bonus!</Text>
          <Text style={styles.bonusText}>
            Premium üyeler her davet için <Text style={styles.highlight}>100💎</Text> kazanır!
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
  heroCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
  },
  heroGradient: {
    padding: 32,
    alignItems: 'center',
  },
  heroIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(10,20,30,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.25)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#00e5ff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#a9b6c7',
  },
  codeCard: {
    backgroundColor: 'rgba(10,20,30,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.25)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
  },
  codeLabel: {
    fontSize: 14,
    color: '#a9b6c7',
    textAlign: 'center',
    marginBottom: 12,
  },
  codeBox: {
    backgroundColor: 'rgba(0,229,255,0.1)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  codeText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#00e5ff',
    textAlign: 'center',
    letterSpacing: 4,
  },
  copyBtn: {
    backgroundColor: 'rgba(0,229,255,0.2)',
    borderRadius: 12,
    padding: 12,
  },
  copyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00e5ff',
    textAlign: 'center',
  },
  shareBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  shareGradient: {
    padding: 20,
    alignItems: 'center',
  },
  shareText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
  },
  howItWorksCard: {
    backgroundColor: 'rgba(10,20,30,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.25)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 20,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,229,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#00e5ff',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  stepText: {
    fontSize: 14,
    color: '#a9b6c7',
    lineHeight: 20,
  },
  bonusCard: {
    backgroundColor: 'rgba(255,215,0,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  bonusIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  bonusTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffd700',
    marginBottom: 8,
  },
  bonusText: {
    fontSize: 14,
    color: '#a9b6c7',
    textAlign: 'center',
  },
  highlight: {
    color: '#ffd700',
    fontWeight: '900',
  },
});
