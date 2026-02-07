import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, TextInput, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as LocalAuthentication from 'expo-local-authentication';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store';
import { profileAPI, addressAPI } from '../../lib/api';
import { COLORS, SPACING, FONT_SIZES } from '../../lib/config';

const MENU_ITEMS = [
  { id: 'edit', icon: 'person-outline', label: 'Edit Profile', desc: 'Update your info' },
  { id: 'addresses', icon: 'location-outline', label: 'Manage Addresses', desc: 'Delivery locations' },
  { id: 'kyc', icon: 'shield-checkmark-outline', label: 'KYC Verification', desc: 'Complete verification' },
  { id: 'analytics', icon: 'bar-chart-outline', label: 'Shop Analytics', desc: 'View insights' },
  { id: 'biometric', icon: 'finger-print', label: 'Biometric Login', desc: 'Fingerprint/Face ID' },
  { id: 'notifications', icon: 'notifications-outline', label: 'Notifications', desc: 'Push settings' },
  { id: 'help', icon: 'help-circle-outline', label: 'Help & Support', desc: 'Get assistance' },
];

export default function ProfileScreen({ navigation }) {
  const [activeSection, setActiveSection] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  
  const { user, logout, biometricEnabled, setBiometric } = useAuthStore();

  useEffect(() => {
    loadProfile();
    checkBiometric();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await profileAPI.get();
      setProfile(res.data);
    } catch (error) {
      console.error('Profile error:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkBiometric = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    setBiometricAvailable(compatible && enrolled);
  };

  const handleMenuPress = (id) => {
    switch (id) {
      case 'edit':
        setActiveSection('edit');
        break;
      case 'addresses':
        setActiveSection('addresses');
        break;
      case 'biometric':
        toggleBiometric();
        break;
      case 'kyc':
        Alert.alert('KYC', 'KYC verification screen');
        break;
      default:
        Alert.alert('Coming Soon', 'This feature is under development');
    }
  };

  const toggleBiometric = async () => {
    if (!biometricAvailable) {
      Alert.alert('Not Available', 'Biometric authentication is not available on this device');
      return;
    }
    
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: biometricEnabled ? 'Disable biometric login?' : 'Enable biometric login?',
    });
    
    if (result.success) {
      setBiometric(!biometricEnabled);
      Alert.alert('Success', `Biometric login ${biometricEnabled ? 'disabled' : 'enabled'}`);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  const renderMainProfile = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(profile?.name || user?.phone)?.[0]?.toUpperCase() || 'S'}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{profile?.name || 'SOVEH User'}</Text>
          <Text style={styles.profilePhone}>+91 {user?.phone}</Text>
          {profile?.shop_name && (
            <Text style={styles.profileShop}>{profile.shop_name}</Text>
          )}
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {MENU_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => handleMenuPress(item.id)}
            activeOpacity={0.7}
          >
            <View style={styles.menuIcon}>
              <Ionicons name={item.icon} size={22} color={COLORS.primary} />
            </View>
            <View style={styles.menuText}>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuDesc}>{item.desc}</Text>
            </View>
            {item.id === 'biometric' ? (
              <View style={[styles.toggle, biometricEnabled && styles.toggleActive]}>
                <View style={[styles.toggleKnob, biometricEnabled && styles.toggleKnobActive]} />
              </View>
            ) : (
              <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={22} color={COLORS.error} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <Text style={styles.version}>SOVEH v1.0.0</Text>
    </ScrollView>
  );

  const renderEditProfile = () => (
    <EditProfileSection 
      profile={profile} 
      onBack={() => setActiveSection(null)}
      onSave={(data) => {
        setProfile(data);
        setActiveSection(null);
      }}
    />
  );

  const renderAddresses = () => (
    <AddressesSection onBack={() => setActiveSection(null)} />
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        {activeSection && (
          <TouchableOpacity style={styles.backBtn} onPress={() => setActiveSection(null)}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
        )}
        <Text style={styles.title}>
          {activeSection === 'edit' ? 'Edit Profile' : 
           activeSection === 'addresses' ? 'Addresses' : 'Profile'}
        </Text>
      </View>

      {!activeSection && renderMainProfile()}
      {activeSection === 'edit' && renderEditProfile()}
      {activeSection === 'addresses' && renderAddresses()}
    </SafeAreaView>
  );
}

// Edit Profile Section
function EditProfileSection({ profile, onBack, onSave }) {
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
    shop_name: profile?.shop_name || '',
    gst: profile?.gst || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await profileAPI.update(formData);
      Alert.alert('Success', 'Profile updated successfully');
      onSave(res.data.user);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.editContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          placeholder="Your name"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Email</Text>
        <TextInput
          style={styles.input}
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          placeholder="email@example.com"
          keyboardType="email-address"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Shop Name</Text>
        <TextInput
          style={styles.input}
          value={formData.shop_name}
          onChangeText={(text) => setFormData({ ...formData, shop_name: text })}
          placeholder="Your shop name"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>GST Number (Optional)</Text>
        <TextInput
          style={styles.input}
          value={formData.gst}
          onChangeText={(text) => setFormData({ ...formData, gst: text })}
          placeholder="22AAAAA0000A1Z5"
        />
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="checkmark" size={20} color="#fff" />
            <Text style={styles.saveBtnText}>Save Changes</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

// Addresses Section
function AddressesSection({ onBack }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const res = await addressAPI.getAll();
      setAddresses(res.data || []);
    } catch (error) {
      console.error('Addresses error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    Alert.alert('Delete', 'Delete this address?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await addressAPI.delete(id);
            loadAddresses();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete');
          }
        },
      },
    ]);
  };

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 50 }} size="large" color={COLORS.primary} />;
  }

  return (
    <ScrollView style={styles.addressContainer} showsVerticalScrollIndicator={false}>
      {addresses.map((addr) => (
        <View key={addr.id} style={styles.addressCard}>
          <View style={styles.addressIcon}>
            <Ionicons 
              name={addr.type === 'shop' ? 'storefront-outline' : 'home-outline'} 
              size={24} 
              color={COLORS.primary} 
            />
          </View>
          <View style={styles.addressInfo}>
            <Text style={styles.addressName}>{addr.name}</Text>
            <Text style={styles.addressText}>{addr.address}</Text>
            <Text style={styles.addressPin}>PIN: {addr.pincode}</Text>
            {addr.is_default && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultText}>Default</Text>
              </View>
            )}
          </View>
          <TouchableOpacity onPress={() => handleDelete(addr.id)}>
            <Ionicons name="trash-outline" size={20} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity style={styles.addAddressBtn}>
        <Ionicons name="add" size={22} color={COLORS.primary} />
        <Text style={styles.addAddressText}>Add New Address</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.card,
  },
  backBtn: { marginRight: SPACING.md },
  title: { fontSize: FONT_SIZES.xxl, fontWeight: 'bold', color: COLORS.text },
  scrollContent: { padding: SPACING.md, paddingBottom: 100 },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  profileInfo: { marginLeft: SPACING.md, flex: 1 },
  profileName: { fontSize: FONT_SIZES.xl, fontWeight: '600', color: COLORS.text },
  profilePhone: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary },
  profileShop: { fontSize: FONT_SIZES.sm, color: COLORS.primary, marginTop: 2 },
  menuContainer: { backgroundColor: COLORS.card, borderRadius: 16, overflow: 'hidden' },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: { flex: 1, marginLeft: SPACING.md },
  menuLabel: { fontSize: FONT_SIZES.md, fontWeight: '500', color: COLORS.text },
  menuDesc: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.border,
    padding: 2,
  },
  toggleActive: { backgroundColor: COLORS.primary },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  toggleKnobActive: { transform: [{ translateX: 22 }] },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.xl,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  logoutText: { fontSize: FONT_SIZES.md, color: COLORS.error, fontWeight: '600' },
  version: { textAlign: 'center', color: COLORS.textLight, marginTop: SPACING.md },
  editContainer: { padding: SPACING.md },
  inputGroup: { marginBottom: SPACING.md },
  inputLabel: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.xs },
  input: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  saveBtnText: { color: '#fff', fontSize: FONT_SIZES.lg, fontWeight: '600' },
  addressContainer: { padding: SPACING.md },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  addressIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressInfo: { flex: 1, marginLeft: SPACING.md },
  addressName: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.text },
  addressText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: 2 },
  addressPin: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginTop: 2 },
  defaultBadge: {
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: SPACING.xs,
  },
  defaultText: { fontSize: 10, color: COLORS.success, fontWeight: '600' },
  addAddressBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  addAddressText: { color: COLORS.primary, fontSize: FONT_SIZES.md, fontWeight: '600' },
});
