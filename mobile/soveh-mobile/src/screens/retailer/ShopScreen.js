import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, TextInput, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { productsAPI, categoriesAPI } from '../../lib/api';
import { useCartStore } from '../../store';
import { COLORS, SPACING, FONT_SIZES } from '../../lib/config';

export default function ShopScreen({ route, navigation }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(route?.params?.category || null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const cart = useCartStore();

  useEffect(() => {
    loadData();
  }, [selectedCategory]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [catRes, prodRes] = await Promise.all([
        categoriesAPI.getAll(),
        productsAPI.getAll({ 
          category_id: selectedCategory, 
          limit: 50,
          search: searchQuery 
        }),
      ]);
      setCategories(catRes.data || []);
      setProducts(prodRes.data || []);
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderProduct = ({ item }) => (
    <TouchableOpacity style={styles.productCard} activeOpacity={0.7}>
      <View style={styles.productImage}>
        <Ionicons name="cube-outline" size={40} color={COLORS.textLight} />
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{item.retailer_price}</Text>
          <Text style={styles.mrp}>₹{item.mrp}</Text>
        </View>
        <Text style={styles.stock}>Stock: {item.stock_quantity}</Text>
      </View>
      <TouchableOpacity 
        style={styles.addBtn}
        onPress={() => cart.addItem(item)}
      >
        <Ionicons name="add" size={22} color="#fff" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Shop</Text>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={loadData}
          />
        </View>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContent}
      >
        <TouchableOpacity
          style={[styles.categoryPill, !selectedCategory && styles.categoryPillActive]}
          onPress={() => setSelectedCategory(null)}
        >
          <Text style={[styles.categoryText, !selectedCategory && styles.categoryTextActive]}>All</Text>
        </TouchableOpacity>
        {categories.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.categoryPill, selectedCategory === cat.id && styles.categoryPillActive]}
            onPress={() => setSelectedCategory(cat.id)}
          >
            <Text style={[styles.categoryText, selectedCategory === cat.id && styles.categoryTextActive]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProduct}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="cube-outline" size={60} color={COLORS.textLight} />
              <Text style={styles.emptyText}>No products found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: SPACING.md, backgroundColor: COLORS.card },
  title: { fontSize: FONT_SIZES.xxl, fontWeight: 'bold', color: COLORS.text, marginBottom: SPACING.md },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  searchInput: { flex: 1, marginLeft: SPACING.sm, fontSize: FONT_SIZES.md },
  categoryScroll: { maxHeight: 50, backgroundColor: COLORS.card },
  categoryContent: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  categoryPill: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.inputBg,
    marginRight: SPACING.sm,
  },
  categoryPillActive: { backgroundColor: COLORS.primary },
  categoryText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  categoryTextActive: { color: '#fff', fontWeight: '600' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: SPACING.md, paddingBottom: 100 },
  productCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: COLORS.inputBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: { flex: 1, marginLeft: SPACING.md },
  productName: { fontSize: FONT_SIZES.md, fontWeight: '500', color: COLORS.text },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginTop: SPACING.xs },
  price: { fontSize: FONT_SIZES.lg, fontWeight: 'bold', color: COLORS.primary },
  mrp: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, textDecorationLine: 'line-through', marginLeft: SPACING.sm },
  stock: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  emptyText: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, marginTop: SPACING.md },
});
