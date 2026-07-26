import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../App';
import { DEMO_MODE, DEMO_USER, spendDemoDiamonds } from '../data/demoData';

export default function ChatScreen({ route, navigation }) {
  const { friendId, pricing, friend: friendData } = route.params || {}; // friend parametresi eklendi
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [friend, setFriend] = useState(friendData || null); // friendData varsa kullan
  const [messagesSent, setMessagesSent] = useState(0); // Gönderilen mesaj sayısı
  const [userDiamonds, setUserDiamonds] = useState(DEMO_USER.diamonds);
  const flatListRef = useRef();

  // Ücretsiz mesaj limiti - güvenli kontrol
  const freeMessageLimit = pricing?.freeMessages ?? 2; // 2 ücretsiz mesaj (önceden 3'tü)
  const messagePrice = pricing?.pricePerMessage ?? 0;
  const isPaidChat = pricing && pricing.pricePerMessage > 0; // Ücretli sohbet mi?

  useEffect(() => {
    loadFriend();
    loadMessages();
  }, []);

  const loadFriend = async () => {
    // Eğer friend zaten param olarak geldiyse, yeniden yüklenmeye gerek yok
    if (friendData) {
      return;
    }
    
    if (DEMO_MODE) {
      // Demo mod için
      setFriend({ 
        id: friendId,
        username: 'Demo Creator', 
        is_online: true,
        avatar_url: 'https://i.pravatar.cc/100?img=5',
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', friendId)
        .single();

      if (error) throw error;
      setFriend(data);
    } catch (error) {
      console.error('Error loading friend:', error);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Fotoğraf göndermek için galeri erişimi gerekli');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      sendImageMessage(result.assets[0].uri);
    }
  };

  const sendImageMessage = (imageUri) => {
    // Ücretli mesajlaşma kontrolü
    if (isPaidChat && messagesSent >= freeMessageLimit) {
      if (userDiamonds < messagePrice) {
        Alert.alert(
          'Yetersiz Elmas',
          `Fotoğraf göndermek için ${messagePrice} elmas gerekiyor.`,
          [
            { text: 'İptal', style: 'cancel' },
            { text: 'Elmas Al', onPress: () => navigation.navigate('TokenShop') },
          ]
        );
        return;
      }
      
      if (!spendDemoDiamonds(messagePrice)) {
        Alert.alert('Hata', 'Elmas çekilemedi');
        return;
      }
      setUserDiamonds(DEMO_USER.diamonds);
    }

    const newMsg = {
      id: Date.now(),
      type: 'image',
      image_url: imageUri,
      sender_id: DEMO_USER.id,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setMessagesSent((prev) => prev + 1);
    
    setTimeout(() => {
      flatListRef.current?.scrollToEnd();
    }, 100);
  };

  const loadMessages = async () => {
    if (DEMO_MODE) {
      // Demo mesajlar
      setMessages([
        {
          id: 1,
          text: 'Merhaba! Nasılsın? 😊',
          sender_id: friendId,
          created_at: new Date(Date.now() - 300000).toISOString(),
        },
        {
          id: 2,
          text: 'Hoş geldin!',
          sender_id: friendId,
          created_at: new Date(Date.now() - 240000).toISOString(),
        },
      ]);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .or(`sender_id.eq.${friendId},receiver_id.eq.${friendId}`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    // Ücretli mesajlaşma kontrolü (sadece pricing varsa)
    if (isPaidChat && messagesSent >= freeMessageLimit) {
      // Ücretsiz limit aşıldı - elmas kontrolü
      if (userDiamonds < messagePrice) {
        Alert.alert(
          'Yetersiz Elmas',
          `Mesaj göndermek için ${messagePrice} elmas gerekiyor.\n\nMevcut bakiyeniz: ${userDiamonds} elmas`,
          [
            { text: 'İptal', style: 'cancel' },
            { text: 'Elmas Al', onPress: () => navigation.navigate('TokenShop') },
          ]
        );
        return;
      }

      // Elmas kes
      if (!spendDemoDiamonds(messagePrice)) {
        Alert.alert('Hata', 'Elmas çekilemedi');
        return;
      }
      
      setUserDiamonds(DEMO_USER.diamonds);
    }

    // Mesajı gönder
    const newMsg = {
      id: Date.now(),
      text: newMessage.trim(),
      sender_id: DEMO_USER.id,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setMessagesSent((prev) => prev + 1);
    setNewMessage('');
    
    setTimeout(() => {
      flatListRef.current?.scrollToEnd();
    }, 100);

    // İlk ücretsiz mesaj bittiyse bildirim göster (sadece ücretli sohbette)
    if (isPaidChat && messagesSent + 1 === freeMessageLimit) {
      Alert.alert(
        '⚠️ Ücretsiz Mesajlar Bitti',
        `${freeMessageLimit} ücretsiz mesaj hakkınız doldu.\n\n` +
        `Bundan sonra her mesaj ${messagePrice} elmas olacak.`,
        [{ text: 'Anladım' }]
      );
    }
  };

  const renderMessage = ({ item }) => {
    const isMe = item.sender_id === DEMO_USER.id;
    
    return (
      <View style={[styles.messageWrapper, isMe && styles.messageWrapperMe]}>
        {!isMe && friend?.avatar_url && (
          <Image 
            source={{ uri: friend.avatar_url }}
            style={styles.messageAvatar}
          />
        )}
        <View style={[styles.messageBubble, isMe && styles.messageBubbleMe]}>
          {item.type === 'image' ? (
            <>
              <Image 
                source={{ uri: item.image_url }}
                style={styles.messageImage}
                resizeMode="cover"
              />
              {item.text && (
                <Text style={[styles.messageText, isMe && styles.messageTextMe]}>
                  {item.text}
                </Text>
              )}
            </>
          ) : (
            <Text style={[styles.messageText, isMe && styles.messageTextMe]}>
              {item.text}
            </Text>
          )}
          <Text style={[styles.messageTime, isMe && styles.messageTimeMe]}>
            {new Date(item.created_at).toLocaleTimeString('tr-TR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    );
  };

  const getInputPlaceholder = () => {
    if (!isPaidChat) return 'Mesaj yaz...';
    
    const remaining = freeMessageLimit - messagesSent;
    if (remaining > 0) {
      return `${remaining} ücretsiz mesaj kaldı...`;
    }
    return `Mesaj (${messagePrice}💎)...`;
  };

  return (
    <LinearGradient
      colors={['#0a0e1a', '#1a1f2e', '#0a0e1a']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.headerInfo}
            onPress={() => {
              // Creator profil sayfasına yönlendir
              if (friend) {
                navigation.navigate('CreatorProfile', { creator: friend });
              }
            }}
            activeOpacity={0.7}
          >
            {friend?.avatar_url && (
              <Image 
                source={{ uri: friend.avatar_url }}
                style={styles.friendAvatar}
              />
            )}
            <View style={styles.friendDetails}>
              <Text style={styles.friendName}>{friend?.username || 'Yükleniyor...'}</Text>
              <Text style={styles.friendStatus}>
                {friend?.is_online ? '🟢 Çevrimiçi' : '⚫ Çevrimdışı'}
              </Text>
            </View>
          </TouchableOpacity>
          
          {isPaidChat && (
            <View style={styles.tokenBadge}>
              <Text style={styles.tokenText}>💎 {userDiamonds}</Text>
            </View>
          )}
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        {/* Pricing Info Banner */}
        {isPaidChat && messagesSent >= freeMessageLimit && (
          <View style={styles.pricingBanner}>
            <Text style={styles.pricingText}>
              💎 Her mesaj {messagePrice} elmas • Bakiye: {userDiamonds} elmas
            </Text>
          </View>
        )}

        {/* Input */}
        <View style={styles.inputContainer}>
          <TouchableOpacity 
            style={styles.attachBtn}
            onPress={pickImage}
          >
            <Text style={styles.attachIcon}>📎</Text>
          </TouchableOpacity>
          
          <TextInput
            style={styles.input}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder={getInputPlaceholder()}
            placeholderTextColor="#5a6a7e"
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !newMessage.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!newMessage.trim()}
          >
            <Text style={styles.sendIcon}>📤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    backgroundColor: 'rgba(10,20,30,0.92)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,229,255,0.25)',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: '#ffffff',
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  friendAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#00d9ff',
  },
  friendDetails: {
    alignItems: 'center',
  },
  friendName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  friendStatus: {
    fontSize: 12,
    color: '#a9b6c7',
  },
  tokenBadge: {
    backgroundColor: 'rgba(0,217,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,217,255,0.4)',
  },
  tokenText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00d9ff',
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },
  messageWrapper: {
    marginBottom: 12,
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 8,
  },
  messageWrapperMe: {
    alignItems: 'flex-end',
    flexDirection: 'row-reverse',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  messageBubble: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    borderTopLeftRadius: 4,
    padding: 12,
    maxWidth: '70%',
  },
  messageBubbleMe: {
    backgroundColor: 'rgba(0,229,255,0.2)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 4,
  },
  messageText: {
    fontSize: 15,
    color: '#ffffff',
    marginBottom: 4,
    lineHeight: 20,
  },
  messageTextMe: {
    color: '#ffffff',
  },
  messageTime: {
    fontSize: 10,
    color: '#a9b6c7',
  },
  messageTimeMe: {
    color: '#00e5ff',
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 4,
  },
  pricingBanner: {
    backgroundColor: 'rgba(255,107,107,0.15)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,107,107,0.3)',
  },
  pricingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ff6b6b',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    backgroundColor: 'rgba(10,20,30,0.92)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,229,255,0.25)',
  },
  attachBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachIcon: {
    fontSize: 20,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#ffffff',
    fontSize: 15,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#00e5ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  sendIcon: {
    fontSize: 20,
  },
});
