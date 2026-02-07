import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { ordersAPI } from '../../lib/api';
import { Card, Button, Badge, Spinner } from '../ui';
import {
  Home, Package, MapPin, User, Phone, Navigation,
  CheckCircle, Clock, Truck, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const tabs = [
  { id: 'deliveries', icon: Package, label: 'Deliveries' },
  { id: 'profile', icon: User, label: 'Profile' }
];

export const DeliveryDashboard = () => {
  const [activeTab, setActiveTab] = useState('deliveries');
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-orange-600 text-white px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-orange-100 text-sm">Delivery Partner</p>
            <h1 className="text-lg font-bold">{user?.name || 'Agent'}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-white/20 text-white">Online</Badge>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-4">
        {activeTab === 'deliveries' && <DeliveriesTab />}
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
              className={`flex flex-col items-center py-1 px-6 rounded-xl transition-colors ${
                activeTab === tab.id ? 'text-orange-600' : 'text-slate-500'
              }`}
            >
              <tab.icon className="w-6 h-6" />
              <span className="text-xs mt-0.5 font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

const DeliveriesTab = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const res = await ordersAPI.getAll();
      // Filter orders that are ready for delivery
      const deliveryOrders = res.data.filter(
        o => ['packed', 'out_for_delivery'].includes(o.order_status)
      );
      setOrders(deliveryOrders);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      await ordersAPI.updateStatus(orderId, status);
      toast.success(`Order marked as ${status}`);
      loadOrders();
    } catch (error) {
      toast.error('Failed to update status');
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
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 text-center bg-orange-50">
          <Package className="w-6 h-6 mx-auto text-orange-600 mb-1" />
          <p className="text-xl font-bold text-slate-900">{orders.length}</p>
          <p className="text-xs text-slate-500">Pending</p>
        </Card>
        <Card className="p-3 text-center bg-green-50">
          <CheckCircle className="w-6 h-6 mx-auto text-green-600 mb-1" />
          <p className="text-xl font-bold text-slate-900">12</p>
          <p className="text-xs text-slate-500">Delivered</p>
        </Card>
        <Card className="p-3 text-center bg-blue-50">
          <Clock className="w-6 h-6 mx-auto text-blue-600 mb-1" />
          <p className="text-xl font-bold text-slate-900">2h</p>
          <p className="text-xs text-slate-500">Active</p>
        </Card>
      </div>

      <h2 className="text-lg font-bold text-slate-900">Active Deliveries</h2>

      {orders.length === 0 ? (
        <Card className="p-10 text-center">
          <Truck className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <h3 className="font-semibold text-slate-900">No deliveries</h3>
          <p className="text-slate-500">You'll see new deliveries here</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Card key={order.id} className="p-4" data-testid={`delivery-${order.id}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-mono font-semibold text-slate-900">{order.order_number}</p>
                  <Badge variant={order.order_status === 'out_for_delivery' ? 'warning' : 'info'}>
                    {order.order_status?.replace(/_/g, ' ')}
                  </Badge>
                </div>
                <p className="font-bold text-slate-900">₹{order.total_amount?.toFixed(0)}</p>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm text-slate-900">
                      {order.delivery_address?.name || 'Customer'}
                    </p>
                    <p className="text-sm text-slate-500">
                      {order.delivery_address?.address || 'Address'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <p className="text-sm text-slate-600">
                    {order.delivery_address?.phone || 'Phone'}
                  </p>
                </div>
              </div>

              {order.delivery_otp && (
                <div className="mb-4 p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <p className="text-sm text-amber-700 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Delivery OTP: <span className="font-mono font-bold ml-1">{order.delivery_otp}</span>
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                {order.order_status === 'packed' && (
                  <Button
                    fullWidth
                    role="delivery"
                    onClick={() => handleUpdateStatus(order.id, 'out_for_delivery')}
                    data-testid={`pickup-${order.id}`}
                  >
                    <Truck className="w-4 h-4 mr-2" /> Pick Up
                  </Button>
                )}
                {order.order_status === 'out_for_delivery' && (
                  <>
                    <Button
                      fullWidth
                      variant="outline"
                      role="delivery"
                      data-testid={`navigate-${order.id}`}
                    >
                      <Navigation className="w-4 h-4 mr-2" /> Navigate
                    </Button>
                    <Button
                      fullWidth
                      role="customer"
                      onClick={() => handleUpdateStatus(order.id, 'delivered')}
                      data-testid={`deliver-${order.id}`}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" /> Delivered
                    </Button>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

const ProfileTab = ({ user, onLogout }) => {
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
            <User className="w-8 h-8 text-orange-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{user?.name || 'Delivery Agent'}</h2>
            <p className="text-sm text-slate-500">+91 {user?.phone}</p>
            <Badge variant="success" className="mt-1">Active</Badge>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold text-slate-900 mb-3">Today's Summary</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-2xl font-bold text-orange-600">12</p>
            <p className="text-sm text-slate-500">Deliveries</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">₹450</p>
            <p className="text-sm text-slate-500">Earnings</p>
          </div>
        </div>
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
