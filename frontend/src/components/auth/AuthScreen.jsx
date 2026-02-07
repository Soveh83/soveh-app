import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { authAPI } from '../../lib/api';
import { Button, Input, Card } from '../ui';
import { 
  Store, Users, Truck, Shield, Phone, ArrowRight, 
  Loader2, CheckCircle, AlertCircle 
} from 'lucide-react';
import toast from 'react-hot-toast';

const roles = [
  { id: 'retailer', name: 'Retailer', icon: Store, color: 'bg-blue-600', desc: 'Shop owners & wholesalers' },
  { id: 'delivery_agent', name: 'Delivery', icon: Truck, color: 'bg-orange-600', desc: 'Delivery partners' },
  { id: 'admin', name: 'Admin', icon: Shield, color: 'bg-red-600', desc: 'Operations team' }
];

export const AuthScreen = () => {
  const [step, setStep] = useState('role'); // role, phone, otp
  const [selectedRole, setSelectedRole] = useState(null);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [testOtp, setTestOtp] = useState('');
  const [timer, setTimer] = useState(0);
  const { setUser, setRole } = useAuthStore();

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setRole(role.id);
    setStep('phone');
  };

  const handleSendOTP = async () => {
    if (phone.length !== 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }
    
    setLoading(true);
    try {
      const response = await authAPI.sendOTP(phone);
      const message = response.data.message;
      // Extract test OTP from response
      const otpMatch = message.match(/Test OTP: (\d+)/);
      if (otpMatch) {
        setTestOtp(otpMatch[1]);
      }
      toast.success('OTP sent successfully!');
      setStep('otp');
      setTimer(60);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    
    setLoading(true);
    try {
      const response = await authAPI.verifyOTP(phone, otp, selectedRole.id);
      setUser(response.data.user, response.data.token);
      toast.success('Login successful!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="inline-block mb-4"
          >
            <img 
              src="https://customer-assets.emergentagent.com/job_hii-wave-2/artifacts/fg5ubket_WhatsApp%20Image%202026-02-07%20at%209.05.20%20PM.jpeg"
              alt="SOVEH"
              className="w-20 h-20 rounded-2xl shadow-lg mx-auto"
            />
          </motion.div>
          <h1 className="text-2xl font-bold text-slate-900">SOVEH</h1>
          <p className="text-slate-500 mt-1">Retail Supply Network</p>
        </div>

        <AnimatePresence mode="wait">
          {step === 'role' && (
            <motion.div
              key="role"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Select your role</h2>
                <div className="grid grid-cols-2 gap-3">
                  {roles.map((role) => (
                    <motion.button
                      key={role.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleRoleSelect(role)}
                      data-testid={`role-${role.id}`}
                      className="flex flex-col items-center p-4 rounded-xl border-2 border-slate-200 hover:border-slate-300 bg-white transition-all"
                    >
                      <div className={`w-12 h-12 rounded-xl ${role.color} flex items-center justify-center mb-2`}>
                        <role.icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="font-semibold text-slate-900">{role.name}</span>
                      <span className="text-xs text-slate-500 mt-0.5">{role.desc}</span>
                    </motion.button>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {step === 'phone' && (
            <motion.div
              key="phone"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="p-6">
                <button
                  onClick={() => setStep('role')}
                  className="text-sm text-slate-500 hover:text-slate-700 mb-4 flex items-center"
                >
                  ← Change role
                </button>
                
                <div className={`inline-flex items-center px-3 py-1.5 rounded-full ${selectedRole.color} text-white text-sm font-medium mb-4`}>
                  <selectedRole.icon className="w-4 h-4 mr-1.5" />
                  {selectedRole.name}
                </div>
                
                <h2 className="text-lg font-semibold text-slate-900 mb-1">Enter your phone number</h2>
                <p className="text-sm text-slate-500 mb-4">We'll send you a verification code</p>
                
                <div className="flex gap-2 mb-4">
                  <div className="flex items-center px-4 h-11 bg-slate-100 rounded-xl text-slate-600 font-medium">
                    +91
                  </div>
                  <Input
                    type="tel"
                    placeholder="Enter 10-digit number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    data-testid="phone-input"
                    className="flex-1"
                  />
                </div>
                
                <Button
                  onClick={handleSendOTP}
                  loading={loading}
                  fullWidth
                  role={selectedRole.id}
                  data-testid="send-otp-btn"
                >
                  Get OTP <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Card>
            </motion.div>
          )}

          {step === 'otp' && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="p-6">
                <button
                  onClick={() => setStep('phone')}
                  className="text-sm text-slate-500 hover:text-slate-700 mb-4 flex items-center"
                >
                  ← Change number
                </button>
                
                <h2 className="text-lg font-semibold text-slate-900 mb-1">Verify OTP</h2>
                <p className="text-sm text-slate-500 mb-4">Enter the 6-digit code sent to +91 {phone}</p>
                
                {testOtp && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-sm text-blue-700 font-medium flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1.5" />
                      Test OTP: <span className="font-mono ml-1">{testOtp}</span>
                    </p>
                  </div>
                )}
                
                <Input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  data-testid="otp-input"
                  className="text-center text-xl tracking-widest font-mono mb-4"
                />
                
                <Button
                  onClick={handleVerifyOTP}
                  loading={loading}
                  fullWidth
                  role={selectedRole.id}
                  data-testid="verify-otp-btn"
                >
                  <CheckCircle className="w-4 h-4 mr-2" /> Verify & Login
                </Button>
                
                <div className="mt-4 text-center">
                  {timer > 0 ? (
                    <p className="text-sm text-slate-500">Resend OTP in {timer}s</p>
                  ) : (
                    <button
                      onClick={handleSendOTP}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      data-testid="resend-otp-btn"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
