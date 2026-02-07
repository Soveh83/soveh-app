import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { adminAPI, productsAPI, categoriesAPI, ordersAPI } from '../../lib/api';
import { Card, Button, Badge, Spinner, Input, Modal } from '../ui';
import {
  LayoutDashboard, Users, Package, ShoppingCart, Settings,
  TrendingUp, DollarSign, Clock, CheckCircle, XCircle,
  Plus, Search, Filter, MoreVertical, Eye, Edit, Trash2,
  LogOut, Bell, ChevronDown, BarChart3, PieChart, Truck,
  UserCheck, MapPin, Phone, Lock, Shield, Upload, Image
} from 'lucide-react';
import toast from 'react-hot-toast';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

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

// Valid employee codes for admin access
const VALID_EMPLOYEE_CODES = ['SOVEH001', 'SOVEH002', 'ADMIN123', 'SUPER001'];

const sidebarItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'retailers', icon: Users, label: 'Retailers' },
  { id: 'products', icon: Package, label: 'Products' },
  { id: 'categories', icon: BarChart3, label: 'Categories' },
  { id: 'orders', icon: ShoppingCart, label: 'Orders' },
  { id: 'delivery', icon: Truck, label: 'Delivery Agents' },
  { id: 'analytics', icon: PieChart, label: 'Analytics' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isAdminVerified, setIsAdminVerified] = useState(false);
  const [employeeCode, setEmployeeCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const { user, logout } = useAuthStore();

  // Check if admin session exists in localStorage
  useEffect(() => {
    const adminSession = localStorage.getItem('soveh_admin_verified');
    if (adminSession === 'true') {
      setIsAdminVerified(true);
    }
  }, []);

  const handleEmployeeCodeVerify = () => {
    setVerifying(true);
    setTimeout(() => {
      if (VALID_EMPLOYEE_CODES.includes(employeeCode.toUpperCase())) {
        setIsAdminVerified(true);
        localStorage.setItem('soveh_admin_verified', 'true');
        toast.success('Admin access granted!');
      } else {
        toast.error('Invalid employee code');
      }
      setVerifying(false);
    }, 1000);
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('soveh_admin_verified');
    setIsAdminVerified(false);
    logout();
  };

  // Employee Code Verification Screen
  if (!isAdminVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="p-8 bg-white/10 backdrop-blur-xl border-white/20">
            <div className="text-center mb-8">
              <SovehLogo size="lg" />
              <h1 className="text-2xl font-bold text-white mt-4">Admin Portal</h1>
              <p className="text-slate-400 text-sm mt-2">Enter your employee code to access the admin panel</p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={employeeCode}
                  onChange={(e) => setEmployeeCode(e.target.value.toUpperCase())}
                  placeholder="Employee Code (e.g., SOVEH001)"
                  className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white/10 border-2 border-white/20 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                  data-testid="employee-code-input"
                />
              </div>

              <Button
                onClick={handleEmployeeCodeVerify}
                loading={verifying}
                fullWidth
                size="lg"
                role="admin"
                className="!bg-gradient-to-r !from-blue-600 !to-indigo-600 !hover:from-blue-700 !hover:to-indigo-700"
                data-testid="verify-code-btn"
              >
                <Shield className="w-5 h-5 mr-2" />
                Verify & Access
              </Button>

              <p className="text-center text-xs text-slate-500 mt-4">
                Only authorized SOVEH employees can access this portal
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-slate-900 to-slate-800 transition-all duration-300 flex flex-col`}>
        <div className="p-4 flex items-center gap-3">
          <SovehLogo size="md" />
          {sidebarOpen && (
            <div>
              <h1 className="font-bold text-white">SOVEH</h1>
              <p className="text-xs text-slate-400">Admin Panel</p>
            </div>
          )}
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {sidebarItems.map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(item.id)}
              data-testid={`sidebar-${item.id}`}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </motion.button>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-700/50">
          <button
            onClick={handleAdminLogout}
            data-testid="admin-logout"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 capitalize">{activeTab}</h2>
              <p className="text-sm text-slate-500">Welcome back, Admin</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors relative">
                <Bell className="w-5 h-5 text-slate-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              </button>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                  A
                </div>
                <span className="font-medium text-slate-700">Admin</span>
                <Badge variant="success" className="text-xs">Verified</Badge>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && <DashboardTab key="dashboard" />}
            {activeTab === 'retailers' && <RetailersTab key="retailers" />}
            {activeTab === 'products' && <ProductsTab key="products" />}
            {activeTab === 'categories' && <CategoriesTab key="categories" />}
            {activeTab === 'orders' && <OrdersTab key="orders" />}
            {activeTab === 'delivery' && <DeliveryAgentsTab key="delivery" />}
            {activeTab === 'analytics' && <AnalyticsTab key="analytics" />}
            {activeTab === 'settings' && <SettingsTab key="settings" />}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

// Dashboard Tab
const DashboardTab = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await adminAPI.getDashboard();
      setStats(res.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = [
    { name: 'Mon', orders: 12, revenue: 4000 },
    { name: 'Tue', orders: 19, revenue: 3000 },
    { name: 'Wed', orders: 15, revenue: 5000 },
    { name: 'Thu', orders: 25, revenue: 4500 },
    { name: 'Fri', orders: 32, revenue: 6000 },
    { name: 'Sat', orders: 28, revenue: 5500 },
    { name: 'Sun', orders: 20, revenue: 4800 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Orders"
          value={stats?.total_orders || 0}
          icon={ShoppingCart}
          color="blue"
          change="+12%"
        />
        <StatsCard
          title="Total Users"
          value={stats?.total_users || 0}
          icon={Users}
          color="green"
          change="+8%"
        />
        <StatsCard
          title="Products"
          value={stats?.total_products || 0}
          icon={Package}
          color="purple"
          change="+5%"
        />
        <StatsCard
          title="Revenue"
          value={`₹${(stats?.total_revenue || 0).toLocaleString()}`}
          icon={DollarSign}
          color="amber"
          change="+15%"
        />
      </div>

      {/* Pending Approvals Alert */}
      {stats?.pending_retailers > 0 && (
        <Card className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900">{stats.pending_retailers} Pending Retailer Approvals</h3>
              <p className="text-sm text-amber-700">Review and approve new retailer registrations</p>
            </div>
            <Button size="sm" role="admin" data-testid="review-pending-btn">
              Review Now
            </Button>
          </div>
        </Card>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Orders This Week</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip />
              <Area type="monotone" dataKey="orders" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Revenue This Week</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip />
              <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </motion.div>
  );
};

// Stats Card Component
const StatsCard = ({ title, value, icon: Icon, color, change }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100'
  };

  return (
    <motion.div whileHover={{ y: -4 }}>
      <Card className="p-4 border-2 border-transparent hover:border-slate-200">
        <div className="flex items-start justify-between">
          <div className={`w-12 h-12 rounded-2xl ${colors[color]} flex items-center justify-center border`}>
            <Icon className="w-6 h-6" />
          </div>
          <Badge variant="success">{change}</Badge>
        </div>
        <div className="mt-4">
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          <p className="text-sm text-slate-500">{title}</p>
        </div>
      </Card>
    </motion.div>
  );
};

// Retailers Tab
const RetailersTab = () => {
  const [retailers, setRetailers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRetailers();
  }, []);

  const loadRetailers = async () => {
    try {
      const res = await adminAPI.getPendingRetailers();
      setRetailers(res.data);
    } catch (error) {
      console.error('Failed to load retailers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (retailerId) => {
    try {
      await adminAPI.approveRetailer({
        retailer_id: retailerId,
        status: 'approved',
        credit_limit: 50000
      });
      toast.success('Retailer approved!');
      loadRetailers();
    } catch (error) {
      toast.error('Failed to approve retailer');
    }
  };

  const handleReject = async (retailerId) => {
    try {
      await adminAPI.approveRetailer({
        retailer_id: retailerId,
        status: 'rejected'
      });
      toast.success('Retailer rejected');
      loadRetailers();
    } catch (error) {
      toast.error('Failed to reject retailer');
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">Pending Approvals ({retailers.length})</h3>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search retailers..."
              className="pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {retailers.length === 0 ? (
        <Card className="p-10 text-center">
          <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-3" />
          <h3 className="font-semibold text-slate-900">All caught up!</h3>
          <p className="text-slate-500">No pending approvals at the moment</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {retailers.map((retailer) => (
            <Card key={retailer.user_id} className="p-4" data-testid={`retailer-${retailer.user_id}`}>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-slate-900">{retailer.shop_name}</h4>
                  <p className="text-sm text-slate-500">{retailer.owner_name}</p>
                  <p className="text-sm text-slate-400">{retailer.address}</p>
                  {retailer.gst && (
                    <p className="text-xs text-slate-400 mt-1 font-mono">GST: {retailer.gst}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    role="admin"
                    onClick={() => handleReject(retailer.user_id)}
                    data-testid={`reject-${retailer.user_id}`}
                  >
                    <XCircle className="w-4 h-4 mr-1" /> Reject
                  </Button>
                  <Button
                    size="sm"
                    role="customer"
                    onClick={() => handleApprove(retailer.user_id)}
                    data-testid={`approve-${retailer.user_id}`}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" /> Approve
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  );
};

// Products Tab with Add/Edit/Delete functionality
const ProductsTab = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    category_id: '',
    mrp: '',
    retailer_price: '',
    customer_price: '',
    stock_quantity: '',
    images: []
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        productsAPI.getAll({ limit: 50 }),
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

  const handleAddProduct = async () => {
    try {
      const productData = {
        ...newProduct,
        mrp: parseFloat(newProduct.mrp),
        retailer_price: parseFloat(newProduct.retailer_price),
        customer_price: parseFloat(newProduct.customer_price),
        stock_quantity: parseInt(newProduct.stock_quantity),
        margin_percent: ((parseFloat(newProduct.mrp) - parseFloat(newProduct.retailer_price)) / parseFloat(newProduct.mrp) * 100).toFixed(2)
      };
      
      await productsAPI.create(productData);
      toast.success('Product added successfully!');
      setShowAddModal(false);
      setNewProduct({ name: '', description: '', category_id: '', mrp: '', retailer_price: '', customer_price: '', stock_quantity: '', images: [] });
      loadData();
    } catch (error) {
      toast.error('Failed to add product');
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">All Products ({products.length})</h3>
        <Button role="admin" onClick={() => setShowAddModal(true)} data-testid="add-product-btn">
          <Plus className="w-4 h-4 mr-2" /> Add Product
        </Button>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Product</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Category</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">MRP</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Retailer Price</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Stock</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50" data-testid={`product-row-${product.id}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 line-clamp-1">{product.name}</p>
                      <p className="text-xs text-slate-400 font-mono">{product.id.slice(0, 8)}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge>{categories.find(c => c.id === product.category_id)?.name || 'N/A'}</Badge>
                </td>
                <td className="px-4 py-3 font-medium">₹{product.mrp}</td>
                <td className="px-4 py-3 font-medium text-green-600">₹{product.retailer_price}</td>
                <td className="px-4 py-3">
                  <Badge variant={product.stock_quantity > 10 ? 'success' : product.stock_quantity > 0 ? 'warning' : 'error'}>
                    {product.stock_quantity}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-500" onClick={() => setEditingProduct(product)}>
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-red-50 text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Add Product Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Product">
        <div className="space-y-4">
          <Input 
            label="Product Name" 
            value={newProduct.name}
            onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
            placeholder="Enter product name"
          />
          <Input 
            label="Description" 
            value={newProduct.description}
            onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
            placeholder="Product description"
          />
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">Category</label>
            <select 
              value={newProduct.category_id}
              onChange={(e) => setNewProduct({...newProduct, category_id: e.target.value})}
              className="w-full h-12 px-4 rounded-xl bg-white border-2 border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input 
              label="MRP (₹)" 
              type="number"
              value={newProduct.mrp}
              onChange={(e) => setNewProduct({...newProduct, mrp: e.target.value})}
              placeholder="0"
            />
            <Input 
              label="Retailer Price (₹)" 
              type="number"
              value={newProduct.retailer_price}
              onChange={(e) => setNewProduct({...newProduct, retailer_price: e.target.value})}
              placeholder="0"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input 
              label="Customer Price (₹)" 
              type="number"
              value={newProduct.customer_price}
              onChange={(e) => setNewProduct({...newProduct, customer_price: e.target.value})}
              placeholder="0"
            />
            <Input 
              label="Stock Quantity" 
              type="number"
              value={newProduct.stock_quantity}
              onChange={(e) => setNewProduct({...newProduct, stock_quantity: e.target.value})}
              placeholder="0"
            />
          </div>
          <Button onClick={handleAddProduct} fullWidth role="admin" data-testid="submit-product-btn">
            <Plus className="w-4 h-4 mr-2" /> Add Product
          </Button>
        </div>
      </Modal>
    </motion.div>
  );
};

