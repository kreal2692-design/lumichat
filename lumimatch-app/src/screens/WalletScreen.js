import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DEMO_MODE, DEMO_USER } from '../data/demoData';

export default function WalletScreen({ navigation }) {
  const [balance, setBalance] = useState(1250.50); // Demo balance
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('bank');

  const minWithdraw = 100; // Minimum ₺100

  const transactions = [
    { id: 1, type: 'earn', amount: 250.00, date: '2024-01-15', desc: 'Hediye geliri' },
    { id: 2, type: 'earn', amount: 180.50, date: '2024-01-14', desc: 'Abonelik geliri' },
    { id: 3, type: 'withdraw', amount: -500.00, date: '2024-01-10', desc: 'Banka transferi', status: 'completed' },
    { id: 4, type: 'earn', amount: 320.00, date: '2024-01-08', desc: 'Tip geliri' },
    { id: 5, type: 'withdraw', amount: -200.00, date: '2024-01-05', desc: 'Banka transferi', status: 'completed' },
  ];

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    
    if (!amount || amount < minWithdraw) {
      Alert.alert('Hata', `Minimum çekim tutarı ₺${minWithdraw}`);
      return;
    }

    if (amount > balance) {
      Alert.alert('Yetersiz Bakiye', 'Bakiyeniz yetersiz');
      return;
    }

    Alert.alert(
      'Para Çekme',
      `₺${amount.toFixed(2)} ${selectedMethod === 'bank' ? 'banka hesabına' : 'Papara hesabına'} transfer edilecek. Onaylıyor musunuz?`,
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Onayla', 
          onPress: () => {
            setBalance(balance - amount);
            setWithdrawAmount('');
            Alert.alert('Başarılı!', 'Para çekme talebiniz alındı. 1-3 iş günü içinde hesabınıza yatırılacak.');
          }
        },
      ]
    );
  };

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
        <Text style={styles.headerTitle}>Cüzdan</Text>
        <View style={styles.backBtn} />
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Balance Card */}
        <LinearGradient
          colors={['#2ecc71', '#27ae60']}
          style={styles.balanceCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.balanceLabel}>Mevcut Bakiyeniz</Text>
          <Text style={styles.balanceAmount}>₺{balance.toFixed(2)}</Text>
          <View style={styles.balanceInfo}>
            <Text style={styles.balanceInfoText}>💰 %70 Creator payı</Text>
            <Text style={styles.balanceInfoText}>🔒 Güvenli ödeme</Text>
          </View>
        </LinearGradient>

        {/* Withdraw Section */}
        <View style={styles.withdrawSection}>
          <Text style={styles.sectionTitle}>Para Çek</Text>
          
          {/* Amount Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Çekilecek Tutar</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.currencySymbol}>₺</Text>
              <TextInput
                style={styles.input}
                value={withdrawAmount}
                onChangeText={setWithdrawAmount}
                placeholder="0.00"
                placeholderTextColor="#5a6a7e"
                keyboardType="decimal-pad"
              />
            </View>
            <Text style={styles.inputHint}>Minimum çekim tutarı: ₺{minWithdraw}</Text>
          </View>

          {/* Quick Amounts */}
          <View style={styles.quickAmounts}>
            {[100, 250, 500, 1000].map((amount) => (
              <TouchableOpacity
                key={amount}
                style={styles.quickBtn}
                onPress={() => setWithdrawAmount(amount.toString())}
              >
                <Text style={styles.quickText}>₺{amount}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Payment Methods */}
          <View style={styles.methodsContainer}>
            <Text style={styles.inputLabel}>Ödeme Yöntemi</Text>
            
            <TouchableOpacity
              style={[styles.methodCard, selectedMethod === 'bank' && styles.methodCardActive]}
              onPress={() => setSelectedMethod('bank')}
            >
              <View style={styles.methodIcon}>
                <Text style={styles.methodEmoji}>🏦</Text>
              </View>
              <View style={styles.methodInfo}>
                <Text style={styles.methodTitle}>Banka Hesabı</Text>
                <Text style={styles.methodDesc}>1-3 iş günü</Text>
              </View>
              <View style={[styles.methodRadio, selectedMethod === 'bank' && styles.methodRadioActive]}>
                {selectedMethod === 'bank' && <View style={styles.methodRadioInner} />}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.methodCard, selectedMethod === 'papara' && styles.methodCardActive]}
              onPress={() => setSelectedMethod('papara')}
            >
              <View style={styles.methodIcon}>
                <Text style={styles.methodEmoji}>💳</Text>
              </View>
              <View style={styles.methodInfo}>
                <Text style={styles.methodTitle}>Papara</Text>
                <Text style={styles.methodDesc}>Anında transfer</Text>
              </View>
              <View style={[styles.methodRadio, selectedMethod === 'papara' && styles.methodRadioActive]}>
                {selectedMethod === 'papara' && <View style={styles.methodRadioInner} />}
              </View>
            </TouchableOpacity>
          </View>

          {/* Withdraw Button */}
          <TouchableOpacity
            style={styles.withdrawBtn}
            onPress={handleWithdraw}
          >
            <LinearGradient
              colors={['#2ecc71', '#27ae60']}
              style={styles.withdrawGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.withdrawText}>Para Çek</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Transaction History */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>İşlem Geçmişi</Text>
          
          {transactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionCard}>
              <View style={[
                styles.transactionIcon,
                transaction.type === 'earn' ? styles.transactionIconEarn : styles.transactionIconWithdraw
              ]}>
                <Text style={styles.transactionEmoji}>
                  {transaction.type === 'earn' ? '📥' : '📤'}
                </Text>
              </View>
              
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionDesc}>{transaction.desc}</Text>
                <Text style={styles.transactionDate}>{transaction.date}</Text>
              </View>
              
              <Text style={[
                styles.transactionAmount,
                transaction.type === 'earn' ? styles.transactionAmountEarn : styles.transactionAmountWithdraw
              ]}>
                {transaction.amount > 0 ? '+' : ''}₺{Math.abs(transaction.amount).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  // Balance Card
  balanceCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#2ecc71',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 48,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 16,
  },
  balanceInfo: {
    flexDirection: 'row',
    gap: 16,
  },
  balanceInfoText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  // Withdraw Section
  withdrawSection: {
    backgroundColor: 'rgba(26,31,46,0.6)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#a9b6c7',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2ecc71',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    paddingVertical: 16,
  },
  inputHint: {
    fontSize: 12,
    color: '#5a6a7e',
    marginTop: 8,
  },
  quickAmounts: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  quickBtn: {
    flex: 1,
    backgroundColor: 'rgba(46,204,113,0.15)',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(46,204,113,0.3)',
  },
  quickText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2ecc71',
  },
  // Payment Methods
  methodsContainer: {
    marginBottom: 20,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  methodCardActive: {
    borderColor: '#2ecc71',
    backgroundColor: 'rgba(46,204,113,0.1)',
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  methodEmoji: {
    fontSize: 24,
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  methodDesc: {
    fontSize: 12,
    color: '#a9b6c7',
  },
  methodRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#5a6a7e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodRadioActive: {
    borderColor: '#2ecc71',
  },
  methodRadioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2ecc71',
  },
  // Withdraw Button
  withdrawBtn: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  withdrawGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  withdrawText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  // Transaction History
  historySection: {
    backgroundColor: 'rgba(26,31,46,0.6)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionIconEarn: {
    backgroundColor: 'rgba(46,204,113,0.2)',
  },
  transactionIconWithdraw: {
    backgroundColor: 'rgba(255,71,87,0.2)',
  },
  transactionEmoji: {
    fontSize: 20,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDesc: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#a9b6c7',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '800',
  },
  transactionAmountEarn: {
    color: '#2ecc71',
  },
  transactionAmountWithdraw: {
    color: '#ff4757',
  },
});
