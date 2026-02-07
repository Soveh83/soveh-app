import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { productsAPI, categoriesAPI, ordersAPI, creditAPI, aiAPI } from '../../lib/api';
import { Card, Button, Badge, Spinner, Modal, StaggerContainer, StaggerItem, PageTransition, Skeleton } from '../ui';
import { AIChatbot } from '../ai/AIChatbot';
import { KYCUpload } from '../kyc/KYCUpload';
import { EditProfile, ManageAddresses, CreditDetails, ShopAnalytics } from '../profile/ProfilePages';
import { LiveTracking } from '../tracking/LiveTracking';
import { initPushNotifications, pushService } from '../../lib/pushNotifications';
import { 
  Home, Grid3X3, ShoppingCart, Package, User,
  Search, Bell, MapPin, ChevronRight, Plus, Minus,
  TrendingUp, Clock, Percent, Star, Wallet, Sparkles,
  Heart, Zap, ArrowRight, Shield, BarChart3, Navigation,
  Phone, RefreshCw, X, Check, Truck, MessageCircle,
  HelpCircle, RotateCcw, ChevronDown, Gift, Flame, Target
} from 'lucide-react';
import toast from 'react-hot-toast';

// Initialize push notifications
initPushNotifications();

// SOVEH Logo Component
const SovehLogo = ({ size = 'md' }) => {
  const sizes = { sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-12 h-12' };
  return (
    <img 
      src="https://customer-assets.emergentagent.com/job_hii-wave-2/artifacts/fg5ubket_WhatsApp%20Image%202026-02-07%20at%209.05.20%20PM.jpeg"
      alt="SOVEH"
      className={`${sizes[size]} rounded-xl object-contain`}
    />
  );
};

const tabs = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'shop', icon: Grid3X3, label: 'Shop' },
  { id: 'cart', icon: ShoppingCart, label: 'Cart' },
  { id: 'orders', icon: Package, label: 'Orders' },
  { id: 'account', icon: User, label: 'Account' }
];