// Categories Tab
const CategoriesTab = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await categoriesAPI.getAll();
      setCategories(res.data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    try {
      await categoriesAPI.create(newCategory);
      toast.success('Category added!');
      setShowAddModal(false);
      setNewCategory({ name: '', description: '' });
      loadCategories();
    } catch (error) {
      toast.error('Failed to add category');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">Categories ({categories.length})</h3>
        <Button role="admin" onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Category
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <Card key={cat.id} className="p-4 text-center" hover>
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mb-3">
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
            <h4 className="font-semibold text-slate-900">{cat.name}</h4>
            <p className="text-xs text-slate-500 mt-1">{cat.description || 'No description'}</p>
          </Card>
        ))}
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Category">
        <div className="space-y-4">
          <Input 
            label="Category Name" 
            value={newCategory.name}
            onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
            placeholder="e.g., Beverages"
          />
          <Input 
            label="Description" 
            value={newCategory.description}
            onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
            placeholder="Optional description"
          />
          <Button onClick={handleAddCategory} fullWidth role="admin">
            Add Category
          </Button>
        </div>
      </Modal>
    </motion.div>
  );
};

// Orders Tab with Delivery Assignment
const OrdersTab = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

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

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await ordersAPI.updateStatus(orderId, status);
      toast.success('Order status updated!');
      loadOrders();
    } catch (error) {
      toast.error('Failed to update status');
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
    return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">All Orders ({orders.length})</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" role="default">
            <Filter className="w-4 h-4 mr-2" /> Filter
          </Button>
        </div>
      </div>

      {orders.length === 0 ? (
        <Card className="p-10 text-center">
          <ShoppingCart className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <h3 className="font-semibold text-slate-900">No orders yet</h3>
          <p className="text-slate-500">Orders will appear here</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Order ID</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Date</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Items</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Amount</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Status</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50" data-testid={`order-row-${order.id}`}>
                  <td className="px-4 py-3">
                    <p className="font-mono font-medium text-slate-900">{order.order_number}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">{order.items?.length || 0} items</td>
                  <td className="px-4 py-3 font-semibold">₹{order.total_amount?.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[order.order_status] || 'bg-slate-100'}`}>
                      {order.order_status?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <select
                        value={order.order_status}
                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                        className="text-xs px-2 py-1 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20"
                      >
                        <option value="placed">Placed</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="packed">Packed</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-500" onClick={() => setSelectedOrder(order)}>
                        <Truck className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Assign Delivery Modal */}
      <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title="Assign Delivery Agent">
        {selectedOrder && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-sm text-slate-500">Order</p>
              <p className="font-mono font-semibold">{selectedOrder.order_number}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">Select Delivery Agent</label>
              <select className="w-full h-12 px-4 rounded-xl bg-white border-2 border-slate-200 text-slate-900 focus:border-blue-500">
                <option value="">Select Agent</option>
                <option value="agent1">Rajesh Kumar - Available</option>
                <option value="agent2">Amit Singh - Available</option>
                <option value="agent3">Suresh Patel - Busy</option>
              </select>
            </div>
            <Button fullWidth role="admin">
              <Truck className="w-4 h-4 mr-2" /> Assign & Notify
            </Button>
          </div>
        )}
      </Modal>
    </motion.div>
  );
};

// Delivery Agents Tab
const DeliveryAgentsTab = () => {
  const [agents] = useState([
    { id: '1', name: 'Rajesh Kumar', phone: '9876543210', status: 'available', deliveries: 156, rating: 4.8 },
    { id: '2', name: 'Amit Singh', phone: '9876543211', status: 'available', deliveries: 203, rating: 4.9 },
    { id: '3', name: 'Suresh Patel', phone: '9876543212', status: 'on_delivery', deliveries: 178, rating: 4.7 },
    { id: '4', name: 'Vikram Yadav', phone: '9876543213', status: 'offline', deliveries: 89, rating: 4.5 },
  ]);

  const statusColors = {
    available: 'bg-green-100 text-green-700',
    on_delivery: 'bg-orange-100 text-orange-700',
    offline: 'bg-slate-100 text-slate-500'
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">Delivery Agents ({agents.length})</h3>
        <Button role="admin">
          <Plus className="w-4 h-4 mr-2" /> Add Agent
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agents.map((agent) => (
          <Card key={agent.id} className="p-4" hover>
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                {agent.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-900">{agent.name}</h4>
                    <p className="text-sm text-slate-500 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {agent.phone}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[agent.status]}`}>
                    {agent.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <span className="flex items-center gap-1 text-slate-600">
                    <Truck className="w-4 h-4" /> {agent.deliveries} deliveries
                  </span>
                  <span className="flex items-center gap-1 text-amber-600">
                    ⭐ {agent.rating}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </motion.div>
  );
};

// Analytics Tab
const AnalyticsTab = () => {
  const chartData = [
    { name: 'Jan', sales: 4000, orders: 24 },
    { name: 'Feb', sales: 3000, orders: 13 },
    { name: 'Mar', sales: 5000, orders: 22 },
    { name: 'Apr', sales: 4500, orders: 18 },
    { name: 'May', sales: 6000, orders: 29 },
    { name: 'Jun', sales: 5500, orders: 25 },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Sales Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip />
              <Area type="monotone" dataKey="sales" stroke="#2563eb" fill="#2563eb" fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Orders Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip />
              <Bar dataKey="orders" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </motion.div>
  );
};

// Settings Tab
const SettingsTab = () => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl space-y-6">
      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 mb-4">General Settings</h3>
        <div className="space-y-4">
          <Input label="Business Name" defaultValue="SOVEH" />
          <Input label="Contact Email" defaultValue="admin@soveh.com" />
          <Input label="Support Phone" defaultValue="+91 9999999999" />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Delivery Settings</h3>
        <div className="space-y-4">
          <Input label="Free Delivery Above (₹)" defaultValue="500" />
          <Input label="Delivery Charge (₹)" defaultValue="50" />
          <Input label="GST Rate (%)" defaultValue="5" />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Employee Codes</h3>
        <div className="space-y-3">
          {VALID_EMPLOYEE_CODES.map((code) => (
            <div key={code} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <span className="font-mono font-medium">{code}</span>
              <Badge variant="success">Active</Badge>
            </div>
          ))}
        </div>
        <Button className="mt-4" variant="outline" role="admin">
          <Plus className="w-4 h-4 mr-2" /> Add New Code
        </Button>
      </Card>

      <Button role="admin" data-testid="save-settings-btn">
        Save Settings
      </Button>
    </motion.div>
  );
};
