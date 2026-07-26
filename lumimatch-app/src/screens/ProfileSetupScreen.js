import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase, useUser } from '../../App';
import { userService } from '../services/supabaseService';
// import { botService } from '../services/botService'; // TODO: Backend hazır olunca aktif et

export default function ProfileSetupScreen({ navigation }) {
  const { setUser } = useUser();
  const [username, setUsername] = useState('');
  const [gender, setGender] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAgeModal, setShowAgeModal] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);

  const handleSave = async () => {
    if (!username.trim()) {
      Alert.alert('Hata', 'Kullanıcı adı gerekli');
      return;
    }
    if (!gender) {
      Alert.alert('Hata', 'Cinsiyet seçimi gerekli');
      return;
    }
    if (!birthDay || !birthMonth || !birthYear) {
      Alert.alert('Hata', 'Doğum tarihi gerekli');
      return;
    }

    // Tarih geçerliliği kontrolü
    const day = parseInt(birthDay);
    const month = parseInt(birthMonth);
    const year = parseInt(birthYear);

    if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > new Date().getFullYear()) {
      Alert.alert('Hata', 'Geçerli bir doğum tarihi giriniz');
      return;
    }

    // 18 yaş kontrolü
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();
    
    // Tam 18 yaş hesaplama
    const actualAge = age - ((monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) ? 1 : 0);

    if (actualAge < 18) {
      Alert.alert(
        '❌ Kayıt Yapılamıyor',
        'LumiMatch uygulamasını kullanmak için en az 18 yaşında olmalısınız.',
        [{ text: 'Tamam' }]
      );
      return;
    }

    // 18+ Onay modalını göster
    setShowAgeModal(true);
  };

  const confirmAgeAndRegister = async () => {
    if (!ageConfirmed) {
      Alert.alert('Uyarı', 'Devam etmek için 18 yaş onayını vermelisiniz');
      return;
    }

    try {
      setLoading(true);
      setShowAgeModal(false);
      
      const birthDate = `${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`;
      const age = new Date().getFullYear() - parseInt(birthYear);

      // Get current user (handle demo mode)
      const { data: { user } } = await supabase.auth.getUser();
      
      // Demo mode: kullanıcı yoksa fake ID kullan
      const userId = user?.id || 'demo-user-' + Date.now();

      // Create/update user profile
      const { error } = await userService.updateProfile(userId, {
        username: username.trim(),
        display_name: username.trim(),
        gender: gender,
        age: age,
        tokens: 100, // İlk kayıt bonusu
        is_premium: false,
      });

      if (error && error.message !== 'Demo mode active') {
        throw error;
      }

      // ✨ Bot servisi şimdilik devre dışı (backend hazır olunca aktif edilecek)
      // setTimeout(async () => {
      //   await botService.sendWelcomeSeries(userId);
      // }, 2000);

      // Demo mode: fake user oluştur ve context'e kaydet
      const demoUser = {
        id: userId,
        email: 'demo@lumimatch.app',
        username: username.trim(),
        display_name: username.trim(),
      };
      setUser(demoUser);

      navigation.replace('Home');
    } catch (error) {
      Alert.alert('Hata', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0f1b2d', '#1a2744']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Profilini Oluştur</Text>
        <Text style={styles.subtitle}>
          Kullanıcı adı, cinsiyet ve doğum tarihini gir
        </Text>

        {/* Username */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Kullanıcı Adı</Text>
          <TextInput
            style={styles.input}
            placeholder="örn: LumiKullanici"
            placeholderTextColor="#5a6a7e"
            value={username}
            onChangeText={setUsername}
            maxLength={24}
          />
        </View>

        {/* Gender */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Cinsiyet</Text>
          <View style={styles.genderRow}>
            <TouchableOpacity
              style={[styles.genderBtn, gender === 'erkek' && styles.genderBtnActive]}
              onPress={() => setGender('erkek')}
            >
              <Text style={styles.genderText}>👨 Erkek</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.genderBtn, gender === 'kadin' && styles.genderBtnActive]}
              onPress={() => setGender('kadin')}
            >
              <Text style={styles.genderText}>👩 Kadın</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Birth Date */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Doğum Tarihi</Text>
          <View style={styles.dateRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Gün"
              placeholderTextColor="#5a6a7e"
              value={birthDay}
              onChangeText={setBirthDay}
              keyboardType="number-pad"
              maxLength={2}
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Ay"
              placeholderTextColor="#5a6a7e"
              value={birthMonth}
              onChangeText={setBirthMonth}
              keyboardType="number-pad"
              maxLength={2}
            />
            <TextInput
              style={[styles.input, { flex: 1.2 }]}
              placeholder="Yıl"
              placeholderTextColor="#5a6a7e"
              value={birthYear}
              onChangeText={setBirthYear}
              keyboardType="number-pad"
              maxLength={4}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveBtnText}>
            {loading ? 'Kaydediliyor...' : 'Kaydet ve Devam Et'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 18+ Yaş Onay Modal */}
      <Modal
        visible={showAgeModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAgeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalIcon}>🔞</Text>
            <Text style={styles.modalTitle}>Yaş Onayı</Text>
            <Text style={styles.modalMessage}>
              LumiMatch uygulaması 18 yaş ve üzeri içerik içermektedir.
              {'\n\n'}
              Devam etmek için aşağıdaki kutucuğu işaretleyerek 18 yaşından büyük olduğunuzu ve Hizmet Koşullarını kabul ettiğinizi onaylayın.
            </Text>

            {/* Checkbox */}
            <TouchableOpacity 
              style={styles.checkboxContainer}
              onPress={() => setAgeConfirmed(!ageConfirmed)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, ageConfirmed && styles.checkboxActive]}>
                {ageConfirmed && <Text style={styles.checkboxIcon}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>
                18 yaşından büyük olduğumu ve Hizmet Koşullarını kabul ettiğimi onaylıyorum
              </Text>
            </TouchableOpacity>

            {/* Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalBtnCancel}
                onPress={() => {
                  setShowAgeModal(false);
                  setAgeConfirmed(false);
                }}
              >
                <Text style={styles.modalBtnCancelText}>İptal</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalBtnConfirm, !ageConfirmed && styles.modalBtnDisabled]}
                onPress={confirmAgeAndRegister}
                disabled={!ageConfirmed}
              >
                <Text style={styles.modalBtnConfirmText}>Onayla ve Devam Et</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#a9b6c7',
    textAlign: 'center',
    marginBottom: 32,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    color: '#a9b6c7',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(15,23,42,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.3)',
    borderRadius: 10,
    padding: 14,
    color: '#ffffff',
    fontSize: 15,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 10,
  },
  genderBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  genderBtnActive: {
    backgroundColor: 'rgba(0,229,255,0.15)',
    borderColor: '#00e5ff',
  },
  genderText: {
    color: '#ffffff',
    fontSize: 15,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 8,
  },
  saveBtn: {
    backgroundColor: '#2ecc71',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#1a2744',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 2,
    borderColor: 'rgba(0,229,255,0.3)',
  },
  modalIcon: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalMessage: {
    fontSize: 14,
    color: '#a9b6c7',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: '#00e5ff',
    borderColor: '#00e5ff',
  },
  checkboxIcon: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '900',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 13,
    color: '#ffffff',
    lineHeight: 18,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBtnCancel: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  modalBtnCancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  modalBtnConfirm: {
    flex: 1,
    backgroundColor: '#2ecc71',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  modalBtnDisabled: {
    opacity: 0.5,
  },
  modalBtnConfirmText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
});
