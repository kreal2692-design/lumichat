import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Modal,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../theme';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - (SPACING.lg * 3)) / 2;

// Countries
const COUNTRIES = [
  { code: 'TR', name: 'Turkey', flag: '🇹🇷' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'US', name: 'USA', flag: '🇺🇸' },
  { code: 'GB', name: 'UK', flag: '🇬🇧' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
];

// Demo Users
const DEMO_USERS = [
  {
    id: '1',
    name: 'Emma',
    age: 24,
    country: 'TR',
    avatar: 'https://i.pravatar.cc/300?img=1',
    is_verified: true,
    is_online: true,
    price: 95,
    tags: ['🎨 Sanat', '🎵 Müzik'],
  },
  {
    id: '2',
    name: 'Sophie',
    age: 26,
    country: 'DE',
    avatar: 'https://i.pravatar.cc/300?img=5',
    is_verified: true,
    is_online: true,
    price: 120,
    tags: ['💃 Dans', '📸 Fotoğraf'],
  },
  {
    id: '3',
    name: 'Mia',
    age: 23,
    country: 'ES',
    avatar: 'https://i.pravatar.cc/300?img=9',
    is_verified: false,
    is_online: true,
    price: 85,
    tags: ['✈️ Seyahat', '🍕 Yemek'],
  },
  {
    id: '4',
    name: 'Olivia',
    age: 25,
    country: 'FR',
    avatar: 'https://i.pravatar.cc/300?img=10',
    is_verified: true,
    is_online: false,
    price: 110,
    tags: ['📚 Kitap', '☕ Kahve'],
  },
];

export default function VideoMatchScreenModern({ navigation }) {
  const [activeTab, setActiveTab] = useState('popular'); // popular, new, following
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [selectedGender, setSelectedGender] = useState('all'); // all, female, male
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [users, setUsers] = useState(DEMO_USERS);
  const [loading, setLoading] = useState(false);
  const [userTokens, setUserTokens] = useState(500);

  const handleVideoCall = (user) => {
    Alert.alert(
      `📹 ${user.name} ile Görüşme`,
      `Dakika başı ${user.price}💎 ücretlendirilecektir. Devam etmek istiyor musunuz?`,
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Başlat', 
          onPress: () => navigation.navigate('VideoCall', { creator: user })
        }
      ]
    );
  };

  const handleMessage = (user) => {
    navigation.navigate('Chat', { friendId: user.id, friend: user });
  };

  const renderUserCard = ({ item, index }) => (
    <View style={styles.userCard}>
      {/* User Image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.avatar }} style={styles.userImage} />
        
        {/* Online Status */}
        {item.is_online && (
          <View style={styles.onlineBadge}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Online</Text>
          </View>
        )}

        {/* Price Badge */}
        <LinearGradient
          colors={['#FFD700', '#FFA500']}
          style={styles.priceBadge}
        >
          <Text style={styles.priceIcon}>💰</Text>
          <Text style={styles.priceText}>{item.price}/dk</Text>
        </LinearGradient>

        {/* Verified Badge */}
        {item.is_verified && (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedIcon}>✓</Text>
          </View>
        )}
      </View>

      {/* User Info */}
      <View style={styles.userInfo}>
        <View style={styles.userNameRow}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userAge}>{item.age}</Text>
        </View>
        
        <Text style={styles.userCountry}>
          {COUNTRIES.find(c => c.code === item.country)?.flag} {item.country}
        </Text>

        {/* Tags */}
        <View style={styles.tagsRow}>
          {item.tags.slice(0, 2).map((tag, idx) => (
            <View key={idx} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity 
          style={styles.actionBtn}
          onPress={() => handleMessage(item)}
        >
          <Text style={styles.actionIcon}>💬</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionBtn, styles.actionBtnPrimary]}
          onPress={() => handleVideoCall(item)}
        >
          <LinearGradient
            colors={[COLORS.primary.blue, COLORS.primary.purple]}
            style={styles.actionBtnGradient}
          >
            <Text style={styles.actionIcon}>📹</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.background.secondary, COLORS.background.primary]}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Video Match</Text>

          <TouchableOpacity style={styles.filterBtn} onPress={() => setShowFilterModal(true)}>
            <Text style={styles.filterIcon}>🔍</Text>
          </TouchableOpacity>
        </View>

        {/* Token Balance */}
        <View style={styles.tokenCard}>
          <LinearGradient
            colors={[COLORS.primary.purple + '30', COLORS.primary.blue + '30']}
            style={styles.tokenGradient}
          >
            <Text style={styles.tokenIcon}>💎</Text>
            <Text style={styles.tokenAmount}>{userTokens}</Text>
            <Text style={styles.tokenLabel}>Jeton</Text>
            <TouchableOpacity style={styles.buyTokenBtn}>
              <Text style={styles.buyTokenText}>+</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'popular' && styles.tabActive]}
            onPress={() => setActiveTab('popular')}
          >
            <Text style={styles.tabIcon}>🔥</Text>
            <Text style={[styles.tabText, activeTab === 'popular' && styles.tabTextActive]}>
              Popüler
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'new' && styles.tabActive]}
            onPress={() => setActiveTab('new')}
          >
            <Text style={styles.tabIcon}>✨</Text>
            <Text style={[styles.tabText, activeTab === 'new' && styles.tabTextActive]}>
              Yeni
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'following' && styles.tabActive]}
            onPress={() => setActiveTab('following')}
          >
            <Text style={styles.tabIcon}>❤️</Text>
            <Text style={[styles.tabText, activeTab === 'following' && styles.tabTextActive]}>
              Takip
            </Text>
          </TouchableOpacity>
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          <TouchableOpacity 
            style={styles.countryFilter}
            onPress={() => setShowCountryModal(true)}
          >
            <Text style={styles.countryFlag}>{selectedCountry.flag}</Text>
            <Text style={styles.countryName}>{selectedCountry.name}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterChip, selectedGender === 'all' && styles.filterChipActive]}
            onPress={() => setSelectedGender('all')}
          >
            <Text style={[styles.filterChipText, selectedGender === 'all' && styles.filterChipTextActive]}>
              Tümü
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterChip, selectedGender === 'female' && styles.filterChipActive]}
            onPress={() => setSelectedGender('female')}
          >
            <Text style={[styles.filterChipText, selectedGender === 'female' && styles.filterChipTextActive]}>
              👩 Kadın
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterChip, selectedGender === 'male' && styles.filterChipActive]}
            onPress={() => setSelectedGender('male')}
          >
            <Text style={[styles.filterChipText, selectedGender === 'male' && styles.filterChipTextActive]}>
              👨 Erkek
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>

      {/* Users Grid */}
      {loading ? (
        <LoadingSpinner />
      ) : users.length > 0 ? (
        <FlatList
          data={users}
          renderItem={renderUserCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.gridContent}
          columnWrapperStyle={styles.gridRow}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <EmptyState
          icon="🔍"
          title="Kullanıcı bulunamadı"
          subtitle="Farklı filtreler deneyin"
        />
      )}

      {/* Country Modal */}
      <Modal
        visible={showCountryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCountryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ülke Seç</Text>
              <TouchableOpacity onPress={() => setShowCountryModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.countriesList}>
              {COUNTRIES.map((country) => (
                <TouchableOpacity
                  key={country.code}
                  style={[
                    styles.countryItem,
                    selectedCountry.code === country.code && styles.countryItemActive
                  ]}
                  onPress={() => {
                    setSelectedCountry(country);
                    setShowCountryModal(false);
                  }}
                >
                  <Text style={styles.countryItemFlag}>{country.flag}</Text>
                  <Text style={styles.countryItemName}>{country.name}</Text>
                  {selectedCountry.code === country.code && (
                    <Text style={styles.countryItemCheck}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },

  // Header
  header: {
    paddingTop: 50,
    paddingBottom: SPACING.md,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 18,
    color: COLORS.text.primary,
  },
  headerTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text.primary,
  },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterIcon: {
    fontSize: 18,
  },

  // Token Card
  tokenCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderRadius: 16,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  tokenGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.primary.purple + '40',
  },
  tokenIcon: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  tokenAmount: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text.primary,
    marginRight: SPACING.xs,
  },
  tokenLabel: {
    fontSize: 14,
    color: COLORS.text.secondary,
    flex: 1,
  },
  buyTokenBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary.purple,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyTokenText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.inverse,
  },

  // Tabs
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: SPACING.sm,
    borderRadius: 12,
    backgroundColor: COLORS.background.tertiary,
  },
  tabActive: {
    backgroundColor: COLORS.primary.blue,
  },
  tabIcon: {
    fontSize: 16,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  tabTextActive: {
    color: COLORS.text.inverse,
    fontWeight: '700',
  },

  // Filters
  filtersContainer: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  countryFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.background.tertiary,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  countryFlag: {
    fontSize: 18,
  },
  countryName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.background.tertiary,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary.purple,
    borderColor: COLORS.primary.purple,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  filterChipTextActive: {
    color: COLORS.text.inverse,
  },

  // Grid
  gridContent: {
    padding: SPACING.lg,
  },
  gridRow: {
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },

  // User Card
  userCard: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.background.secondary,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border.light,
    ...SHADOWS.medium,
  },
  imageContainer: {
    position: 'relative',
    aspectRatio: 0.75,
  },
  userImage: {
    width: '100%',
    height: '100%',
  },
  onlineBadge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.text.inverse,
  },
  onlineText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.text.inverse,
  },
  priceBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priceIcon: {
    fontSize: 12,
  },
  priceText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#000',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.sm,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary.blue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedIcon: {
    fontSize: 14,
    color: COLORS.text.inverse,
    fontWeight: '800',
  },

  // User Info
  userInfo: {
    padding: SPACING.md,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  userAge: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary.pink,
  },
  userCountry: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: COLORS.background.tertiary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 10,
    color: COLORS.text.secondary,
  },

  // Actions
  actionsRow: {
    flexDirection: 'row',
    padding: SPACING.md,
    paddingTop: 0,
    gap: SPACING.sm,
  },
  actionBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnPrimary: {
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  actionBtnGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  actionIcon: {
    fontSize: 20,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: COLORS.background.secondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  modalTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
  },
  modalClose: {
    fontSize: 24,
    color: COLORS.text.secondary,
  },
  countriesList: {
    padding: SPACING.lg,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.md,
    borderRadius: 12,
    backgroundColor: COLORS.background.tertiary,
    marginBottom: SPACING.sm,
  },
  countryItemActive: {
    backgroundColor: COLORS.primary.blue + '30',
    borderWidth: 2,
    borderColor: COLORS.primary.blue,
  },
  countryItemFlag: {
    fontSize: 28,
  },
  countryItemName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  countryItemCheck: {
    fontSize: 20,
    color: COLORS.primary.blue,
  },
});
