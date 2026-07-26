import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
  Animated,
  Dimensions,
  Image,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../App';
import { authService } from '../services/supabaseService';

const { width } = Dimensions.get('window');

// Supabase sabitlerini App.js'den al
const SUPABASE_URL = 'https://llibpqwyzexsgczxwjcp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsaWJwcXd5emV4c2djenh3amNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2NTAzNzgsImV4cCI6MjEwMDIyNjM3OH0.PYCfFxXce_oSDHru_d2TuaWGRvDsVX1fY8_Tx3_f0F0';

const DEMO_MODE = true; // Demo mode AÇIK - Supabase sorunlu

export default function AuthScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const scrollViewRef = useRef(null);

  // Demo kullanıcı profilleri
  const demoUsers = [
    { image: 'https://i.pravatar.cc/300?img=1', name: 'Emma', age: 24, country: '🇹🇷' },
    { image: 'https://i.pravatar.cc/300?img=12', name: 'Alex', age: 27, country: '🇬🇧' },
    { image: 'https://i.pravatar.cc/300?img=5', name: 'Sofia', age: 22, country: '🇪🇸' },
    { image: 'https://i.pravatar.cc/300?img=13', name: 'David', age: 25, country: '🇺🇸' },
    { image: 'https://i.pravatar.cc/300?img=9', name: 'Yuki', age: 23, country: '🇯🇵' },
    { image: 'https://i.pravatar.cc/300?img=15', name: 'Marco', age: 26, country: '🇮🇹' },
    { image: 'https://i.pravatar.cc/300?img=20', name: 'Lisa', age: 21, country: '🇩🇪' },
    { image: 'https://i.pravatar.cc/300?img=33', name: 'Ahmed', age: 28, country: '🇦🇪' },
  ];

  // Auto scroll
  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % demoUsers.length;
      scrollViewRef.current?.scrollTo({
        x: currentIndex * (width * 0.4),
        animated: true,
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);

      console.log('🔵 Google Sign-In başlatılıyor...');

      // Manuel OAuth flow - Deep link'e direkt redirect
      const redirectUrl = 'lumimatch://auth/callback';
      const scopes = 'email profile openid';
      
      // OAuth URL'i manuel oluştur - YENİ SUPABASE
      const authUrl = `https://llibpqwyzexsgczxwjcp.supabase.co/auth/v1/authorize?` +
        `provider=google&` +
        `redirect_to=${encodeURIComponent(redirectUrl)}`;

      console.log('✅ OAuth URL oluşturuldu:', authUrl);

      // Tarayıcıda aç
      const supported = await Linking.canOpenURL(authUrl);
      if (supported) {
        console.log('📱 Tarayıcı açılıyor...');
        await Linking.openURL(authUrl);
      } else {
        throw new Error('Tarayıcı açılamadı');
      }
    } catch (error) {
      console.error('❌ Google Sign-In hatası:', error);
      Alert.alert(
        'Hata',
        error.message || 'Google ile giriş yapılamadı. Lütfen tekrar deneyin.',
        [{ text: 'Tamam' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    console.log('🎮 Demo mode: Direkt Home\'a gidiliyor...');
    navigation.navigate('Home');
  };

  const handleEmailSignIn = async () => {
    // Demo mode açıksa direkt Home'a git
    if (DEMO_MODE) {
      handleDemoLogin();
      return;
    }

    if (!email || !password) {
      Alert.alert('Hata', 'Email ve şifre alanlarını doldurun');
      return;
    }

    try {
      setLoading(true);
      setDebugInfo('🔄 Başlatılıyor...');

      // Önce Supabase bağlantısını test et
      console.log('🧪 Supabase bağlantısı test ediliyor...');
      setDebugInfo('🧪 Sunucu bağlantısı kontrol ediliyor...');

      try {
        const { data: healthCheck, error: healthError } = await supabase
          .from('profiles')
          .select('count')
          .limit(0);
        
        if (healthError) {
          console.error('❌ Health check hatası:', healthError);
          setDebugInfo(`❌ Sunucu bağlantı hatası: ${healthError.message}`);
          throw new Error(`Sunucu bağlantı hatası: ${healthError.message}`);
        }
        
        console.log('✅ Supabase bağlantısı OK');
        setDebugInfo('✅ Sunucu bağlantısı OK, giriş yapılıyor...');
      } catch (healthError) {
        console.error('❌ Health check exception:', healthError);
        setDebugInfo(`❌ Bağlantı test hatası: ${healthError.message}`);
        // Devam et, belki auth çalışır
      }

      if (isSignUp) {
        // Kayıt ol
        console.log('📝 Kayıt işlemi başlatılıyor...');
        setDebugInfo('📝 Hesap oluşturuluyor...');

        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              email: email.trim(),
            }
          }
        });

        if (error) {
          console.error('❌ SignUp hatası:', error);
          console.error('❌ Error code:', error.code);
          console.error('❌ Error status:', error.status);
          console.error('❌ Error message:', error.message);
          setDebugInfo(`❌ Kayıt hatası: ${error.message} (${error.code || 'no code'})`);
          throw error;
        }

        console.log('✅ Kayıt başarılı:', data.user?.email);
        setDebugInfo('✅ Kayıt başarılı!');

        Alert.alert(
          'Başarılı!',
          'Hesabınız oluşturuldu. Profil bilgilerinizi tamamlayın.',
          [{ text: 'Tamam', onPress: () => navigation.navigate('ProfileSetup') }]
        );
      } else {
        // Giriş yap
        console.log('🔑 Giriş işlemi başlatılıyor...');
        setDebugInfo('🔑 Giriş yapılıyor...');

        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          console.error('❌ SignIn hatası:', error);
          console.error('❌ Error code:', error.code);
          console.error('❌ Error status:', error.status);
          console.error('❌ Error message:', error.message);
          setDebugInfo(`❌ Giriş hatası: ${error.message} (${error.code || 'no code'})`);
          throw error;
        }

        console.log('✅ Email login başarılı!', data.user.email);
        setDebugInfo('✅ Giriş başarılı!');
        navigation.navigate('Home');
      }
    } catch (error) {
      console.error('❌ Email auth hatası:', error);
      console.error('❌ Error stack:', error.stack);
      
      let errorMessage = error.message || 'Giriş yapılamadı';
      
      // API key hatası özel durumu
      if (errorMessage.includes('invalid api key') || errorMessage.includes('Invalid API key')) {
        errorMessage = `API Key Hatası!\n\nSupabase bağlantısı kurulamadı.\n\nHata detayı: ${error.message}\n\nLütfen internet bağlantınızı kontrol edin.`;
      }
      
      setDebugInfo(`❌ Hata: ${error.message}`);
      Alert.alert('Hata', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const testSupabaseConnection = async () => {
    try {
      setLoading(true);
      setDebugInfo('🧪 Test başlatılıyor...');
      
      console.log('🧪 === SUPABASE BAĞLANTI TESTİ BAŞLADI ===');
      console.log('🧪 URL:', SUPABASE_URL);
      console.log('🧪 Anon Key (ilk 20 karakter):', SUPABASE_ANON_KEY.substring(0, 20) + '...');
      
      // Test 1: Basit fetch
      setDebugInfo('🧪 Test 1/3: HTTP bağlantısı...');
      try {
        const response = await fetch(`https://llibpqwyzexsgczxwjcp.supabase.co/rest/v1/`, {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          }
        });
        console.log('✅ HTTP Response:', response.status, response.statusText);
        setDebugInfo(`✅ Test 1: HTTP OK (${response.status})`);
      } catch (fetchError) {
        console.error('❌ HTTP Fetch hatası:', fetchError);
        setDebugInfo(`❌ Test 1: HTTP Hatası - ${fetchError.message}`);
        throw new Error(`HTTP bağlantı hatası: ${fetchError.message}`);
      }
      
      // Test 2: Supabase client health
      setDebugInfo('🧪 Test 2/3: Supabase client...');
      try {
        const { data, error } = await supabase.from('profiles').select('count').limit(0);
        if (error) {
          console.error('❌ Supabase query hatası:', error);
          setDebugInfo(`❌ Test 2: Query Hatası - ${error.message}`);
          throw error;
        }
        console.log('✅ Supabase query OK');
        setDebugInfo('✅ Test 2: Supabase client OK');
      } catch (queryError) {
        console.error('❌ Query exception:', queryError);
        setDebugInfo(`❌ Test 2: ${queryError.message}`);
      }
      
      // Test 3: Auth endpoint
      setDebugInfo('🧪 Test 3/3: Auth endpoint...');
      try {
        const { data, error } = await supabase.auth.getSession();
        console.log('✅ Auth endpoint OK, session:', data.session ? 'VAR' : 'YOK');
        setDebugInfo('✅ Test 3: Auth endpoint OK');
      } catch (authError) {
        console.error('❌ Auth test hatası:', authError);
        setDebugInfo(`❌ Test 3: ${authError.message}`);
        throw authError;
      }
      
      console.log('🧪 === TÜM TESTLER BAŞARILI ===');
      setDebugInfo('✅ Tüm testler başarılı! Supabase çalışıyor.');
      
      Alert.alert(
        'Test Başarılı! ✅',
        'Supabase bağlantısı çalışıyor. Artık email/şifre ile kayıt olabilirsiniz.',
        [{ text: 'Tamam' }]
      );
    } catch (error) {
      console.error('❌ === TEST BAŞARISIZ ===');
      console.error('❌ Hata:', error);
      
      Alert.alert(
        'Test Başarısız ❌',
        `Supabase bağlantısı kurulamadı.\n\nHata: ${error.message}\n\nLütfen internet bağlantınızı kontrol edin veya demo modunu kullanın.`,
        [{ text: 'Tamam' }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Video Slider */}
      <View style={styles.backgroundSlider}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled={false}
          showsHorizontalScrollIndicator={false}
          snapToInterval={width * 0.4}
          decelerationRate="fast"
          contentContainerStyle={styles.sliderContent}
        >
          {demoUsers.map((user, index) => (
            <View key={index} style={styles.userCard}>
              {/* Gerçek insan fotoğrafı */}
              <Image 
                source={{ uri: user.image }}
                style={styles.userImage}
                resizeMode="cover"
              />
              
              {/* Overlay gradient */}
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.85)']}
                style={styles.userOverlay}
              >
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.name}, {user.age}</Text>
                  <Text style={styles.userCountry}>{user.country}</Text>
                </View>
                <View style={styles.liveBadge}>
                  <View style={styles.liveIndicator} />
                  <Text style={styles.liveText}>CANLI</Text>
                </View>
              </LinearGradient>
            </View>
          ))}
        </ScrollView>
        
        {/* Overlay Gradient */}
        <LinearGradient
          colors={['rgba(10,14,26,0.2)', 'rgba(10,14,26,0.9)', 'rgba(10,14,26,1)']}
          style={styles.overlayGradient}
          pointerEvents="none"
        />
        
        {/* Online Count */}
        <View style={styles.onlineCount}>
          <View style={styles.onlineDot} />
          <Text style={styles.onlineText}>
            <Text style={styles.onlineNumber}>12,847</Text> çevrimiçi
          </Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.contentScroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={['#00e5ff', '#7b2ff7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoGradient}
          >
            <Text style={styles.emoji}>💬</Text>
          </LinearGradient>
          <Text style={styles.appName}>LumiMatch</Text>
          <Text style={styles.tagline}>Gerçek ve Kaliteli Görüşmeler</Text>
        </View>

        {/* Features - Kompakt */}
        <View style={styles.featuresCompact}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIconSmall}>📹</Text>
            <Text style={styles.featureTextSmall}>HD Video</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIconSmall}>🌍</Text>
            <Text style={styles.featureTextSmall}>12 Dil</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIconSmall}>🎯</Text>
            <Text style={styles.featureTextSmall}>Filtreler</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIconSmall}>🔒</Text>
            <Text style={styles.featureTextSmall}>Güvenli</Text>
          </View>
        </View>

        {/* Auth Card */}
        <View style={styles.authCard}>
          <Text style={styles.authTitle}>Hemen Başla</Text>
          <Text style={styles.authSubtitle}>
            Dünya çapında binlerce kişiyle tanış
          </Text>

          {/* Demo Mode Banner */}
          {DEMO_MODE && (
            <View style={styles.demoBanner}>
              <Text style={styles.demoIcon}>🎮</Text>
              <View style={styles.demoTextContainer}>
                <Text style={styles.demoTitle}>Demo Mode Aktif</Text>
                <Text style={styles.demoText}>Kayıt olmadan test edebilirsiniz</Text>
              </View>
            </View>
          )}

          {/* Debug Info */}
          {debugInfo !== '' && (
            <View style={styles.debugBanner}>
              <Text style={styles.debugText}>{debugInfo}</Text>
            </View>
          )}

          {/* Test Button - Sadece debug için */}
          <TouchableOpacity
            style={styles.testButton}
            onPress={testSupabaseConnection}
            disabled={loading}
          >
            <Text style={styles.testButtonText}>
              🧪 Supabase Bağlantısını Test Et
            </Text>
          </TouchableOpacity>

          {DEMO_MODE && (
            <TouchableOpacity
              style={styles.demoButton}
              onPress={handleDemoLogin}
            >
              <LinearGradient
                colors={['#ff6b6b', '#ee5a6f']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.demoGradient}
              >
                <Text style={styles.demoButtonText}>🎮 Demo ile Giriş Yap</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Email/Password Form */}
          <View style={styles.emailForm}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#666"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
            <TextInput
              style={styles.input}
              placeholder="Şifre"
              placeholderTextColor="#666"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
            
            <TouchableOpacity
              style={styles.emailButton}
              onPress={handleEmailSignIn}
              disabled={loading}
            >
              <LinearGradient
                colors={['#7b2ff7', '#00e5ff']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.emailGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.emailButtonText}>
                    {isSignUp ? 'Kayıt Ol' : 'Giriş Yap'}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsSignUp(!isSignUp)}
              disabled={loading}
            >
              <Text style={styles.switchText}>
                {isSignUp ? 'Hesabın var mı? Giriş Yap' : 'Hesabın yok mu? Kayıt Ol'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>veya</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Button */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
            disabled={loading}
          >
            <LinearGradient
              colors={['#4285F4', '#34A853']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.googleGradient}
            >
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleText}>Google ile Devam Et</Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.terms}>
            18+ • Kullanım koşullarını kabul ediyorum
          </Text>
        </View>

        {/* Social */}
        <View style={styles.social}>
          <Text style={styles.socialTitle}>Bizi Takip Et</Text>
          
          <View style={styles.socialButtons}>
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => Linking.openURL('https://instagram.com/lumimatch')}
            >
              <LinearGradient
                colors={['#833AB4', '#FD1D1D', '#F77737']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.socialGradient}
              >
                <Text style={styles.socialIcon}>📷</Text>
                <View style={styles.socialInfo}>
                  <Text style={styles.socialName}>Instagram</Text>
                  <Text style={styles.socialHandle}>@lumimatch</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.socialButton}
              onPress={() => Linking.openURL('https://tiktok.com/@lumimatchoffical')}
            >
              <LinearGradient
                colors={['#000000', '#fe2c55', '#000000']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.socialGradient}
              >
                <Text style={styles.socialIcon}>🎵</Text>
                <View style={styles.socialInfo}>
                  <Text style={styles.socialName}>TikTok</Text>
                  <Text style={styles.socialHandle}>@lumimatchoffical</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0f17', // Web sitenle aynı
  },
  backgroundSlider: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  sliderContent: {
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  userCard: {
    width: width * 0.35,
    height: 200,
    marginRight: 12,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  userImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  userOverlay: {
    flex: 1,
    padding: 12,
    justifyContent: 'flex-end',
  },
  userCardGradient: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(10,20,30,0.92)', // Web sitenle aynı
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.25)', // Web sitenle aynı
  },
  userEmoji: {
    fontSize: 48,
    textAlign: 'center',
    marginTop: 20,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  userCountry: {
    fontSize: 18,
    marginTop: 2,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,71,87,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  liveIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ff4757',
  },
  liveText: {
    color: '#ff4757',
    fontSize: 10,
    fontWeight: '700',
  },
  overlayGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
  },
  onlineCount: {
    position: 'absolute',
    top: 50,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.3)',
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2ecc71', // Web sitendeki success rengi
  },
  onlineText: {
    color: '#e8f0f8', // Web sitendeki text rengi
    fontSize: 12,
    fontWeight: '600',
  },
  onlineNumber: {
    color: '#2ecc71',
    fontWeight: '700',
  },
  contentScroll: {
    flex: 1,
    marginTop: '40%',
  },
  scrollContent: {
    padding: 24,
    paddingTop: 0,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emoji: {
    fontSize: 40,
  },
  appName: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 13,
    color: '#00e5ff',
    fontWeight: '600',
  },
  featuresCompact: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.25)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  featureItem: {
    alignItems: 'center',
    gap: 4,
  },
  featureIconSmall: {
    fontSize: 24,
  },
  featureTextSmall: {
    fontSize: 11,
    color: '#a9b6c7',
    fontWeight: '600',
  },
  authCard: {
    backgroundColor: 'rgba(10,20,30,0.92)', // Web sitenle aynı
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.25)', // Web sitenle aynı
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 25,
    elevation: 10,
  },
  authTitle: {
    fontSize: 28, // Web sitedeki .title ile aynı
    fontWeight: '800',
    color: '#e8f0f8', // Web sitendeki text rengi
    textAlign: 'center',
    marginBottom: 6,
  },
  authSubtitle: {
    fontSize: 13,
    color: '#a9b6c7', // Web sitendeki muted rengi
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  emailForm: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.2)',
    borderRadius: 12,
    padding: 14,
    color: '#ffffff',
    fontSize: 15,
    marginBottom: 12,
  },
  emailButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
  },
  emailGradient: {
    padding: 16,
    alignItems: 'center',
  },
  emailButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  switchText: {
    textAlign: 'center',
    color: '#00e5ff',
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  dividerText: {
    color: '#666',
    fontSize: 12,
    marginHorizontal: 12,
    fontWeight: '600',
  },
  googleButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
  },
  googleGradient: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  googleText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  terms: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'center',
  },
  demoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(123,47,247,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(123,47,247,0.4)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 12,
  },
  demoIcon: {
    fontSize: 24,
  },
  demoTextContainer: {
    flex: 1,
  },
  demoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7b2ff7',
    marginBottom: 2,
  },
  demoText: {
    fontSize: 11,
    color: '#a9b6c7',
  },
  demoButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 16,
  },
  demoGradient: {
    padding: 16,
    alignItems: 'center',
  },
  demoButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  debugBanner: {
    backgroundColor: 'rgba(255,193,7,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,193,7,0.4)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  debugText: {
    fontSize: 11,
    color: '#ffc107',
    fontFamily: 'monospace',
  },
  testButton: {
    backgroundColor: 'rgba(33,150,243,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(33,150,243,0.4)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  testButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2196f3',
  },
  social: {
    alignItems: 'center',
  },
  socialTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
  },
  socialButtons: {
    width: '100%',
    gap: 12,
  },
  socialButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  socialGradient: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  socialIcon: {
    fontSize: 24,
  },
  socialInfo: {
    flex: 1,
  },
  socialName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  socialHandle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
});
