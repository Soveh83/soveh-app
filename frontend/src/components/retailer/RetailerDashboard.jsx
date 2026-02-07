import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { productsAPI, categoriesAPI, ordersAPI, creditAPI } from '../../lib/api';
import { Card, Button, Badge, Spinner } from '../ui';
import { 
  Home, Grid3X3, ShoppingCart, Package, User,
  Search, Bell, MapPin, ChevronRight, Plus, Minus,
  TrendingUp, Clock, Percent, Star, Wallet
} from 'lucide-react';
import toast from 'react-hot-toast';

const tabs = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'categories', icon: Grid3X3, label: 'Categories' },
  { id: 'cart', icon: ShoppingCart, label: 'Cart' },
  { id: 'orders', icon: Package, label: 'Orders' },
  { id: 'profile', icon: User, label: 'Profile' }
];

export const RetailerDashboard = () => {
  const [activeTab, setActiveTab] = useState('home');
  const { user, logout } = useAuthStore();
  const cart = useCartStore();

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-200">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-slate-500">Good morning,</p>
              <h1 className="text-lg font-bold text-slate-900">{user?.name || 'Retailer'}</h1>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors" data-testid="notifications-btn">
                <Bell className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search products, brands..."
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-100 border-0 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all"
              data-testid="search-input"
            />
          </div>
          
          {/* Location */}
          <div className="flex items-center mt-2 text-sm text-slate-600">
            <MapPin className="w-4 h-4 mr-1 text-blue-600" />
            <span>Delivering to your shop</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-4">
        {activeTab === 'home' && <HomeTab />}
        {activeTab === 'categories' && <CategoriesTab />}
        {activeTab === 'cart' && <CartTab />}
        {activeTab === 'orders' && <OrdersTab />}
        {activeTab === 'profile' && <ProfileTab user={user} onLogout={logout} />}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-2 safe-area-inset-bottom">
        <div className="flex justify-around items-center max-w-lg mx-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              data-testid={`nav-${tab.id}`}
              className={`flex flex-col items-center py-1 px-3 rounded-xl transition-colors relative ${
                activeTab === tab.id ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <tab.icon className="w-6 h-6" />
              <span className="text-xs mt-0.5 font-medium">{tab.label}</span>
              {tab.id === 'cart' && cart.getItemCount() > 0 && (
                <span className="absolute -top-1 right-0 w-5 h-5 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
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

// Home Tab Component
const HomeTab = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creditInfo, setCreditInfo] = useState(null);
  const cart = useCartStore();

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
      
      try {
        const creditRes = await creditAPI.getBalance();
        setCreditInfo(creditRes.data);
      } catch (e) {
        // Credit not available for this user
      }
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
      {/* Credit Summary */}
      {creditInfo && (
        <Card className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Available Credit</p>
              <p className="text-2xl font-bold">₹{creditInfo.available_credit?.toLocaleString() || 0}</p>
            </div>
            <Wallet className="w-10 h-10 text-blue-200" />
          </div>
          <div className="mt-3 flex gap-4 text-sm">
            <div>
              <p className="text-blue-200">Limit</p>
              <p className="font-semibold">₹{creditInfo.credit_limit?.toLocaleString() || 0}</p>
            </div>
            <div>
              <p className="text-blue-200">Used</p>
              <p className="font-semibold">₹{creditInfo.used_credit?.toLocaleString() || 0}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 text-center" data-testid="stat-orders">
          <Package className="w-6 h-6 mx-auto text-blue-600 mb-1" />
          <p className="text-xl font-bold text-slate-900">12</p>
          <p className="text-xs text-slate-500">Orders</p>
        </Card>
        <Card className="p-3 text-center" data-testid="stat-savings">
          <Percent className="w-6 h-6 mx-auto text-green-600 mb-1" />
          <p className="text-xl font-bold text-slate-900">₹2.5K</p>
          <p className="text-xs text-slate-500">Saved</p>
        </Card>
        <Card className="p-3 text-center" data-testid="stat-points">
          <Star className="w-6 h-6 mx-auto text-amber-500 mb-1" />
          <p className="text-xl font-bold text-slate-900">850</p>
          <p className="text-xs text-slate-500">Points</p>
        </Card>
      </div>

      {/* Categories */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-slate-900">Categories</h2>
          <button className="text-sm text-blue-600 font-medium">View All</button>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {categories.slice(0, 8).map((category, index) => (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex flex-col items-center p-3 rounded-xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-sm transition-all"
              data-testid={`category-${category.id}`}
            >
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-1">
                <Grid3X3 className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-slate-700 text-center line-clamp-1">{category.name}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Products */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-slate-900">Best Sellers</h2>
          <button className="text-sm text-blue-600 font-medium">View All</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
};

// Product Card
const ProductCard = ({ product, index }) => {
  const cart = useCartStore();
  const cartItem = cart.items.find(item => item.product_id === product.id);
  const margin = ((product.mrp - product.retailer_price) / product.mrp * 100).toFixed(0);

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
          <Badge variant="success" className="absolute top-2 left-2">
            {margin}% margin
          </Badge>
        </div>
        <div className="p-3">
          <h3 className="font-medium text-slate-900 text-sm line-clamp-2 mb-1">{product.name}</h3>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-lg font-bold text-slate-900">₹{product.retailer_price}</span>
            <span className="text-sm text-slate-400 line-through">₹{product.mrp}</span>
          </div>
          
          {cartItem ? (
            <div className="flex items-center justify-between bg-blue-50 rounded-lg p-1">
              <button
                onClick={() => cart.updateQuantity(product.id, cartItem.quantity - 1)}
                className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-blue-600 shadow-sm"
                data-testid={`decrease-${product.id}`}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-semibold text-blue-600">{cartItem.quantity}</span>
              <button
                onClick={() => cart.updateQuantity(product.id, cartItem.quantity + 1)}
                className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-blue-600 shadow-sm"
                data-testid={`increase-${product.id}`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Button
              onClick={() => {
                cart.addItem(product);
                toast.success('Added to cart!');
              }}
              fullWidth
              size="sm"
              role="retailer"
              data-testid={`add-${product.id}`}
            >
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

// Categories Tab
const CategoriesTab = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadProducts(selectedCategory);
    }
  }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      const res = await categoriesAPI.getAll();
      setCategories(res.data);
      if (res.data.length > 0) {
        setSelectedCategory(res.data[0].id);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async (categoryId) => {
    try {
      const res = await productsAPI.getAll({ category_id: categoryId });
      setProducts(res.data);
    } catch (error) {
      console.error('Failed to load products:', error);
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
    <div className="flex gap-4">
      {/* Category Sidebar */}
      <div className="w-24 flex-shrink-0">
        <div className="space-y-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              data-testid={`category-btn-${category.id}`}
              className={`w-full p-3 rounded-xl text-center transition-all ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Grid3X3 className="w-6 h-6 mx-auto mb-1" />
              <span className="text-xs font-medium line-clamp-2">{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="flex-1">
        <div className="grid grid-cols-2 gap-3">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
        {products.length === 0 && (
          <div className="text-center py-10 text-slate-500">
            <Package className="w-12 h-12 mx-auto mb-2 text-slate-300" />
            <p>No products in this category</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Cart Tab
const CartTab = () => {
  const cart = useCartStore();
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();

  const subtotal = cart.getTotal();
  const savings = cart.getSavings();
  const gst = subtotal * 0.05;
  const delivery = subtotal > 500 ? 0 : 50;
  const total = subtotal + gst + delivery;

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
          name: user?.name || 'Shop',
          phone: user?.phone || '',
          address: 'Shop Address',
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
        <p className="text-slate-500">Add products to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-900">Cart ({cart.getItemCount()} items)</h2>
      
      {/* Cart Items */}
      <div className="space-y-3">
        {cart.items.map((item) => (
          <Card key={item.product_id} className="p-4" data-testid={`cart-item-${item.product_id}`}>
            <div className="flex gap-3">
              <div className="w-16 h-16 bg-slate-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                <Package className="w-6 h-6 text-slate-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-slate-900 line-clamp-1">{item.product_name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-semibold text-slate-900">₹{item.price}</span>
                  <span className="text-sm text-slate-400 line-through">₹{item.mrp}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
                    <button
                      onClick={() => cart.updateQuantity(item.product_id, item.quantity - 1)}
                      className="w-7 h-7 rounded bg-white flex items-center justify-center text-slate-600 shadow-sm"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => cart.updateQuantity(item.product_id, item.quantity + 1)}
                      className="w-7 h-7 rounded bg-white flex items-center justify-center text-slate-600 shadow-sm"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="font-semibold text-slate-900">₹{item.total}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Bill Summary */}
      <Card className="p-4" data-testid="bill-summary">
        <h3 className="font-semibold text-slate-900 mb-3">Bill Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Subtotal</span>
            <span className="font-medium">₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-green-600">
            <span>Savings</span>
            <span className="font-medium">-₹{savings.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">GST (5%)</span>
            <span className="font-medium">₹{gst.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Delivery</span>
            <span className="font-medium">{delivery === 0 ? 'FREE' : `₹${delivery}`}</span>
          </div>
          <div className="border-t border-slate-200 pt-2 flex justify-between text-base">
            <span className="font-semibold">Total</span>
            <span className="font-bold text-blue-600">₹{total.toFixed(2)}</span>
          </div>
        </div>
      </Card>

      {/* Checkout Button */}
      <Button
        onClick={handleCheckout}
        loading={loading}
        fullWidth
        size="lg"
        role="retailer"
        data-testid="checkout-btn"
      >
        Place Order • ₹{total.toFixed(2)}
      </Button>
    </div>
  );
};

// Orders Tab
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

  const statusColors = {
    placed: 'bg-blue-100 text-blue-700',
    confirmed: 'bg-purple-100 text-purple-700',
    packed: 'bg-indigo-100 text-indigo-700',
    out_for_delivery: 'bg-orange-100 text-orange-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700'
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
        <p className="text-slate-500">Place your first order</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-900">Your Orders</h2>
      
      {orders.map((order) => (
        <Card key={order.id} className="p-4" data-testid={`order-${order.id}`}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="font-mono text-sm text-slate-500">{order.order_number}</p>
              <p className="text-xs text-slate-400">
                {new Date(order.created_at).toLocaleDateString()}
              </p>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[order.order_status] || 'bg-slate-100'}`}>
              {order.order_status?.replace(/_/g, ' ')}
            </span>
          </div>
          
          <div className="border-t border-slate-100 pt-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">{order.items?.length || 0} items</span>
              <span className="font-semibold text-slate-900">₹{order.total_amount?.toFixed(2)}</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

// Profile Tab
const ProfileTab = ({ user, onLogout }) => {
  const menuItems = [
    { icon: User, label: 'Edit Profile', action: () => {} },
    { icon: MapPin, label: 'Manage Addresses', action: () => {} },
    { icon: Wallet, label: 'Credit Details', action: () => {} },
    { icon: Package, label: 'Order History', action: () => {} },
    { icon: TrendingUp, label: 'Shop Analytics', action: () => {} },
  ];

  return (
    <div className="space-y-4">
      {/* Profile Card */}
      <Card className="p-4" data-testid="profile-card">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{user?.name || 'Retailer'}</h2>
            <p className="text-sm text-slate-500">+91 {user?.phone}</p>
            <Badge variant="success" className="mt-1">Verified</Badge>
          </div>
        </div>
      </Card>

      {/* Menu */}
      <Card className="divide-y divide-slate-100">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={item.action}
            className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors"
          >
            <item.icon className="w-5 h-5 text-slate-500" />
            <span className="flex-1 text-left font-medium text-slate-700">{item.label}</span>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
        ))}
      </Card>

      {/* Logout */}
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
