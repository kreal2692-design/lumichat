/**
 * Debug Screen - Hata Loglarını Görüntüleme Ekranı
 * 
 * Bu ekran geliştiricilerin uygulama içindeki hataları görmesini sağlar.
 * Production'da gizlenmelidir.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  getLogHistory, 
  clearLogHistory, 
  exportLogs,
  enableDebugMode 
} from '../utils/errorLogger';

export default function DebugScreen({ navigation }) {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('ALL'); // ALL, ERROR, WARNING, INFO
  const [debugMode, setDebugMode] = useState(true);

  useEffect(() => {
    loadLogs();
    const interval = setInterval(loadLogs, 2000); // 2 saniyede bir güncelle
    return () => clearInterval(interval);
  }, []);

  const loadLogs = () => {
    const history = getLogHistory();
    setLogs(history);
  };

  const handleClearLogs = () => {
    Alert.alert(
      'Logları Temizle',
      'Tüm log kayıtlarını silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Temizle',
          style: 'destructive',
          onPress: () => {
            clearLogHistory();
            loadLogs();
            Alert.alert('✓ Başarılı', 'Log kayıtları temizlendi.');
          }
        }
      ]
    );
  };

  const handleExportLogs = async () => {
    try {
      const logsText = exportLogs();
      await Share.share({
        message: logsText,
        title: 'LumiMatch Debug Logs',
      });
    } catch (error) {
      Alert.alert('Hata', 'Loglar dışa aktarılamadı.');
    }
  };

  const handleToggleDebugMode = () => {
    const newMode = !debugMode;
    setDebugMode(newMode);
    enableDebugMode(newMode);
    Alert.alert(
      'Debug Mode',
      `Debug mode ${newMode ? 'AÇILDI' : 'KAPANDI'}\n\n` +
      `${newMode ? 'Tüm loglar console\'da görünecek.' : 'Console logları kapatıldı.'}`
    );
  };

  const getLogIcon = (type) => {
    switch (type) {
      case 'ERROR': return '❌';
      case 'WARNING': return '⚠️';
      case 'INFO': return 'ℹ️';
      case 'SUCCESS': return '✅';
      default: return '📝';
    }
  };

  const getLogColor = (type) => {
    switch (type) {
      case 'ERROR': return '#ff4444';
      case 'WARNING': return '#ffaa00';
      case 'INFO': return '#44aaff';
      case 'SUCCESS': return '#44ff44';
      default: return '#999999';
    }
  };

  const filteredLogs = logs.filter(log => {
    if (filter === 'ALL') return true;
    return log.type === filter;
  });

  return (
    <LinearGradient
      colors={['#0a0e1a', '#1a1f2e', '#0a0e1a']}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Debug Console</Text>
        <TouchableOpacity 
          style={styles.moreBtn}
          onPress={handleToggleDebugMode}
        >
          <Text style={styles.moreIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{logs.length}</Text>
          <Text style={styles.statLabel}>Toplam Log</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#ff4444' }]}>
            {logs.filter(l => l.type === 'ERROR').length}
          </Text>
          <Text style={styles.statLabel}>Hata</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#ffaa00' }]}>
            {logs.filter(l => l.type === 'WARNING').length}
          </Text>
          <Text style={styles.statLabel}>Uyarı</Text>
        </View>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filters}>
        {['ALL', 'ERROR', 'WARNING', 'INFO'].map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Logs List */}
      <ScrollView style={styles.logsList} contentContainerStyle={styles.logsContent}>
        {filteredLogs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>Henüz log kaydı yok</Text>
          </View>
        ) : (
          filteredLogs.map((log, index) => (
            <View key={index} style={styles.logCard}>
              <View style={styles.logHeader}>
                <Text style={styles.logIcon}>{getLogIcon(log.type)}</Text>
                <View style={styles.logHeaderInfo}>
                  <Text style={styles.logComponent}>{log.component}</Text>
                  <Text style={styles.logTime}>
                    {new Date(log.timestamp).toLocaleTimeString('tr-TR')}
                  </Text>
                </View>
                <View style={[styles.logBadge, { backgroundColor: getLogColor(log.type) }]}>
                  <Text style={styles.logBadgeText}>{log.type}</Text>
                </View>
              </View>
              <Text style={styles.logMessage}>{log.message}</Text>
              {log.error && (
                <View style={styles.errorDetails}>
                  <Text style={styles.errorTitle}>Error Details:</Text>
                  <Text style={styles.errorText}>{log.error.message}</Text>
                  {log.error.stack && (
                    <Text style={styles.errorStack} numberOfLines={3}>
                      {log.error.stack}
                    </Text>
                  )}
                </View>
              )}
              {log.data && (
                <View style={styles.dataDetails}>
                  <Text style={styles.dataText}>
                    {JSON.stringify(log.data, null, 2)}
                  </Text>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.actionBtn, styles.clearBtn]}
          onPress={handleClearLogs}
        >
          <Text style={styles.actionBtnText}>🗑️ Temizle</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionBtn, styles.exportBtn]}
          onPress={handleExportLogs}
        >
          <Text style={styles.actionBtnText}>📤 Dışa Aktar</Text>
        </TouchableOpacity>
      </View>

      {/* Debug Mode Indicator */}
      {debugMode && (
        <View style={styles.debugIndicator}>
          <Text style={styles.debugIndicatorText}>🔧 DEBUG MODE ACTIVE</Text>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
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
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
  },
  moreBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreIcon: {
    fontSize: 18,
  },
  stats: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(10,20,30,0.92)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.2)',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#00e5ff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#a9b6c7',
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 16,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
  },
  filterBtnActive: {
    backgroundColor: '#00e5ff',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#a9b6c7',
  },
  filterTextActive: {
    color: '#000000',
  },
  logsList: {
    flex: 1,
  },
  logsContent: {
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#a9b6c7',
  },
  logCard: {
    backgroundColor: 'rgba(10,20,30,0.92)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.15)',
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  logIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  logHeaderInfo: {
    flex: 1,
  },
  logComponent: {
    fontSize: 13,
    fontWeight: '700',
    color: '#00e5ff',
    marginBottom: 2,
  },
  logTime: {
    fontSize: 10,
    color: '#a9b6c7',
  },
  logBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  logBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ffffff',
  },
  logMessage: {
    fontSize: 13,
    color: '#ffffff',
    lineHeight: 18,
    marginBottom: 8,
  },
  errorDetails: {
    backgroundColor: 'rgba(255,68,68,0.1)',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#ff4444',
  },
  errorTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ff4444',
    marginBottom: 6,
  },
  errorText: {
    fontSize: 12,
    color: '#ff8888',
    marginBottom: 6,
  },
  errorStack: {
    fontSize: 10,
    color: '#aa6666',
    fontFamily: 'monospace',
  },
  dataDetails: {
    backgroundColor: 'rgba(68,170,255,0.1)',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  dataText: {
    fontSize: 11,
    color: '#88ccff',
    fontFamily: 'monospace',
  },
  actions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  clearBtn: {
    backgroundColor: 'rgba(255,68,68,0.2)',
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  exportBtn: {
    backgroundColor: 'rgba(0,229,255,0.2)',
    borderWidth: 1,
    borderColor: '#00e5ff',
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
  debugIndicator: {
    position: 'absolute',
    top: 100,
    right: 20,
    backgroundColor: 'rgba(255,170,0,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  debugIndicatorText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#000000',
  },
});
