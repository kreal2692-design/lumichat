/**
 * Error Boundary Component
 * 
 * React'te beklenmeyen hatalar oluştuğunda uygulamanın çökmesini önler.
 * Hataları yakalar ve kullanıcıya güvenli bir ekran gösterir.
 * 
 * KULLANIM:
 * import ErrorBoundary from './components/ErrorBoundary';
 * 
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { logError } from '../utils/errorLogger';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Bir hata yakalandığında state'i güncelle
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Hatayı logla
    logError('ErrorBoundary', 'Uncaught error in component tree', {
      error: error.toString(),
      componentStack: errorInfo.componentStack,
    });

    // State'i güncelle
    this.setState({
      error,
      errorInfo,
    });

    // Console'a da yazdır
    console.error('❌ Error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    // State'i resetle
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Hata ekranını göster
      return (
        <LinearGradient
          colors={['#0a0e1a', '#1a1f2e', '#0a0e1a']}
          style={styles.container}
        >
          <View style={styles.content}>
            {/* Error Icon */}
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>⚠️</Text>
            </View>

            {/* Error Message */}
            <Text style={styles.title}>Bir Şeyler Yanlış Gitti</Text>
            <Text style={styles.subtitle}>
              Beklenmeyen bir hata oluştu. Lütfen uygulamayı yeniden başlatın.
            </Text>

            {/* Error Details (only in debug mode) */}
            {__DEV__ && this.state.error && (
              <ScrollView style={styles.errorDetails}>
                <Text style={styles.errorTitle}>Hata Detayları:</Text>
                <Text style={styles.errorText}>
                  {this.state.error.toString()}
                </Text>
                {this.state.errorInfo && (
                  <>
                    <Text style={styles.errorTitle}>Component Stack:</Text>
                    <Text style={styles.errorStack}>
                      {this.state.errorInfo.componentStack}
                    </Text>
                  </>
                )}
              </ScrollView>
            )}

            {/* Action Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={this.handleReset}
              >
                <LinearGradient
                  colors={['#00e5ff', '#00a8cc']}
                  style={styles.btnGradient}
                >
                  <Text style={styles.btnText}>🔄 Tekrar Dene</Text>
                </LinearGradient>
              </TouchableOpacity>

              {__DEV__ && (
                <TouchableOpacity
                  style={styles.secondaryBtn}
                  onPress={() => {
                    console.log('Error:', this.state.error);
                    console.log('Error Info:', this.state.errorInfo);
                  }}
                >
                  <Text style={styles.secondaryBtnText}>📋 Hata Logunu Göster</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Info Text */}
            <Text style={styles.infoText}>
              Sorun devam ederse uygulamayı yeniden yükleyin veya destek ile iletişime geçin.
            </Text>
          </View>
        </LinearGradient>
      );
    }

    // Hata yoksa child component'leri render et
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,68,68,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 64,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#a9b6c7',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  errorDetails: {
    width: '100%',
    maxHeight: 200,
    backgroundColor: 'rgba(255,68,68,0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 3,
    borderLeftColor: '#ff4444',
  },
  errorTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ff4444',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#ff8888',
    marginBottom: 12,
    fontFamily: 'monospace',
  },
  errorStack: {
    fontSize: 10,
    color: '#aa6666',
    fontFamily: 'monospace',
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  primaryBtn: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  btnGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000000',
  },
  secondaryBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  infoText: {
    fontSize: 12,
    color: '#5a6a7e',
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 18,
  },
});

export default ErrorBoundary;
