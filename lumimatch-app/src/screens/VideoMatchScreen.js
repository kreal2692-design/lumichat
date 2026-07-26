import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  Modal,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { creatorService } from '../services/supabaseService';
// import { botService } from '../services/botService'; // TODO: Backend hazır olunca aktif et

const { width } = Dimensions.get('window');

// Ülkeler
const COUNTRIES = [
  { code: 'TR', name: 'Turkey', flag: '🇹🇷' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'US', name: 'USA', flag: '🇺🇸' },
  { code: 'GB', name: 'UK', flag: '🇬🇧' },
];

// Filtreler - Temel (Ücretsiz)
const FREE_FILTERS = ['Tümü', 'Çevrimiçi', 'Erkek', 'Her İkisi'];

// Premium Filtreler (Jetonla erişim)
const PREMIUM_FILTERS = [
  { id: 'gender', name: 'Kadın Filtresi', icon: '👩', cost: 9, values: ['Sadece Kadın'] },
];

export default function VideoMatchScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('popular'); // popular, new, following
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [selectedFilter, setSelectedFilter] = useState('Tümü');
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [activeFilters, setActiveFilters] = useState({}); // { age: '18-24', gender: 'Kadın' }
  const [userTokens, setUserTokens] = useState(500); // Kullanıcının mevcut jetonları (backend'den gelecek)
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [activeTab, selectedCountry, selectedFilter, activeFilters]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const filters = {
        country: selectedCountry.code,
        is_online: selectedFilter === 'Çevrimiçi' ? true : undefined,
        gender: selectedFilter === 'Erkek' ? 'male' : 
                selectedFilter === 'Her İkisi' ? undefined :
                activeFilters.gender === 'Sadece Kadın' ? 'female' : undefined,
        orderBy: activeTab === 'popular' ? 'followers_count' : 
                 activeTab === 'new' ? 'created_at' : 
                 'followers_count',
        limit: 20,
      };

      const { data, error } = await creatorService.getCreators(filters);
      
      if (error) {
        console.error('Error loading users:', error);
        return;
      }

      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoCall = (user) => {
    // Video Match'ten yapılan aramalar ÜCRETLİDİR (ücretsiz hak YOK)
    // Filtreleri VideoCall ekranına ilet
    navigation.navigate('VideoCall', { 
      creator: user,
      cost: user.pricing?.videoCall?.pricePerMinute || 50,
      genderFilter: selectedFilter === 'Erkek' ? 'Erkek' : 
                    selectedFilter === 'Her İkisi' ? 'Her İkisi' :
                    activeFilters.gender || 'Tümü',
      countryFilter: selectedCountry.code,
      ageFilter: activeFilters.age,
    });
  };

  const handleMessage = (user) => {
    navigation.navigate('Chat', { 
      friendId: user.id,
      friend: user, // friend parametresi eklendi - crash fix
      pricing: {
        freeMessages: 2, // 2 ücretsiz mesaj (3'ten düşürüldü)
        pricePerMessage: user.pricing?.message?.pricePerMessage || 10,
      },
    });
  };

  const handleUserDetail = (user) => {
    navigation.navigate('VideoMatchDetail', { user });
  };

  const handlePremiumFilter = (filter, value) => {
    // Eğer filtre zaten aktifse, kaldır (jeton iadesi yok)
    if (activeFilters[filter.id] === value) {
      const newFilters = { ...activeFilters };
      delete newFilters[filter.id];
      setActiveFilters(newFilters);
      return;
    }

    // Jeton kontrolü
    if (userTokens < filter.cost) {
      Alert.alert(
        'Yetersiz Jeton 💎',
        `Bu filtreyi kullanmak için ${filter.cost} jetona ihtiyacınız var. Mevcut jetonunuz: ${userTokens}`,
        [
          { text: 'İptal', style: 'cancel' },
          { text: 'Jeton Al', onPress: () => navigation.navigate('Purchase') }
        ]
      );
      return;
    }

    // Filtreyi aktif et ve jeton düş
    Alert.alert(
      `${filter.icon} ${filter.name} Filtresi`,
      `"${value}" filtresi için ${filter.cost}💎 harcanacak. Onaylıyor musunuz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Onayla',
          onPress: () => {
            setActiveFilters({ ...activeFilters, [filter.id]: value });
            setUserTokens(userTokens - filter.cost);
            // TODO: Backend'e filtre kullanımını kaydet
            loadUsers();
          }
        }
      ]
    );
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    loadUsers();
  };

  const getActiveFilterCount = () => {
    return Object.keys(activeFilters).length;
  };

  const renderUserCard = ({ item, index }) => {
    const isOnline = Math.random() > 0.5;
    const price = item.pricing?.videoCall?.pricePerMinute || Math.floor(Math.random() * 150) + 90;

    return (
      <TouchableOpacity
        style={styles.userCard}
        onPress={() => handleUserDetail(item)}
        activeOpacity={0.9}
      >
        {/* Photo */}
        <View style={styles.userPhotoContainer}>
          <Image source={{ uri: item.avatar }} style={styles.userPhoto} />
          
          {/* Online Status */}
          <View style={[styles.onlineIndicator, !isOnline && styles.offlineIndicator]}>
            <Text style={styles.onlineText}>{isOnline ? 'online' : 'offline'}</Text>
          </View>

          {/* Price Badge */}
          <View style={styles.priceBadge}>
            <Text style={styles.priceIcon}>💰</Text>
            <Text style={styles.priceText}>{price}/min</Text>
          </View>
        </View>

        {/* User Info */}
        <View style={styles.userInfo}>
          <View style={styles.userNameRow}>
            <Text style={styles.userName}>{item.name}</Text>
            {item.is_verified && <Text style={styles.verifiedBadge}>✓</Text>}
          </View>

          <View style={styles.userMetaRow}>
            <Text style={styles.userAge}>{item.age}</Text>
            <Text style={styles.userCountry}>
              {selectedCountry.flag} {selectedCountry.name}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.userActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleMessage(item)}
          >
            <View style={styles.actionBtnCircle}>
              <Text style={styles.actionBtnIcon}>💬</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnPrimary]}
            onPress={() => handleVideoCall(item)}
          >
            <View style={[styles.actionBtnCircle, styles.actionBtnCirclePrimary]}>
              <Text style={styles.actionBtnIcon}>📹</Text>
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#1a1f2e', '#0a0e1a']} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>

          {/* Tabs */}
          <View style={styles.headerTabs}>
            <TouchableOpacity
              style={[styles.headerTab, activeTab === 'popular' && styles.headerTabActive]}
              onPress={() => setActiveTab('popular')}
            >
              <Text style={[styles.headerTabText, activeTab === 'popular' && styles.headerTabTextActive]}>
                Popüler
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.headerTab, activeTab === 'new' && styles.headerTabActive]}
              onPress={() => setActiveTab('new')}
            >
              <Text style={[styles.headerTabText, activeTab === 'new' && styles.headerTabTextActive]}>
                Yeni
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.headerTab, activeTab === 'following' && styles.headerTabActive]}
              onPress={() => setActiveTab('following')}
            >
              <Text style={[styles.headerTabText, activeTab === 'following' && styles.headerTabTextActive]}>
                Takip etti
              </Text>
            </TouchableOpacity>
          </View>

          {/* Country Selector */}
          <TouchableOpacity
            style={styles.countryBtn}
            onPress={() => setShowCountryModal(true)}
          >
            <Text style={styles.countryFlag}>{selectedCountry.flag}</Text>
          </TouchableOpacity>

          {/* Settings */}
          <TouchableOpacity 
            style={styles.settingsBtn}
            onPress={() => setShowFiltersModal(true)}
          >
            <Text style={styles.settingsIcon}>🔍</Text>
            {getActiveFilterCount() > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{getActiveFilterCount()}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Token Balance */}
        <View style={styles.tokenBalance}>
          <Text style={styles.tokenIcon}>💎</Text>
          <Text style={styles.tokenText}>{userTokens} Jeton</Text>
          <TouchableOpacity 
            style={styles.buyTokenBtn}
            onPress={() => navigation.navigate('Purchase')}
          >
            <Text style={styles.buyTokenText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          {FREE_FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterBtn,
                selectedFilter === filter && styles.filterBtnActive,
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === filter && styles.filterTextActive,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
          
          {/* Premium Filters Button */}
          <TouchableOpacity
            style={styles.premiumFilterBtn}
            onPress={() => setShowFiltersModal(true)}
          >
            <Text style={styles.premiumFilterIcon}>⭐</Text>
            <Text style={styles.premiumFilterText}>Premium Filtreler</Text>
            {getActiveFilterCount() > 0 && (
              <View style={styles.premiumFilterBadge}>
                <Text style={styles.premiumFilterBadgeText}>{getActiveFilterCount()}</Text>
              </View>
            )}
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>

      {/* Users Grid */}
      <FlatList
        data={users}
        renderItem={renderUserCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.usersGrid}
        columnWrapperStyle={styles.usersRow}
        showsVerticalScrollIndicator={false}
      />

      {/* Country Modal */}
      <Modal
        visible={showCountryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCountryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.countryModal}>
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
                    selectedCountry.code === country.code && styles.countryItemActive,
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

      {/* Premium Filters Modal */}
      <Modal
        visible={showFiltersModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFiltersModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.filtersModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>⭐ Premium Filtreler</Text>
              <TouchableOpacity onPress={() => setShowFiltersModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Token Balance in Modal */}
            <View style={styles.modalTokenBalance}>
              <Text style={styles.modalTokenIcon}>💎</Text>
              <Text style={styles.modalTokenText}>Mevcut Jeton: {userTokens}</Text>
              <TouchableOpacity 
                style={styles.modalBuyBtn}
                onPress={() => {
                  setShowFiltersModal(false);
                  navigation.navigate('Purchase');
                }}
              >
                <Text style={styles.modalBuyText}>Jeton Al</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filtersList}>
              {/* Active Filters Summary */}
              {getActiveFilterCount() > 0 && (
                <View style={styles.activeFiltersSection}>
                  <View style={styles.activeFiltersHeader}>
                    <Text style={styles.activeFiltersTitle}>Aktif Filtreler ({getActiveFilterCount()})</Text>
                    <TouchableOpacity onPress={clearAllFilters}>
                      <Text style={styles.clearFiltersBtn}>Tümünü Temizle</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.activeFiltersList}>
                    {Object.entries(activeFilters).map(([key, value]) => {
                      const filter = PREMIUM_FILTERS.find(f => f.id === key);
                      return (
                        <View key={key} style={styles.activeFilterChip}>
                          <Text style={styles.activeFilterChipIcon}>{filter?.icon}</Text>
                          <Text style={styles.activeFilterChipText}>{value}</Text>
                          <TouchableOpacity onPress={() => handlePremiumFilter(filter, value)}>
                            <Text style={styles.activeFilterChipClose}>✕</Text>
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Premium Filters List */}
              {PREMIUM_FILTERS.map((filter) => (
                <View key={filter.id} style={styles.premiumFilterItem}>
                  <View style={styles.premiumFilterHeader}>
                    <View style={styles.premiumFilterTitleRow}>
                      <Text style={styles.premiumFilterIcon}>{filter.icon}</Text>
                      <Text style={styles.premiumFilterName}>{filter.name}</Text>
                    </View>
                    <View style={styles.premiumFilterCost}>
                      <Text style={styles.premiumFilterCostIcon}>💎</Text>
                      <Text style={styles.premiumFilterCostText}>{filter.cost}</Text>
                    </View>
                  </View>

                  <View style={styles.premiumFilterOptions}>
                    {filter.values.map((value) => (
                      <TouchableOpacity
                        key={value}
                        style={[
                          styles.premiumFilterOption,
                          activeFilters[filter.id] === value && styles.premiumFilterOptionActive,
                        ]}
                        onPress={() => handlePremiumFilter(filter, value)}
                      >
                        <Text style={[
                          styles.premiumFilterOptionText,
                          activeFilters[filter.id] === value && styles.premiumFilterOptionTextActive,
                        ]}>
                          {value}
                        </Text>
                        {activeFilters[filter.id] === value && (
                          <Text style={styles.premiumFilterOptionCheck}>✓</Text>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}

              {/* Info Box */}
              <View style={styles.filterInfoBox}>
                <Text style={styles.filterInfoIcon}>💡</Text>
                <Text style={styles.filterInfoText}>
                  Premium filtreler bir kere ödenir ve dilediğiniz kadar kullanabilirsiniz. 
                  Filtreleri değiştirmek ek ücrete tabi değildir.
                </Text>
              </View>
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
    backgroundColor: '#000000',
  },

  // Header
  header: {
    paddingTop: 50,
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 18,
    color: '#ffffff',
  },
  headerTabs: {
    flex: 1,
    flexDirection: 'row',
    marginLeft: 12,
    gap: 8,
  },
  headerTab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  headerTabActive: {
    backgroundColor: 'rgba(255,255,0,0.2)',
  },
  headerTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#a9b6c7',
  },
  headerTabTextActive: {
    color: '#ffff00',
    fontWeight: '700',
  },
  countryBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  countryFlag: {
    fontSize: 20,
  },
  settingsBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    position: 'relative',
  },
  settingsIcon: {
    fontSize: 18,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ff006e',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ffffff',
  },

  // Token Balance
  tokenBalance: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#7c3aed',
  },
  tokenIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  tokenText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    flex: 1,
  },
  buyTokenBtn: {
    backgroundColor: '#7c3aed',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyTokenText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },

  // Filters
  filtersContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  filterBtnActive: {
    backgroundColor: '#00d9ff',
    borderColor: '#00d9ff',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#a9b6c7',
  },
  filterTextActive: {
    color: '#000000',
    fontWeight: '700',
  },
  premiumFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    borderWidth: 1,
    borderColor: '#ffc107',
    position: 'relative',
  },
  premiumFilterIcon: {
    fontSize: 14,
  },
  premiumFilterText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffc107',
  },
  premiumFilterBadge: {
    backgroundColor: '#ff006e',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  premiumFilterBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ffffff',
  },

  // Users Grid
  usersGrid: {
    padding: 16,
  },
  usersRow: {
    gap: 12,
    marginBottom: 12,
  },
  userCard: {
    flex: 1,
    backgroundColor: '#1a1f2e',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },

  // User Photo
  userPhotoContainer: {
    position: 'relative',
    aspectRatio: 0.75,
  },
  userPhoto: {
    width: '100%',
    height: '100%',
  },
  onlineIndicator: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#2ecc71',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  offlineIndicator: {
    backgroundColor: '#95a5a6',
  },
  onlineText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  priceBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,193,7,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priceIcon: {
    fontSize: 12,
  },
  priceText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#000000',
  },

  // User Info
  userInfo: {
    padding: 12,
    paddingBottom: 8,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  verifiedBadge: {
    fontSize: 12,
    color: '#00d9ff',
  },
  userMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userAge: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ff006e',
  },
  userCountry: {
    fontSize: 12,
    color: '#a9b6c7',
  },

  // Actions
  userActions: {
    flexDirection: 'row',
    padding: 12,
    paddingTop: 8,
    gap: 8,
  },
  actionBtn: {
    flex: 1,
  },
  actionBtnCircle: {
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnPrimary: {},
  actionBtnCirclePrimary: {
    backgroundColor: '#00d9ff',
  },
  actionBtnIcon: {
    fontSize: 18,
  },

  // Country Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  countryModal: {
    backgroundColor: '#1a1f2e',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  modalClose: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: '300',
  },
  countriesList: {
    padding: 20,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginBottom: 8,
  },
  countryItemActive: {
    backgroundColor: 'rgba(0,217,255,0.2)',
    borderWidth: 2,
    borderColor: '#00d9ff',
  },
  countryItemFlag: {
    fontSize: 28,
  },
  countryItemName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  countryItemCheck: {
    fontSize: 20,
    color: '#00d9ff',
  },

  // Premium Filters Modal
  filtersModal: {
    backgroundColor: '#1a1f2e',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  modalTokenBalance: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    padding: 16,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#7c3aed',
  },
  modalTokenIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  modalTokenText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  modalBuyBtn: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  modalBuyText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
  filtersList: {
    padding: 20,
  },
  
  // Active Filters
  activeFiltersSection: {
    backgroundColor: 'rgba(255, 0, 110, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ff006e',
  },
  activeFiltersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  activeFiltersTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },
  clearFiltersBtn: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ff006e',
  },
  activeFiltersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  activeFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff006e',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  activeFilterChipIcon: {
    fontSize: 14,
  },
  activeFilterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  activeFilterChipClose: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    marginLeft: 4,
  },

  // Premium Filter Items
  premiumFilterItem: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  premiumFilterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  premiumFilterTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  premiumFilterIcon: {
    fontSize: 20,
  },
  premiumFilterName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  premiumFilterCost: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffc107',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 4,
  },
  premiumFilterCostIcon: {
    fontSize: 14,
  },
  premiumFilterCostText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000000',
  },
  premiumFilterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  premiumFilterOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  premiumFilterOptionActive: {
    backgroundColor: '#00d9ff',
    borderColor: '#00d9ff',
  },
  premiumFilterOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#a9b6c7',
  },
  premiumFilterOptionTextActive: {
    color: '#000000',
    fontWeight: '700',
  },
  premiumFilterOptionCheck: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000000',
  },

  // Filter Info
  filterInfoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
    gap: 12,
  },
  filterInfoIcon: {
    fontSize: 20,
  },
  filterInfoText: {
    flex: 1,
    fontSize: 13,
    color: '#ffc107',
    lineHeight: 18,
  },
});
