import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleMap, useJsApiLoader, Marker, Autocomplete } from '@react-google-maps/api';
import { 
  User, MapPin, CreditCard, BarChart3, ArrowLeft, Camera, Save,
  Plus, Trash2, Edit2, Home, Building, Star, Check, X, Navigation,
  TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, Clock,
  Wallet, Receipt, Calendar, ChevronRight, Phone, Mail, Building2
} from 'lucide-react';
import { Button, Card, Badge, Input, Spinner, Modal } from '../ui';
import { useAuthStore } from '../../store/authStore';
import { creditAPI } from '../../lib/api';
import toast from 'react-hot-toast';

const libraries = ['places'];

// Edit Profile Component
export const EditProfile = ({ user, onBack, onSave }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    shopName: user?.shop_name || '',
    gst: user?.gst || '',
    businessType: user?.business_type || 'retail'
  });
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState(null);

  const handleSave = async () => {
    setLoading(true);
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Profile updated successfully!');
      onSave?.(formData);
      onBack();
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-slate-100" data-testid="back-btn">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <h2 className="text-xl font-bold text-slate-900">Edit Profile</h2>
      </div>

      {/* Avatar Section */}
      <Card className="p-6">
        <div className="flex flex-col items-center">
          <div className="relative">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center overflow-hidden"
            >
              {avatar ? (
                <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-white" />
              )}
            </motion.div>
            <motion.label
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center cursor-pointer shadow-lg"
            >
              <Camera className="w-4 h-4" />
              <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (e) => setAvatar(e.target.result);
                  reader.readAsDataURL(file);
                }
              }} />
            </motion.label>
          </div>
          <p className="text-sm text-slate-500 mt-2">Tap to change photo</p>
        </div>
      </Card>

      {/* Form */}
      <Card className="p-6 space-y-4">
        <h3 className="font-semibold text-slate-900 mb-4">Personal Information</h3>
        
        <Input
          label="Full Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter your name"
          data-testid="input-name"
        />
        
        <Input
          label="Phone Number"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="+91 XXXXXXXXXX"
          disabled
          data-testid="input-phone"
        />
        
        <Input
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="your@email.com"
          data-testid="input-email"
        />
      </Card>

      <Card className="p-6 space-y-4">
        <h3 className="font-semibold text-slate-900 mb-4">Business Information</h3>
        
        <Input
          label="Shop/Business Name"
          value={formData.shopName}
          onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
          placeholder="Your Shop Name"
          data-testid="input-shop"
        />
        
        <Input
          label="GST Number (Optional)"
          value={formData.gst}
          onChange={(e) => setFormData({ ...formData, gst: e.target.value })}
          placeholder="22AAAAA0000A1Z5"
          data-testid="input-gst"
        />
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Business Type</label>
          <div className="grid grid-cols-2 gap-2">
            {['retail', 'wholesale', 'distributor', 'manufacturer'].map((type) => (
              <motion.button
                key={type}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFormData({ ...formData, businessType: type })}
                className={`p-3 rounded-xl border-2 text-sm font-medium capitalize transition-all ${
                  formData.businessType === type
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {type}
              </motion.button>
            ))}
          </div>
        </div>
      </Card>

      <Button onClick={handleSave} loading={loading} fullWidth size="lg" role="retailer" data-testid="save-profile-btn">
        <Save className="w-5 h-5 mr-2" /> Save Changes
      </Button>
    </motion.div>
  );
};

// Manage Addresses Component with Google Maps
export const ManageAddresses = ({ onBack }) => {
  const [addresses, setAddresses] = useState([
    { id: '1', type: 'shop', name: 'My Shop', address: '123 Market Street, Mumbai', pincode: '400001', isDefault: true, lat: 19.076, lng: 72.8777 },
    { id: '2', type: 'warehouse', name: 'Warehouse', address: '456 Industrial Area, Thane', pincode: '400601', isDefault: false, lat: 19.2183, lng: 72.9781 }
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState({ lat: 19.076, lng: 72.8777 });
  const [autocomplete, setAutocomplete] = useState(null);
  const [newAddress, setNewAddress] = useState({ type: 'shop', name: '', address: '', pincode: '', lat: 19.076, lng: 72.8777 });

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_KEY || '',
    libraries
  });

  const onLoad = useCallback((autocompleteInstance) => {
    setAutocomplete(autocompleteInstance);
  }, []);

  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setSelectedLocation({ lat, lng });
        setNewAddress({
          ...newAddress,
          address: place.formatted_address || '',
          lat,
          lng
        });
      }
    }
  };

  const handleMapClick = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setSelectedLocation({ lat, lng });
    setNewAddress({ ...newAddress, lat, lng });
  };

  const handleSaveAddress = () => {
    if (!newAddress.name || !newAddress.address) {
      toast.error('Please fill all required fields');
      return;
    }

    if (editingAddress) {
      setAddresses(addresses.map(a => a.id === editingAddress.id ? { ...newAddress, id: a.id } : a));
      toast.success('Address updated!');
    } else {
      setAddresses([...addresses, { ...newAddress, id: Date.now().toString(), isDefault: false }]);
      toast.success('Address added!');
    }
    setShowAddModal(false);
    setEditingAddress(null);
    setNewAddress({ type: 'shop', name: '', address: '', pincode: '', lat: 19.076, lng: 72.8777 });
  };

  const handleDelete = (id) => {
    setAddresses(addresses.filter(a => a.id !== id));
    toast.success('Address deleted');
  };

  const handleSetDefault = (id) => {
    setAddresses(addresses.map(a => ({ ...a, isDefault: a.id === id })));
    toast.success('Default address updated');
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-xl hover:bg-slate-100" data-testid="back-btn">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h2 className="text-xl font-bold text-slate-900">Manage Addresses</h2>
        </div>
        <Button size="sm" role="retailer" onClick={() => setShowAddModal(true)} data-testid="add-address-btn">
          <Plus className="w-4 h-4 mr-1" /> Add
        </Button>
      </div>

      {/* Map Overview */}
      {isLoaded && (
        <Card className="overflow-hidden">
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '200px' }}
            center={addresses[0] ? { lat: addresses[0].lat, lng: addresses[0].lng } : { lat: 19.076, lng: 72.8777 }}
            zoom={11}
          >
            {addresses.map((addr) => (
              <Marker
                key={addr.id}
                position={{ lat: addr.lat, lng: addr.lng }}
                title={addr.name}
              />
            ))}
          </GoogleMap>
        </Card>
      )}

      {/* Address List */}
      <div className="space-y-3">
        {addresses.map((address, index) => (
          <motion.div
            key={address.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="p-4" hover data-testid={`address-${address.id}`}>
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  address.type === 'shop' ? 'bg-blue-100' : 'bg-purple-100'
                }`}>
                  {address.type === 'shop' ? (
                    <Home className={`w-5 h-5 ${address.type === 'shop' ? 'text-blue-600' : 'text-purple-600'}`} />
                  ) : (
                    <Building className="w-5 h-5 text-purple-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-slate-900">{address.name}</h4>
                    {address.isDefault && <Badge variant="success">Default</Badge>}
                  </div>
                  <p className="text-sm text-slate-600 mt-0.5">{address.address}</p>
                  <p className="text-xs text-slate-400 mt-0.5">PIN: {address.pincode}</p>
                </div>
                <div className="flex gap-1">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setEditingAddress(address);
                      setNewAddress(address);
                      setSelectedLocation({ lat: address.lat, lng: address.lng });
                      setShowAddModal(true);
                    }}
                    className="p-2 rounded-lg hover:bg-slate-100"
                  >
                    <Edit2 className="w-4 h-4 text-slate-500" />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDelete(address.id)}
                    className="p-2 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </motion.button>
                </div>
              </div>
              {!address.isDefault && (
                <button
                  onClick={() => handleSetDefault(address.id)}
                  className="mt-3 text-sm text-blue-600 font-medium flex items-center"
                >
                  <Star className="w-4 h-4 mr-1" /> Set as default
                </button>
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Add/Edit Address Modal */}
      <Modal isOpen={showAddModal} onClose={() => { setShowAddModal(false); setEditingAddress(null); }} title={editingAddress ? 'Edit Address' : 'Add New Address'}>
        <div className="space-y-4">
          {/* Address Type */}
          <div className="flex gap-2">
            {[{ id: 'shop', icon: Home, label: 'Shop' }, { id: 'warehouse', icon: Building, label: 'Warehouse' }].map((type) => (
              <motion.button
                key={type.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setNewAddress({ ...newAddress, type: type.id })}
                className={`flex-1 p-3 rounded-xl border-2 flex items-center justify-center gap-2 ${
                  newAddress.type === type.id ? 'border-blue-600 bg-blue-50' : 'border-slate-200'
                }`}
              >
                <type.icon className={`w-5 h-5 ${newAddress.type === type.id ? 'text-blue-600' : 'text-slate-500'}`} />
                <span className={`font-medium ${newAddress.type === type.id ? 'text-blue-700' : 'text-slate-600'}`}>{type.label}</span>
              </motion.button>
            ))}
          </div>

          <Input
            label="Address Name"
            value={newAddress.name}
            onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
            placeholder="e.g., Main Shop, Warehouse 1"
          />

          {/* Google Maps Autocomplete */}
          {isLoaded && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Search Address</label>
              <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
                <input
                  type="text"
                  placeholder="Search for address..."
                  className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </Autocomplete>
            </div>
          )}

          {/* Map */}
          {isLoaded && (
            <div className="rounded-xl overflow-hidden border border-slate-200">
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '200px' }}
                center={selectedLocation}
                zoom={15}
                onClick={handleMapClick}
              >
                <Marker position={selectedLocation} />
              </GoogleMap>
            </div>
          )}

          <Input
            label="Full Address"
            value={newAddress.address}
            onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
            placeholder="Full address with landmark"
          />

          <Input
            label="PIN Code"
            value={newAddress.pincode}
            onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
            placeholder="400001"
          />

          <Button onClick={handleSaveAddress} fullWidth role="retailer" data-testid="save-address-btn">
            <Check className="w-4 h-4 mr-2" /> {editingAddress ? 'Update Address' : 'Save Address'}
          </Button>
        </div>
      </Modal>
    </motion.div>
  );
};

