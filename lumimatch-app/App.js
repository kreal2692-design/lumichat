import React, { useState, createContext, useContext, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { createClient } from '@supabase/supabase-js';
import { Linking, Alert } from 'react-native';

// Context for demo user
const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};

// Screens
import SplashScreen from './src/screens/SplashScreen';
import AuthScreen from './src/screens/AuthScreen';
import ProfileSetupScreen from './src/screens/ProfileSetupScreen';
import HomeScreen from './src/screens/HomeScreen';
import VideoCallScreen from './src/screens/VideoCallScreen';
import TokenShopScreen from './src/screens/TokenShopScreen';
import PremiumScreen from './src/screens/PremiumScreen';
import ProfileScreen from './src/screens/ProfileScreenModern';
import FriendsScreen from './src/screens/FriendsScreen';
import ChatScreen from './src/screens/ChatScreen';
import LiveStreamScreen from './src/screens/LiveStreamScreen';
import StreamBroadcastScreen from './src/screens/StreamBroadcastScreen';
import StreamViewerScreen from './src/screens/StreamViewerScreen';
import StatsScreen from './src/screens/StatsScreen';
import StoryScreen from './src/screens/StoryScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import CreatorProfileScreen from './src/screens/CreatorProfileScreen';
import SubscribeScreen from './src/screens/SubscribeScreen';
import BecomeCreatorScreen from './src/screens/BecomeCreatorScreen';
import CreatorDashboardScreen from './src/screens/CreatorDashboardScreen';
import WalletScreen from './src/screens/WalletScreen';
import PPVContentScreen from './src/screens/PPVContentScreen';
import TipCreatorScreen from './src/screens/TipCreatorScreen';
import ReferralScreen from './src/screens/ReferralScreen';
import ContentModerationScreen from './src/screens/ContentModerationScreen';
import VoiceMessageScreen from './src/screens/VoiceMessageScreen';
import CustomRequestScreen from './src/screens/CustomRequestScreen';
import PollScreen from './src/screens/PollScreen';
import GamificationScreen from './src/screens/GamificationScreen';
import VirtualGiftsScreen from './src/screens/VirtualGiftsScreen';
import PrivateCallScreen from './src/screens/PrivateCallScreen';
import ExclusiveChatScreen from './src/screens/ExclusiveChatScreen';
import LiveEventScreen from './src/screens/LiveEventScreen';
import ReportBlockScreen from './src/screens/ReportBlockScreen';
import ModeratorScreen from './src/screens/ModeratorScreen';
import SafeModeScreen from './src/screens/SafeModeScreen';
import PushNotificationScreen from './src/screens/PushNotificationScreen';
import BookmarksScreen from './src/screens/BookmarksScreen';
import CollaborativeStreamScreen from './src/screens/CollaborativeStreamScreen';
import LanguageScreen from './src/screens/LanguageScreen';
import VerificationScreen from './src/screens/VerificationScreen';
import PrioritySupportScreen from './src/screens/PrioritySupportScreen';
import FeedScreen from './src/screens/FeedScreenModern';
import GroupsScreen from './src/screens/GroupsScreen';
import PostCreateScreen from './src/screens/PostCreateScreen';
import EnhancedSettingsScreen from './src/screens/EnhancedSettingsScreen';
import PartyRoomScreen from './src/screens/PartyRoomScreen';
import VideoMatchScreen from './src/screens/VideoMatchScreenModern';
import VideoMatchDetailScreen from './src/screens/VideoMatchDetailScreen';
import CreatorCenterScreen from './src/screens/CreatorCenterScreen';
import EventCenterScreen from './src/screens/EventCenterScreen';
import ChatHistoryScreen from './src/screens/ChatHistoryScreenModern';
import ReelsScreen from './src/screens/ReelsScreenModern';
import MissionsScreen from './src/screens/MissionsScreenModern';
// v2.6.0 screens removed for stability
// import PurchaseScreen from './src/screens/PurchaseScreen';
// import MediaDownloadScreen from './src/screens/MediaDownloadScreen';

