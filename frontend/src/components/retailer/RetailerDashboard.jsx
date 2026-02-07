import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { productsAPI, categoriesAPI, ordersAPI, creditAPI, aiAPI } from '../../lib/api';
import { Card, Button, Badge, Spinner, Modal, StaggerContainer, StaggerItem, PageTransition, Skeleton } from '../ui';
import { AIChatbot } from '../ai/AIChatbot';
import { KYCUpload } from '../kyc/KYCUpload';
import { EditProfile, ManageAddresses, CreditDetails, ShopAnalytics } from '../profile/ProfilePages';
import { 
  Home, Grid3X3, ShoppingCart, Package, User,
  Search, Bell, MapPin, ChevronRight, Plus, Minus,
  TrendingUp, Clock, Percent, Star, Wallet, Sparkles,
  FileCheck, Heart, Zap, ArrowRight, Shield, BarChart3
} from 'lucide-react';
import toast from 'react-hot-toast';

const tabs = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'categories', icon: Grid3X3, label: 'Shop' },
  { id: 'cart', icon: ShoppingCart, label: 'Cart' },
  { id: 'orders', icon: Package, label: 'Orders' },
  { id: 'profile', icon: User, label: 'Account' }
];

export const RetailerDashboard = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [showKYC, setShowKYC] = useState(false);
  const { user, logout } = useAuthStore();
  const cart = useCartStore();

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Animated Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200/50"
      >
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <p className="text-sm text-slate-500">Good morning,</p>
              <h1 className="text-lg font-bold text-slate-900">{user?.name || 'Retailer'}</h1>
            </motion.div>
            <div className="flex items-center gap-2">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors" 
                data-testid="notifications-btn"
              >
                <Bell className="w-5 h-5 text-slate-600" />
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"
                />
              </motion.button>
            </div>
          </div>
          
          {/* Animated Search Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search products, brands..."
              className="w-full h-12 pl-10 pr-4 rounded-2xl bg-slate-100 border-0 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all"
              data-testid="search-input"
            />
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-medium flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" /> AI
            </motion.div>
          </motion.div>
          
          {/* Location */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center mt-2 text-sm text-slate-600"
          >
            <MapPin className="w-4 h-4 mr-1 text-blue-600" />
            <span>Delivering to your shop</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </motion.div>
        </div>
      </motion.header>

      {/* Content */}
      <main className="px-4 py-4">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <PageTransition key="home">
              <HomeTab onShowKYC={() => setShowKYC(true)} />
            </PageTransition>
          )}
          {activeTab === 'categories' && (
            <PageTransition key="categories">
              <CategoriesTab />
            </PageTransition>
          )}
          {activeTab === 'cart' && (
            <PageTransition key="cart">
              <CartTab />
            </PageTransition>
          )}
          {activeTab === 'orders' && (
            <PageTransition key="orders">
              <OrdersTab />
            </PageTransition>
          )}
          {activeTab === 'profile' && (
            <PageTransition key="profile">
              <ProfileTab user={user} onLogout={logout} onShowKYC={() => setShowKYC(true)} />
            </PageTransition>
          )}
        </AnimatePresence>
      </main>

      {/* AI Chatbot */}
      <AIChatbot />

      {/* Bottom Navigation */}
      <motion.nav 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200/50 px-2 py-2 safe-area-inset-bottom"
      >
        <div className="flex justify-around items-center max-w-lg mx-auto">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileTap={{ scale: 0.9 }}
              data-testid={`nav-${tab.id}`}
              className={`flex flex-col items-center py-1.5 px-4 rounded-2xl transition-all relative ${
                activeTab === tab.id 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <motion.div
                animate={activeTab === tab.id ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <tab.icon className="w-6 h-6" />
              </motion.div>
              <span className="text-xs mt-0.5 font-medium">{tab.label}</span>
              {tab.id === 'cart' && cart.getItemCount() > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 right-2 w-5 h-5 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center"
                >
                  {cart.getItemCount()}
                </motion.span>
              )}
            </motion.button>
          ))}
        </div>
      </motion.nav>

      {/* KYC Modal */}
      <Modal isOpen={showKYC} onClose={() => setShowKYC(false)} title="KYC Verification">
        <KYCUpload userId={user?.id} onComplete={() => {
          setShowKYC(false);
          toast.success('KYC submitted successfully!');
        }} />
      </Modal>
    </div>
  );
};

// Home Tab Component
const HomeTab = ({ onShowKYC }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creditInfo, setCreditInfo] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const cart = useCartStore();

  useEffect(() => {
    loadData();
    loadRecommendations();
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
      } catch (e) {}
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendations = async () => {
    setLoadingRecs(true);
    try {
      const res = await aiAPI.getRecommendations(cart.items);
      if (res.data.success && res.data.recommendations) {
        setRecommendations(res.data.recommendations);
      }
    } catch (e) {
      console.error('Recommendations error:', e);
    } finally {
      setLoadingRecs(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-3 gap-3">
          {[1,2,3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KYC Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        onClick={onShowKYC}
        className="cursor-pointer"
      >
        <Card className="p-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold">Complete Your KYC</h3>
              <p className="text-amber-100 text-sm">Get verified with AI-powered verification</p>
            </div>
            <ArrowRight className="w-5 h-5" />
          </div>
        </Card>
      </motion.div>

      {/* Credit Summary */}
      {creditInfo && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-4 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 text-white border-0 overflow-hidden relative">
            <motion.div
              className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full"
              animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
              transition={{ duration: 10, repeat: Infinity }}
            />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-blue-200 text-sm">Available Credit</p>
                <motion.p 
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  className="text-3xl font-bold"
                >
                  ₹{creditInfo.available_credit?.toLocaleString() || 0}
                </motion.p>
              </div>
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Wallet className="w-12 h-12 text-blue-200" />
              </motion.div>
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
        </motion.div>
      )}

      {/* Quick Stats */}
      <StaggerContainer className="grid grid-cols-3 gap-3">
        {[
          { icon: Package, label: 'Orders', value: '12', color: 'blue' },
          { icon: Percent, label: 'Saved', value: '₹2.5K', color: 'green' },
          { icon: Star, label: 'Points', value: '850', color: 'amber' }
        ].map((stat, i) => (
          <StaggerItem key={i}>
            <Card className="p-3 text-center" hover data-testid={`stat-${stat.label.toLowerCase()}`}>
              <motion.div
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
              >
                <stat.icon className={`w-6 h-6 mx-auto mb-1 text-${stat.color}-600`} />
              </motion.div>
              <p className="text-xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-xs text-slate-500">{stat.label}</p>
            </Card>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* AI Recommendations */}
      {!loadingRecs && recommendations && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-bold text-slate-900">AI Recommendations</h2>
          </div>
          <Card className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-100">
            <p className="text-sm text-purple-800">
              {typeof recommendations === 'string' ? recommendations : 'Based on your purchase history, we recommend stocking up on rice and cooking oil!'}
            </p>
          </Card>
        </div>
      )}

      {/* Categories */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-slate-900">Categories</h2>
          <button className="text-sm text-blue-600 font-medium flex items-center">
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <StaggerContainer className="grid grid-cols-4 gap-3">
          {categories.slice(0, 8).map((category, index) => (
            <StaggerItem key={category.id}>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center p-3 rounded-2xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all"
                data-testid={`category-${category.id}`}
              >
                {category.image ? (
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="w-12 h-12 rounded-xl object-cover mb-1"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-1">
                    <Grid3X3 className="w-6 h-6 text-blue-600" />
                  </div>
                )}
                <span className="text-xs font-medium text-slate-700 text-center line-clamp-1">
                  {category.name}
                </span>
              </motion.button>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>

      {/* Products */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-slate-900">Best Sellers</h2>
          <button className="text-sm text-blue-600 font-medium flex items-center">
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <StaggerContainer className="grid grid-cols-2 gap-3">
          {products.map((product, index) => (
            <StaggerItem key={product.id}>
              <ProductCard product={product} index={index} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </div>
  );
};

// Enhanced Product Card
const ProductCard = ({ product, index }) => {
  const cart = useCartStore();
  const cartItem = cart.items.find(item => item.product_id === product.id);
  const margin = ((product.mrp - product.retailer_price) / product.mrp * 100).toFixed(0);

  return (
    <Card className="overflow-hidden" hover data-testid={`product-${product.id}`}>
      <div className="aspect-square bg-slate-100 relative overflow-hidden">
        {product.images?.[0] ? (
          <motion.img 
            src={product.images[0]} 
            alt={product.name} 
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">
            <Package className="w-12 h-12" />
          </div>
        )}
        <motion.div
          initial={{ x: -50 }}
          animate={{ x: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Badge variant="success" className="absolute top-2 left-2">
            <Zap className="w-3 h-3 mr-0.5" />{margin}% margin
          </Badge>
        </motion.div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center"
        >
          <Heart className="w-4 h-4 text-slate-400" />
        </motion.button>
      </div>
      <div className="p-3">
        <h3 className="font-medium text-slate-900 text-sm line-clamp-2 mb-1">{product.name}</h3>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-lg font-bold text-slate-900">₹{product.retailer_price}</span>
          <span className="text-sm text-slate-400 line-through">₹{product.mrp}</span>
        </div>
        
        <AnimatePresence mode="wait">
          {cartItem ? (
            <motion.div
              key="controls"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center justify-between bg-blue-50 rounded-xl p-1"
            >
              <motion.button
                whileTap={{ scale: 0.8 }}
                onClick={() => cart.updateQuantity(product.id, cartItem.quantity - 1)}
                className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-blue-600 shadow-sm"
                data-testid={`decrease-${product.id}`}
              >
                <Minus className="w-4 h-4" />
              </motion.button>
              <motion.span 
                key={cartItem.quantity}
                initial={{ scale: 1.5 }}
                animate={{ scale: 1 }}
                className="font-bold text-blue-600"
              >
                {cartItem.quantity}
              </motion.span>
              <motion.button
                whileTap={{ scale: 0.8 }}
                onClick={() => cart.updateQuantity(product.id, cartItem.quantity + 1)}
                className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-blue-600 shadow-sm"
                data-testid={`increase-${product.id}`}
              >
                <Plus className="w-4 h-4" />
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="add"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
};

// Categories Tab (keeping shorter for space)
const CategoriesTab = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadCategories(); }, []);
  useEffect(() => { if (selectedCategory) loadProducts(selectedCategory); }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      const res = await categoriesAPI.getAll();
      setCategories(res.data);
      if (res.data.length > 0) setSelectedCategory(res.data[0].id);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally { setLoading(false); }
  };

  const loadProducts = async (categoryId) => {
    try {
      const res = await productsAPI.getAll({ category_id: categoryId });
      setProducts(res.data);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="flex gap-4">
      <div className="w-24 flex-shrink-0 space-y-2">
        {categories.map((category) => (
          <motion.button
            key={category.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory(category.id)}
            data-testid={`category-btn-${category.id}`}
            className={`w-full p-3 rounded-2xl text-center transition-all ${
              selectedCategory === category.id
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            {category.image ? (
              <img src={category.image} alt={category.name} className="w-8 h-8 mx-auto rounded-lg mb-1 object-cover" />
            ) : (
              <Grid3X3 className="w-6 h-6 mx-auto mb-1" />
            )}
            <span className="text-xs font-medium line-clamp-2">{category.name}</span>
          </motion.button>
        ))}
      </div>
      <div className="flex-1">
        <StaggerContainer className="grid grid-cols-2 gap-3">
          {products.map((product, index) => (
            <StaggerItem key={product.id}>
              <ProductCard product={product} index={index} />
            </StaggerItem>
          ))}
        </StaggerContainer>
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
    if (cart.items.length === 0) { toast.error('Cart is empty!'); return; }
    setLoading(true);
    try {
      await ordersAPI.create({
        items: cart.items,
        payment_mode: 'cod',
        delivery_address: { name: user?.name || 'Shop', phone: user?.phone || '', address: 'Shop Address', city: 'City', pincode: '000000' }
      });
      cart.clearCart();
      toast.success('Order placed successfully!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to place order');
    } finally { setLoading(false); }
  };

  if (cart.items.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
        <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <ShoppingCart className="w-20 h-20 mx-auto mb-4 text-slate-300" />
        </motion.div>
        <h3 className="text-lg font-semibold text-slate-900 mb-1">Your cart is empty</h3>
        <p className="text-slate-500">Add products to get started</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-900">Cart ({cart.getItemCount()} items)</h2>
      <StaggerContainer className="space-y-3">
        {cart.items.map((item) => (
          <StaggerItem key={item.product_id}>
            <Card className="p-4" data-testid={`cart-item-${item.product_id}`}>
              <div className="flex gap-3">
                <div className="w-16 h-16 bg-slate-100 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden">
                  {item.image ? (
                    <img src={item.image} alt={item.product_name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-slate-900 line-clamp-1">{item.product_name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-semibold text-slate-900">₹{item.price}</span>
                    <span className="text-sm text-slate-400 line-through">₹{item.mrp}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
                      <motion.button whileTap={{ scale: 0.8 }} onClick={() => cart.updateQuantity(item.product_id, item.quantity - 1)} className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shadow-sm">
                        <Minus className="w-3 h-3" />
                      </motion.button>
                      <span className="w-6 text-center font-semibold">{item.quantity}</span>
                      <motion.button whileTap={{ scale: 0.8 }} onClick={() => cart.updateQuantity(item.product_id, item.quantity + 1)} className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shadow-sm">
                        <Plus className="w-3 h-3" />
                      </motion.button>
                    </div>
                    <span className="font-semibold text-slate-900">₹{item.total}</span>
                  </div>
                </div>
              </div>
            </Card>
          </StaggerItem>
        ))}
      </StaggerContainer>

      <Card className="p-4" data-testid="bill-summary">
        <h3 className="font-semibold text-slate-900 mb-3">Bill Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-slate-600">Subtotal</span><span className="font-medium">₹{subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between text-emerald-600"><span>Savings</span><span className="font-medium">-₹{savings.toFixed(2)}</span></div>
          <div className="flex justify-between"><span className="text-slate-600">GST (5%)</span><span className="font-medium">₹{gst.toFixed(2)}</span></div>
          <div className="flex justify-between"><span className="text-slate-600">Delivery</span><span className="font-medium">{delivery === 0 ? 'FREE' : `₹${delivery}`}</span></div>
          <div className="border-t border-slate-200 pt-2 flex justify-between text-base">
            <span className="font-semibold">Total</span>
            <span className="font-bold text-blue-600">₹{total.toFixed(2)}</span>
          </div>
        </div>
      </Card>

      <Button onClick={handleCheckout} loading={loading} fullWidth size="lg" role="retailer" data-testid="checkout-btn">
        Place Order • ₹{total.toFixed(2)}
      </Button>
    </div>
  );
};

// Orders Tab
const OrdersTab = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async () => {
    try {
      const res = await ordersAPI.getAll();
      setOrders(res.data);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally { setLoading(false); }
  };

  const statusColors = {
    placed: 'bg-blue-100 text-blue-700',
    confirmed: 'bg-purple-100 text-purple-700',
    packed: 'bg-indigo-100 text-indigo-700',
    out_for_delivery: 'bg-orange-100 text-orange-700',
    delivered: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-700'
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>;
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
      <StaggerContainer className="space-y-3">
        {orders.map((order) => (
          <StaggerItem key={order.id}>
            <Card className="p-4" hover data-testid={`order-${order.id}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-mono text-sm text-slate-500">{order.order_number}</p>
                  <p className="text-xs text-slate-400">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <motion.span whileHover={{ scale: 1.05 }} className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[order.order_status] || 'bg-slate-100'}`}>
                  {order.order_status?.replace(/_/g, ' ')}
                </motion.span>
              </div>
              <div className="border-t border-slate-100 pt-3 flex justify-between text-sm">
                <span className="text-slate-600">{order.items?.length || 0} items</span>
                <span className="font-semibold text-slate-900">₹{order.total_amount?.toFixed(2)}</span>
              </div>
            </Card>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </div>
  );
};

// Profile Tab
const ProfileTab = ({ user, onLogout, onShowKYC }) => {
  const menuItems = [
    { icon: User, label: 'Edit Profile', action: () => {} },
    { icon: MapPin, label: 'Manage Addresses', action: () => {} },
    { icon: Shield, label: 'KYC Verification', action: onShowKYC, badge: 'AI Powered' },
    { icon: Wallet, label: 'Credit Details', action: () => {} },
    { icon: Package, label: 'Order History', action: () => {} },
    { icon: TrendingUp, label: 'Shop Analytics', action: () => {} },
  ];

  return (
    <div className="space-y-4">
      <Card className="p-4" data-testid="profile-card">
        <div className="flex items-center gap-4">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center"
          >
            <User className="w-8 h-8 text-white" />
          </motion.div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{user?.name || 'Retailer'}</h2>
            <p className="text-sm text-slate-500">+91 {user?.phone}</p>
            <Badge variant="success" className="mt-1">Verified</Badge>
          </div>
        </div>
      </Card>

      <Card className="divide-y divide-slate-100">
        {menuItems.map((item, index) => (
          <motion.button
            key={index}
            whileHover={{ x: 5 }}
            onClick={item.action}
            className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors"
          >
            <item.icon className="w-5 h-5 text-slate-500" />
            <span className="flex-1 text-left font-medium text-slate-700">{item.label}</span>
            {item.badge && (
              <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">
                {item.badge}
              </span>
            )}
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </motion.button>
        ))}
      </Card>

      <Button onClick={onLogout} variant="outline" fullWidth role="admin" data-testid="logout-btn">
        Logout
      </Button>
    </div>
  );
};
