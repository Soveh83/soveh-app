import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { productsAPI, categoriesAPI, ordersAPI } from '../../lib/api';
import { Card, Button, Badge, Spinner } from '../ui';
import {
  Home, Grid3X3, ShoppingCart, Package, User,
  Search, Bell, MapPin, ChevronRight, Plus, Minus,
  Heart, Star, Percent
} from 'lucide-react';
import toast from 'react-hot-toast';

const tabs = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'categories', icon: Grid3X3, label: 'Shop' },
  { id: 'cart', icon: ShoppingCart, label: 'Cart' },
  { id: 'orders', icon: Package, label: 'Orders' },
  { id: 'profile', icon: User, label: 'Profile' }
];

export const CustomerDashboard = () => {
  const [activeTab, setActiveTab] = useState('home');
  const { user, logout } = useAuthStore();
  const cart = useCartStore();

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-green-600 text-white px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-green-100 text-sm">Deliver to</p>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="font-semibold">Home</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
          <button className="p-2 rounded-full bg-white/20" data-testid="notifications-btn">
            <Bell className="w-5 h-5" />
          </button>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search for groceries, snacks..."
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-white text-slate-900 border-0 focus:ring-2 focus:ring-green-300"
            data-testid="search-input"
          />
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-4">
        {activeTab === 'home' && <HomeTab />}
        {activeTab === 'categories' && <ShopTab />}
        {activeTab === 'cart' && <CartTab />}
        {activeTab === 'orders' && <OrdersTab />}
        {activeTab === 'profile' && <ProfileTab user={user} onLogout={logout} />}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-2">
        <div className="flex justify-around items-center max-w-lg mx-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              data-testid={`nav-${tab.id}`}
              className={`flex flex-col items-center py-1 px-3 rounded-xl transition-colors relative ${
                activeTab === tab.id ? 'text-green-600' : 'text-slate-500'
              }`}
            >
              <tab.icon className="w-6 h-6" />
              <span className="text-xs mt-0.5 font-medium">{tab.label}</span>
              {tab.id === 'cart' && cart.getItemCount() > 0 && (
                <span className="absolute -top-1 right-0 w-5 h-5 bg-green-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {cart.getItemCount()}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

const HomeTab = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        productsAPI.getAll({ limit: 10 }),
        categoriesAPI.getAll()
      ]);
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      <Card className="p-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white overflow-hidden relative">
        <div className="relative z-10">
          <Badge className="bg-white/20 text-white mb-2">Limited Offer</Badge>
          <h2 className="text-xl font-bold mb-1">Get 20% OFF</h2>
          <p className="text-green-100 text-sm mb-3">On your first order</p>
          <Button size="sm" className="bg-white text-green-600 hover:bg-green-50">
            Order Now
          </Button>
        </div>
        <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      </Card>

      {/* Categories */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-3">Categories</h2>
        <div className="grid grid-cols-4 gap-3">
          {categories.slice(0, 8).map((category) => (
            <motion.button
              key={category.id}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center p-3 rounded-xl bg-white border border-slate-100 hover:shadow-sm transition-all"
              data-testid={`category-${category.id}`}
            >
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center mb-1">
                <Grid3X3 className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-xs font-medium text-slate-700 text-center line-clamp-1">
                {category.name}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Products */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-3">Popular Products</h2>
        <div className="grid grid-cols-2 gap-3">
          {products.map((product, index) => (
            <CustomerProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
};

const CustomerProductCard = ({ product, index }) => {
  const cart = useCartStore();
  const cartItem = cart.items.find(item => item.product_id === product.id);
  const discount = Math.round((product.mrp - product.customer_price) / product.mrp * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="overflow-hidden" hover data-testid={`product-${product.id}`}>
        <div className="aspect-square bg-slate-100 relative">
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              <Package className="w-12 h-12" />
            </div>
          )}
          {discount > 0 && (
            <Badge variant="error" className="absolute top-2 left-2">
              {discount}% OFF
            </Badge>
          )}
          <button className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center">
            <Heart className="w-4 h-4 text-slate-400" />
          </button>
        </div>
        <div className="p-3">
          <h3 className="font-medium text-slate-900 text-sm line-clamp-2 mb-1">{product.name}</h3>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-lg font-bold text-slate-900">₹{product.customer_price}</span>
            <span className="text-sm text-slate-400 line-through">₹{product.mrp}</span>
          </div>
          
          {cartItem ? (
            <div className="flex items-center justify-between bg-green-50 rounded-lg p-1">
              <button
                onClick={() => cart.updateQuantity(product.id, cartItem.quantity - 1)}
                className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-green-600 shadow-sm"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-semibold text-green-600">{cartItem.quantity}</span>
              <button
                onClick={() => cart.updateQuantity(product.id, cartItem.quantity + 1)}
                className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-green-600 shadow-sm"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Button
              onClick={() => {
                cart.addItem({ ...product, retailer_price: product.customer_price });
                toast.success('Added to cart!');
              }}
              fullWidth
              size="sm"
              role="customer"
            >
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

const ShopTab = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await productsAPI.getAll({ limit: 20 });
      setProducts(res.data);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-slate-900 mb-4">All Products</h2>
      <div className="grid grid-cols-2 gap-3">
        {products.map((product, index) => (
          <CustomerProductCard key={product.id} product={product} index={index} />
        ))}
      </div>
    </div>
  );
};

const CartTab = () => {
  const cart = useCartStore();
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();

  const subtotal = cart.getTotal();
  const savings = cart.getSavings();
  const delivery = subtotal > 300 ? 0 : 30;
  const total = subtotal + delivery;

  const handleCheckout = async () => {
    if (cart.items.length === 0) {
      toast.error('Cart is empty!');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        items: cart.items,
        payment_mode: 'cod',
        delivery_address: {
          name: user?.name || 'Customer',
          phone: user?.phone || '',
          address: 'Home Address',
          city: 'City',
          pincode: '000000'
        }
      };

      await ordersAPI.create(orderData);
      cart.clearCart();
      toast.success('Order placed successfully!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="text-center py-20">
        <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-slate-300" />
        <h3 className="text-lg font-semibold text-slate-900 mb-1">Your cart is empty</h3>
        <p className="text-slate-500">Add items to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-900">Your Cart ({cart.getItemCount()} items)</h2>
      
      <div className="space-y-3">
        {cart.items.map((item) => (
          <Card key={item.product_id} className="p-4">
            <div className="flex gap-3">
              <div className="w-16 h-16 bg-slate-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                <Package className="w-6 h-6 text-slate-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-slate-900 line-clamp-1">{item.product_name}</h4>
                <p className="text-sm text-slate-500">₹{item.price} x {item.quantity}</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
                    <button
                      onClick={() => cart.updateQuantity(item.product_id, item.quantity - 1)}
                      className="w-7 h-7 rounded bg-white flex items-center justify-center"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => cart.updateQuantity(item.product_id, item.quantity + 1)}
                      className="w-7 h-7 rounded bg-white flex items-center justify-center"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="font-semibold">₹{item.total}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <h3 className="font-semibold text-slate-900 mb-3">Bill Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          {savings > 0 && (
            <div className="flex justify-between text-green-600">
              <span>You Save</span>
              <span>-₹{savings.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-slate-600">Delivery</span>
            <span>{delivery === 0 ? 'FREE' : `₹${delivery}`}</span>
          </div>
          <div className="border-t pt-2 flex justify-between text-base">
            <span className="font-semibold">Total</span>
            <span className="font-bold text-green-600">₹{total.toFixed(2)}</span>
          </div>
        </div>
      </Card>

      <Button
        onClick={handleCheckout}
        loading={loading}
        fullWidth
        size="lg"
        role="customer"
        data-testid="checkout-btn"
      >
        Place Order • ₹{total.toFixed(2)}
      </Button>
    </div>
  );
};

const OrdersTab = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const res = await ordersAPI.getAll();
      setOrders(res.data);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-20">
        <Package className="w-16 h-16 mx-auto mb-4 text-slate-300" />
        <h3 className="text-lg font-semibold text-slate-900 mb-1">No orders yet</h3>
        <p className="text-slate-500">Your orders will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-900">Your Orders</h2>
      {orders.map((order) => (
        <Card key={order.id} className="p-4" data-testid={`order-${order.id}`}>
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="font-mono text-sm text-slate-500">{order.order_number}</p>
              <p className="text-xs text-slate-400">
                {new Date(order.created_at).toLocaleDateString()}
              </p>
            </div>
            <Badge variant={order.order_status === 'delivered' ? 'success' : 'info'}>
              {order.order_status?.replace(/_/g, ' ')}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-slate-600">{order.items?.length || 0} items</span>
            <span className="font-semibold">₹{order.total_amount?.toFixed(2)}</span>
          </div>
        </Card>
      ))}
    </div>
  );
};

const ProfileTab = ({ user, onLogout }) => {
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <User className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{user?.name || 'Customer'}</h2>
            <p className="text-sm text-slate-500">+91 {user?.phone}</p>
          </div>
        </div>
      </Card>

      <Card className="divide-y divide-slate-100">
        {[
          { icon: User, label: 'Edit Profile' },
          { icon: MapPin, label: 'Saved Addresses' },
          { icon: Heart, label: 'Wishlist' },
          { icon: Star, label: 'Reviews' },
        ].map((item, index) => (
          <button
            key={index}
            className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors"
          >
            <item.icon className="w-5 h-5 text-slate-500" />
            <span className="flex-1 text-left font-medium text-slate-700">{item.label}</span>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
        ))}
      </Card>

      <Button
        onClick={onLogout}
        variant="outline"
        fullWidth
        role="admin"
        data-testid="logout-btn"
      >
        Logout
      </Button>
    </div>
  );
};
