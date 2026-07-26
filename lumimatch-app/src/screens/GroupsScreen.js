import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DEMO_MODE, DEMO_GROUPS, DEMO_USER } from '../data/demoData';

export default function GroupsScreen({ navigation }) {
  const [groups, setGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [selectedTab, setSelectedTab] = useState('discover'); // discover, myGroups
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = () => {
    if (DEMO_MODE) {
      setGroups(DEMO_GROUPS);
      setMyGroups(DEMO_GROUPS.filter(g => g.is_member));
    }
  };

  const handleJoinGroup = (group) => {
    if (group.join_approval_required) {
      Alert.alert(
        'Katılma İsteği',
        `${group.name} grubuna katılma isteği göndermek ister misin?`,
        [
          { text: 'İptal', style: 'cancel' },
          { text: 'İstek Gönder', onPress: () => {
            Alert.alert('Başarılı', 'Katılma isteğin gönderildi!');
          }},
        ]
      );
    } else {
      Alert.alert('Başarılı', `${group.name} grubuna katıldın!`);
    }
  };

  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      Alert.alert('Hata', 'Grup adı gerekli');
      return;
    }

    Alert.alert('Başarılı', `${groupName} grubu oluşturuldu!`);
    setCreateModalVisible(false);
    setGroupName('');
    setGroupDescription('');
  };

  const renderGroupCard = (group) => (
    <TouchableOpacity 
      key={group.id}
      style={styles.groupCard}
      onPress={() => navigation.navigate('GroupDetail', { group })}
      activeOpacity={0.8}
    >
      <Image 
        source={{ uri: group.avatar_url }}
        style={styles.groupAvatar}
        resizeMode="cover"
      />
      
      <View style={styles.groupOverlay}>
        {/* Top Badge */}
        <View style={styles.groupTopRow}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>Lv.{group.level}</Text>
          </View>
          {group.is_private && (
            <View style={styles.privateBadge}>
              <Text style={styles.privateIcon}>🔒</Text>
            </View>
          )}
        </View>

        {/* Group Info */}
        <View style={styles.groupInfo}>
          <Text style={styles.groupName} numberOfLines={1}>
            {group.name}
          </Text>
          <Text style={styles.groupMembers}>
            👥 {group.members_count}/{group.max_members} üye
          </Text>
          
          <View style={styles.groupStats}>
            <View style={styles.groupStat}>
              <Text style={styles.groupStatIcon}>⚡</Text>
              <Text style={styles.groupStatText}>{group.xp} XP</Text>
            </View>
            <View style={styles.groupStat}>
              <Text style={styles.groupStatIcon}>🎁</Text>
              <Text style={styles.groupStatText}>{group.total_gifts_sent}</Text>
            </View>
          </View>

          {!group.is_member && (
            <TouchableOpacity 
              style={styles.joinBtn}
              onPress={() => handleJoinGroup(group)}
            >
              <Text style={styles.joinBtnText}>
                {group.join_approval_required ? '+ İstek Gönder' : '+ Katıl'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#0a0e1a', '#1a1f2e']}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Aile & Gruplar</Text>
        
        <TouchableOpacity 
          style={styles.createBtn}
          onPress={() => setCreateModalVisible(true)}
        >
          <Text style={styles.createIcon}>+</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'discover' && styles.tabActive]}
          onPress={() => setSelectedTab('discover')}
        >
          <Text style={[styles.tabText, selectedTab === 'discover' && styles.tabTextActive]}>
            Keşfet
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, selectedTab === 'myGroups' && styles.tabActive]}
          onPress={() => setSelectedTab('myGroups')}
        >
          <Text style={[styles.tabText, selectedTab === 'myGroups' && styles.tabTextActive]}>
            Gruplarım
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>👨‍👩‍👧‍👦</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Aile Sistemi</Text>
            <Text style={styles.infoText}>
              Bir aileye katılın, birlikte hediye gönderin ve sıralamada yüksellin!
            </Text>
          </View>
        </View>

        {/* Groups Grid */}
        <View style={styles.groupsGrid}>
          {(selectedTab === 'discover' ? groups : myGroups).map(renderGroupCard)}
        </View>

        {/* Empty State */}
        {selectedTab === 'myGroups' && myGroups.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyTitle}>Henüz Grup Yok</Text>
            <Text style={styles.emptyText}>
              İlk grubunu oluştur veya mevcut gruplara katıl
            </Text>
            <TouchableOpacity 
              style={styles.emptyBtn}
              onPress={() => setCreateModalVisible(true)}
            >
              <Text style={styles.emptyBtnText}>Grup Oluştur</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Create Group Modal */}
      <Modal
        visible={createModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.createModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Yeni Grup Oluştur</Text>
              <TouchableOpacity 
                style={styles.modalCloseBtn}
                onPress={() => setCreateModalVisible(false)}
              >
                <Text style={styles.modalCloseIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.avatarUpload}>
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarPlaceholderIcon}>📷</Text>
                  <Text style={styles.avatarPlaceholderText}>Grup Fotoğrafı</Text>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Grup Adı *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Grup adını girin"
                  placeholderTextColor="#5a6a7e"
                  value={groupName}
                  onChangeText={setGroupName}
                  maxLength={30}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Açıklama</Text>
                <TextInput
                  style={[styles.formInput, styles.formTextarea]}
                  placeholder="Grup hakkında..."
                  placeholderTextColor="#5a6a7e"
                  value={groupDescription}
                  onChangeText={setGroupDescription}
                  multiline
                  maxLength={200}
                />
              </View>

              <View style={styles.formGroup}>
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Özel Grup</Text>
                  <TouchableOpacity style={styles.switchBtn}>
                    <View style={[styles.switchTrack, styles.switchTrackOff]}>
                      <View style={styles.switchThumb} />
                    </View>
                  </TouchableOpacity>
                </View>
                <Text style={styles.switchHelp}>
                  Özel gruplara sadece davet ile katılınabilir
                </Text>
              </View>

              <TouchableOpacity 
                style={[styles.createGroupBtn, !groupName.trim() && styles.createGroupBtnDisabled]}
                onPress={handleCreateGroup}
                disabled={!groupName.trim()}
              >
                <Text style={styles.createGroupBtnText}>Grup Oluştur</Text>
              </TouchableOpacity>
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
  createBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00d9ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createIcon: {
    fontSize: 24,
    color: '#000000',
    fontWeight: '700',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(26,31,46,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: 'rgba(0,217,255,0.2)',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#a9b6c7',
  },
  tabTextActive: {
    color: '#00d9ff',
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(131,56,236,0.15)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(131,56,236,0.3)',
    gap: 12,
  },
  infoIcon: {
    fontSize: 40,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8338ec',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#ffffff',
  },
  groupsGrid: {
    gap: 16,
  },
  groupCard: {
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#1a1f2e',
  },
  groupAvatar: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  groupOverlay: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  groupTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  levelBadge: {
    backgroundColor: 'rgba(131,56,236,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
  },
  privateBadge: {
    backgroundColor: 'rgba(255,107,107,0.9)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  privateIcon: {
    fontSize: 16,
  },
  groupInfo: {
    gap: 8,
  },
  groupName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
  },
  groupMembers: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
  },
  groupStats: {
    flexDirection: 'row',
    gap: 16,
  },
  groupStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  groupStatIcon: {
    fontSize: 14,
  },
  groupStatText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  joinBtn: {
    backgroundColor: '#00d9ff',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  joinBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000000',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  emptyText: {
    fontSize: 14,
    color: '#a9b6c7',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyBtn: {
    backgroundColor: '#00d9ff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  emptyBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  createModal: {
    backgroundColor: '#1a1f2e',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
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
    fontWeight: '700',
    color: '#ffffff',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalCloseIcon: {
    fontSize: 24,
    color: '#ffffff',
  },
  modalContent: {
    padding: 20,
  },
  avatarUpload: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  avatarPlaceholderIcon: {
    fontSize: 32,
  },
  avatarPlaceholderText: {
    fontSize: 12,
    color: '#a9b6c7',
    fontWeight: '600',
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#ffffff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  formTextarea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  switchBtn: {
    padding: 4,
  },
  switchTrack: {
    width: 50,
    height: 28,
    borderRadius: 14,
    padding: 2,
  },
  switchTrackOff: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'flex-start',
  },
  switchTrackOn: {
    backgroundColor: '#00d9ff',
    justifyContent: 'flex-end',
  },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  switchHelp: {
    fontSize: 12,
    color: '#a9b6c7',
  },
  createGroupBtn: {
    backgroundColor: '#00d9ff',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  createGroupBtnDisabled: {
    opacity: 0.5,
  },
  createGroupBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
  },
});
