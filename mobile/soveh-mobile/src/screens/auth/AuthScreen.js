import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as LocalAuthentication from 'expo-local-authentication';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store';
import { authAPI } from '../../lib/api';
import { COLORS, SPACING, FONT_SIZES } from '../../lib/config';

const ROLES = [
  { id: 'retailer', name: 'Retailer', icon: 'storefront-outline', color: '#2563EB', desc: 'Shop owners' },
  { id: 'delivery_agent', name: 'Delivery', icon: 'bicycle-outline', color: '#F59E0B', desc: 'Delivery partners' },
  { id: 'admin', name: 'Admin', icon: 'shield-checkmark-outline', color: '#EF4444', desc: 'Operations team' },
];

export default function AuthScreen({ navigation }) {
  const [step, setStep] = useState('role'); // role, phone, otp
  const [selectedRole, setSelectedRole] = useState(null);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [testOtp, setTestOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  
  const { setUser, setBiometric, loadUser, biometricEnabled } = useAuthStore();
  const otpInputRef = useRef(null);

  useEffect(() => {
    checkBiometric();
  }, []);

  const checkBiometric = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    setBiometricAvailable(compatible && enrolled);
    
    // Try biometric login if enabled
    if (compatible && enrolled && biometricEnabled) {
      handleBiometricLogin();
    }
  };

  const handleBiometricLogin = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Login to SOVEH',
        cancelLabel: 'Use OTP',
        disableDeviceFallback: false,
      });
      
      if (result.success) {
        const loaded = await loadUser();
        if (loaded) {
          // User loaded from storage, navigation will handle redirect
          return;
        }
      }
    } catch (error) {
      console.error('Biometric error:', error);
    }
  };

  const handleSendOTP = async () => {
    if (phone.length !== 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }
    
    setLoading(true);
    try {
      const response = await authAPI.sendOTP(phone);
      if (response.data.success) {
        // Extract test OTP from response
        const match = response.data.message?.match(/Test OTP: (\d+)/);
        if (match) {
          setTestOtp(match[1]);
        }
        setStep('otp');
        setTimeout(() => otpInputRef.current?.focus(), 100);
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }
    
    setLoading(true);
    try {
      const response = await authAPI.verifyOTP(phone, otp, selectedRole);
      if (response.data.success) {
        setUser(response.data.user, response.data.token, selectedRole);
        
        // Ask to enable biometric
        if (biometricAvailable) {
          Alert.alert(
            'Enable Biometric Login?',
            'Would you like to use fingerprint/face recognition for faster login?',
            [
              { text: 'No', style: 'cancel' },
              { text: 'Yes', onPress: () => setBiometric(true) },
            ]
          );
        }
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.detail || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const renderRoleSelection = () => (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>S</Text>
        </View>
        <Text style={styles.appName}>SOVEH</Text>
        <Text style={styles.tagline}>B2B Retail Supply Network</Text>
      </View>

      <Text style={styles.sectionTitle}>Select Your Role</Text>
      
      <View style={styles.rolesContainer}>
        {ROLES.map((role) => (
          <TouchableOpacity
            key={role.id}
            style={[
              styles.roleCard,
              selectedRole === role.id && { borderColor: role.color, borderWidth: 2 }
            ]}
            onPress={() => setSelectedRole(role.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.roleIconBox, { backgroundColor: role.color + '20' }]}>
              <Ionicons name={role.icon} size={28} color={role.color} />
            </View>
            <Text style={styles.roleName}>{role.name}</Text>
            <Text style={styles.roleDesc}>{role.desc}</Text>
            {selectedRole === role.id && (
              <View style={[styles.checkMark, { backgroundColor: role.color }]}>
                <Ionicons name="checkmark" size={14} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.continueBtn, !selectedRole && styles.disabledBtn]}
        onPress={() => selectedRole && setStep('phone')}
        disabled={!selectedRole}
      >
        <Text style={styles.continueBtnText}>Continue</Text>
        <Ionicons name="arrow-forward" size={20} color="#fff" />
      </TouchableOpacity>

      {biometricAvailable && biometricEnabled && (
        <TouchableOpacity style={styles.biometricBtn} onPress={handleBiometricLogin}>
          <Ionicons name="finger-print" size={24} color={COLORS.primary} />
          <Text style={styles.biometricText}>Login with Biometric</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderPhoneInput = () => (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => setStep('role')}>
        <Ionicons name="arrow-back" size={24} color={COLORS.text} />
      </TouchableOpacity>

      <View style={styles.phoneHeader}>
        <View style={styles.phoneIconBox}>
          <Ionicons name="call-outline" size={32} color={COLORS.primary} />
        </View>
        <Text style={styles.phoneTitle}>Enter Phone Number</Text>
        <Text style={styles.phoneSubtitle}>We'll send you a verification code</Text>
      </View>

      <View style={styles.phoneInputContainer}>
        <View style={styles.countryCode}>
          <Text style={styles.countryCodeText}>+91</Text>
        </View>
        <TextInput
          style={styles.phoneInput}
          placeholder="9999999999"
          placeholderTextColor={COLORS.textLight}
          keyboardType="phone-pad"
          maxLength={10}
          value={phone}
          onChangeText={setPhone}
          autoFocus
        />
      </View>

      <TouchableOpacity
        style={[styles.continueBtn, phone.length !== 10 && styles.disabledBtn]}
        onPress={handleSendOTP}
        disabled={phone.length !== 10 || loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Text style={styles.continueBtnText}>Send OTP</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderOTPInput = () => (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => setStep('phone')}>
        <Ionicons name="arrow-back" size={24} color={COLORS.text} />
      </TouchableOpacity>

      <View style={styles.phoneHeader}>
        <View style={[styles.phoneIconBox, { backgroundColor: COLORS.success + '20' }]}>
          <Ionicons name="shield-checkmark-outline" size={32} color={COLORS.success} />
        </View>
        <Text style={styles.phoneTitle}>Verify OTP</Text>
        <Text style={styles.phoneSubtitle}>Enter the 6-digit code sent to +91 {phone}</Text>
      </View>

      {testOtp && (
        <View style={styles.testOtpBox}>
          <Text style={styles.testOtpLabel}>Test OTP:</Text>
          <Text style={styles.testOtpValue}>{testOtp}</Text>
        </View>
      )}

      <TextInput
        ref={otpInputRef}
        style={styles.otpInput}
        placeholder="000000"
        placeholderTextColor={COLORS.textLight}
        keyboardType="number-pad"
        maxLength={6}
        value={otp}
        onChangeText={setOtp}
        textAlign="center"
      />

      <TouchableOpacity
        style={[styles.continueBtn, otp.length !== 6 && styles.disabledBtn]}
        onPress={handleVerifyOTP}
        disabled={otp.length !== 6 || loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Text style={styles.continueBtnText}>Verify & Login</Text>
            <Ionicons name="checkmark" size={20} color="#fff" />
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.resendBtn} onPress={handleSendOTP}>
        <Text style={styles.resendText}>Didn't receive code? </Text>
        <Text style={styles.resendLink}>Resend</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {step === 'role' && renderRoleSelection()}
          {step === 'phone' && renderPhoneInput()}
          {step === 'otp' && renderOTPInput()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: SPACING.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
  },
  appName: {
    fontSize: FONT_SIZES.hero,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  tagline: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  rolesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  roleCard: {
    width: '31%',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  roleIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  roleName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  roleDesc: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  checkMark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: 16,
    marginTop: SPACING.xl,
    gap: SPACING.sm,
  },
  continueBtnText: {
    color: '#fff',
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
  },
  disabledBtn: {
    backgroundColor: COLORS.textLight,
  },
  biometricBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  biometricText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.inputBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  phoneHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  phoneIconBox: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  phoneTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  phoneSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.inputBg,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  countryCode: {
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.md,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  countryCodeText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.xl,
    color: COLORS.text,
    letterSpacing: 2,
  },
  testOtpBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.success + '20',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.lg,
  },
  testOtpLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.success,
    marginRight: SPACING.sm,
  },
  testOtpValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.success,
    letterSpacing: 4,
  },
  otpInput: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 16,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    fontSize: FONT_SIZES.hero,
    fontWeight: 'bold',
    color: COLORS.text,
    letterSpacing: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  resendBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.lg,
  },
  resendText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  resendLink: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
});
