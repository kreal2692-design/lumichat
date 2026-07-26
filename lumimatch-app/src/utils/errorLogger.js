/**
 * Error Logger & Debug Utility
 * 
 * Bu dosya uygulama çökmelerini tespit etmek ve log kayıtlarını toplamak için kullanılır.
 * 
 * KULLANIM:
 * import { logError, logInfo, logWarning, enableDebugMode } from '../utils/errorLogger';
 * 
 * // Hata loglama
 * logError('VideoCallScreen', 'Camera init failed', error);
 * 
 * // Bilgi loglama
 * logInfo('HomeScreen', 'User loaded successfully');
 * 
 * // Debug mode açma (geliştirme için)
 * enableDebugMode(true);
 */

// Debug mode - Geliştirme sırasında true, production'da false
let DEBUG_MODE = __DEV__ || false;

// Log history - Son 100 log'u tutuyoruz
const LOG_HISTORY = [];
const MAX_LOG_HISTORY = 100;

/**
 * Debug mode'u açıp kapatır
 */
export const enableDebugMode = (enabled) => {
  DEBUG_MODE = enabled;
  console.log(`🔧 Debug mode: ${enabled ? 'AÇIK' : 'KAPALI'}`);
};

/**
 * Log'u history'ye ekle
 */
const addToHistory = (logEntry) => {
  LOG_HISTORY.unshift(logEntry);
  if (LOG_HISTORY.length > MAX_LOG_HISTORY) {
    LOG_HISTORY.pop();
  }
};

/**
 * Hata loglama - Kırmızı
 */
export const logError = (component, message, error = null) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    type: 'ERROR',
    component,
    message,
    error: error ? {
      message: error.message,
      stack: error.stack,
      name: error.name,
    } : null,
    timestamp,
  };

  addToHistory(logEntry);

  if (DEBUG_MODE) {
    console.error(`❌ [${component}] ${message}`);
    if (error) {
      console.error('Error details:', error);
    }
  }

  return logEntry;
};

/**
 * Uyarı loglama - Sarı
 */
export const logWarning = (component, message, data = null) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    type: 'WARNING',
    component,
    message,
    data,
    timestamp,
  };

  addToHistory(logEntry);

  if (DEBUG_MODE) {
    console.warn(`⚠️ [${component}] ${message}`);
    if (data) {
      console.warn('Warning data:', data);
    }
  }

  return logEntry;
};

/**
 * Bilgi loglama - Mavi
 */
export const logInfo = (component, message, data = null) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    type: 'INFO',
    component,
    message,
    data,
    timestamp,
  };

  addToHistory(logEntry);

  if (DEBUG_MODE) {
    console.log(`ℹ️ [${component}] ${message}`);
    if (data) {
      console.log('Info data:', data);
    }
  }

  return logEntry;
};

/**
 * Başarı loglama - Yeşil
 */
export const logSuccess = (component, message, data = null) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    type: 'SUCCESS',
    component,
    message,
    data,
    timestamp,
  };

  addToHistory(logEntry);

  if (DEBUG_MODE) {
    console.log(`✅ [${component}] ${message}`);
    if (data) {
      console.log('Success data:', data);
    }
  }

  return logEntry;
};

/**
 * Log history'yi al
 */
export const getLogHistory = () => {
  return [...LOG_HISTORY];
};

/**
 * Log history'yi temizle
 */
export const clearLogHistory = () => {
  LOG_HISTORY.length = 0;
  console.log('🗑️ Log history temizlendi');
};

/**
 * Log'ları dosyaya kaydet (gelecekte kullanılabilir)
 */
export const exportLogs = () => {
  const logs = getLogHistory();
  const logsText = logs.map(log => {
    return `[${log.timestamp}] [${log.type}] [${log.component}] ${log.message}`;
  }).join('\n');
  
  return logsText;
};

/**
 * Async fonksiyon wrapper - Hataları otomatik loglar
 * 
 * KULLANIM:
 * const safeFetch = wrapAsync('HomeScreen', async () => {
 *   const data = await fetchData();
 *   return data;
 * });
 */
export const wrapAsync = (component, asyncFunc) => {
  return async (...args) => {
    try {
      const result = await asyncFunc(...args);
      return result;
    } catch (error) {
      logError(component, 'Async function failed', error);
      throw error;
    }
  };
};

/**
 * Component lifecycle logger - Component mount/unmount izleme
 */
export const logLifecycle = (component, lifecycle) => {
  if (DEBUG_MODE) {
    console.log(`🔄 [${component}] ${lifecycle}`);
  }
};

/**
 * Performance logger - İşlem süresini ölç
 */
export const measurePerformance = (component, label) => {
  const startTime = Date.now();
  
  return () => {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    if (DEBUG_MODE) {
      console.log(`⏱️ [${component}] ${label}: ${duration}ms`);
    }
    
    return duration;
  };
};

// Global error handler
if (DEBUG_MODE) {
  console.log('🚀 Error Logger initialized');
}
