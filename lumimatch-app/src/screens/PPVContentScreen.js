import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../App';

export default function PPVContentScreen({ route, navigation }) {
  const { content } = route.params;
  const [isUnlocked, setIsUnlocked] = useState(false);

  const handleUnlock = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Check balance
      const { data: userData } = await supabase
        .from('users')
        .select('tokens')
        .eq('id', user.id)
        .single();

      if (userData.tokens < content.price) {
        Alert.alert(
          'Yetersiz Jeton',
          `Bu içeriği açmak için ${content.price} jeton gerekli.`,
          [
            { text: 'İptal', style: 'cancel' },
            { text: 'Jeton Al', onPress: () => navigation.navigate('TokenShop') },
          ]
        );
        return;
      }

      Alert.alert(
        'İçeriği Aç',
        `${content.price}💎 jeton ile bu içeriği kalıcı olarak açmak istediğine emin misin?`,
        [
          { text: 'İptal', style: 'cancel' },
          {
            text: 'Aç',
            onPress: async () => {
              try {
                // Deduct tokens
                await supabase
                  .from('users')
                  .update({ tokens: userData.tokens - content.price })
                  .eq('id', user.id);

                // Record purchase
                await supabase
                  .from('ppv_purchases')
                  .insert({
                    user_id: user.id,
                    content_id: content.id,
                    creator_id: content.creator_id,
                    price_paid: content.price,
                  });

                // Transfer earnings to creator (70%)
                const creatorEarnings = content.price * 0.7;
                await supabase.rpc('add_creator_earnings', {
                  creator_id: content.creator_id,
                  amount: creatorEarnings,
                });

                setIsUnlocked(true);
                Alert.alert('Başarılı! 🎉', 'İçerik açıldı!');
              } catch (error) {
                console.error('Error unlocking content:', error);
                Alert.alert('Hata', 'Bir şeyler ters gitti');
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Demo Modu', 'PPV satın alma demo modda çalışmıyor');
    }
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
          <Text style={styles.headerTitle}>Özel İçerik</Text>
          <View style={styles.backBtn} />
        </View>

        {/* Content Preview */}
        {!isUnlocked ? (
          <View style={styles.lockedContainer}>
            <LinearGradient
              colors={['#ff006e', '#8338ec', '#3a86ff']}
              style={styles.lockedPreview}
            >
              <View style={styles.lockOverlay}>
                <Text style={styles.lockIcon}>🔒</Text>
                <Text style={styles.lockTitle}>Kilitli İçerik</Text>
                <Text style={styles.lockSubtitle}>
                  Bu özel içeriği görmek için açmalısın
                </Text>
              </View>
            </LinearGradient>

            {/* Content Info */}
            <View style={styles.contentInfo}>
              <Text style={styles.contentTitle}>{content.title}</Text>
              <Text style={styles.contentDescription}>
                {content.description}
              </Text>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaIcon}>👁️</Text>
                  <Text style={styles.metaText}>
                    {content.purchases_count || 0} kişi açtı
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaIcon}>⭐</Text>
                  <Text style={styles.metaText}>
                    {content.rating || 4.8}/5
                  </Text>
                </View>
              </View>
            </View>

            {/* Price Card */}
            <View style={styles.priceCard}>
              <Text style={styles.priceLabel}>Tek seferlik ödeme:</Text>
              <View style={styles.priceRow}>
                <Text style={styles.priceValue}>{content.price}</Text>
                <Text style={styles.priceIcon}>💎</Text>
              </View>
              <Text style={styles.priceNote}>
                ✓ Kalıcı erişim
              </Text>
              <Text style={styles.priceNote}>
                ✓ İndirme hakkı
              </Text>
            </View>

            {/* Unlock Button */}
            <TouchableOpacity 
              style={styles.unlockBtn}
              onPress={handleUnlock}
            >
              <LinearGradient
                colors={['#ff006e', '#d90429']}
                style={styles.unlockGradient}
              >
                <Text style={styles.unlockText}>
                  🔓 {content.price}💎 ile Aç
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Creator Info */}
            <TouchableOpacity 
              style={styles.creatorCard}
              onPress={() => navigation.navigate('CreatorProfile', { 
                creatorId: content.creator_id 
              })}
            >
              <View style={styles.creatorAvatar}>
                <Text style={styles.creatorAvatarText}>
                  {content.creator_name?.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.creatorInfo}>
                <Text style={styles.creatorName}>{content.creator_name}</Text>
                <Text style={styles.creatorSub}>İçerik Üreticisi</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.unlockedContainer}>
            <Text style={styles.unlockedTitle}>✓ İçerik Açıldı!</Text>
            <View style={styles.contentContainer}>
              {/* Burada gerçek içerik gösterilir */}
              <LinearGradient
                colors={['#2ecc71', '#27ae60']}
                style={styles.contentPreview}
              >
                <Text style={styles.contentIcon}>🎬</Text>
                <Text style={styles.contentText}>İçerik Burada</Text>
              </LinearGradient>
            </View>
          </View>
        )}
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
  lockedContainer: {
    gap: 20,
  },
  lockedPreview: {
    height: 300,
    borderRadius: 20,
    overflow: 'hidden',
  },
  lockOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  lockTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 8,
  },
  lockSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  contentInfo: {
    gap: 12,
  },
  contentTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
  },
  contentDescription: {
    fontSize: 15,
    color: '#a9b6c7',
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaIcon: {
    fontSize: 16,
  },
  metaText: {
    fontSize: 14,
    color: '#a9b6c7',
  },
  priceCard: {
    backgroundColor: 'rgba(0,229,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.3)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 14,
    color: '#a9b6c7',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  priceValue: {
    fontSize: 48,
    fontWeight: '900',
    color: '#00e5ff',
  },
  priceIcon: {
    fontSize: 32,
  },
  priceNote: {
    fontSize: 13,
    color: '#00e5ff',
    marginBottom: 4,
  },
  unlockBtn: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  unlockGradient: {
    padding: 20,
    alignItems: 'center',
  },
  unlockText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
  },
  creatorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10,20,30,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.25)',
    borderRadius: 16,
    padding: 16,
  },
  creatorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,229,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  creatorAvatarText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#00e5ff',
  },
  creatorInfo: {
    flex: 1,
  },
  creatorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  creatorSub: {
    fontSize: 12,
    color: '#a9b6c7',
  },
  arrow: {
    fontSize: 24,
    color: '#a9b6c7',
  },
  unlockedContainer: {
    gap: 20,
  },
  unlockedTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#2ecc71',
    textAlign: 'center',
  },
  contentContainer: {
    gap: 16,
  },
  contentPreview: {
    height: 400,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  contentText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
});
