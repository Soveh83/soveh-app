import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { adminAPI, productsAPI, categoriesAPI, ordersAPI } from '../../lib/api';
import { Card, Button, Badge, Spinner, Input } from '../ui';
import {
  LayoutDashboard, Users, Package, ShoppingCart, Settings,
  TrendingUp, DollarSign, Clock, CheckCircle, XCircle,
  Plus, Search, Filter, MoreVertical, Eye, Edit, Trash2,
  LogOut, Bell, ChevronDown, BarChart3, PieChart
} from 'lucide-react';
import toast from 'react-hot-toast';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const sidebarItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'retailers', icon: Users, label: 'Retailers' },
  { id: 'products', icon: Package, label: 'Products' },
  { id: 'orders', icon: ShoppingCart, label: 'Orders' },
  { id: 'analytics', icon: BarChart3, label: 'Analytics' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 transition-all duration-300 flex flex-col`}>
        <div className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            S
          </div>
          {sidebarOpen && (
            <div>
              <h1 className="font-bold text-white">SREYANIMTI</h1>
              <p className="text-xs text-slate-400">Admin Panel</p>
            </div>
          )}
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              data-testid={`sidebar-${item.id}`}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                activeTab === item.id
                  ? 'bg-red-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-800">
          <button
            onClick={logout}
            data-testid="admin-logout"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 capitalize">{activeTab}</h2>
              <p className="text-sm text-slate-500">Welcome back, Admin</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors relative">
                <Bell className="w-5 h-5 text-slate-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100">
                <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white text-sm font-bold">
                  A
                </div>
                <span className="font-medium text-slate-700">Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'retailers' && <RetailersTab />}
          {activeTab === 'products' && <ProductsTab />}
          {activeTab === 'orders' && <OrdersTab />}
          {activeTab === 'analytics' && <AnalyticsTab />}
          {activeTab === 'settings' && <SettingsTab />}
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
    <div className="space-y-6">
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
        <Card className="p-4 bg-amber-50 border-amber-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
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
    </div>
  );
};

// Stats Card Component
const StatsCard = ({ title, value, icon: Icon, color, change }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    amber: 'bg-amber-50 text-amber-600'
  };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl ${colors[color]} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
        <Badge variant="success">{change}</Badge>
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-sm text-slate-500">{title}</p>
      </div>
    </Card>
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">Pending Approvals ({retailers.length})</h3>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search retailers..."
              className="pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
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
    </div>
  );
};

// Products Tab
const ProductsTab = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await productsAPI.getAll({ limit: 50 });
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
    <div className="space-y-4">
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
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 line-clamp-1">{product.name}</p>
                      <p className="text-xs text-slate-400 font-mono">{product.id.slice(0, 8)}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge>{product.category_id?.slice(0, 8) || 'N/A'}</Badge>
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
                    <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
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

  return (
    <div className="space-y-4">
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
                    <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Sales Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip />
              <Area type="monotone" dataKey="sales" stroke="#dc2626" fill="#dc2626" fillOpacity={0.1} />
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
              <Bar dataKey="orders" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

// Settings Tab
const SettingsTab = () => {
  return (
    <div className="max-w-2xl space-y-6">
      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 mb-4">General Settings</h3>
        <div className="space-y-4">
          <Input label="Business Name" defaultValue="SREYANIMTI" />
          <Input label="Contact Email" defaultValue="admin@sreyanimti.com" />
          <Input label="Support Phone" defaultValue="+91 9999999999" />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Delivery Settings</h3>
        <div className="space-y-4">
          <Input label="Free Delivery Above" defaultValue="500" />
          <Input label="Delivery Charge" defaultValue="50" />
          <Input label="GST Rate (%)" defaultValue="5" />
        </div>
      </Card>

      <Button role="admin" data-testid="save-settings-btn">
        Save Settings
      </Button>
    </div>
  );
};