// Credit Details Component
export const CreditDetails = ({ onBack }) => {
  const [creditInfo, setCreditInfo] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCreditData();
  }, []);

  const loadCreditData = async () => {
    try {
      const res = await creditAPI.getBalance();
      setCreditInfo(res.data);
      
      // Mock transactions
      setTransactions([
        { id: '1', type: 'credit', amount: 50000, description: 'Credit limit approved', date: '2026-02-01', status: 'completed' },
        { id: '2', type: 'debit', amount: 12500, description: 'Order #ORD-001', date: '2026-02-03', status: 'completed' },
        { id: '3', type: 'debit', amount: 8750, description: 'Order #ORD-002', date: '2026-02-05', status: 'completed' },
        { id: '4', type: 'credit', amount: 12500, description: 'Payment received', date: '2026-02-06', status: 'completed' },
      ]);
    } catch (error) {
      console.error('Failed to load credit data:', error);
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

  const creditUsedPercent = creditInfo ? (creditInfo.used_credit / creditInfo.credit_limit) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-slate-100" data-testid="back-btn">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <h2 className="text-xl font-bold text-slate-900">Credit Details</h2>
      </div>

      {/* Credit Card */}
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring' }}
      >
        <Card className="p-6 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 text-white border-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <CreditCard className="w-6 h-6" />
                <span className="font-semibold">SREYANIMTI Credit</span>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-300">Active</Badge>
            </div>
            
            <p className="text-slate-400 text-sm">Available Credit</p>
            <p className="text-4xl font-bold mb-6">₹{(creditInfo?.available_credit || 0).toLocaleString()}</p>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Credit Used</span>
                <span>{creditUsedPercent.toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${creditUsedPercent}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className={`h-full rounded-full ${creditUsedPercent > 80 ? 'bg-red-500' : creditUsedPercent > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>₹{(creditInfo?.used_credit || 0).toLocaleString()} used</span>
                <span>₹{(creditInfo?.credit_limit || 0).toLocaleString()} limit</span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4" hover>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Credit Score</p>
              <p className="text-lg font-bold text-slate-900">750</p>
            </div>
          </div>
        </Card>
        <Card className="p-4" hover>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Next Due</p>
              <p className="text-lg font-bold text-slate-900">Feb 15</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Transactions */}
      <Card className="p-4">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
          <Receipt className="w-5 h-5 mr-2 text-slate-500" />
          Recent Transactions
        </h3>
        <div className="space-y-3">
          {transactions.map((tx, index) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  tx.type === 'credit' ? 'bg-emerald-100' : 'bg-red-100'
                }`}>
                  {tx.type === 'credit' ? (
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{tx.description}</p>
                  <p className="text-xs text-slate-400">{tx.date}</p>
                </div>
              </div>
              <span className={`font-semibold ${tx.type === 'credit' ? 'text-emerald-600' : 'text-red-600'}`}>
                {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toLocaleString()}
              </span>
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
};

// Shop Analytics Component
export const ShopAnalytics = ({ onBack }) => {
  const [timeRange, setTimeRange] = useState('week');
  const [loading, setLoading] = useState(false);

  const stats = {
    totalOrders: 156,
    totalRevenue: 245000,
    avgOrderValue: 1571,
    topProducts: [
      { name: 'Fortune Oil 1L', quantity: 45, revenue: 7125 },
      { name: 'Tata Salt 1kg', quantity: 120, revenue: 2880 },
      { name: 'Coca Cola 2L', quantity: 38, revenue: 3610 }
    ],
    weeklyData: [
      { day: 'Mon', orders: 12, revenue: 18500 },
      { day: 'Tue', orders: 19, revenue: 29000 },
      { day: 'Wed', orders: 15, revenue: 23500 },
      { day: 'Thu', orders: 25, revenue: 38000 },
      { day: 'Fri', orders: 32, revenue: 48500 },
      { day: 'Sat', orders: 28, revenue: 42000 },
      { day: 'Sun', orders: 25, revenue: 45500 }
    ]
  };

  const maxRevenue = Math.max(...stats.weeklyData.map(d => d.revenue));

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-xl hover:bg-slate-100" data-testid="back-btn">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h2 className="text-xl font-bold text-slate-900">Shop Analytics</h2>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-100 text-sm font-medium border-0"
        >
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingCart, color: 'blue', change: '+12%' },
          { label: 'Revenue', value: `₹${(stats.totalRevenue/1000).toFixed(0)}K`, icon: DollarSign, color: 'emerald', change: '+18%' },
          { label: 'Avg Order', value: `₹${stats.avgOrderValue}`, icon: Package, color: 'purple', change: '+5%' },
          { label: 'Active Days', value: '26', icon: Clock, color: 'amber', change: '100%' }
        ].map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="p-4" hover>
              <div className="flex items-start justify-between mb-2">
                <div className={`w-10 h-10 rounded-xl bg-${metric.color}-100 flex items-center justify-center`}>
                  <metric.icon className={`w-5 h-5 text-${metric.color}-600`} />
                </div>
                <Badge variant="success">{metric.change}</Badge>
              </div>
              <p className="text-2xl font-bold text-slate-900">{metric.value}</p>
              <p className="text-xs text-slate-500">{metric.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Revenue Chart */}
      <Card className="p-4">
        <h3 className="font-semibold text-slate-900 mb-4">Weekly Revenue</h3>
        <div className="flex items-end justify-between h-40 gap-2">
          {stats.weeklyData.map((day, index) => (
            <motion.div
              key={day.day}
              initial={{ height: 0 }}
              animate={{ height: `${(day.revenue / maxRevenue) * 100}%` }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="flex-1 flex flex-col items-center"
            >
              <div className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg relative group cursor-pointer">
                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap"
                >
                  ₹{day.revenue.toLocaleString()}
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          {stats.weeklyData.map((day) => (
            <span key={day.day} className="text-xs text-slate-500 flex-1 text-center">{day.day}</span>
          ))}
        </div>
      </Card>

      {/* Top Products */}
      <Card className="p-4">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
          <Star className="w-5 h-5 mr-2 text-amber-500" />
          Top Selling Products
        </h3>
        <div className="space-y-3">
          {stats.topProducts.map((product, index) => (
            <motion.div
              key={product.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  index === 0 ? 'bg-amber-100 text-amber-700' :
                  index === 1 ? 'bg-slate-200 text-slate-700' :
                  'bg-orange-100 text-orange-700'
                }`}>
                  {index + 1}
                </span>
                <div>
                  <p className="font-medium text-slate-900">{product.name}</p>
                  <p className="text-xs text-slate-500">{product.quantity} units sold</p>
                </div>
              </div>
              <span className="font-semibold text-emerald-600">₹{product.revenue.toLocaleString()}</span>
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
};