// Supabase Config - YENİ PROJE
const SUPABASE_URL = 'https://llibpqwyzexsgczxwjcp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsaWJwcXd5emV4c2djenh3amNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2NTAzNzgsImV4cCI6MjEwMDIyNjM3OH0.PYCfFxXce_oSDHru_d2TuaWGRvDsVX1fY8_Tx3_f0F0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const Stack = createStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigationRef = React.useRef(null);

  useEffect(() => {
    // Supabase auth kontrolü
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Deep link handler for OAuth callback
    const handleDeepLink = async (event) => {
      console.log('📱 Deep link alındı:', event.url);
      console.log('📱 URL uzunluğu:', event.url.length);
      
      if (event.url.includes('lumimatch://auth/callback')) {
        try {
          // URL'den session parametrelerini çıkar
          let access_token, refresh_token, type;
          
          console.log('🔍 URL parsing başlıyor...');
          console.log('🔍 Hash var mı?', event.url.includes('#'));
          console.log('🔍 Query var mı?', event.url.includes('?'));
          
          // URL parse et - hem query params (?token=...) hem hash (#token=...) destekle
          if (event.url.includes('#')) {
            // Hash fragment (#access_token=...)
            const hashPart = event.url.split('#')[1];
            console.log('🔍 Hash part:', hashPart.substring(0, 100) + '...');
            const params = new URLSearchParams(hashPart);
            access_token = params.get('access_token');
            refresh_token = params.get('refresh_token');
            type = params.get('type');
            console.log('🔑 Hash fragmentten token alındı');
            console.log('🔑 Token uzunlukları - access:', access_token?.length, 'refresh:', refresh_token?.length);
          } else if (event.url.includes('?')) {
            // Query params (?access_token=...)
            const queryPart = event.url.split('?')[1];
            console.log('🔍 Query part:', queryPart.substring(0, 100) + '...');
            const params = new URLSearchParams(queryPart);
            access_token = params.get('access_token');
            refresh_token = params.get('refresh_token');
            type = params.get('type');
            console.log('🔑 Query paramstan token alındı');
            console.log('🔑 Token uzunlukları - access:', access_token?.length, 'refresh:', refresh_token?.length);
          }
          
          console.log('🔍 Type:', type);
          
          if (access_token && refresh_token) {
            console.log('✅ Tokenlar bulundu, session oluşturuluyor...');
            
            // Session'ı Supabase'e set et
            const { data, error } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });

            if (error) {
              console.error('❌ Session set hatası:', error);
              throw error;
            }

            console.log('✅ Google OAuth başarılı!', data.user?.email);
            setUser(data.user);

            // ProfileSetup'a yönlendir
            if (navigationRef.current) {
              console.log('📍 ProfileSetup\'a yönlendiriliyor...');
              navigationRef.current.navigate('ProfileSetup');
            } else {
              console.warn('⚠️ Navigation ref bulunamadı');
            }
          } else {
            console.warn('⚠️ Tokenlar bulunamadı!');
            console.warn('⚠️ access_token:', access_token ? 'VAR' : 'YOK');
            console.warn('⚠️ refresh_token:', refresh_token ? 'VAR' : 'YOK');
            console.warn('⚠️ Tam URL:', event.url);
            
            Alert.alert(
              'Debug',
              `Token bulunamadı!\n\nURL: ${event.url.substring(0, 100)}...\n\nHash: ${event.url.includes('#') ? 'VAR' : 'YOK'}\nQuery: ${event.url.includes('?') ? 'VAR' : 'YOK'}`,
              [{ text: 'Tamam' }]
            );
          }
        } catch (error) {
          console.error('❌ Deep link işleme hatası:', error);
          console.error('❌ Error stack:', error.stack);
          Alert.alert('Hata', `Giriş tamamlanamadı.\n\n${error.message}`);
        }
      } else {
        console.log('📱 Callback URL değil, atlanıyor');
      }
    };

    // Deep link listener ekle
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Uygulama ilk açılışta URL'i kontrol et
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    // Listen for auth changes
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('🔐 Auth state değişti:', _event);
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.remove();
      authSubscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <StatusBar style="light" />
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: '#0b0f17' }
          }}
          initialRouteName={!user ? "Auth" : "Home"}
        >
          {/* Auth Screen - Always accessible */}
          <Stack.Screen name="Auth" component={AuthScreen} />
          <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
          
          {/* Main Screens */}
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="VideoCall" component={VideoCallScreen} />
            <Stack.Screen name="TokenShop" component={TokenShopScreen} />
            <Stack.Screen name="Premium" component={PremiumScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Friends" component={FriendsScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="LiveStream" component={LiveStreamScreen} />
            <Stack.Screen name="StreamBroadcast" component={StreamBroadcastScreen} />
            <Stack.Screen name="StreamViewer" component={StreamViewerScreen} />
            <Stack.Screen name="Stats" component={StatsScreen} />
            <Stack.Screen name="Story" component={StoryScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="CreatorProfile" component={CreatorProfileScreen} />
            <Stack.Screen name="Subscribe" component={SubscribeScreen} />
            <Stack.Screen name="BecomeCreator" component={BecomeCreatorScreen} />
            <Stack.Screen name="CreatorDashboard" component={CreatorDashboardScreen} />
            <Stack.Screen name="Wallet" component={WalletScreen} />
            <Stack.Screen name="PPVContent" component={PPVContentScreen} />
            <Stack.Screen name="TipCreator" component={TipCreatorScreen} />
            <Stack.Screen name="Referral" component={ReferralScreen} />
            <Stack.Screen name="ContentModeration" component={ContentModerationScreen} />
            <Stack.Screen name="VoiceMessage" component={VoiceMessageScreen} />
            <Stack.Screen name="CustomRequest" component={CustomRequestScreen} />
            <Stack.Screen name="Poll" component={PollScreen} />
            <Stack.Screen name="Gamification" component={GamificationScreen} />
            <Stack.Screen name="VirtualGifts" component={VirtualGiftsScreen} />
            <Stack.Screen name="PrivateCall" component={PrivateCallScreen} />
            <Stack.Screen name="ExclusiveChat" component={ExclusiveChatScreen} />
            <Stack.Screen name="LiveEvent" component={LiveEventScreen} />
            <Stack.Screen name="ReportBlock" component={ReportBlockScreen} />
            <Stack.Screen name="Moderator" component={ModeratorScreen} />
            <Stack.Screen name="SafeMode" component={SafeModeScreen} />
            <Stack.Screen name="PushNotification" component={PushNotificationScreen} />
            <Stack.Screen name="Bookmarks" component={BookmarksScreen} />
            <Stack.Screen name="CollaborativeStream" component={CollaborativeStreamScreen} />
            <Stack.Screen name="Language" component={LanguageScreen} />
            <Stack.Screen name="Verification" component={VerificationScreen} />
            <Stack.Screen name="PrioritySupport" component={PrioritySupportScreen} />
            <Stack.Screen name="Feed" component={FeedScreen} />
            <Stack.Screen name="Groups" component={GroupsScreen} />
            <Stack.Screen name="PostCreate" component={PostCreateScreen} />
            <Stack.Screen name="EnhancedSettings" component={EnhancedSettingsScreen} />
            <Stack.Screen name="PartyRoom" component={PartyRoomScreen} />
            <Stack.Screen name="VideoMatch" component={VideoMatchScreen} />
            <Stack.Screen name="VideoMatchDetail" component={VideoMatchDetailScreen} />
            <Stack.Screen name="CreatorCenter" component={CreatorCenterScreen} />
            <Stack.Screen name="EventCenter" component={EventCenterScreen} />
            <Stack.Screen name="ChatHistory" component={ChatHistoryScreen} />
            <Stack.Screen name="Reels" component={ReelsScreen} />
            <Stack.Screen name="Missions" component={MissionsScreen} />
            {/* v2.6.0 screens removed for stability */}
          </>
        </Stack.Navigator>
      </NavigationContainer>
    </UserContext.Provider>
  );
}
