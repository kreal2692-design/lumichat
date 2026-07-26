import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../App';

export default function ExclusiveChatScreen({ navigation, route }) {
  const { creatorId } = route.params || {};
  
  const [user, setUser] = useState(null);
  const [creator, setCreator] = useState(null);
  const [tokens, setTokens] = useState(0);
  const [message, setMessage] = useState('');
  const [messagePrice, setMessagePrice] = useState(10);
  const [sentMessages, setSentMessages] = useState([]);
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [isCreator, setIsCreator] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profile) {
        setTokens(profile.tokens || 0);
        setIsCreator(profile.is_creator);
        setMessagePrice(profile.exclusive_message_price || 10);
      }

      if (creatorId) {
        const { data: creatorData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', creatorId)
          .single();
        setCreator(creatorData);
      }

      loadMessages(user.id);
    }
  };

  const loadMessages = async (userId) => {
    // Gönderilen mesajlar
    const { data: sent } = await supabase
      .from('exclusive_messages')
      .select('*, recipient:profiles!recipient_id(username, avatar_url)')
      .eq('sender_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);
    if (sent) setSentMessages(sent);

    // Alınan mesajlar
    const { data: received } = await supabase
      .from('exclusive_messages')
      .select('*, sender:profiles!sender_id(username, avatar_url)')
      .eq('recipient_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);
    if (received) setReceivedMessages(received);
  };

  const sendExclusiveMessage = async () => {
    if (!creator) {
      Alert.alert('Hata', 'Alıcı seçilmedi!');
      return;
    }

    if (!message.trim()) {
      Alert.alert('Hata', 'Mesaj boş olamaz!');
      return;
    }

    const cost = creator.exclusive_message_price || 10;

    if (tokens < cost) {
      Alert.alert(
        'Yetersiz Token',
        `Bu mesaj için ${cost} token gerekiyor.`,
        [
          { text: 'İptal', style: 'cancel' },
          { text: 'Token Al', onPress: () => navigation.navigate('TokenShop') },
        ]
      );
      return;
    }

    Alert.alert(
      'Özel Mesaj Gönder',
      `${creator.username} kullanıcısına ${cost} token karşılığında özel mesaj gönderilecek. Creator yanıt garanti verir. Onaylıyor musunuz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Gönder',
          onPress: async () => {
            // Token düş
            const { error: tokenError } = await supabase
              .from('profiles')
              .update({ tokens: tokens - cost })
              .eq('id', user.id);

            if (tokenError) {
              Alert.alert('Hata', tokenError.message);
              return;
            }

            // Creator'a gelir ekle (70%)
            await supabase.rpc('increment_creator_earnings', {
              creator_id: creatorId,
              amount: cost * 0.7,
            });

            // Mesaj kaydet
            const { error: msgError } = await supabase
              .from('exclusive_messages')
              .insert({
                sender_id: user.id,
                recipient_id: creatorId,
                message: message.trim(),
                price: cost,
                status: 'sent',
              });

            if (msgError) {
              Alert.alert('Hata', msgError.message);
              return;
            }

            // Bildirim gönder
            await supabase.from('notifications').insert({
              user_id: creatorId,
              type: 'exclusive_message',
              title: 'Yeni Özel Mesaj',
              message: `${user.email} size özel mesaj gönderdi`,
              data: { sender_id: user.id },
            });

            Alert.alert('Başarılı', 'Özel mesajınız gönderildi!');
            setMessage('');
            setTokens(tokens - cost);
            loadMessages(user.id);
          },
        },
      ]
    );
  };

  const updateMessagePrice = async () => {
    if (!isCreator) return;

    const { error } = await supabase
      .from('profiles')
      .update({ exclusive_message_price: messagePrice })
      .eq('id', user.id);

    if (error) {
      Alert.alert('Hata', error.message);
    } else {
      Alert.alert('Başarılı', 'Mesaj fiyatınız güncellendi!');
    }
  };

  const replyToMessage = async (messageId, replyText) => {
    if (!replyText.trim()) {
      Alert.alert('Hata', 'Yanıt boş olamaz!');
      return;
    }

    const { error } = await supabase
      .from('exclusive_messages')
      .update({
        reply: replyText.trim(),
        status: 'replied',
        replied_at: new Date().toISOString(),
      })
      .eq('id', messageId);

    if (error) {
      Alert.alert('Hata', error.message);
    } else {
      Alert.alert('Başarılı', 'Yanıtınız gönderildi!');
      loadMessages(user.id);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Özel Mesajlar 💬</Text>
        <View style={styles.tokenBadge}>
          <Ionicons name="diamond" size={16} color="#FFD700" />
          <Text style={styles.tokenText}>{tokens}</Text>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Creator Settings */}
        {isCreator && !creatorId && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Creator Ayarları</Text>
            <View style={styles.settingsCard}>
              <Text style={styles.label}>Özel Mesaj Fiyatı:</Text>
              <View style={styles.priceInput}>
                <TextInput
                  style={styles.input}
                  value={String(messagePrice)}
                  onChangeText={(text) => setMessagePrice(Number(text))}
                  keyboardType="numeric"
                  placeholderTextColor="#888"
                />
                <Text style={styles.tokenLabel}>Token</Text>
              </View>
              <TouchableOpacity style={styles.updateButton} onPress={updateMessagePrice}>
                <LinearGradient colors={['#667eea', '#764ba2']} style={styles.buttonGradient}>
                  <Text style={styles.buttonText}>Fiyatı Güncelle</Text>
                </LinearGradient>
              </TouchableOpacity>
              <Text style={styles.helperText}>
                💡 Fanlar size özel mesaj gönderebilir. Yanıt garanti verirsiniz.
              </Text>
              <Text style={styles.helperText}>
                💰 Kazancınız: {(messagePrice * 0.7).toFixed(2)} Token/mesaj (%70)
              </Text>
            </View>
          </View>
        )}

        {/* Send Message to Creator */}
        {creator && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mesaj Gönder</Text>
            <View style={styles.messageCard}>
              <Image
                source={{ uri: creator.avatar_url || 'https://via.placeholder.com/60' }}
                style={styles.creatorAvatar}
              />
              <View style={styles.creatorInfo}>
                <Text style={styles.creatorName}>{creator.username}</Text>
                <View style={styles.priceTag}>
                  <Ionicons name="diamond" size={14} color="#FFD700" />
                  <Text style={styles.priceText}>{creator.exclusive_message_price || 10} Token/mesaj</Text>
                </View>
              </View>
            </View>

            <TextInput
              style={styles.messageInput}
              placeholder="Özel mesajınızı yazın..."
              placeholderTextColor="#888"
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={4}
            />

            <View style={styles.messageInfo}>
              <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
              <Text style={styles.messageInfoText}>
                Creator yanıt garantisi verir. Mesajınız önceliklidir.
              </Text>
            </View>

            <TouchableOpacity style={styles.sendButton} onPress={sendExclusiveMessage}>
              <LinearGradient colors={['#667eea', '#764ba2']} style={styles.buttonGradient}>
                <Ionicons name="send" size={18} color="#fff" />
                <Text style={styles.buttonText}>
                  Özel Mesaj Gönder ({creator.exclusive_message_price || 10} Token)
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Received Messages (for creators) */}
        {isCreator && receivedMessages.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gelen Özel Mesajlar ({receivedMessages.length})</Text>
            {receivedMessages.map((msg) => (
              <View key={msg.id} style={styles.messageItem}>
                <View style={styles.messageHeader}>
                  <Image
                    source={{ uri: msg.sender?.avatar_url || 'https://via.placeholder.com/40' }}
                    style={styles.messageAvatar}
                  />
                  <View style={styles.messageHeaderInfo}>
                    <Text style={styles.messageSender}>{msg.sender?.username}</Text>
                    <Text style={styles.messageDate}>
                      {new Date(msg.created_at).toLocaleDateString('tr-TR')}
                    </Text>
                  </View>
                  <View style={styles.messagePrice}>
                    <Ionicons name="diamond" size={12} color="#FFD700" />
                    <Text style={styles.messagePriceText}>{msg.price}</Text>
                  </View>
                </View>
                <Text style={styles.messageText}>{msg.message}</Text>
                {msg.status === 'replied' && msg.reply && (
                  <View style={styles.replyBox}>
                    <Text style={styles.replyLabel}>Yanıtınız:</Text>
                    <Text style={styles.replyText}>{msg.reply}</Text>
                  </View>
                )}
                {msg.status === 'sent' && (
                  <TouchableOpacity
                    style={styles.replyButton}
                    onPress={() => {
                      Alert.prompt(
                        'Yanıt Gönder',
                        'Yanıtınızı yazın:',
                        (text) => replyToMessage(msg.id, text)
                      );
                    }}
                  >
                    <Ionicons name="arrow-undo" size={16} color="#667eea" />
                    <Text style={styles.replyButtonText}>Yanıtla</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Sent Messages */}
        {sentMessages.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gönderilen Mesajlar ({sentMessages.length})</Text>
            {sentMessages.map((msg) => (
              <View key={msg.id} style={styles.messageItem}>
                <View style={styles.messageHeader}>
                  <Image
                    source={{ uri: msg.recipient?.avatar_url || 'https://via.placeholder.com/40' }}
                    style={styles.messageAvatar}
                  />
                  <View style={styles.messageHeaderInfo}>
                    <Text style={styles.messageSender}>{msg.recipient?.username}</Text>
                    <Text style={styles.messageDate}>
                      {new Date(msg.created_at).toLocaleDateString('tr-TR')}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, styles[`status${msg.status}`]]}>
                    <Text style={styles.statusText}>{msg.status === 'replied' ? 'Yanıtlandı' : 'Gönderildi'}</Text>
                  </View>
                </View>
                <Text style={styles.messageText}>{msg.message}</Text>
                {msg.reply && (
                  <View style={styles.replyBox}>
                    <Text style={styles.replyLabel}>Creator Yanıtı:</Text>
                    <Text style={styles.replyText}>{msg.reply}</Text>
                    <Text style={styles.replyDate}>
                      {new Date(msg.replied_at).toLocaleDateString('tr-TR')}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {!isCreator && !creator && sentMessages.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="mail-outline" size={80} color="#888" />
            <Text style={styles.emptyTitle}>Özel Mesajınız Yok</Text>
            <Text style={styles.emptyText}>
              Creator'lara özel mesaj göndererek öncelikli iletişim kurabilirsiniz.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0f17',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  tokenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  tokenText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  section: {
    margin: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  settingsCard: {
    backgroundColor: '#1a1f2e',
    borderRadius: 16,
    padding: 20,
  },
  label: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  priceInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0b0f17',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 12,
  },
  tokenLabel: {
    color: '#FFD700',
    fontWeight: '600',
  },
  updateButton: {
    marginBottom: 10,
  },
  buttonGradient: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  helperText: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
  },
  messageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1f2e',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  creatorAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  creatorInfo: {
    flex: 1,
  },
  creatorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
  },
  priceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priceText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '600',
  },
  messageInput: {
    backgroundColor: '#1a1f2e',
    borderRadius: 12,
    padding: 15,
    color: '#fff',
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  messageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF5020',
    padding: 12,
    borderRadius: 12,
    gap: 8,
    marginBottom: 15,
  },
  messageInfoText: {
    flex: 1,
    color: '#4CAF50',
    fontSize: 12,
  },
  sendButton: {
    marginTop: 5,
  },
  messageItem: {
    backgroundColor: '#1a1f2e',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  messageAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  messageHeaderInfo: {
    flex: 1,
  },
  messageSender: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  messageDate: {
    fontSize: 11,
    color: '#888',
  },
  messagePrice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  messagePriceText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold',
  },
  messageText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  replyBox: {
    backgroundColor: '#667eea20',
    borderLeftWidth: 3,
    borderLeftColor: '#667eea',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  replyLabel: {
    color: '#667eea',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  replyText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  replyDate: {
    color: '#888',
    fontSize: 11,
    marginTop: 6,
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#667eea20',
    padding: 10,
    borderRadius: 8,
    gap: 6,
    marginTop: 8,
  },
  replyButtonText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statussent: {
    backgroundColor: '#FFC10720',
  },
  statusreplied: {
    backgroundColor: '#4CAF5020',
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },
});
