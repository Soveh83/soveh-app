import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ordersAPI } from '../../lib/api';
import { COLORS, SPACING, FONT_SIZES } from '../../lib/config';

const STATUS_CONFIG = {
  placed: { color: '#3B82F6', icon: 'time-outline', label: 'Placed' },
  confirmed: { color: '#8B5CF6', icon: 'checkmark-circle-outline', label: 'Confirmed' },
  packed: { color: '#6366F1', icon: 'cube-outline', label: 'Packed' },
  out_for_delivery: { color: '#F59E0B', icon: 'bicycle-outline', label: 'Out for Delivery' },
  delivered: { color: '#10B981', icon: 'checkmark-done-outline', label: 'Delivered' },
  cancelled: { color: '#EF4444', icon: 'close-circle-outline', label: 'Cancelled' },
};

export default function OrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const res = await ordersAPI.getAll();
      setOrders(res.data || []);
    } catch (error) {
      console.error('Load orders error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const renderOrder = ({ item }) => {
    const status = STATUS_CONFIG[item.order_status] || STATUS_CONFIG.placed;
    
    return (
      <TouchableOpacity style={styles.orderCard} activeOpacity={0.7}>
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderNumber}>{item.order_number}</Text>
            <Text style={styles.orderDate}>
              {new Date(item.created_at).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
            <Ionicons name={status.icon} size={14} color={status.color} />
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>
        
        <View style={styles.orderItems}>
          <Text style={styles.itemsText}>
            {item.items?.length || 0} items
          </Text>
          <Text style={styles.itemsList} numberOfLines={1}>
            {item.items?.map(i => i.product_name).join(', ')}
          </Text>
        </View>
        
        <View style={styles.orderFooter}>
          <Text style={styles.totalAmount}>₹{item.total_amount?.toFixed(2)}</Text>
          <View style={styles.trackBtn}>
            <Text style={styles.trackText}>Track Order</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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
        <Text style={styles.title}>My Orders</Text>
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={80} color={COLORS.textLight} />
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptyText}>Your orders will appear here</Text>
          <TouchableOpacity 
            style={styles.shopBtn}
            onPress={() => navigation.navigate('Shop')}
          >
            <Text style={styles.shopBtnText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: SPACING.md, backgroundColor: COLORS.card },
  title: { fontSize: FONT_SIZES.xxl, fontWeight: 'bold', color: COLORS.text },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
  emptyTitle: { fontSize: FONT_SIZES.xl, fontWeight: '600', color: COLORS.text, marginTop: SPACING.md },
  emptyText: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, marginTop: SPACING.xs },
  shopBtn: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 12,
  },
  shopBtnText: { color: '#fff', fontSize: FONT_SIZES.md, fontWeight: '600' },
  listContent: { padding: SPACING.md, paddingBottom: 100 },
  orderCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  orderNumber: { fontSize: FONT_SIZES.lg, fontWeight: '600', color: COLORS.text },
  orderDate: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: 2 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  statusText: { fontSize: FONT_SIZES.xs, fontWeight: '600' },
  orderItems: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  itemsText: { fontSize: FONT_SIZES.sm, fontWeight: '500', color: COLORS.text },
  itemsList: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: 2 },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.md,
  },
  totalAmount: { fontSize: FONT_SIZES.xl, fontWeight: 'bold', color: COLORS.primary },
  trackBtn: { flexDirection: 'row', alignItems: 'center' },
  trackText: { fontSize: FONT_SIZES.md, color: COLORS.primary, fontWeight: '500' },
});
