import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { AuthScreen } from './components/auth/AuthScreen';
import { RetailerDashboard } from './components/retailer/RetailerDashboard';
import { CustomerDashboard } from './components/customer/CustomerDashboard';
import { DeliveryDashboard } from './components/delivery/DeliveryDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  return children;
};

// Role-based Dashboard Router
const DashboardRouter = () => {
  const { role } = useAuthStore();
  
  switch (role) {
    case 'retailer':
      return <RetailerDashboard />;
    case 'customer':
      return <CustomerDashboard />;
    case 'delivery_agent':
      return <DeliveryDashboard />;
    case 'admin':
    case 'super_admin':
      return <AdminDashboard />;
    default:
      return <RetailerDashboard />;
  }
};

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="App">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#0f172a',
            color: '#fff',
            borderRadius: '12px',
            padding: '12px 16px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      <BrowserRouter>
        <Routes>
          <Route
            path="/auth"
            element={
              isAuthenticated ? <Navigate to="/" replace /> : <AuthScreen />
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardRouter />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