export const RetailerDashboard = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [showKYC, setShowKYC] = useState(false);
  const [profilePage, setProfilePage] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const { user, logout } = useAuthStore();
  const cart = useCartStore();

  // Auto-fetch current location on mount
  useEffect(() => {
    fetchCurrentLocation();
  }, []);

  const fetchCurrentLocation = async () => {
    setLocationLoading(true);
    
    // First check if geolocation is available
    if (!navigator.geolocation) {
      setCurrentLocation({ address: 'Location not supported', short: 'Set Location' });
      setLocationLoading(false);
      return;
    }

    // Request location with high accuracy
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log('Got location:', latitude, longitude);
        
        try {
          // Try Google Maps reverse geocoding
          const apiKey = process.env.REACT_APP_GOOGLE_MAPS_KEY;
          if (apiKey) {
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
            );
            const data = await response.json();
            
            if (data.status === 'OK' && data.results?.[0]) {
              const result = data.results[0];
              const locality = result.address_components?.find(c => 
                c.types.includes('sublocality_level_1') || c.types.includes('sublocality')
              )?.long_name;
              const city = result.address_components?.find(c => 
                c.types.includes('locality')
              )?.long_name;
              
              setCurrentLocation({
                lat: latitude,
                lng: longitude,
                address: result.formatted_address,
                short: locality || city || 'Current Location'
              });
              toast.success('Location detected!');
            } else {
              // Fallback if geocoding fails
              setCurrentLocation({
                lat: latitude,
                lng: longitude,
                address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
                short: 'Current Location'
              });
            }
          } else {
            // No API key, use coordinates
            setCurrentLocation({
              lat: latitude,
              lng: longitude,
              address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
              short: 'Current Location'
            });
          }
        } catch (error) {
          console.error('Geocoding error:', error);
          setCurrentLocation({
            lat: latitude,
            lng: longitude,
            address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            short: 'Current Location'
          });
        }
        setLocationLoading(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMsg = 'Location unavailable';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = 'Permission denied';
            toast.error('Please enable location access in your browser settings');
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = 'Position unavailable';
            break;
          case error.TIMEOUT:
            errorMsg = 'Request timeout';
            break;
          default:
            break;
        }
        setCurrentLocation({ address: errorMsg, short: 'Set Location' });
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // Handle profile sub-pages
  if (profilePage) {
    switch (profilePage) {
      case 'edit-profile': return <EditProfile user={user} onBack={() => setProfilePage(null)} />;
      case 'addresses': return <ManageAddresses onBack={() => setProfilePage(null)} />;
      case 'credit': return <CreditDetails onBack={() => setProfilePage(null)} />;
      case 'analytics': return <ShopAnalytics onBack={() => setProfilePage(null)} />;
      default: break;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pb-safe">
      {/* Premium Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-40 glass"
      >
        <div className="px-4 pt-3 pb-2">
          {/* Top Row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <SovehLogo size="md" />
              <div>
                <motion.div 
                  className="flex items-center gap-1 text-xs text-slate-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <MapPin className="w-3 h-3" />
                  {locationLoading ? (
                    <span className="animate-pulse">Detecting...</span>
                  ) : (
                    <span>{currentLocation?.short || 'Set Location'}</span>
                  )}
                  <ChevronDown className="w-3 h-3" />
                </motion.div>
                <h1 className="text-lg font-bold text-slate-900">Hi, {user?.name?.split(' ')[0] || 'Partner'} 👋</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchCurrentLocation}
                className="p-2.5 rounded-2xl bg-white shadow-sm border border-slate-100"
              >
                <Navigation className={`w-5 h-5 text-blue-600 ${locationLoading ? 'animate-spin' : ''}`} />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2.5 rounded-2xl bg-white shadow-sm border border-slate-100"
              >
                <Bell className="w-5 h-5 text-slate-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </motion.button>
            </div>
          </div>
          
          {/* Search Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search 1000+ products..."
              className="w-full h-12 pl-12 pr-20 rounded-2xl bg-white border border-slate-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              data-testid="search-input"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <motion.span 
                whileHover={{ scale: 1.05 }}
                className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" /> AI
              </motion.span>
            </div>
          </motion.div>
        </div>
      </motion.header>

      {/* Content */}
      <main className="px-4 py-4">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && <PageTransition key="home"><HomeTab currentLocation={currentLocation} /></PageTransition>}
          {activeTab === 'shop' && <PageTransition key="shop"><ShopTab /></PageTransition>}
          {activeTab === 'cart' && <PageTransition key="cart"><CartTab /></PageTransition>}
          {activeTab === 'orders' && <PageTransition key="orders"><OrdersTab /></PageTransition>}
          {activeTab === 'account' && <PageTransition key="account"><AccountTab user={user} onLogout={logout} onShowKYC={() => setShowKYC(true)} onNavigate={setProfilePage} /></PageTransition>}
        </AnimatePresence>
      </main>

      {/* AI Chatbot */}
      <AIChatbot />

      {/* iOS 26-style Glass Bottom Navigation */}
      <motion.nav 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50"
        style={{
          background: 'linear-gradient(to top, rgba(255,255,255,0.95), rgba(255,255,255,0.85))',
          backdropFilter: 'blur(40px) saturate(200%)',
          WebkitBackdropFilter: 'blur(40px) saturate(200%)',
          borderTop: '1px solid rgba(255,255,255,0.6)',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)'
        }}
      >
        <div className="flex justify-around items-center py-1.5 px-3 max-w-lg mx-auto">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileTap={{ scale: 0.85 }}
              data-testid={`nav-${tab.id}`}
              className={`relative flex flex-col items-center py-2 px-5 rounded-3xl transition-all duration-300 ${
                activeTab === tab.id 
                  ? 'text-blue-600' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-3xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(99,102,241,0.1))',
                    border: '1px solid rgba(59,130,246,0.2)',
                    boxShadow: '0 4px 15px rgba(59,130,246,0.15), inset 0 1px 0 rgba(255,255,255,0.5)'
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <motion.div
                animate={activeTab === tab.id ? { y: -2, scale: 1.1 } : { y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="relative z-10"
              >
                <tab.icon className="w-6 h-6" strokeWidth={activeTab === tab.id ? 2.5 : 1.8} />
              </motion.div>
              <motion.span 
                animate={activeTab === tab.id ? { opacity: 1, y: 0 } : { opacity: 0.8, y: 0 }}
                className={`relative z-10 text-[10px] mt-0.5 font-semibold tracking-wide ${activeTab === tab.id ? 'text-blue-600' : ''}`}
              >
                {tab.label}
              </motion.span>
              {tab.id === 'cart' && cart.getItemCount() > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 right-1 min-w-[18px] h-[18px] bg-gradient-to-r from-red-500 to-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 z-20 shadow-lg shadow-red-500/30"
                >
                  {cart.getItemCount()}
                </motion.span>
              )}
            </motion.button>
          ))}
        </div>
        {/* Safe area padding for iOS */}
        <div className="h-[env(safe-area-inset-bottom)]" style={{ background: 'inherit' }} />
      </motion.nav>

      {/* KYC Modal */}
      <Modal isOpen={showKYC} onClose={() => setShowKYC(false)} title="KYC Verification">
        <KYCUpload userId={user?.id} onComplete={() => { setShowKYC(false); toast.success('KYC submitted!'); }} />
      </Modal>
    </div>
  );
};

// Home Tab with Premium Design
const HomeTab = ({ currentLocation }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState('');
  const [loadingRecs, setLoadingRecs] = useState(true);
  const cart = useCartStore();

  useEffect(() => {
    loadData();
    loadRecommendations();
  }, []);

  const loadData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        productsAPI.getAll({ limit: 12 }),
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

  const loadRecommendations = async () => {
    try {
      const res = await aiAPI.getRecommendations(cart.items);
      if (res.data.success) {
        const { recommendations, summary } = res.data;
        
        // Format recommendations for display
        let formattedRecs = '';
        if (Array.isArray(recommendations) && recommendations.length > 0) {
          formattedRecs = recommendations.slice(0, 3).map(r => 
            `• ${r.product_name}: ${r.reason}`
          ).join('\n');
        } else if (summary) {
          formattedRecs = summary;
        } else {
          formattedRecs = 'Stock up on cooking essentials like oil, rice, and snacks for maximum profit margins!';
        }
        setRecommendations(formattedRecs);
      }
    } catch (e) {
      console.error('Recommendations error:', e);
      setRecommendations('Based on your purchase patterns, stock up on cooking oil, rice, and daily essentials for maximum margin!');
    } finally {
      setLoadingRecs(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full rounded-3xl" />
        <div className="grid grid-cols-4 gap-3">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-48 w-full rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-5 text-white"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-5 h-5 text-orange-300" />
            <span className="text-sm font-medium text-blue-200">Hot Deal</span>
          </div>
          <h2 className="text-2xl font-bold mb-1">Up to 25% Extra Margin</h2>
          <p className="text-blue-200 text-sm mb-4">On 500+ FMCG products this week</p>
          <Button size="sm" className="bg-white text-blue-700 hover:bg-blue-50">
            Explore Deals <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { icon: Target, value: '₹45K', label: 'This Month', color: 'blue' },
          { icon: Package, value: '28', label: 'Orders', color: 'green' },
          { icon: Percent, value: '₹4.2K', label: 'Saved', color: 'purple' },
          { icon: Star, value: '1.2K', label: 'Points', color: 'amber' }
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -2 }}
            className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 text-center"
          >
            <stat.icon className={`w-5 h-5 mx-auto mb-1 text-${stat.color}-500`} />
            <p className="text-sm font-bold text-slate-900">{stat.value}</p>
            <p className="text-[10px] text-slate-500">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* AI Recommendations */}
      {!loadingRecs && recommendations && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 border border-purple-100"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-purple-900 mb-1">AI Recommendation</p>
              <p className="text-sm text-purple-700 leading-relaxed">{recommendations.slice(0, 150)}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Categories */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-slate-900">Shop by Category</h2>
          <button className="text-sm text-blue-600 font-semibold flex items-center">
            See All <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {categories.slice(0, 4).map((category, index) => (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center p-3 rounded-2xl bg-white shadow-sm border border-slate-100"
            >
              {category.image ? (
                <img src={category.image} alt={category.name} className="w-12 h-12 rounded-xl object-cover mb-2" />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-2">
                  <Grid3X3 className="w-6 h-6 text-blue-600" />
                </div>
              )}
              <span className="text-xs font-medium text-slate-700 text-center line-clamp-1">{category.name}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-slate-900">Best Margin Products</h2>
          <button className="text-sm text-blue-600 font-semibold flex items-center">
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {products.slice(0, 6).map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100"
    >
      <div className="aspect-square bg-gradient-to-br from-slate-50 to-slate-100 relative overflow-hidden">
        {product.images?.[0] ? (
          <motion.img 
            src={product.images[0]} 
            alt={product.name} 
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-12 h-12 text-slate-300" />
          </div>
        )}
        <Badge variant="success" className="absolute top-2 left-2 bg-green-500 text-white">
          {margin}% margin
        </Badge>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center"
        >
          <Heart className="w-4 h-4 text-slate-400" />
        </motion.button>
      </div>
      <div className="p-3">
        <h3 className="font-medium text-slate-900 text-sm line-clamp-2 mb-1 h-10">{product.name}</h3>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-lg font-bold text-slate-900">₹{product.retailer_price}</span>
          <span className="text-xs text-slate-400 line-through">₹{product.mrp}</span>
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
              >
                <Minus className="w-4 h-4" />
              </motion.button>
              <motion.span key={cartItem.quantity} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="font-bold text-blue-600">
                {cartItem.quantity}
              </motion.span>
              <motion.button
                whileTap={{ scale: 0.8 }}
                onClick={() => cart.updateQuantity(product.id, cartItem.quantity + 1)}
                className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-blue-600 shadow-sm"
              >
                <Plus className="w-4 h-4" />
              </motion.button>
            </motion.div>
          ) : (
            <motion.div key="add" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Button
                onClick={() => { cart.addItem(product); toast.success('Added!'); }}
                fullWidth
                size="sm"
                role="retailer"
              >
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// Shop Tab (Categories + Products)
const ShopTab = () => {
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
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const loadProducts = async (categoryId) => {
    try {
      const res = await productsAPI.getAll({ category_id: categoryId });
      setProducts(res.data);
    } catch (e) { console.error(e); }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="flex gap-3">
      {/* Category Sidebar */}
      <div className="w-20 flex-shrink-0 space-y-2">
        {categories.map((cat) => (
          <motion.button
            key={cat.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory(cat.id)}
            className={`w-full p-2 rounded-2xl text-center transition-all ${
              selectedCategory === cat.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-700 shadow-sm'
            }`}
          >
            {cat.image ? (
              <img src={cat.image} alt={cat.name} className="w-8 h-8 mx-auto rounded-lg mb-1 object-cover" />
            ) : (
              <Grid3X3 className="w-6 h-6 mx-auto mb-1" />
            )}
            <span className="text-[10px] font-medium line-clamp-2">{cat.name}</span>
          </motion.button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="flex-1 grid grid-cols-2 gap-3">
        {products.length > 0 ? (
          products.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)
        ) : (
          <div className="col-span-2 text-center py-10">
            <Package className="w-12 h-12 mx-auto mb-2 text-slate-300" />
            <p className="text-slate-500">No products found</p>
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
    } catch (e) { toast.error('Failed to place order'); }
    finally { setLoading(false); }
  };

  if (cart.items.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
        <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <ShoppingCart className="w-20 h-20 mx-auto mb-4 text-slate-300" />
        </motion.div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">Your cart is empty</h3>
        <p className="text-slate-500 mb-4">Add products to get started</p>
        <Button role="retailer">Start Shopping</Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-900">Cart ({cart.getItemCount()} items)</h2>
      
      <div className="space-y-3">
        {cart.items.map((item) => (
          <Card key={item.product_id} className="p-3">
            <div className="flex gap-3">
              <div className="w-16 h-16 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0">
                {item.image ? <img src={item.image} alt={item.product_name} className="w-full h-full object-cover" /> : <Package className="w-6 h-6 m-auto text-slate-400" />}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-slate-900 text-sm line-clamp-1">{item.product_name}</h4>
                <p className="text-sm text-slate-500">₹{item.price} × {item.quantity}</p>
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
                    <button onClick={() => cart.updateQuantity(item.product_id, item.quantity - 1)} className="w-6 h-6 rounded bg-white flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                    <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                    <button onClick={() => cart.updateQuantity(item.product_id, item.quantity + 1)} className="w-6 h-6 rounded bg-white flex items-center justify-center"><Plus className="w-3 h-3" /></button>
                  </div>
                  <span className="font-bold text-slate-900">₹{item.total}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <h3 className="font-semibold text-slate-900 mb-3">Bill Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-slate-600">Subtotal</span><span>₹{subtotal.toFixed(0)}</span></div>
          <div className="flex justify-between text-green-600"><span>Savings</span><span>-₹{savings.toFixed(0)}</span></div>
          <div className="flex justify-between"><span className="text-slate-600">GST (5%)</span><span>₹{gst.toFixed(0)}</span></div>
          <div className="flex justify-between"><span className="text-slate-600">Delivery</span><span className={delivery === 0 ? 'text-green-600' : ''}>{delivery === 0 ? 'FREE' : `₹${delivery}`}</span></div>
          <div className="border-t pt-2 flex justify-between font-bold text-base"><span>Total</span><span className="text-blue-600">₹{total.toFixed(0)}</span></div>
        </div>
      </Card>

      <Button onClick={handleCheckout} loading={loading} fullWidth size="lg" role="retailer">
        Place Order • ₹{total.toFixed(0)}
      </Button>
    </div>
  );
};

// Orders Tab with Real-time Tracking
const OrdersTab = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async () => {
    try {
      const res = await ordersAPI.getAll();
      setOrders(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>;

  if (orders.length === 0) {
    return (
      <div className="text-center py-20">
        <Package className="w-16 h-16 mx-auto mb-4 text-slate-300" />
        <h3 className="text-lg font-bold text-slate-900 mb-1">No orders yet</h3>
        <p className="text-slate-500">Your orders will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-900">Your Orders</h2>
      
      {orders.map((order, index) => (
        <motion.div
          key={order.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="p-4" hover onClick={() => setSelectedOrder(order)}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-mono text-sm font-semibold text-slate-900">{order.order_number}</p>
                <p className="text-xs text-slate-500">{new Date(order.created_at).toLocaleDateString()}</p>
              </div>
              <OrderStatusBadge status={order.order_status} />
            </div>
            
            {/* Live Tracking Bar */}
            <div className="mb-3">
              <TrackingProgress status={order.order_status} />
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-sm text-slate-600">{order.items?.length || 0} items</span>
              <span className="font-bold text-slate-900">₹{order.total_amount?.toFixed(0)}</span>
            </div>
          </Card>
        </motion.div>
      ))}

      {/* Order Detail Modal */}
      <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={`Order ${selectedOrder?.order_number}`}>
        {selectedOrder && <OrderDetailView order={selectedOrder} onClose={() => { setSelectedOrder(null); loadOrders(); }} />}
      </Modal>
    </div>
  );
};

// Order Status Badge
const OrderStatusBadge = ({ status }) => {
  const statusConfig = {
    placed: { color: 'bg-blue-100 text-blue-700', label: 'Order Placed' },
    confirmed: { color: 'bg-purple-100 text-purple-700', label: 'Confirmed' },
    packed: { color: 'bg-indigo-100 text-indigo-700', label: 'Packed' },
    out_for_delivery: { color: 'bg-orange-100 text-orange-700', label: 'Out for Delivery' },
    delivered: { color: 'bg-green-100 text-green-700', label: 'Delivered' },
    cancelled: { color: 'bg-red-100 text-red-700', label: 'Cancelled' }
  };
  const config = statusConfig[status] || statusConfig.placed;
  return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>{config.label}</span>;
};

// Tracking Progress Component
const TrackingProgress = ({ status }) => {
  const steps = ['placed', 'confirmed', 'packed', 'out_for_delivery', 'delivered'];
  const currentIndex = steps.indexOf(status);
  
  return (
    <div className="flex items-center gap-1">
      {steps.map((step, index) => (
        <React.Fragment key={step}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              index <= currentIndex ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-400'
            }`}
          >
            {index <= currentIndex ? <Check className="w-3 h-3" /> : index + 1}
          </motion.div>
          {index < steps.length - 1 && (
            <div className={`flex-1 h-1 rounded ${index < currentIndex ? 'bg-green-500' : 'bg-slate-200'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// Order Detail View with Actions
const OrderDetailView = ({ order, onClose }) => {
  const [cancelling, setCancelling] = useState(false);
  const [showLiveTracking, setShowLiveTracking] = useState(order.order_status === 'out_for_delivery');

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await ordersAPI.updateStatus(order.id, 'cancelled');
      toast.success('Order cancelled');
      pushService.showNotification('Order Cancelled', { body: `Order ${order.order_number} has been cancelled` });
      onClose();
    } catch (e) { toast.error('Failed to cancel'); }
    finally { setCancelling(false); }
  };

  // Show live tracking for out_for_delivery orders
  if (showLiveTracking && order.order_status === 'out_for_delivery') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900">Live Tracking</h3>
          <button onClick={() => setShowLiveTracking(false)} className="text-sm text-blue-600">View Details</button>
        </div>
        <LiveTracking 
          order={order}
          onBack={() => setShowLiveTracking(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status */}
      <div className="text-center py-4">
        <OrderStatusBadge status={order.order_status} />
        <p className="text-sm text-slate-500 mt-2">
          {order.order_status === 'out_for_delivery' ? 'Arriving in 15-20 mins' : 
           order.order_status === 'delivered' ? 'Delivered successfully' : 'Processing your order'}
        </p>
      </div>
      
      {/* Live Tracking Button for out_for_delivery */}
      {order.order_status === 'out_for_delivery' && (
        <Button fullWidth role="retailer" onClick={() => setShowLiveTracking(true)}>
          <Navigation className="w-4 h-4 mr-2" /> Track Live on Map
        </Button>
      )}

      {/* Live Map Placeholder */}
      {order.order_status === 'out_for_delivery' && (
        <div className="h-40 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl flex items-center justify-center">
          <div className="text-center">
            <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 1, repeat: Infinity }}>
              <Truck className="w-10 h-10 text-blue-600 mx-auto" />
            </motion.div>
            <p className="text-sm text-blue-700 mt-2">Live tracking available</p>
          </div>
        </div>
      )}

      {/* Items */}
      <div>
        <h4 className="font-semibold text-slate-900 mb-2">Order Items</h4>
        <div className="space-y-2">
          {order.items?.map((item, i) => (
            <div key={i} className="flex justify-between text-sm py-2 border-b border-slate-100">
              <span className="text-slate-700">{item.product_name} × {item.quantity}</span>
              <span className="font-medium">₹{item.total}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Total */}
      <div className="flex justify-between font-bold text-base pt-2">
        <span>Total</span>
        <span className="text-blue-600">₹{order.total_amount?.toFixed(0)}</span>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 pt-4">
        <Button variant="outline" role="default" onClick={() => window.open('tel:+919999999999')}>
          <Phone className="w-4 h-4 mr-2" /> Call Support
        </Button>
        <Button variant="outline" role="default">
          <MessageCircle className="w-4 h-4 mr-2" /> Chat
        </Button>
      </div>

      {order.order_status !== 'delivered' && order.order_status !== 'cancelled' && (
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" role="admin" onClick={handleCancel} loading={cancelling}>
            <X className="w-4 h-4 mr-2" /> Cancel Order
          </Button>
          <Button variant="outline" role="default">
            <RotateCcw className="w-4 h-4 mr-2" /> Request Refund
          </Button>
        </div>
      )}
    </div>
  );
};

// Account Tab
const AccountTab = ({ user, onLogout, onShowKYC, onNavigate }) => {
  const menuSections = [
    {
      title: 'Account Settings',
      items: [
        { icon: User, label: 'Edit Profile', page: 'edit-profile' },
        { icon: MapPin, label: 'Manage Addresses', page: 'addresses', badge: 'Maps' },
        { icon: Shield, label: 'KYC Verification', action: onShowKYC, badge: 'AI' },
      ]
    },
    {
      title: 'Business',
      items: [
        { icon: Wallet, label: 'Credit & Payments', page: 'credit' },
        { icon: BarChart3, label: 'Shop Analytics', page: 'analytics' },
        { icon: Gift, label: 'Rewards & Points', page: 'rewards' },
      ]
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'Help Center', page: 'help' },
        { icon: MessageCircle, label: 'Chat with Us', page: 'chat' },
        { icon: Phone, label: 'Call Support', action: () => window.open('tel:+919999999999') },
      ]
    }
  ];

  return (
    <div className="space-y-4">
      {/* Profile Card */}
      <Card className="p-4 bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-0">
        <div className="flex items-center gap-4">
          <motion.div 
            whileHover={{ scale: 1.1 }}
            className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center"
          >
            <User className="w-8 h-8" />
          </motion.div>
          <div className="flex-1">
            <h2 className="text-lg font-bold">{user?.name || 'SOVEH Partner'}</h2>
            <p className="text-blue-200 text-sm">+91 {user?.phone}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="bg-green-500/20 text-green-200">Verified</Badge>
              <Badge className="bg-amber-500/20 text-amber-200">Gold Member</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Menu Sections */}
      {menuSections.map((section, sIdx) => (
        <div key={sIdx}>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 px-1">{section.title}</h3>
          <Card className="divide-y divide-slate-100">
            {section.items.map((item, index) => (
              <motion.button
                key={index}
                whileHover={{ x: 4 }}
                onClick={() => item.action ? item.action() : onNavigate(item.page)}
                className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-slate-600" />
                </div>
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
        </div>
      ))}

      {/* Logout */}
      <Button onClick={onLogout} variant="outline" fullWidth role="admin" className="mt-4">
        Logout
      </Button>

      {/* App Version */}
      <p className="text-center text-xs text-slate-400 mt-4">
        SOVEH Partner App v2.0 • Made with ❤️
      </p>
    </div>
  );
};
