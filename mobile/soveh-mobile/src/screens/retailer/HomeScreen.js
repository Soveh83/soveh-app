import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
  RefreshControl,
  TextInput,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore, useCartStore, useLocationStore } from '../../store';
import { productsAPI, categoriesAPI, aiAPI, ordersAPI } from '../../lib/api';
import { COLORS, SPACING, FONT_SIZES } from '../../lib/config';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [recommendations, setRecommendations] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { user } = useAuthStore();
  const cart = useCartStore();
  const { currentLocation, address, setLocation } = useLocationStore();

  useEffect(() => {
    loadData();
    fetchLocation();
  }, []);

  const fetchLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location Permission', 'Please enable location for better experience');
        return;
      }
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      // Reverse geocode
      const [place] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      
      const addr = place ? `${place.subregion || place.city}, ${place.region}` : 'Current Location';
      setLocation(location.coords, addr);
    } catch (error) {
      console.error('Location error:', error);
    }
  };

  const loadData = async () => {
    try {
      const [catRes, prodRes] = await Promise.all([
        categoriesAPI.getAll(),
        productsAPI.getAll({ limit: 20 }),
      ]);
      
      setCategories(catRes.data || []);
      setProducts(prodRes.data || []);
      
      // Load AI recommendations
      loadRecommendations();
    } catch (error) {
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendations = async () => {
    try {
      const res = await aiAPI.getRecommendations(cart.items);
      if (res.data.success) {
        const { recommendations: recs, summary } = res.data;
        if (Array.isArray(recs) && recs.length > 0) {
          const formatted = recs.slice(0, 3).map(r => `• ${r.product_name}: ${r.reason}`).join('\n');
          setRecommendations(formatted);
        } else if (summary) {
          setRecommendations(summary);
        }
      }
    } catch (error) {
      setRecommendations('Stock up on cooking essentials for maximum profit!');
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.locationRow}>
        <TouchableOpacity style={styles.locationBtn} onPress={fetchLocation}>
          <Ionicons name="location" size={20} color={COLORS.primary} />
          <View style={styles.locationText}>
            <Text style={styles.locationLabel}>Deliver to</Text>
            <Text style={styles.locationValue} numberOfLines={1}>
              {address || 'Fetching location...'}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={16} color={COLORS.textSecondary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.cartBtn}
          onPress={() => navigation.navigate('Cart')}
        >
          <Ionicons name="cart-outline" size={24} color={COLORS.text} />
          {cart.getItemCount() > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cart.getItemCount()}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor={COLORS.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
    </View>
  );

  const renderRecommendations = () => (
    <View style={styles.recsCard}>
      <View style={styles.recsHeader}>
        <Ionicons name="sparkles" size={20} color="#F59E0B" />
        <Text style={styles.recsTitle}>AI Recommendations</Text>
      </View>
      <Text style={styles.recsText}>{recommendations || 'Loading...'}</Text>
    </View>
  );

  const renderCategories = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Categories</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={styles.categoryCard}
            onPress={() => navigation.navigate('Shop', { category: cat.id })}
          >
            <View style={styles.categoryIcon}>
              <Ionicons name="grid-outline" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.categoryName} numberOfLines={1}>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderProductCard = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetail', { product: item })}
      activeOpacity={0.7}
    >
      <View style={styles.productImage}>
        {item.images?.[0] ? (
          <Image source={{ uri: item.images[0] }} style={styles.productImg} />
        ) : (
          <Ionicons name="cube-outline" size={40} color={COLORS.textLight} />
        )}
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.productPrice}>₹{item.retailer_price}</Text>
        <Text style={styles.productMrp}>MRP: ₹{item.mrp}</Text>
        <View style={styles.marginBadge}>
          <Text style={styles.marginText}>
            {((item.mrp - item.retailer_price) / item.mrp * 100).toFixed(0)}% margin
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => {
          cart.addItem(item);
          Alert.alert('Added', `${item.name} added to cart`);
        }}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading SOVEH...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={products}
        renderItem={renderProductCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        ListHeaderComponent={
          <>
            {renderHeader()}
            {renderRecommendations()}
            {renderCategories()}
            <Text style={styles.sectionTitle}>Popular Products</Text>
          </>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  header: {
    padding: SPACING.md,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  locationLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  locationValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  cartBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.inputBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  recsCard: {
    margin: SPACING.md,
    padding: SPACING.md,
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  recsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  recsTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: '#92400E',
    marginLeft: SPACING.sm,
  },
  recsText: {
    fontSize: FONT_SIZES.sm,
    color: '#78350F',
    lineHeight: 20,
  },
  section: {
    padding: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
    marginHorizontal: SPACING.md,
  },
  categoryCard: {
    alignItems: 'center',
    marginRight: SPACING.md,
    width: 80,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  categoryName: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 100,
  },
  productRow: {
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  productCard: {
    width: (width - SPACING.md * 3) / 2,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  productImage: {
    width: '100%',
    height: 120,
    backgroundColor: COLORS.inputBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  productInfo: {
    padding: SPACING.sm,
  },
  productName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.text,
    height: 36,
  },
  productPrice: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: SPACING.xs,
  },
  productMrp: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    textDecorationLine: 'line-through',
  },
  marginBadge: {
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: SPACING.xs,
  },
  marginText: {
    fontSize: 10,
    color: COLORS.success,
    fontWeight: '600',
  },
  addBtn: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.sm,
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
