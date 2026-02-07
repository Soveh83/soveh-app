import React from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from '../../store';
import { ordersAPI } from '../../lib/api';
import { COLORS, SPACING, FONT_SIZES } from '../../lib/config';

export default function CartScreen({ navigation }) {
  const cart = useCartStore();

  const handleCheckout = async () => {
    if (cart.items.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to cart first');
      return;
    }

    Alert.alert(
      'Confirm Order',
      `Total: ₹${cart.getTotal().toFixed(2)}\n\nProceed to place order?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Place Order', 
          onPress: async () => {
            try {
              const orderData = {
                items: cart.items.map(i => ({
                  product_id: i.product.id,
                  product_name: i.product.name,
                  quantity: i.quantity,
                  price: i.product.retailer_price,
                  total: i.product.retailer_price * i.quantity,
                })),
                subtotal: cart.getTotal(),
                gst_amount: cart.getTotal() * 0.05,
                delivery_charges: cart.getTotal() > 500 ? 0 : 50,
                total_amount: cart.getTotal() * 1.05 + (cart.getTotal() > 500 ? 0 : 50),
              };
              
              await ordersAPI.create(orderData);
              cart.clearCart();
              Alert.alert('Success', 'Order placed successfully!');
              navigation.navigate('Orders');
            } catch (error) {
              Alert.alert('Error', 'Failed to place order');
            }
          }
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.cartItem}>
      <View style={styles.itemImage}>
        <Ionicons name="cube-outline" size={30} color={COLORS.textLight} />
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>{item.product.name}</Text>
        <Text style={styles.itemPrice}>₹{item.product.retailer_price}</Text>
      </View>
      <View style={styles.quantityContainer}>
        <TouchableOpacity 
          style={styles.qtyBtn}
          onPress={() => cart.updateQuantity(item.product.id, item.quantity - 1)}
        >
          <Ionicons name="remove" size={18} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.qtyText}>{item.quantity}</Text>
        <TouchableOpacity 
          style={styles.qtyBtn}
          onPress={() => cart.updateQuantity(item.product.id, item.quantity + 1)}
        >
          <Ionicons name="add" size={18} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity 
        style={styles.removeBtn}
        onPress={() => cart.removeItem(item.product.id)}
      >
        <Ionicons name="trash-outline" size={20} color={COLORS.error} />
      </TouchableOpacity>
    </View>
  );

  const subtotal = cart.getTotal();
  const gst = subtotal * 0.05;
  const delivery = subtotal > 500 ? 0 : 50;
  const total = subtotal + gst + delivery;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Cart</Text>
        <Text style={styles.itemCount}>{cart.getItemCount()} items</Text>
      </View>

      {cart.items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color={COLORS.textLight} />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptyText}>Add products to get started</Text>
          <TouchableOpacity 
            style={styles.shopBtn}
            onPress={() => navigation.navigate('Shop')}
          >
            <Text style={styles.shopBtnText}>Browse Products</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cart.items}
            renderItem={renderItem}
            keyExtractor={item => item.product.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>₹{subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>GST (5%)</Text>
              <Text style={styles.summaryValue}>₹{gst.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery</Text>
              <Text style={[styles.summaryValue, delivery === 0 && styles.freeText]}>
                {delivery === 0 ? 'FREE' : `₹${delivery}`}
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₹{total.toFixed(2)}</Text>
            </View>
            
            <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
              <Text style={styles.checkoutText}>Place Order</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.card,
  },
  title: { fontSize: FONT_SIZES.xxl, fontWeight: 'bold', color: COLORS.text },
  itemCount: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary },
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
  listContent: { padding: SPACING.md, paddingBottom: 250 },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: COLORS.inputBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: { flex: 1, marginLeft: SPACING.md },
  itemName: { fontSize: FONT_SIZES.md, fontWeight: '500', color: COLORS.text },
  itemPrice: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.primary, marginTop: 2 },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: 8,
    padding: 4,
  },
  qtyBtn: { width: 28, height: 28, justifyContent: 'center', alignItems: 'center' },
  qtyText: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.text, marginHorizontal: SPACING.sm },
  removeBtn: { marginLeft: SPACING.md },
  summaryCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    paddingBottom: 100,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm },
  summaryLabel: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary },
  summaryValue: { fontSize: FONT_SIZES.md, color: COLORS.text },
  freeText: { color: COLORS.success, fontWeight: '600' },
  totalRow: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SPACING.md, marginTop: SPACING.sm },
  totalLabel: { fontSize: FONT_SIZES.lg, fontWeight: '600', color: COLORS.text },
  totalValue: { fontSize: FONT_SIZES.xl, fontWeight: 'bold', color: COLORS.primary },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  checkoutText: { color: '#fff', fontSize: FONT_SIZES.lg, fontWeight: '600' },
});
