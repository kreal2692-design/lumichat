import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DEMO_USER, spendDemoDiamonds } from '../data/demoData';

export default function PrivateCallScreen({ route, navigation }) {
  const { creator, pricing, onTokenUpdate } = route.params;
  
  const [seconds, setSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [diamondsSpent, setDiamondsSpent] = useState(0);
  const [isFreeTime, setIsFreeTime] = useState(true);
  
  const intervalRef = useRef(null);

  useEffect(() => {
    // Timer başlat
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Ücretsiz süre bitti mi?
    if (seconds > pricing.freeSeconds && isFreeTime) {
      setIsFreeTime(false);
      Alert.alert(
        '⏰ Ücretsiz Süre Bitti',
        `Ücretsiz ${pricing.freeSeconds} saniye doldu.\n\n` +
        `Artık dakikası ${pricing.pricePerMinute} elmas üzerinden ücretlendirileceksiniz.`,
        [
          { text: 'Anladım', style: 'default' },
        ]
      );
    }

    // Ücretli sürede - her dakika elmas kes
    if (!isFreeTime && seconds > pricing.freeSeconds) {
      const paidSeconds = seconds - pricing.freeSeconds;
      const paidMinutes = Math.floor(paidSeconds / 60);
      const currentDiamondsSpent = paidMinutes * pricing.pricePerMinute;

      if (currentDiamondsSpent > diamondsSpent) {
        // Yeni dakika başladı
        const diamondsNeeded = pricing.pricePerMinute;
        
        if (DEMO_USER.diamonds < diamondsNeeded) {
          // Yetersiz bakiye - görüşmeyi bitir
          endCall(true);
        } else {
          // Elmas kes
          spendDemoDiamonds(diamondsNeeded);
          setDiamondsSpent(currentDiamondsSpent);
          if (onTokenUpdate) {
            onTokenUpdate(DEMO_USER.diamonds);
          }
        }
      }
    }
  }, [seconds]);

  const endCall = (insufficientBalance = false) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const message = insufficientBalance 
      ? `Yetersiz bakiye nedeniyle görüşme sonlandırıldı.\n\n` +
        `Süre: ${formatTime(seconds)}\n` +
        `Harcanan: ${diamondsSpent} elmas`
      : `Görüşme süresi: ${formatTime(seconds)}\n` +
        `Harcanan: ${diamondsSpent} elmas`;

    Alert.alert(
      'Görüşme Sonlandı',
      message,
      [
        { 
          text: insufficientBalance ? 'Elmas Al' : 'Tamam', 
          onPress: () => {
            navigation.goBack();
            if (insufficientBalance) {
              navigation.navigate('TokenShop');
            }
          }
        },
      ]
    );
  };

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCostDisplay = () => {
    if (isFreeTime) {
      const remaining = pricing.freeSeconds - seconds;
      return `🎁 ${remaining}sn ücretsiz kaldı`;
    } else {
      return `💎 ${diamondsSpent} elmas harcandı`;
    }
  };

  return (
    <View style={styles.container}>
      {/* Video View - Mock */}
      <View style={styles.videoContainer}>
        {/* Remote Video (Creator) */}
        <View style={styles.remoteVideo}>
          <Image 
            source={{ uri: creator.avatar }}
            style={styles.remoteVideoImage}
            blurRadius={isCameraOff ? 10 : 0}
          />
          {isCameraOff && (
            <View style={styles.cameraOffOverlay}>
              <Text style={styles.cameraOffText}>📷</Text>
              <Text style={styles.cameraOffLabel}>Kamera Kapalı</Text>
            </View>
          )}
        </View>

        {/* Local Video (You) - PiP */}
        <View style={styles.localVideo}>
          <View style={styles.localVideoPlaceholder}>
            <Text style={styles.localVideoText}>Sen</Text>
          </View>
        </View>
      </View>

      {/* Overlay */}
      <LinearGradient
        colors={['rgba(0,0,0,0.8)', 'transparent', 'rgba(0,0,0,0.9)']}
        style={styles.overlay}
      >
        {/* Top Bar */}
        <View style={styles.topBar}>
          <View style={styles.creatorInfo}>
            <Image 
              source={{ uri: creator.avatar }}
              style={styles.creatorAvatar}
            />
            <View style={styles.creatorDetails}>
              <Text style={styles.creatorName}>{creator.name}</Text>
              <View style={styles.onlineBadge}>
                <View style={styles.onlineDot} />
                <Text style={styles.onlineText}>Çevrimiçi</Text>
              </View>
            </View>
          </View>

          {/* Timer & Cost */}
          <View style={styles.timerCard}>
            <Text style={styles.timerText}>{formatTime(seconds)}</Text>
            <Text style={styles.costText}>{getCostDisplay()}</Text>
          </View>
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          {/* Balance Display */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceIcon}>💎</Text>
            <Text style={styles.balanceText}>{DEMO_USER.diamonds} elmas</Text>
          </View>

          {/* Control Buttons */}
          <View style={styles.controlsRow}>
            {/* Mute */}
            <TouchableOpacity
              style={[styles.controlBtn, isMuted && styles.controlBtnActive]}
              onPress={() => setIsMuted(!isMuted)}
            >
              <Text style={styles.controlIcon}>{isMuted ? '🔇' : '🔊'}</Text>
              <Text style={styles.controlLabel}>
                {isMuted ? 'Sessiz' : 'Mikrofon'}
              </Text>
            </TouchableOpacity>

            {/* Camera */}
            <TouchableOpacity
              style={[styles.controlBtn, isCameraOff && styles.controlBtnActive]}
              onPress={() => setIsCameraOff(!isCameraOff)}
            >
              <Text style={styles.controlIcon}>
                {isCameraOff ? '📷' : '📹'}
              </Text>
              <Text style={styles.controlLabel}>
                {isCameraOff ? 'Kamera Kapalı' : 'Kamera'}
              </Text>
            </TouchableOpacity>

            {/* End Call */}
            <TouchableOpacity
              style={styles.endCallBtn}
              onPress={() => endCall(false)}
            >
              <LinearGradient
                colors={['#ff006e', '#ff4757']}
                style={styles.endCallGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.endCallIcon}>📞</Text>
                <Text style={styles.endCallLabel}>Bitir</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  videoContainer: {
    flex: 1,
  },
  remoteVideo: {
    flex: 1,
    position: 'relative',
  },
  remoteVideoImage: {
    width: '100%',
    height: '100%',
  },
  cameraOffOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraOffText: {
    fontSize: 64,
    marginBottom: 12,
  },
  cameraOffLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  localVideo: {
    position: 'absolute',
    top: 70,
    right: 16,
    width: 100,
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  localVideoPlaceholder: {
    flex: 1,
    backgroundColor: '#1a1f2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  localVideoText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  topBar: {
    padding: 20,
    paddingTop: 50,
    gap: 12,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  creatorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  creatorDetails: {
    gap: 4,
  },
  creatorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2ecc71',
  },
  onlineText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2ecc71',
  },
  timerCard: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    alignSelf: 'center',
  },
  timerText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 4,
  },
  costText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00d9ff',
  },
  bottomControls: {
    padding: 20,
    paddingBottom: 40,
    gap: 20,
  },
  balanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,217,255,0.2)',
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,217,255,0.4)',
  },
  balanceIcon: {
    fontSize: 20,
  },
  balanceText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#00d9ff',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  controlBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    width: 80,
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    gap: 8,
  },
  controlBtnActive: {
    backgroundColor: 'rgba(255,71,87,0.3)',
  },
  controlIcon: {
    fontSize: 28,
  },
  controlLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  endCallBtn: {
    width: 80,
    borderRadius: 20,
    overflow: 'hidden',
  },
  endCallGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    gap: 8,
  },
  endCallIcon: {
    fontSize: 28,
  },
  endCallLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
});
